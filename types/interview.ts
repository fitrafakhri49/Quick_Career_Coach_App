// Base types matching backend
export type Question = {
  id: number;
  question: string;
};

export type ScoreDetail = {
  structure: string;
  content: string;
  communication: string;
  technical: string;
};

export interface FeedbackItem {
  id: number;
  question: string;
  answer: string;
  feedback: string;
  better_answer: string;
  score: ScoreDetail;
  strengths: string[];
  improvements: string[];
  suggestions?: string[];
}

export interface ApiFeedbackResponse {
  success: boolean;
  sessionId: string;
  stage: string;
  message: string;
  feedback: {
    stage: string;
    role: string;
    role_level: string;
    feedback: FeedbackItem[];
  };
  summary: {
    totalQuestions: number;
    totalAnswered: number;
  };
}

export interface FrontendFeedback {
  overall_score: number;
  feedback: FeedbackItem[];
  strengths: string[];
  areas_for_improvement: string[];
  recommendations: string[];
  stage?: string;
}

export type Summary = {
  totalQuestions: number;
  totalAnswered: number;
};

// API Request Types
export type StartInterviewRequest = {
  role: string;
  level: string;
  parsedCv: string;
};

export type SubmitAnswerRequest = {
  sessionId: string;
  answer: string;
};

// API Response Types
export type StartInterviewResponse = {
  success: boolean;
  sessionId: string;
  totalQuestions: number;
  currentQuestion: number;
  question: Question;
  progress: string;
};

export type SubmitAnswerResponse = {
  success: boolean;
  sessionId: string;
  stage: 'in_progress' | 'complete';
  currentQuestion?: number;
  totalQuestions?: number;
  question?: Question;
  feedback?: ApiFeedbackResponse['feedback'];
  summary?: Summary;
  message?: string;
  progress?: string;
};

export type GetQuestionResponse = {
  success: boolean;
  sessionId: string;
  stage: 'in_progress' | 'complete';
  currentQuestion?: number;
  totalQuestions?: number;
  question?: Question;
  message?: string;
  answeredQuestions?: number;
  progress?: string;
};

// Session management
export type InterviewSession = {
  sessionId: string;
  role: string;
  level: string;
  createdAt: string;
  currentQuestion?: number;
  totalQuestions?: number;
  stage: 'in_progress' | 'complete';
};

// Helper function to transform API response to frontend format
export const transformApiFeedback = (apiResponse: ApiFeedbackResponse): FrontendFeedback => {
  if (!apiResponse?.feedback?.feedback) {
    return {
      overall_score: 0,
      feedback: [],
      strengths: [],
      areas_for_improvement: [],
      recommendations: [],
      stage: apiResponse?.stage || "complete"
    };
  }

  const feedbackItems = apiResponse.feedback.feedback;
  
  // Calculate overall score from individual item scores
  const totalScore = feedbackItems.reduce((sum, item) => {
    if (!item.score) return sum;
    
    const scores = Object.values(item.score).map(v => {
      const num = parseFloat(v as string);
      return isNaN(num) ? 0 : num;
    });
    
    if (scores.length === 0) return sum;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return sum + avg;
  }, 0);
  
  const overall_score = feedbackItems.length > 0 ? totalScore / feedbackItems.length : 0;
  
  // Combine all strengths and improvements from all items
  const allStrengths: string[] = [];
  const allImprovements: string[] = [];
  
  feedbackItems.forEach(item => {
    if (item.strengths && Array.isArray(item.strengths)) {
      allStrengths.push(...item.strengths);
    }
    if (item.improvements && Array.isArray(item.improvements)) {
      allImprovements.push(...item.improvements);
    }
  });
  
  // Create unique lists
  const uniqueStrengths = [...new Set(allStrengths)];
  const uniqueImprovements = [...new Set(allImprovements)];
  
  // Create recommendations based on improvements (limit to 3)
  const recommendations = uniqueImprovements
    .slice(0, 3)
    .map(imp => `Focus on: ${imp}`);
  
  return {
    overall_score: parseFloat(overall_score.toFixed(1)),
    feedback: feedbackItems.map(item => ({
      ...item,
      suggestions: item.improvements || [],
      // Ensure score has all properties
      score: {
        structure: item.score?.structure || "0/10",
        content: item.score?.content || "0/10",
        communication: item.score?.communication || "0/10",
        technical: item.score?.technical || "0/10"
      }
    })),
    strengths: uniqueStrengths,
    areas_for_improvement: uniqueImprovements,
    recommendations: recommendations,
    stage: apiResponse.stage || "complete"
  };
};

// Helper to extract role and level
export const extractRoleAndLevel = (apiResponse: ApiFeedbackResponse) => {
  return {
    role: apiResponse.feedback?.role || "Unknown Role",
    level: apiResponse.feedback?.role_level || "Unknown Level"
  };
};

// Helper to get session ID
export const extractSessionId = (apiResponse: ApiFeedbackResponse) => {
  return apiResponse.sessionId || "";
};