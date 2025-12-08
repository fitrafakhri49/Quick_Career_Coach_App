import { InterviewSession } from '@/types/interview';

const SESSION_KEY = 'interview_session';

export const saveInterviewSession = (session: InterviewSession): void => {
  if (typeof window === 'undefined') return;
  
  const sessionData = {
    ...session,
    createdAt: new Date().toISOString()
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
};

export const getCurrentSession = (): InterviewSession | null => {
  if (typeof window === 'undefined') return null;
  
  const sessionData = localStorage.getItem(SESSION_KEY);
  if (!sessionData) return null;
  
  try {
    return JSON.parse(sessionData) as InterviewSession;
  } catch (error) {
    console.error('Failed to parse session data:', error);
    return null;
  }
};

export const updateSessionProgress = (sessionId: string, currentQuestion: number): void => {
  const session = getCurrentSession();
  if (session && session.sessionId === sessionId) {
    session.currentQuestion = currentQuestion;
    saveInterviewSession(session);
  }
};

export const clearInterviewSession = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
};

export const getCvFromStorage = (): any => {
  if (typeof window === 'undefined') return null;
  
  const cvAnalysis = localStorage.getItem('analysis');
  if (!cvAnalysis) return null;
  
  try {
    const parsed = JSON.parse(cvAnalysis);
    return parsed.analysis;
  } catch (error) {
    console.error('Failed to parse CV analysis:', error);
    return null;
  }
};