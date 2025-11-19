import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Initialize the client
// NOTE: We are using process.env.API_KEY as mandated.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for the structured output
const outputSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      score: {
        type: Type.NUMBER,
        description: "Sentiment score from -1.00 to 1.00 (e.g. 0.45, -0.12).",
      },
      magnitude: {
        type: Type.NUMBER,
        description: "Sentiment magnitude from 0.00 to 1.00 (e.g. 0.85, 0.12).",
      },
      explanation: {
        type: Type.STRING,
        description: "A very brief explanation (max 10 words) of why this score was assigned, in Italian.",
      }
    },
    required: ["score", "magnitude"],
  },
};

/**
 * Analyzes a batch of text strings. 
 * Note: For very large files, in production you'd want to chunk this request.
 * Here we assume a reasonable batch size for the demo.
 */
export const analyzeSentimentBatch = async (texts: string[]): Promise<AnalysisResult[]> => {
  
  if (!process.env.API_KEY) {
    throw new Error("API Key non trovata. Configura process.env.API_KEY.");
  }

  // To maintain index mapping, we send an index with the text
  const promptInput = texts.map((text, index) => `ID:${index} | TEXT: "${text}"`).join("\n---\n");

  const prompt = `
    Sei un esperto analista di sentiment. Analizza le seguenti frasi (separate da '---').
    Per ogni frase, restituisci valori precisi al centesimo (due cifre decimali).
    
    Output richiesto:
    1. 'score': Un numero preciso tra -1.00 (Negativo) e 1.00 (Positivo). 0 è Neutro. Esempio: 0.43, -0.12, 0.89. NON arrotondare ai decimi (es. non usare solo 0.4 o 0.5).
    2. 'magnitude': Un numero preciso tra 0.00 (Nessuna emozione) e 1.00 (Forte emozione). Esempio: 0.55, 0.91.
    3. 'explanation': Breve spiegazione in italiano.
    
    Mantieni rigorosamente l'ordine dell'array di output corrispondente all'ordine di input.
    
    INPUT DATA:
    ${promptInput}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: outputSchema,
      },
    });

    const rawJson = response.text;
    if (!rawJson) throw new Error("Nessuna risposta dal modello.");

    const parsedData = JSON.parse(rawJson) as Omit<AnalysisResult, 'originalText'>[];

    // Merge results with original text
    // Safety check: if lengths differ, we map as best as possible, though strict schema usually prevents this.
    return texts.map((text, i) => ({
      originalText: text,
      score: parsedData[i]?.score ?? 0,
      magnitude: parsedData[i]?.magnitude ?? 0,
      explanation: parsedData[i]?.explanation ?? "Analisi non disponibile"
    }));

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Errore durante l'analisi con Gemini AI.");
  }
};