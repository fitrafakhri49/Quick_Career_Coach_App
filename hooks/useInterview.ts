import { useState, useCallback } from 'react';
import { interviewApi } from '@/lib/api';
import { 
  StartInterviewRequest, 
  SubmitAnswerRequest,
  InterviewSession
} from '@/types/interview';
import { saveInterviewSession, getCurrentSession, clearInterviewSession } from '@/lib/api-utils';

export const useInterview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(getCurrentSession());

  const clearError = useCallback(() => setError(null), []);

  const startInterview = useCallback(async (data: StartInterviewRequest) => {
    setLoading(true);
    clearError();
    
    try {
      const response = await interviewApi.startInterview(data);
      
      // Save session to localStorage
      const session: InterviewSession = {
        sessionId: response.sessionId,
        role: data.role,
        level: data.level,
        createdAt: new Date().toISOString(),
        currentQuestion: response.currentQuestion,
        totalQuestions: response.totalQuestions,
        stage: 'in_progress'
      };
      
      saveInterviewSession(session);
      setCurrentSession(session);
      
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to start interview';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  const submitAnswer = useCallback(async (sessionId: string, answer: string) => {
    setLoading(true);
    clearError();
    
    try {
      const response = await interviewApi.submitAnswer({ sessionId, answer });
      
      if (response.stage === 'in_progress' && response.currentQuestion) {
        // Update session progress
        const updatedSession: InterviewSession = {
          sessionId: response.sessionId,
          role: currentSession?.role || '',
          level: currentSession?.level || '',
          createdAt: currentSession?.createdAt || new Date().toISOString(),
          currentQuestion: response.currentQuestion,
          totalQuestions: response.totalQuestions,
          stage: 'in_progress'
        };
        
        saveInterviewSession(updatedSession);
        setCurrentSession(updatedSession);
      } else if (response.stage === 'complete') {
        // Clear session on completion
        clearInterviewSession();
        setCurrentSession(null);
      }
      
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to submit answer';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError, currentSession]);
// In @/hooks/useInterview.ts
const getQuestion = useCallback(async (sessionId: string) => {
  setLoading(true);
  clearError();
  
  try {
    const response = await interviewApi.getQuestion(sessionId);
    
    if (response.stage === 'in_progress') {
      // Update session from response
      const updatedSession: InterviewSession = {
        sessionId: response.sessionId,
        role: currentSession?.role || '',
        level: currentSession?.level || '',
        createdAt: currentSession?.createdAt || new Date().toISOString(),
        currentQuestion: response.currentQuestion,
        totalQuestions: response.totalQuestions,
        stage: 'in_progress'
      };
      
      saveInterviewSession(updatedSession);
      setCurrentSession(updatedSession);
    }
    
    return response;
  } catch (err: any) {
    const errorMessage = err.message || 'Failed to get question';
    setError(errorMessage);
    throw err;
  } finally {
    setLoading(false);
  }
}, [clearError]); // Remove currentSession from dependencies

  const clearSession = useCallback(() => {
    clearInterviewSession();
    setCurrentSession(null);
  }, []);

  return {
    startInterview,
    submitAnswer,
    getQuestion,
    loading,
    error,
    clearError,
    currentSession,
    clearSession
  };
};