// import { supabase } from "../supabase/client";
// import { Request, Response } from "express";
// import { askGemini } from "../services/Gemini";
// import { prisma } from "../prisma/client";

// export async function interview(req: Request, res: Response) {
//     try {
//       const { role,level,parsedCv, answers} = req.body;

//     if (!parsedCv) {
//         return res.status(400).json({
//           success: false,
//           message: "parsedText (CV text) is required.",
//         });
//       }
//       const isAnswerStage = Array.isArray(answers) && answers.length === 3;
  
  
//       if (!isAnswerStage) {
//         const prompt = `
//   You are an HR interviewer.
  
//   Generate exactly 3 HR-style questions based on this job role:
//   Role: ${role}
//   Level:${level}
//   Candidate CV:${parsedCv}
//   Include:
// 1. Behavioral question (STAR format)
// 2. Technical question (role-specific)
// 3. Situational question (problem-solving)

  
//   STRICT RULES:
//   1. Respond ONLY with VALID JSON.
//   2. No markdown, no explanations.
//   3. No null. Use "".
//   4. Format EXACTLY:
  
//   {
//     "stage": "questions",
//     "role": "${role}",
//     "role_level":"${level}"
//     "questions": [
//       { "id": 1, "question": "" },
//       { "id": 2, "question": "" },
//       { "id": 3, "question": "" }
//     ]
//   }


//   Context:
// - Candidate's experience: ${parsedCv}
// - Role level: ${level}

// Return questions yang realistic & commonly asked

//   `;
  
//         const response = await askGemini(prompt);
  
//         let parsed;
//         try {
//           parsed = JSON.parse(response);
//         } catch (err) {
//           return res.status(400).json({
//             success: false,
//             message: "Gemini returned invalid JSON",
//             raw: response,
//           });
//         }
  
//         return res.json({ success: true, result: parsed });
//       }

  
//       const a1 = String(answers[0] || "");
//       const a2 = String(answers[1] || "");
//       const a3 = String(answers[2] || "");
  
//       const prompt = `
//   You are an HR evaluator. Provide feedback for each candidate answer.
  
//   You will evaluate three candidate answers. IMPORTANT:
//   - Do NOT modify or rewrite the candidate's original answers.
//   - In your JSON output, include the candidate's original answer in the "answer" field (exactly as provided in the input).
//   - Provide AI-generated "better_answer" (an improved example) and "feedback" (short, constructive), plus "score", "strengths", and "improvements".

//   STRICT RULES:
//   1. Respond ONLY with valid JSON.
//   2. No markdown, no explanations.
//   3. No null. Use "".
  

  
// Candidate Answers (do NOT change them):
// 1) "${a1}"
// 2) "${a2}"
// 3) "${a3}"

  
//   OUTPUT FORMAT:
  
//   {
//     "stage": "feedback",
//     "role": "${role}",
//     "feedback": [
//       {
//         "id": 1,
//         "answer": "${a1}",
//         "feedback": "",
//         "better_answer": "",
//         "score": {
//           "structure": "",
//           "content": "",
//           "communication": "",
//           "technical": ""
//         },
//         "strengths": [],
//         "improvements": []
//       },
//       {
//         "id": 2,
//         "answer": "${a2}",
//         "feedback": "",
//         "better_answer": "",
//         "score": {
//           "structure": "",
//           "content": "",
//           "communication": "",
//           "technical": ""
//         },
//         "strengths": [],
//         "improvements": []
//       },
//       {
//         "id": 3,
//         "answer": "${a3}",
//         "feedback": "",
//         "better_answer": "",
//         "score": {
//           "structure": "0-10/10",
//           "content": "0-10/10",
//           "communication": "0-10/10",
//           "technical": "0-10/10"
//         },
//         "strengths": [],
//         "improvements": []
//       }
//     ]
//   }
  
  
//   Rules:
//   - Feedback must be constructive and relevant.
//   Evaluation criteria:
//   - If an answer is empty string, set feedback to "No answer provided." and scores empty.
//   - Provide a short "better_answer" example per question (<= 200 chars).


// 1. Structure (25%)
//    - Clear beginning/middle/end
//    - Logical flow
//    - STAR method (for behavioral)

// 2. Content (35%)
//    - Specific examples
//    - Quantifiable results
//    - Relevant to question
//    - Depth of explanation

// 3. Communication (20%)
//    - Clarity
//    - Conciseness (not too long/short)
//    - Professional tone

// 4. Technical accuracy (20%) - for technical questions
//    - Correct concepts
//    - Demonstrates understanding

// analyzes answer, returns:
// - Score per criteria
// - Specific strengths
// - Areas to improve
// - Better answer example
//   `;
  
//       const response = await askGemini(prompt);
  
