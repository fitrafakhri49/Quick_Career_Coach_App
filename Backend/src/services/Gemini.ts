import "dotenv/config";

import { GoogleGenAI} from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY missing in .env");
}


const ai = new GoogleGenAI({ });

export async function askGemini(promptText: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,   
    });



    return response.text || "";
  } catch (err: any) {
    console.error("askGemini Error:", err);
    throw err;
  }
}
