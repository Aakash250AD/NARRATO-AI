
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StructuredReport } from "../types";

// Models tried in order — first available with quota wins
const REPORT_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
];

/**
 * Generates a structured business report using Gemini.
 * Automatically falls back through multiple models if one hits quota.
 */
export const generateReport = async (dataContent: string, filename: string): Promise<StructuredReport> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is not configured. Please check your .env.local file.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const dataSnippet = dataContent.length > 20000
    ? dataContent.substring(0, 20000) + "\n...[data truncated]..."
    : dataContent;

  const systemInstruction = `You are an expert business analyst. Analyze the data and return a JSON report.
Rules:
- NEVER use markdown symbols like #, ##, **, *, or - in any string value.
- All text must be plain sentences, professional and formal.
- keyInsights, trends, and recommendations must each have at least 4 items.
- Be specific and data-driven based on the actual content provided.
- The title must reflect what the data is actually about.`;

  const prompt = `Analyze the following data from file "${filename}" and produce a structured business intelligence report.

DATA:
---
${dataSnippet}
---

Return a JSON object with these exact fields:
- title: A concise, formal report title based on the actual data content
- executiveSummary: 3-4 sentences summarizing the key findings from the data
- keyInsights: Array of 5 specific, data-backed observations from the dataset
- trends: Array of 4-5 patterns or changes identified in the data over time or across categories
- recommendations: Array of 5 concrete, actionable business recommendations based on the data
- conclusion: 2-3 sentences wrapping up the analysis with forward-looking perspective`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      executiveSummary: { type: Type.STRING },
      keyInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
      trends: { type: Type.ARRAY, items: { type: Type.STRING } },
      recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
      conclusion: { type: Type.STRING }
    },
    required: ["title", "executiveSummary", "keyInsights", "trends", "recommendations", "conclusion"]
  };

  let lastError: any;

  for (const model of REPORT_MODELS) {
    try {
      console.log(`[NarratoAI] Trying model: ${model}`);

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.4,
          responseMimeType: "application/json",
          responseSchema,
        },
      });

      const text = response.text?.trim();
      if (!text) throw new Error("Empty response from AI model.");

      console.log(`[NarratoAI] Success with model: ${model}`);
      const parsed = JSON.parse(text) as StructuredReport;

      // Validate required fields are populated
      if (!parsed.title || !parsed.executiveSummary || !parsed.keyInsights?.length) {
        throw new Error("AI returned incomplete report data.");
      }

      return parsed;

    } catch (error: any) {
      const msg = error?.message || '';
      const is429 = error?.status === 429 || msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('resource_exhausted');
      const is404 = error?.status === 404 || msg.includes('404') || msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('not_found');

      if (is429 || is404) {
        const reason = is429 ? 'Quota exceeded' : 'Model not found';
        console.warn(`[NarratoAI] ${reason} for model "${model}", trying next...`);
        lastError = error;
        continue;
      }

      console.error(`[NarratoAI] Error with model "${model}":`, error);
      throw new Error(error.message || "Failed to generate report. Please try again.");
    }
  }

  throw new Error(
    "All AI models have hit their free-tier quota. Please wait ~1 minute and try again."
  );
};

/**
 * Generates a structured report from a binary file (PDF, Excel, Word).
 * The file is passed as an inline base64 part — Gemini reads it natively.
 */
export const generateReportFromBinary = async (dataUrl: string, filename: string, mimeType: string): Promise<StructuredReport> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is not configured. Please check your .env.local file.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // dataUrl is like "data:application/pdf;base64,JVBERi0x..."
  const parts = dataUrl.split(',');
  const base64Data = parts[1];
  if (!base64Data) throw new Error("Failed to extract base64 data from file.");

  const systemInstruction = `You are an expert business analyst. Analyze the document and return a JSON report.
Rules:
- NEVER use markdown symbols like #, ##, **, *, or - in any string value.
- All text must be plain sentences, professional and formal.
- keyInsights, trends, and recommendations must each have at least 4 items.
- Be specific and data-driven based on the actual content provided.
- The title must reflect what the document is actually about.`;

  const prompt = `Analyze the following document "${filename}" and produce a structured business intelligence report.

Return a JSON object with these exact fields:
- title: A concise, formal report title based on the actual document content
- executiveSummary: 3-4 sentences summarizing the key findings from the document
- keyInsights: Array of 5 specific, document-backed observations
- trends: Array of 4-5 patterns or changes identified in the document
- recommendations: Array of 5 concrete, actionable business recommendations based on the document
- conclusion: 2-3 sentences wrapping up the analysis with forward-looking perspective`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      executiveSummary: { type: Type.STRING },
      keyInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
      trends: { type: Type.ARRAY, items: { type: Type.STRING } },
      recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
      conclusion: { type: Type.STRING }
    },
    required: ["title", "executiveSummary", "keyInsights", "trends", "recommendations", "conclusion"]
  };

  let lastError: any;

  for (const model of REPORT_MODELS) {
    try {
      console.log(`[NarratoAI] Trying model: ${model} (Binary mode: ${mimeType})`);

      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data,
                },
              },
              { text: prompt },
            ],
          },
        ],
        config: {
          systemInstruction,
          temperature: 0.4,
          responseMimeType: "application/json",
          responseSchema,
        },
      });

      const text = response.text?.trim();
      if (!text) throw new Error("Empty response from AI model.");

      console.log(`[NarratoAI] Success with model: ${model}`);
      const parsed = JSON.parse(text) as StructuredReport;

      if (!parsed.title || !parsed.executiveSummary || !parsed.keyInsights?.length) {
        throw new Error("AI returned incomplete report data.");
      }

      return parsed;

    } catch (error: any) {
      const msg = error?.message || '';
      const is429 = error?.status === 429 || msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('resource_exhausted');
      const is404 = error?.status === 404 || msg.includes('404') || msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('not_found');

      if (is429 || is404) {
        const reason = is429 ? 'Quota exceeded' : 'Model not found';
        console.warn(`[NarratoAI] ${reason} for model "${model}", trying next...`);
        lastError = error;
        continue;
      }

      console.error(`[NarratoAI] Error with model "${model}":`, error);
      throw new Error(error.message || "Failed to generate report from document. Please try again.");
    }
  }

  throw new Error(
    "All AI models have hit their free-tier quota. Please wait ~1 minute and try again."
  );
};

/**
 * Transforms report text into professional audio narration.
 */
export const generateSpeech = async (text: string): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API Key is not configured.");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const safeText = text.substring(0, 1500).trim();
  const prompt = `Read this business report summary in a calm, clear, professional tone: ${safeText}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", // Use standard model for TTS if multimodal TTS isn't available or just use 1.5-flash
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Charon' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Voice engine returned an empty response.");

    return base64Audio;
  } catch (error: any) {
    console.error("Gemini TTS Error:", error);
    throw new Error(error.message || "Voice Assistant is temporarily unavailable.");
  }
};
