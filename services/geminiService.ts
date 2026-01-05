import { GoogleGenAI } from "@google/genai";

export const generateMemeImage = async (prompt: string): Promise<string> => {
  // 1. Check for API Key Selection (Required for Veo/Pro Image models)
  const win = window as any;
  if (win.aistudio) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await win.aistudio.openSelectKey();
      // Assume success after dialog closes, or throw to prompt retry
      const checkAgain = await win.aistudio.hasSelectedApiKey();
      if (!checkAgain) {
        throw new Error("API Key selection is required to use the Meme Generator.");
      }
    }
  }

  // 2. Initialize Client
  // Note: key is injected via process.env.API_KEY automatically after selection
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 3. Generate Image
  // Mapping 'nano banana pro' to 'gemini-3-pro-image-preview' as per instructions
  const model = 'gemini-3-pro-image-preview';
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            text: `Create a funny meme image based on this concept: ${prompt}. Make it high quality, viral internet style.`
          }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K" // High quality for pro model
        }
      }
    });

    // 4. Extract Image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data received from the model.");

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};