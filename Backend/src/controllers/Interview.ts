import { supabase } from "../supabase/client";
import { Request, Response } from "express";
import { askGemini } from "../services/Gemini";
import { prisma } from "../prisma/client";
import interviewStore from "../storage/interviewStore";
// function escapeForPrompt(s: string) {
//     if (!s) return "";
//     return s
//       .replace(/\\/g, "\\\\")
//       .replace(/"/g, '\\"')
//       .replace(/\r/g, "")
//       .replace(/\n/g, "\\n");
//   }
export async function interview(req: Request, res: Response) {
    try {
      const { role,level, answers} = req.body;
      const parsed_from_CV=interviewStore.paragraphText
      if (!interviewStore.paragraphText) {
        return res.status(400).json({
          success: false,
          message: "parsedText (CV text) is required. Send paragraphText from analyzeCV step."
        });
      }
      console.log(parsed_from_CV);
      
      const isAnswerStage = Array.isArray(answers) && answers.length === 3;
  
  
      if (!isAnswerStage) {
        const prompt = `
  You are an HR interviewer.
  
  Generate exactly 3 HR-style questions based on this job role:
  Role: ${role}
  Level:${level}
  Candidate CV:${parsed_from_CV}
  Include:
1. Behavioral question (STAR format)
2. Technical question (role-specific)
3. Situational question (problem-solving)

  
  STRICT RULES:
  1. Respond ONLY with VALID JSON.
  2. No markdown, no explanations.
  3. No null. Use "".
  4. Format EXACTLY:
  
  {
    "stage": "questions",
    "role": "${role}",
    "role_level":"${level}"
    "questions": [
      { "id": 1, "question": "" },
      { "id": 2, "question": "" },
      { "id": 3, "question": "" }
    ]
  }


  Context:
- Candidate's experience: ${parsed_from_CV}
- Role level: ${level}

Return questions yang realistic & commonly asked

  `;
  
        const response = await askGemini(prompt);
  
        let parsed;
        try {
          parsed = JSON.parse(response);
        } catch (err) {
          return res.status(400).json({
            success: false,
            message: "Gemini returned invalid JSON",
            raw: response,
          });
        }
  
        return res.json({ success: true, result: parsed });
      }
  
      // ------------------------------
      // STEP 2 → Provide Feedback
      // ------------------------------
  
      const a1 = String(answers[0] || "");
      const a2 = String(answers[1] || "");
      const a3 = String(answers[2] || "");
  
      const prompt = `
  You are an HR evaluator. Provide feedback for each candidate answer.
  
  You will evaluate three candidate answers. IMPORTANT:
  - Do NOT modify or rewrite the candidate's original answers.
  - In your JSON output, include the candidate's original answer in the "answer" field (exactly as provided in the input).
  - Provide AI-generated "better_answer" (an improved example) and "feedback" (short, constructive), plus "score", "strengths", and "improvements".

  STRICT RULES:
  1. Respond ONLY with valid JSON.
  2. No markdown, no explanations.
  3. No null. Use "".
  

  
Candidate Answers (do NOT change them):
1) "${a1}"
2) "${a2}"
3) "${a3}"

  
  OUTPUT FORMAT:
  
  {
    "stage": "feedback",
    "role": "${role}",
    "feedback": [
      {
        "id": 1,
        "answer": "${a1}",
        "feedback": "",
        "better_answer": "",
        "score": {
          "structure": "",
          "content": "",
          "communication": "",
          "technical": ""
        },
        "strengths": [],
        "improvements": []
      },
      {
        "id": 2,
        "answer": "${a2}",
        "feedback": "",
        "better_answer": "",
        "score": {
          "structure": "",
          "content": "",
          "communication": "",
          "technical": ""
        },
        "strengths": [],
        "improvements": []
      },
      {
        "id": 3,
        "answer": "${a3}",
        "feedback": "",
        "better_answer": "",
        "score": {
          "structure": "0-10/10",
          "content": "0-10/10",
          "communication": "0-10/10",
          "technical": "0-10/10"
        },
        "strengths": [],
        "improvements": []
      }
    ]
  }
  
  
  Rules:
  - Feedback must be constructive and relevant.
  Evaluation criteria:
  - If an answer is empty string, set feedback to "No answer provided." and scores empty.
  - Provide a short "better_answer" example per question (<= 200 chars).


1. Structure (25%)
   - Clear beginning/middle/end
   - Logical flow
   - STAR method (for behavioral)

2. Content (35%)
   - Specific examples
   - Quantifiable results
   - Relevant to question
   - Depth of explanation

3. Communication (20%)
   - Clarity
   - Conciseness (not too long/short)
   - Professional tone

4. Technical accuracy (20%) - for technical questions
   - Correct concepts
   - Demonstrates understanding

analyzes answer, returns:
- Score per criteria
- Specific strengths
- Areas to improve
- Better answer example
  `;
  
      const response = await askGemini(prompt);
  
      let parsed;
      try {
        parsed = JSON.parse(response);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Gemini returned invalid JSON",
          raw: response,
        });
      }
  
      if (parsed && Array.isArray(parsed.feedback)) {
        parsed.feedback = parsed.feedback.map((f: any, idx: number) => {
          const originalAnswer = idx === 0 ? a1 : idx === 1 ? a2 : a3;
         
          const out: any = {
            id: f.id ?? idx + 1,
            answer: originalAnswer,
            feedback: typeof f.feedback === "string" ? f.feedback : "",
            better_answer: typeof f.better_answer === "string" ? f.better_answer : "",
            score: typeof f.score === "object" ? f.score : {
              structure: "",
              content: "",
              communication: "",
              technical: ""
            },
            strengths: Array.isArray(f.strengths) ? f.strengths : [],
            improvements: Array.isArray(f.improvements) ? f.improvements : []
          };
          // If the answer is empty, override feedback as required
          if (!originalAnswer) {
            out.feedback = "No answer provided.";
            out.better_answer = "";
            out.score = {
              structure: "",
              content: "",
              communication: "",
              technical: ""
            };
          }
          return out;
        });
      } else {
        // If parsed structure unexpected, build fallback using user answers
        parsed = {
          stage: "feedback",
          role: role || "",
          feedback: [
            {
              id: 1,
              answer: a1,
              feedback: a1 ? "No feedback available." : "No answer provided.",
              better_answer: "",
              score: { structure: "", content: "", communication: "", technical: "" },
              strengths: [],
              improvements: []
            },
            {
              id: 2,
              answer: a2,
              feedback: a2 ? "No feedback available." : "No answer provided.",
              better_answer: "",
              score: { structure: "", content: "", communication: "", technical: "" },
              strengths: [],
              improvements: []
            },
            {
              id: 3,
              answer: a3,
              feedback: a3 ? "No feedback available." : "No answer provided.",
              better_answer: "",
              score: { structure: "", content: "", communication: "", technical: "" },
              strengths: [],
              improvements: []
            }
          ]
        };
      }

      return res.json({
        success: true,
        result: parsed,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
  