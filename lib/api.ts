import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  StartInterviewRequest,
  SubmitAnswerRequest,
  StartInterviewResponse,
  SubmitAnswerResponse,
  GetQuestionResponse
} from '@/types/interview';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: false,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 400:
          console.error('Bad Request:', data);
          break;
        case 401:
          console.error('Unauthorized');
          break;
        case 404:
          console.error('Not Found');
          break;
        case 500:
          console.error('Server Error');
          break;
        default:
          console.error('API Error:', status, data);
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export const interviewApi = {
  // Start new interview session
  async startInterview(data: StartInterviewRequest): Promise<StartInterviewResponse> {
    try {
      const response = await apiClient.post<StartInterviewResponse>('/interview/start', data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout. Please try again.');
        }
        if (error.code === 'ERR_NETWORK') {
          throw new Error('Network error. Please check your connection.');
        }
      }
      throw new Error('Failed to start interview');
    }
  },

  // Submit answer for current question
  async submitAnswer(data: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
    try {
      const response = await apiClient.post<SubmitAnswerResponse>('/interview/submit', data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        if (error.response?.status === 404) {
          throw new Error('Session not found. Please start a new interview.');
        }
      }
      throw new Error('Failed to submit answer');
    }
  },

  // Get current question (resume interview)
  async getQuestion(sessionId: string): Promise<GetQuestionResponse> {
    try {
      const response = await apiClient.get<GetQuestionResponse>(`/interview/${sessionId}/question`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          throw new Error('Session not found or expired. Please start a new interview.');
        }
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
      }
      throw new Error('Failed to get question');
    }
  },

  // Check session status
  async checkSessionStatus(sessionId: string): Promise<{ valid: boolean; stage?: string }> {
    try {
      const response = await apiClient.get(`/interview/${sessionId}/question`);
      return { valid: true, stage: response.data.stage };
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return { valid: false };
      }
      throw error;
    }
  }
};

export { apiClient };