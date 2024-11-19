import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string().min(1)
        : z.string().min(1).optional(),
    NEXTAUTH_URL: z.preprocess(
      (str) => process.env.VERCEL_URL ?? str,
      process.env.VERCEL ? z.string().min(1) : z.string().url(),
    ),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_API_KEY: z.string(),
    UPLOADTHING_TOKEN: z.string(),
    OPENAI_API_KEY: z.string(),
    PINECONE_ENVIRONMENT: z.string(),
    PINECONE_API_KEY: z.string(),
    PINECONE_INDEX: z.string(),
    HUGGINGFACE_API_KEY: z.string(),
    SUPABASE_SERVICE_KEY: z.string(),
    PUBLIC_SUPABASE_URL: z.string().min(1),
  },

  client: {
    NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_API_KEY: z.string().min(1),
    NEXT_PUBLIC_ENV: z.enum(["development", "test", "production"]).optional(),
  },

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT,
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    PINECONE_INDEX: process.env.PINECONE_INDEX,
    HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
    NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_API_KEY:
      process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_API_KEY,
    PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});