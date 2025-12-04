import { supabase } from "../supabase/client";
import { Request, Response } from "express";
import { askGemini } from "../services/Gemini";
import { prisma } from "../prisma/client";
import { cleanAIResponse } from "../utils/cleanAIResponse";

export async function skillAnalysis(req: Request, res: Response) {
  try {
    const { targetRole, parsedCv } = req.body;

    if (!parsedCv) {
      return res.status(400).json({
        success: false,
        message: "parsedCv (CV text) is required.",
      });
    }

    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: "targetRole is required.",
      });
    }

    const prompt = `
You are an AI specialized in analyzing job skills.

Your tasks:

1. Extract all relevant skills from the candidate CV text below.
2. Compare the extracted skills with the required skills for the target role.
3. Classify them into:
   - Matched skills (candidate already has)
   - Missing skills (required but not found)
   - Nice-to-have skills (beneficial but not required)
4. Provide learning recommendations such as:
   - Recommended courses (Coursera, Udemy, LinkedIn Learning, Dicoding)
   - Suggested practice projects for portfolio

---

### Candidate CV Text:
${parsedCv}

### Target Role:
${targetRole}

---

### Very Important:
Return output ONLY in clean JSON. No explanation, no markdown, no extra text.

The JSON keys MUST be exactly:

{
  "extracted_skills": [],
  "matched_skills": [],
  "missing_skills": [],
  "nice_to_have_skills": [],
  "recommendations": {
      "courses": [],
      "projects": []
  }
}

Ensure the JSON is valid and properly formatted.
`;

    const rawResult = await askGemini(prompt);
    const cleaned = cleanAIResponse(rawResult);

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON.",
        raw: cleaned,
      });
    }

    return res.json({
      success: true,
      role: targetRole,
      analysis: parsed,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error in skill analysis",
      detail: error instanceof Error ? error.message : error,
    });
  }
}
