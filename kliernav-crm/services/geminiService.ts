import { GoogleGenAI, Type } from "@google/genai";
import { AIMode } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY}); as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAIResponse = async (
  prompt: string,
  mode: AIMode,
  contextData?: string
) => {
  let modelName = 'gemini-3-flash-preview';
  let tools: any[] = [];
  let thinkingConfig: any = undefined;
  let systemInstruction = `Eres KlierNav, un asistente experto para KlierNav Innovations, una agencia digital boutique liderada por Sergio Callier.
  
  TU NEGOCIO:
  - Servicios principales: Landing SAME-DAY, E-commerce Express, CRM Setup, Apps Web y Automatización.
  - Diferenciador: Soluciones rápidas con alta calidad estética y funcional.
  - Tono: Profesional, ejecutivo, eficiente.
  `;

  if (contextData) {
    systemInstruction += `\n\nContexto actual:\n${contextData}`;
  }

  switch (mode) {
    case AIMode.REASONING:
      modelName = 'gemini-3-pro-preview'; 
      thinkingConfig = { thinkingBudget: 32768 };
      break;
    case AIMode.SEARCH:
      modelName = 'gemini-3-flash-preview'; 
      tools = [{ googleSearch: {} }];
      break;
    case AIMode.FAST:
    default:
      modelName = 'gemini-3-flash-preview';
      break;
  }

  try {
    // Generate content using the new SDK patterns
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction,
        tools: tools.length > 0 ? tools : undefined,
        thinkingConfig: thinkingConfig,
      }
    });

    // Access .text property directly
    const text = response.text || "No hay respuesta disponible.";
    const sources: Array<{ uri: string; title: string }> = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({ uri: chunk.web.uri, title: chunk.web.title });
        }
      });
    }

    return { text, sources };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Error al conectar con la inteligencia artificial.", sources: [] };
  }
};

export const generateReplySuggestion = async (conversation: string, leadContext: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Sugiere una respuesta profesional y breve para esta conversación de KlierNav Innovations.\n\nContexto: ${leadContext}\n\nChat:\n${conversation}`,
            config: {
                systemInstruction: "Eres un experto en ventas digitales. Tu estilo es persuasivo y directo. Máximo 20 palabras."
            }
        });
        return response.text;
    } catch (e) {
        return null;
    }
};

export const analyzeLeadWithAI = async (leadData: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analiza este lead para KlierNav Innovations:\n${leadData}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        nextSteps: { type: Type.STRING },
                        winProbability: { type: Type.INTEGER },
                        contactTone: { type: Type.STRING }
                    }
                }
            }
        });
        return response.text;
    } catch (e) {
        return null;
    }
}
