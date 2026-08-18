import { GoogleGenAI } from "@google/genai";
import { ASSISTANT_MODEL } from "./constants";

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Gemini assistant is not configured");
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }

  return geminiClient;
}

export async function streamGeminiResponse(prompt: string) {
  const client = getGeminiClient();

  return client.models.generateContentStream({
    model: ASSISTANT_MODEL,
    contents: prompt,
  });
}