import { env } from "@/env.mjs";
import { gemini } from "@/lib/gemini";
import { generateDummyStream } from "@/lib/utils";
import { retrieveRelevantDocumentContent } from "@/lib/vectorise";
import { chatRouteSchema } from "@/schema/routes";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";
import { Message } from "ai";
import { getServerSession } from "next-auth";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request, res: Response) {
  try {
    if (env.NODE_ENV === "development") {
      return generateDummyStream();
    } else {
      const reqBody = await req.json();
      let { messages, docId } = chatRouteSchema.parse(reqBody);

      const session = await getServerSession(authOptions);
      if (!session) return new Response("Unauthorized", { status: 401 });

      const doc = await prisma.document.findFirst({
        where: {
          id: docId,
          OR: [
            { ownerId: session?.user.id },
            {
              collaborators: {
                some: {
                  userId: session?.user.id,
                },
              },
            },
          ],
        },
      });

      if (!doc) return new Response("Document not found", { status: 404 });

      if (!doc.isVectorised) {
        throw new Error("Document not vectorized.");
      }

      const prevMessage = messages[messages.length - 1] as Message;
      const isPreviousMessageToolInvoked =
        prevMessage.toolInvocations?.length &&
        prevMessage.toolInvocations?.length > 0;

      // don't add the user's message to the database if it was a tool invocation
      if (!isPreviousMessageToolInvoked) {
        await prisma.message.create({
          data: {
            text: messages[messages.length - 1].content,
            documentId: docId,
            userId: session?.user.id,
          },
        });
      }

      // Get relevant content from the document
      const relevantContent = await retrieveRelevantDocumentContent(
        docId,
        messages[messages.length - 1].content
      );

      // Prepare chat history and context
      const chatHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: msg.content,
      }));

      // Create chat instance
      const chat = gemini.startChat({
        history: chatHistory,
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      // Prepare context and question
      const context = `Context from the document:
${relevantContent.map(doc => doc.pageContent).join('\n')}

Based on the above context, please answer the following question. If the information isn't found in the provided context, clearly state that. Don't make assumptions or provide information not present in the context.

Question: ${messages[messages.length - 1].content}`;

      // Get response from Gemini
      const result = await chat.sendMessage(context);
      const response = await result.response;
      const text = response.text();

      // Save assistant's response
      await prisma.message.create({
        data: {
          text,
          userId: null,
          documentId: docId,
        },
      });

      // Return streaming response
      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(new TextEncoder().encode(text));
          controller.close();
        },
      });

      return new Response(stream);
    }
  } catch (error) {
    console.error("Error in Chat function:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