//       let parsed;
//       try {
//         parsed = JSON.parse(response);
//       } catch (err) {
//         return res.status(400).json({
//           success: false,
//           message: "Gemini returned invalid JSON",
//           raw: response,
//         });
//       }
  
//       if (parsed && Array.isArray(parsed.feedback)) {
//         parsed.feedback = parsed.feedback.map((f: any, idx: number) => {
//           const originalAnswer = idx === 0 ? a1 : idx === 1 ? a2 : a3;
         
//           const out: any = {
//             id: f.id ?? idx + 1,
//             answer: originalAnswer,
//             feedback: typeof f.feedback === "string" ? f.feedback : "",
//             better_answer: typeof f.better_answer === "string" ? f.better_answer : "",
//             score: typeof f.score === "object" ? f.score : {
//               structure: "",
//               content: "",
//               communication: "",
//               technical: ""
//             },
//             strengths: Array.isArray(f.strengths) ? f.strengths : [],
//             improvements: Array.isArray(f.improvements) ? f.improvements : []
//           };
//           // If the answer is empty, override feedback as required
//           if (!originalAnswer) {
//             out.feedback = "No answer provided.";
//             out.better_answer = "";
//             out.score = {
//               structure: "",
//               content: "",
//               communication: "",
//               technical: ""
//             };
//           }
//           return out;
//         });
//       } else {
//         // If parsed structure unexpected, build fallback using user answers
//         parsed = {
//           stage: "feedback",
//           role: role || "",
//           feedback: [
//             {
//               id: 1,
//               answer: a1,
//               feedback: a1 ? "No feedback available." : "No answer provided.",
//               better_answer: "",
//               score: { structure: "", content: "", communication: "", technical: "" },
//               strengths: [],
//               improvements: []
//             },
//             {
//               id: 2,
//               answer: a2,
//               feedback: a2 ? "No feedback available." : "No answer provided.",
//               better_answer: "",
//               score: { structure: "", content: "", communication: "", technical: "" },
//               strengths: [],
//               improvements: []
//             },
//             {
//               id: 3,
//               answer: a3,
//               feedback: a3 ? "No feedback available." : "No answer provided.",
//               better_answer: "",
//               score: { structure: "", content: "", communication: "", technical: "" },
//               strengths: [],
//               improvements: []
//             }
//           ]
//         };
//       }

//       return res.json({
//         success: true,
//         result: parsed,
//       });
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: "Internal Server Error",
//       });
//     }
//   }
  

import { supabase } from "../supabase/client";
import { Request, Response } from "express";
import { askGemini } from "../services/Gemini";
import { prisma } from "../prisma/client";

// Store interview sessions in memory (use Redis or database in production)
const interviewSessions = new Map<string, {
  role: string;
  level: string;
  parsedCv: string;
  questions: Array<{ id: number; question: string }>;
  answers: Array<{ id: number; answer: string; feedback?: any }>;
  currentQuestion: number;
  sessionId: string;
}>();

