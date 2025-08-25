import { GoogleGenAI, Type } from "@google/genai";
import type { Reference } from '../types';

let currentApiKeyIndex = 0;

/**
 * Strips the Base64 string prefix if it exists.
 * @param base64String The full Base64 data URL.
 * @returns The pure Base64 encoded data.
 */
const getBase64Data = (base64String: string): string => {
  const parts = base64String.split(',');
  return parts.length === 2 ? parts[1] : base64String;
};

export const findMatchInClass = async (
  capturedImgBase64: string,
  references: Reference[],
  uiApiKeys: string[]
): Promise<{ matches: Reference[]; error?: string; }> => {
  if (references.length === 0) {
    return { matches: [], error: "No references in the class to compare against." };
  }
  
  const envApiKeys: string[] = [];
  // In a browser environment, this relies on a build tool populating `process.env`.
  // This loop checks for GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.
  let i = 1;
  while (true) {
    const keyName = `GEMINI_API_KEY_${i}`;
    const key = (process.env as any)?.[keyName];
    if (key && typeof key === 'string') {
      envApiKeys.push(key);
      i++;
    } else {
      break;
    }
  }

  // As a fallback, also check for the singular GEMINI_API_KEY.
  const singleKey = (process.env as any)?.['GEMINI_API_KEY'];
  if (singleKey && typeof singleKey === 'string') {
    envApiKeys.push(singleKey);
  }

  // Combine UI keys with environment variable keys, ensuring uniqueness.
  const uniqueKeys = new Set([...uiApiKeys.filter(Boolean), ...envApiKeys]);
  const keysToTry = Array.from(uniqueKeys);

  if (keysToTry.length === 0) {
    const message = "No API keys found. Add keys in the UI or set GEMINI_API_KEY environment variables.";
    return { matches: [], error: message };
  }

  const capturedData = getBase64Data(capturedImgBase64);
  const referenceData = references.map(ref => getBase64Data(ref.imageBase64));

  const imageParts = [
    { inlineData: { mimeType: "image/jpeg", data: capturedData } },
    ...referenceData.map(data => ({ inlineData: { mimeType: "image/jpeg", data } }))
  ];

  const prompt = `You are a highly advanced facial recognition and liveness detection system. The first image is a live camera capture which may contain multiple people. The subsequent images are a set of reference photos for class members.

Your tasks are:
1.  **Liveness Detection**: Analyze the first image to identify all *live human faces*. You must ignore any faces that appear to be non-live presentations, such as a photo of a person, a face on a screen, a statue, or a drawing.
2.  **Facial Recognition**: For *each valid, live face* you detect in the first image, compare it against the entire set of reference photos.
3.  **Report Matches**: Respond with a JSON object containing an array of all matches you find.

The JSON response must follow this schema: {"matches": [{"referenceIndex": N}]}, where N is the 0-based index of the matching reference photo.

- If you find multiple matches (e.g., two people from the reference set are in the photo), include an object for each in the "matches" array.
- If no live faces in the first image match any of the reference photos, respond with {"matches": []}.
- If there are no live human faces in the first image, respond with {"matches": []}.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      matches: {
        type: Type.ARRAY,
        description: "An array of all detected matches between live faces and reference photos.",
        items: {
          type: Type.OBJECT,
          properties: {
            referenceIndex: {
              type: Type.INTEGER,
              description: "The 0-based index of the matching reference image.",
            },
          },
          required: ['referenceIndex'],
        },
      },
    },
    required: ['matches'],
  };

  const totalKeys = keysToTry.length;
  for (let i = 0; i < totalKeys; i++) {
    if (currentApiKeyIndex >= totalKeys) {
      currentApiKeyIndex = 0;
    }
    const apiKey = keysToTry[currentApiKeyIndex];

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: {
          parts: [
            { text: prompt },
            ...imageParts
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });

      const responseText = response.text.trim();
      const resultJson = JSON.parse(responseText);
      
      if (resultJson.matches && Array.isArray(resultJson.matches)) {
        const matchedReferences = resultJson.matches
          .map((match: any) => {
            const matchIndex = match.referenceIndex;
            if (typeof matchIndex === 'number' && matchIndex >= 0 && matchIndex < references.length) {
              return references[matchIndex];
            }
            return null;
          })
          .filter((ref: Reference | null): ref is Reference => ref !== null);
          
        return { matches: matchedReferences };
      } else {
        return { matches: [] };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('429')) {
        console.warn(`API key at index ${currentApiKeyIndex} exceeded its quota. Trying next key.`);
        currentApiKeyIndex = (currentApiKeyIndex + 1) % totalKeys;
      } else {
        console.error(`API call failed with key index ${currentApiKeyIndex}:`, error);
        const reason = `API Error with Key #${currentApiKeyIndex + 1}. Check its validity and ensure its project has billing enabled.`;
        return { 
            matches: [], 
            error: reason, 
        };
      }
    }
  }

  const reason = "All available API keys have failed or exceeded their quotas.";
  return { matches: [], error: reason };
};