import { GoogleGenAI, Type } from '@google/genai';

export interface TriageResult {
  urgencyLevel: 'URGENT' | 'SEE_DOCTOR' | 'HOME_CARE';
  conditions: string[];
  careAdvice: string;
  explanation: string;
}

const triageSchema = {
  type: Type.OBJECT,
  properties: {
    urgencyLevel: {
      type: Type.STRING,
      description: 'MUST be exactly one of: URGENT, SEE_DOCTOR, HOME_CARE',
      enum: ['URGENT', 'SEE_DOCTOR', 'HOME_CARE']
    },
    conditions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of highly possible conditions based on the symptoms provided, taking into account common regional ailments in Africa if relevant.'
    },
    careAdvice: {
      type: Type.STRING,
      description: 'Basic safe home care advice or first aid. Must not contradict urgent care needs if the situation is urgent.'
    },
    explanation: {
      type: Type.STRING,
      description: 'Brief explanation of why this urgency level was chosen.'
    }
  },
  required: ['urgencyLevel', 'conditions', 'careAdvice', 'explanation']
};

export async function analyzeSymptoms(symptoms: string): Promise<TriageResult> {
  const key = process.env.GEMINI_API_KEY;
  
  if (!key) {
    throw new Error("Gemini API key is missing from the environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: key });

  const prompt = `You are "MedAssist AI", an expert medical triage assistant specifically tailored to help African patients. 
Your goal is to evaluate the provided symptoms and determine the appropriate level of urgency, potential conditions (considering endemic and common diseases in Africa when applicable, as well as general illnesses), and provide basic home care advice.
  
IMPORTANT SAFETY RULES:
1. Always err on the side of caution. If symptoms suggest a potentially life-threatening condition (e.g., severe chest pain, difficulty breathing, stroke symptoms, profuse bleeding, extreme fever in a malaria-endemic region), classify as URGENT.
2. Provide clear, basic home care advice, but explicitly state that this advice does not replace a doctor's visit.
3. Keep the language accessible, clear, and reassuring.

Evaluate these symptoms from the user:
"${symptoms}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: triageSchema,
        temperature: 0.2, // Low temperature for more deterministic, safer triage
      }
    });

    if (!response.text) {
      throw new Error("No response received from the AI.");
    }

    const result = JSON.parse(response.text) as TriageResult;
    return result;
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    
    const errorMessage = error?.message || "";
    if (errorMessage.includes("429") || errorMessage.includes("Quota exceeded") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
      const match = errorMessage.match(/retry in ([\d\.]+)s/);
      if (match) {
        const seconds = Math.ceil(parseFloat(match[1]));
        throw new Error(`API Rate limit reached (Free Tier Quota). Please wait ${seconds} seconds before trying again.`);
      }
      throw new Error("API Rate limit reached (Free Tier Quota). You are making too many requests too quickly. Please wait a minute and try again.");
    }
    
    throw new Error(error instanceof Error ? error.message : "Failed to analyze symptoms.");
  }
}