export async function startInterview(req: Request, res: Response) {
  try {
    const { role, level, parsedCv } = req.body;

    if (!parsedCv) {
      return res.status(400).json({
        success: false,
        message: "parsedCv (CV text) is required.",
      });
    }

    // Generate interview questions
    const prompt = `
You are an HR interviewer.

Generate exactly 3 HR-style questions based on this job role:
Role: ${role}
Level: ${level}
Candidate CV: ${parsedCv}

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
  "role_level": "${level}",
  "questions": [
    { "id": 1, "question": "" },
    { "id": 2, "question": "" },
    { "id": 3, "question": "" }
  ]
}

Context:
- Candidate's experience: ${parsedCv}
- Role level: ${level}

Return questions that are realistic & commonly asked
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

    // Create session
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    interviewSessions.set(sessionId, {
      role,
      level,
      parsedCv,
      questions: parsed.questions,
      answers: [],
      currentQuestion: 0,
      sessionId
    });

    // Return first question
    const session = interviewSessions.get(sessionId)!;
    const firstQuestion = session.questions[0];

    return res.json({
      success: true,
      sessionId,
      totalQuestions: session.questions.length,
      currentQuestion: 1,
      question: firstQuestion,
      progress: `${1}/${session.questions.length}`
    });

  } catch (error) {
    console.error("Error starting interview:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function submitAnswer(req: Request, res: Response) {
  try {
    const { sessionId, answer } = req.body;

    if (!sessionId || answer === undefined) {
      return res.status(400).json({
        success: false,
        message: "sessionId and answer are required.",
      });
    }

    const session = interviewSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found or expired.",
      });
    }

    const currentQuestionIndex = session.currentQuestion;
    
    // Store answer
    session.answers.push({
      id: currentQuestionIndex + 1,
      answer: String(answer)
    });

    // Move to next question
    session.currentQuestion++;

    // Check if interview is complete
    if (session.currentQuestion >= session.questions.length) {
      // Generate final feedback for all answers
      const feedback = await generateFinalFeedback(session);
      
      // Clean up session (optional: store in database first)
      interviewSessions.delete(sessionId);

      return res.json({
        success: true,
        sessionId,
        stage: "complete",
        message: "Interview completed!",
        feedback: feedback,
        summary: {
          totalQuestions: session.questions.length,
          totalAnswered: session.answers.length
        }
      });
    }

    // Return next question
    const nextQuestion = session.questions[session.currentQuestion];
    
    return res.json({
      success: true,
      sessionId,
      stage: "in_progress",
      currentQuestion: session.currentQuestion + 1,
      totalQuestions: session.questions.length,
      question: nextQuestion,
      progress: `${session.currentQuestion + 1}/${session.questions.length}`
    });

  } catch (error) {
    console.error("Error submitting answer:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function getQuestion(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;

    const session = interviewSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found or expired.",
      });
    }

    const currentQuestionIndex = session.currentQuestion;
    
    if (currentQuestionIndex >= session.questions.length) {
      return res.json({
        success: true,
        sessionId,
        stage: "complete",
        message: "All questions have been answered.",
        answeredQuestions: session.answers.length
      });
    }

    const currentQuestion = session.questions[currentQuestionIndex];

    return res.json({
      success: true,
      sessionId,
      stage: "in_progress",
      currentQuestion: currentQuestionIndex + 1,
      totalQuestions: session.questions.length,
      question: currentQuestion,
      progress: `${currentQuestionIndex + 1}/${session.questions.length}`
    });

  } catch (error) {
    console.error("Error getting question:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

async function generateFinalFeedback(session: {
  role: string;
  level: string;
  parsedCv: string;
  questions: Array<{ id: number; question: string }>;
  answers: Array<{ id: number; answer: string }>;
}) {
  try {
    // Prepare answers text for the prompt
    const answersText = session.questions.map((q, idx) => {
      const answer = session.answers.find(a => a.id === q.id)?.answer || "";
      return `Question ${idx + 1}: "${q.question}"\nAnswer: "${answer}"`;
    }).join('\n\n');

    const prompt = `
You are an HR evaluator. Provide feedback for each candidate answer.

Evaluate these candidate answers. IMPORTANT:
- Do NOT modify or rewrite the candidate's original answers.
- In your JSON output, include the candidate's original answer in the "answer" field (exactly as provided in the input).
- Provide AI-generated "better_answer" (an improved example) and "feedback" (short, constructive), plus "score", "strengths", and "improvements".

STRICT RULES:
1. Respond ONLY with valid JSON.
2. No markdown, no explanations.
3. No null. Use "".

Candidate Answers (do NOT change them):
${answersText}

OUTPUT FORMAT:

{
  "stage": "feedback",
  "role": "${session.role}",
  "role_level": "${session.level}",
  "feedback": [
    {
      "id": 1,
      "question": "${session.questions[0].question}",
      "answer": "${session.answers[0]?.answer || ""}",
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
      "question": "${session.questions[1].question}",
      "answer": "${session.answers[1]?.answer || ""}",
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
      "question": "${session.questions[2].question}",
      "answer": "${session.answers[2]?.answer || ""}",
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
      // Fallback feedback
      return generateFallbackFeedback(session);
    }

    // Process and format feedback
    if (parsed && Array.isArray(parsed.feedback)) {
      parsed.feedback = parsed.feedback.map((f: any, idx: number) => {
        const originalAnswer = session.answers[idx]?.answer || "";
        const out: any = {
          id: f.id ?? idx + 1,
          question: session.questions[idx].question,
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
    }

    return parsed;

  } catch (error) {
    console.error("Error generating feedback:", error);
    return generateFallbackFeedback(session);
  }
}

function generateFallbackFeedback(session: {
  role: string;
  level: string;
  questions: Array<{ id: number; question: string }>;
  answers: Array<{ id: number; answer: string }>;
}) {
  return {
    stage: "feedback",
    role: session.role || "",
    role_level: session.level || "",
    feedback: session.questions.map((q, idx) => {
      const answer = session.answers[idx]?.answer || "";
      return {
        id: q.id,
        question: q.question,
        answer: answer,
        feedback: answer ? "No feedback available." : "No answer provided.",
        better_answer: "",
        score: { 
          structure: "", 
          content: "", 
          communication: "", 
          technical: "" 
        },
        strengths: [],
        improvements: []
      };
    })
  };
}

// Optional: Clean up old sessions periodically
function cleanupOldSessions() {
  // In production, use a proper session store with TTL
  // This is a simple in-memory example
  setInterval(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    // Add timestamp to sessions for cleanup if needed
  }, 30 * 60 * 1000); // Clean up every 30 minutes
}

// Start cleanup on server start
cleanupOldSessions();