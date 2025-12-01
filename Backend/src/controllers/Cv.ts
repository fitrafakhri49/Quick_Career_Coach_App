// controllers/cvController.ts
import { Request, Response } from "express";
import path from "path";
import { parseCV } from "../utils/pdfParser";
import { askGemini } from "../services/Gemini";
import { prisma } from "../prisma/client";

function cleanAIResponse(raw: string): string {
  if (!raw) return "";


  let cleaned = raw.replace(/```json|```/g, "").trim();

 
  cleaned = cleaned.replace(/\\n/g, "\n").replace(/\\t/g, "\t");

  return cleaned;
}

export const analyzeCVFromFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File missing" });

    const ext = path.extname(req.file.originalname).toLowerCase();
    const text = await parseCV(req.file.path, ext);

    if (!text) return res.status(400).json({ error: "Failed to parse CV" });

    const cleanText = text.replace(/\\n/g, "\n");
    const paragraphText = cleanText.replace(/\r?\n/g, "\n\n"); 

    const prompt =`
    Extract from this CV:
      - Personal info (name, contact)
      - Work experience (company, role, dates, descriptions)
      - Education
      - Skills
      - Projects (if any)
     
    CV Content:
    ${paragraphText}
    and give suggestion like below according to uploaded cv
    Overall Score: score/10   │
│                                       │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                       │
│ 💡 Top Recommendations:               │
│                                       │
│ 🔴 HIGH PRIORITY                      │
              │
│                                       │
│ 🟡 MEDIUM PRIORITY                    │
│           │
│ [View All 7 Suggestions]              │
│ [Download Improvement Checklist]      │
│                                       
    Return as structured JSON.    
    `;

    const rawResult = await askGemini(prompt);
    const cleanedResult = cleanAIResponse(rawResult);

    let parsed;
    try {
      parsed = JSON.parse(cleanedResult);
    } catch (err) {
      return res.status(500).json({
        error: "Gemini response is not valid JSON",
        raw: cleanedResult,
      });
    }

    const saved = await prisma.cVHistory.create({
      data: { text: paragraphText, analysis: parsed },
    });

    return res.json({
      success: true,
      id: saved.id,
      parsedText: paragraphText,
      analysis: parsed,
    });

  } catch (err) {
    console.error("AnalyzeCVFromFile Error:", err);
    return res.status(500).json({
      error: "Failed to analyze CV",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
};


export const getAnalyze = async (req: Request, res: Response) => {
  try {
    const id = req.query.id as string | undefined;

    if (!id) return res.status(400).json({ error: "CV ID is required in query" });

    const cvHistory = await prisma.cVHistory.findUnique({
      where: { id },
    });

    if (!cvHistory) return res.status(404).json({ error: "CV analysis not found" });

    return res.json({
      success: true,
      id: cvHistory.id,
      parsedText: cvHistory.text,
      analysis: cvHistory.analysis,
    });

  } catch (err) {
    console.error("GetAnalyze Error:", err);
    return res.status(500).json({
      error: "Failed to get CV analysis",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
};
