import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/env.mjs";

// Create a client instance
const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);

// Initialize the model
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export const gemini = model;
