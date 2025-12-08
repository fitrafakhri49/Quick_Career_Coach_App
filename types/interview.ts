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

export type FeedbackItem = {
  id: number;
  question: string;
  answer: string;
  feedback: string;
  better_answer: string;
  score: ScoreDetail;
  strengths: string[];
  improvements: string[];
  suggestions?: string[];
  areas_for_improvement?: string[];
};

export type BackendFeedback = {
  stage: string;
  role: string;
  role_level: string;
  feedback: FeedbackItem[];
};

export type Feedback = {
  overall_score: number;
  feedback: FeedbackItem[];
  strengths: string[];
  areas_for_improvement: string[];
  recommendations: string[];
};

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
  feedback?: BackendFeedback;
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

// Helper function to transform backend feedback
export const transformFeedback = (backendFeedback: BackendFeedback): Feedback => {
  if (!backendFeedback) {
    return {
      overall_score: 0,
      feedback: [],
      strengths: [],
      areas_for_improvement: [],
      recommendations: []
    };
  }

  const feedbackItems = backendFeedback.feedback || [];
  
  // Calculate overall score
  const totalScore = feedbackItems.reduce((sum, item) => {
    const scores = item.score ? Object.values(item.score).map(v => {
      const num = parseFloat(v as string);
      return isNaN(num) ? 0 : num;
    }) : [];
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return sum + avg;
  }, 0);
  
  const overall_score = feedbackItems.length > 0 ? totalScore / feedbackItems.length : 0;
  
  // Combine strengths and improvements
  const allStrengths = Array.from(new Set(
    feedbackItems.flatMap(item => item.strengths || [])
  ));
  
  const allImprovements = Array.from(new Set(
    feedbackItems.flatMap(item => item.improvements || [])
  ));
  
  // Transform items for component compatibility
  const transformedItems = feedbackItems.map(item => ({
    ...item,
    suggestions: item.improvements || [],
    areas_for_improvement: item.improvements || []
  }));

  return {
    overall_score,
    feedback: transformedItems,
    strengths: allStrengths,
    areas_for_improvement: allImprovements,
    recommendations: allImprovements.map(imp => `Consider: ${imp}`)
  };
};