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
    const existing = await prisma.cVHistory.findFirst({
      where: { text: paragraphText },
    });

    if (existing) {
      return res.json({
        success: true,
        id: existing.id,
        parsedText: paragraphText,
        extract: existing.analysis,
        cached: true, 
      });
    }

    const prompt =` 
    CV Content:
    ${paragraphText}
    Extract from this CV:
    - Personal info (name, contact)
    - Work experience (company, role, dates, descriptions)
    - Education
    - Skills
    - Projects (if any)
    YOU MUST FOLLOW THESE RULES STRICTLY:

1. RESPOND ONLY WITH VALID JSON.
2. DO NOT WRITE ANY TEXT OUTSIDE JSON.
3. DO NOT WRITE MARKDOWN OR EXPLANATIONS.
4. DO NOT ADD SENTENCES BEFORE OR AFTER JSON.
5. ALL FIELDS MUST EXIST EXACTLY AS IN THE TEMPLATE.
6. USE "" FOR EMPTY STRING AND [] FOR EMPTY ARRAY.
7. NEVER USE null.
8. ALWAYS INCLUDE SUGGESTIONS.
9. IF YOU ARE UNSURE, RETURN EMPTY STRING OR EMPTY ARRAY.
    **OUTPUT FORMAT MUST BE IN JSON ONLY**

    {
      "analysis": {
        "extracted_data": {
          "personal_info": {
            "name": "",
            "contact": {
              "email": "",
              "phone": "",
              "linkedin": "",
              "location": ""
            }
          },
          "work_experience": [
            {
              "company": "",
              "role": "",
              "dates": "",
              "location": "",
              "description": []
            }
          ],
          "education": [
            {
              "degree": "",
              "university": "",
              "location": "",
              "year": ""
            }
          ],
          "skills": [],
          "projects": []
        },
        "suggestions": {
          "overall_score": "score/10",
          "recommendations": {
            "HIGH PRIORITY": [
              {
                "title": "",
                "description": "",
                "example": ""
              }
            ],
            "MEDIUM PRIORITY": [
              {
                "title": "",
                "description": "",
                "example": ""
              }
            ],
            "LOW PRIORITY": [
              {
                "title": "",
                "description": "",
                "example": ""
              }
            ]
          }
        }
      }
    }
    

Return as structured valid JSON.  
**IMPORTANT RULES MUST BE OBEY:**
- ONLY RETURN JSON DATA, WITH NO MARKDOWN
- MAKE SURE ALL THE FIELD ABOVE HAVE RESPONSE IF NOT RETURN WITH EMPTY ARRAY
- DONT USE NULL FOR ARRAY, ALWAYS USE []
- ALWAYS GIVE SUGGESTION
“Respond ONLY with valid JSON. No explanations. No text outside JSON.”
“If a field has no data, use empty string or empty array.”
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
      extract: parsed,
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
