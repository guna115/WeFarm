import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Uses Gemini Vision to analyze if an uploaded image contains plants, crops, or nursery-related items.
 * Returns true if the image is valid, false if it should be rejected.
 */
export async function verifyPlantImage(imageBuffer: Buffer, mimeType: string = 'image/jpeg'): Promise<boolean> {
  // If no API key is provided, bypass the check in development
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[AI Moderation] No GEMINI_API_KEY found, bypassing image verification.');
    return true;
  }

  try {
    const prompt = `Analyze this image. Is it a photograph of a plant, crop, seedling, agricultural field, nursery, or farm-related produce? Reply exactly with YES or NO.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType,
              },
            },
          ],
        },
      ],
      config: {
        temperature: 0.1, // Low temperature for deterministic output
      },
    });

    const resultText = response.text?.trim().toUpperCase() || '';
    
    // If it says YES, it's a valid plant image
    if (resultText.includes('YES')) {
      return true;
    }
    
    console.log(`[AI Moderation] Image rejected. AI Response: ${resultText}`);
    return false;
  } catch (error) {
    console.error('[AI Moderation Error]:', error);
    // On API error, we allow the image to pass rather than blocking the user completely.
    return true;
  }
}
