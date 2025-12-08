// // lib/transform-feedback.ts

// import { Feedback, FeedbackItem } from "@/types/interview";

// interface ApiFeedbackItem {
//   id: number;
//   question: string;
//   answer: string;
//   feedback: string;
//   better_answer: string;
//   score: {
//     structure: string;
//     content: string;
//     communication: string;
//     technical: string;
//   };
//   strengths: string[];
//   improvements: string[];
//   suggestions?: string[];
// }

// interface ApiFeedbackResponse {
//   success: boolean;
//   sessionId: string;
//   stage: string;
//   message: string;
//   feedback: {
//     stage: string;
//     role: string;
//     role_level: string;
//     feedback: ApiFeedbackItem[];
//   };
//   summary: {
//     totalQuestions: number;
//     totalAnswered: number;
//   };
// }

// export const transformFeedbackData = (apiData: ApiFeedbackResponse): Feedback => {
//   const feedbackItems = apiData.feedback.feedback;
  
//   // Calculate overall average score
//   const totalScore = feedbackItems.reduce((sum: number, item: ApiFeedbackItem) => {
//     const scores = Object.values(item.score || {});
//     const itemAvg = scores.reduce((s: number, v: any) => s + parseFloat(v), 0) / scores.length;
//     return sum + itemAvg;
//   }, 0);
  
//   const overallScore = feedbackItems.length > 0 ? totalScore / feedbackItems.length : 0;
  
//   // Extract all unique strengths and improvements
//   const allStrengths: string[] = [];
//   const allImprovements: string[] = [];
  
//   feedbackItems.forEach((item: ApiFeedbackItem) => {
//     if (item.strengths) allStrengths.push(...item.strengths);
//     if (item.improvements) allImprovements.push(...item.improvements);
//   });
  
//   // Create recommendations based on improvements
//   const recommendations = allImprovements
//     .slice(0, 3)
//     .map(imp => `Focus on: ${imp.toLowerCase()}`);
  
//   // Transform feedback items
//   const transformedFeedback: FeedbackItem[] = feedbackItems.map((item: ApiFeedbackItem) => ({
//     id: item.id,
//     question: item.question,
//     answer: item.answer || "No answer provided",
//     feedback: item.feedback || "",
//     better_answer: item.better_answer || "",
//     score: item.score || {
//       structure: "0/10",
//       content: "0/10",
//       communication: "0/10",
//       technical: "0/10"
//     },
//     strengths: item.strengths || [],
//     improvements: item.improvements || [],
//     suggestions: item.suggestions || []
//   }));
  
//   return {
//     overall_score: parseFloat(overallScore.toFixed(1)),
//     feedback: transformedFeedback,
//     strengths: [...new Set(allStrengths)], // Remove duplicates
//     areas_for_improvement: [...new Set(allImprovements)], // Remove duplicates
//     recommendations: recommendations,
//     // stage: apiData.stage || "complete"
//   };
// };

// // Helper to get role and level from API response
// export const getRoleAndLevel = (apiData: ApiFeedbackResponse) => {
//   return {
//     role: apiData.feedback.role || "Unknown Role",
//     level: apiData.feedback.role_level || "Unknown Level"
//   };
// };

// // Helper to get session ID
// export const getSessionId = (apiData: ApiFeedbackResponse) => {
//   return apiData.sessionId;
// };