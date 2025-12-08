"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { InterviewStart } from "@/components/interviewStart";
import { InterviewQuestion } from "@/components/interviewQuestion";
import { InterviewFeedback } from "@/components/interviewFeedback";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useInterview } from "@/hooks/useInterview";
import { Question, Feedback, transformFeedback } from "@/types/interview";
import { getCurrentSession, clearInterviewSession } from "@/lib/api-utils";

type InterviewStage = "start" | "questions" | "feedback";

export default function InterviewPage() {
  const router = useRouter();
  const {
    startInterview,
    submitAnswer,
    getQuestion,
    loading,
    error,
    clearError,
    currentSession,
    clearSession,
  } = useInterview();

  const [stage, setStage] = useState<InterviewStage>("start");
  const [sessionId, setSessionId] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [feedback, setFeedback] = useState<Feedback>({
    overall_score: 0,
    feedback: [],
    strengths: [],
    areas_for_improvement: [],
    recommendations: [],
  });

  // Check for existing session on initial load - SIMPLIFIED
  useEffect(() => {
    const session = getCurrentSession();
    if (session?.sessionId) {
      // Offer resume option instead of auto-resuming
      console.log("Found existing session:", session.sessionId);
      // You could show a button to resume instead of auto-resuming
    }
  }, []); // Empty dependency array - runs once on mount

  const handleStartInterview = async (data: {
    role: string;
    level: string;
    parsedCv: string;
  }) => {
    clearError();
    try {
      const response = await startInterview(data);

      if (response.success) {
        setSessionId(response.sessionId);
        setRole(data.role);
        setLevel(data.level);
        setQuestions([response.question]);
        setCurrentQuestionIndex(0);
        setStage("questions");
      }
    } catch (err) {
      console.error("Failed to start interview:", err);
    }
  };

  // Add a resume function if you want to offer resume option
  const handleResumeInterview = async () => {
    const session = getCurrentSession();
    if (!session?.sessionId) return;

    clearError();
    try {
      const response = await getQuestion(session.sessionId);
      if (response.success) {
        setSessionId(session.sessionId);
        setRole(session.role);
        setLevel(session.level);

        if (response.stage === "complete") {
          // Session was completed, clear it
          clearInterviewSession();
          setStage("start");
        } else {
          setStage("questions");
          setCurrentQuestionIndex(response.currentQuestion! - 1);
          if (response.question) {
            setQuestions([response.question]);
          }
        }
      }
    } catch (err) {
      console.error("Failed to resume interview:", err);
      clearInterviewSession();
      setStage("start");
    }
  };

  const handleSubmitAnswer = async (answer: string) => {
    clearError();
    try {
      const response = await submitAnswer(sessionId, answer);

      if (response.stage === "complete") {
        // Interview completed, show feedback
        if (response.feedback) {
          const transformedFeedback = transformFeedback(response.feedback);
          setFeedback(transformedFeedback);
          setStage("feedback");
        }
      } else if (response.stage === "in_progress") {
        // Move to next question
        setCurrentQuestionIndex(response.currentQuestion! - 1);
        if (response.question) {
          setQuestions((prev) => [...prev, response.question!]);
        }
      }
    } catch (err) {
      console.error("Failed to submit answer:", err);
    }
  };

  const handleRestartInterview = () => {
    clearSession();
    clearInterviewSession();
    setStage("start");
    setSessionId("");
    setRole("");
    setLevel("");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setFeedback({
      overall_score: 0,
      feedback: [],
      strengths: [],
      areas_for_improvement: [],
      recommendations: [],
    });
    clearError();
  };

  const handleNavigateToQuestion = (questionNumber: number) => {
    if (questionNumber >= 1 && questionNumber <= questions.length) {
      setCurrentQuestionIndex(questionNumber - 1);
    }
  };

  const renderContent = () => {
    switch (stage) {
      case "start":
        return (
          <InterviewStart onStart={handleStartInterview} loading={loading} />
        );

      case "questions":
        if (
          questions.length === 0 ||
          currentQuestionIndex >= questions.length
        ) {
          return (
            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Loading questions...</p>
              </div>
            </div>
          );
        }

        const currentQuestion = questions[currentQuestionIndex];

        return (
          <div>
            {/* Question Navigation */}
            {questions.length > 1 && (
              <div className="max-w-4xl mx-auto px-6 mb-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-center space-x-2">
                    {questions.map((q, index) => (
                      <button
                        key={q.id}
                        onClick={() => handleNavigateToQuestion(index + 1)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          index === currentQuestionIndex
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Q{index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Current Question */}
            <InterviewQuestion
              sessionId={sessionId}
              question={currentQuestion}
              current={currentQuestionIndex + 1}
              total={3}
              onSubmitAnswer={handleSubmitAnswer}
              loading={loading}
            />
          </div>
        );

      case "feedback":
        return (
          <InterviewFeedback
            feedback={feedback}
            role={role}
            level={level}
            sessionId={sessionId}
          />
        );

      default:
        return null;
    }
  };

  // Check if there's a session to resume
  const hasSession = getCurrentSession();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-gray-900">
                {stage === "start"
                  ? "Quick Career Coach"
                  : stage === "questions"
                  ? "AI Interview Practice"
                  : "Interview Results"}
              </h1>

              {stage === "questions" && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Question {currentQuestionIndex + 1} of 3
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {stage !== "start" && (
                <button
                  onClick={handleRestartInterview}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  New Interview
                </button>
              )}

              {stage === "questions" && sessionId && (
                <div className="text-sm text-gray-500">
                  Session: {sessionId.slice(0, 8)}...
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {stage === "questions" && (
            <div className="h-1 bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / 3) * 100}%` }}
              />
            </div>
          )}
        </div>
      </header>

      {/* Resume Session Banner */}
      {stage === "start" && hasSession && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span>
                You have an interview in progress. Would you like to resume?
              </span>
              <button
                onClick={handleResumeInterview}
                className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
              >
                Resume Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="text-red-700 hover:text-red-900"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">
                {stage === "start"
                  ? "Starting your interview..."
                  : stage === "questions"
                  ? "Processing your answer..."
                  : "Generating feedback..."}
              </p>
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Quick Career Coach
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                AI-powered interview practice to help you land your dream job.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Features
              </h3>
              <ul className="mt-2 space-y-2">
                <li className="text-sm text-gray-500">
                  • Tailored interview questions
                </li>
                <li className="text-sm text-gray-500">
                  • AI feedback & scoring
                </li>
                <li className="text-sm text-gray-500">• Progress tracking</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Tips
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Be specific in your answers. Use the STAR method for behavioral
                questions.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Quick Career Coach. Practice makes
              perfect!
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
