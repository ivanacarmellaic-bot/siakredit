import { GoogleGenAI } from "@google/genai";
import { JurnalEntry } from "../types";

// Note: In a real production app, this would be a backend proxy to protect the key.
// Since this is a frontend-only demo generated via instructions, we use the env var directly.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const auditJournalEntry = async (entry: JurnalEntry): Promise<string> => {
  if (!apiKey) {
    return "Simulated AI Audit: API Key is missing. In a real environment, Gemini would analyze this journal entry for accounting compliance, verifying that Debit 'Persediaan' and Credit 'Utang Usaha' match the Invoice amount.";
  }

  try {
    const prompt = `
      You are an expert Senior Accountant and System Auditor.
      Analyze the following Accounting Journal Entry in JSON format:
      
      ${JSON.stringify(entry, null, 2)}
      
      Please provide a brief, professional audit summary (max 100 words).
      1. Verify if the logic (Debit vs Credit) follows standard Accrual Accounting for Credit Purchases.
      2. Mention the specific accounts affected.
      3. Confirm if the entry is balanced.
      
      Format the output as a clean text paragraph.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI Auditor. Please check your network or API Key configuration.";
  }
};