
import { GoogleGenAI, Type } from "@google/genai";
import { SmartEventSuggestion } from "../types";

/**
 * Parses natural language input into a structured calendar event suggestion.
 * Moves GoogleGenAI initialization inside the function to ensure it uses the most current API key.
 */
export const parseSmartEvent = async (text: string, referenceDate: Date): Promise<SmartEventSuggestion | null> => {
  // Initialize right before the API call to ensure we have the latest environment variable/key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parse the following natural language into a structured calendar event. 
      Reference date (today): ${referenceDate.toISOString()}.
      Input: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            startDate: { type: Type.STRING, description: "ISO 8601 string" },
            endDate: { type: Type.STRING, description: "ISO 8601 string" },
          },
          required: ["title", "startDate", "endDate"]
        }
      }
    });

    // Access the text property directly (not a method) and trim as recommended
    const jsonStr = response.text?.trim();
    if (!jsonStr) {
      console.warn("Gemini service returned empty content");
      return null;
    }

    const result = JSON.parse(jsonStr);
    return result as SmartEventSuggestion;
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    return null;
  }
};
