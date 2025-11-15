import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTIONS } from '../constants';

// Fix: Check for API_KEY before initializing GoogleGenAI.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chat: Chat | null = null;

export const startChat = (language: string): void => {
  const systemInstruction = SYSTEM_INSTRUCTIONS[language] || SYSTEM_INSTRUCTIONS['en'];
  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
  });
};

export const sendMessageStream = async (message: string): Promise<AsyncGenerator<string, void, unknown>> => {
  // Ensure chat session is initialized before sending a message.
  if (!chat) {
    throw new Error("Chat not initialized. Call startChat first.");
  }

  // The 'chat' variable is guaranteed to be non-null here due to the check above.
  // Using a non-null assertion (!) to satisfy TypeScript.
  const stream = await chat!.sendMessageStream({ message });
  
  return (async function*() {
    for await (const chunk of stream) {
      yield chunk.text;
    }
  })();
};