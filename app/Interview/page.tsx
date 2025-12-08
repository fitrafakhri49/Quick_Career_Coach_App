"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { InterviewStart } from "@/components/interviewStart";
import { InterviewQuestion } from "@/components/interviewQuestion";
import { InterviewFeedback } from "@/components/interviewFeedback";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useInterview } from "@/hooks/useInterview";
import {
  Question,
  FrontendFeedback,
  transformApiFeedback,
  extractRoleAndLevel,
  extractSessionId,
} from "@/types/interview";
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
  const [feedback, setFeedback] = useState<FrontendFeedback>({
    overall_score: 0,
    feedback: [],
    strengths: [],
    areas_for_improvement: [],
    recommendations: [],
  });
  const [isCheckingSavedData, setIsCheckingSavedData] = useState(true);

  // Key for localStorage
  const FEEDBACK_STORAGE_KEY = "interview_feedback_data";

  // Check for saved feedback data on initial load
  useEffect(() => {
    const checkSavedFeedback = () => {
      try {
        const savedData = localStorage.getItem(FEEDBACK_STORAGE_KEY);
        if (savedData && savedData !== "undefined") {
          const parsedData = JSON.parse(savedData);
          console.log("Found saved feedback data:", parsedData);

          // Use the stored feedback directly
          setFeedback(parsedData.feedback);
          setRole(parsedData.role);
          setLevel(parsedData.level);
          setSessionId(parsedData.sessionId || "");
          setStage("feedback");
        }
      } catch (error) {
        console.error("Error loading saved feedback:", error);
      } finally {
        setIsCheckingSavedData(false);
      }
    };

    checkSavedFeedback();
  }, []);

  // Check for existing session on initial load
  useEffect(() => {
    if (isCheckingSavedData) return;

    const session = getCurrentSession();
    if (session?.sessionId) {
      console.log("Found existing session:", session.sessionId);
    }
  }, [isCheckingSavedData]);

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
          // Session was completed, check if feedback exists
          const savedData = localStorage.getItem(FEEDBACK_STORAGE_KEY);
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            if (parsedData.sessionId === session.sessionId) {
              setFeedback(parsedData.feedback);
              setStage("feedback");
              return;
            }
          }
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
          // Create a complete API response object
          const apiResponse = {
            success: response.success,
            sessionId: response.sessionId,
            stage: response.stage,
            message: response.message || "Interview completed!",
            feedback: response.feedback,
            summary: response.summary || {
              totalQuestions: 3,
              totalAnswered: 3,
            },
          };

          // Transform the API response
          const transformedFeedback = transformApiFeedback(apiResponse);
          setFeedback(transformedFeedback);

          // Save to localStorage
          const feedbackData = {
            feedback: transformedFeedback,
            role,
            level,
            sessionId,
            overallScore: transformedFeedback.overall_score,
            timestamp: new Date().toISOString(),
          };
          localStorage.setItem(
            FEEDBACK_STORAGE_KEY,
            JSON.stringify(feedbackData)
          );

          setStage("feedback");
        }
      } else if (response.stage === "in_progress") {
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
    localStorage.removeItem(FEEDBACK_STORAGE_KEY);
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

  const handleClearFeedback = () => {
    localStorage.removeItem(FEEDBACK_STORAGE_KEY);
    handleRestartInterview();
  };

  const handleNavigateToQuestion = (questionNumber: number) => {
    if (questionNumber >= 1 && questionNumber <= questions.length) {
      setCurrentQuestionIndex(questionNumber - 1);
    }
  };

  // Function to load test data using your exact format
  const loadTestFeedbackData = () => {
    const testApiData = {
      success: true,
      sessionId: "miwu3om0ciy1jzap0tj",
      stage: "complete",
      message: "Interview completed!",
      feedback: {
        stage: "feedback",
        role: "Frontend Developer",
        role_level: "Senior",
        feedback: [
          {
            id: 1,
            question:
              "Tell me about a time you led a significant frontend project, perhaps like the customer dashboard you mentioned, where you faced unexpected technical or team challenges. Describe the situation, the actions you took to navigate those challenges, and the ultimate impact or outcome of your efforts.",
            answer:
              "I led the development of a customer-facing dashboard for an internal analytics platform that was critical for business teams to track real-time performance. The project started with a tight deadline and an evolving feature scope, and midway through development we faced two major challenges: performance degradation as data volume increased and misalignment within the team about architectural decisions.",
            feedback:
              "You've effectively set the stage by describing the situation and identifying the challenges. However, the answer is incomplete as it omits the crucial actions you took and the eventual impact or outcome, which are key components of a behavioral question.",
            better_answer:
              "Faced dashboard performance issues due to data volume; I implemented data virtualization and mediated architectural debates by facilitating design sessions. This reduced load times by 40% and aligned the team, delivering on time with a scalable solution.",
            score: {
              structure: "2/10",
              content: "3/10",
              communication: "5/10",
              technical: "6/10",
            },
            strengths: [
              "Clearly described the project's critical nature and initial constraints.",
              "Identified specific and relevant technical and team challenges.",
            ],
            improvements: [
              "Complete the STAR method by detailing the specific 'Actions' taken to address the challenges.",
              "Describe the 'Results' and 'Impact' of those actions, ideally with quantifiable outcomes.",
              "Elaborate on the specific architectural decisions that caused misalignment and how they were resolved.",
            ],
          },
          {
            id: 2,
            question:
              "As a Senior Frontend Developer utilizing Next.js and TypeScript, how do you approach architecting a scalable and maintainable application, specifically when integrating complex data fetching strategies and global state management across various components?",
            answer:
              "I start by structuring the project with a clear, feature-based folder architecture instead of a purely technical one. Each domain has its own components, hooks, services, and types, which makes the codebase easier to navigate and scale as the application grows. I also enforce strict TypeScript configurations and shared type definitions between the data layer and UI to catch integration issues early.",
            feedback:
              "Your answer provides a good foundation for project structure and type safety. To make it stronger, you could elaborate on specific strategies and tools used for complex data fetching and global state management, as the question explicitly asked for them.",
            better_answer:
              "I'd use feature-based architecture with Next.js API routes for data abstraction. For complex data fetching, React Query handles caching/revalidation. Global state is managed with Zustand/Context API, ensuring typesafety via TypeScript interfaces shared across layers.",
            score: {
              structure: "8/10",
              content: "6/10",
              communication: "8/10",
              technical: "7/10",
            },
            strengths: [
              "Emphasizes a feature-based folder architecture for modularity and scalability.",
              "Highlights the importance of strict TypeScript configurations and shared type definitions for early issue detection.",
            ],
            improvements: [
              "Detail specific libraries or patterns used for 'complex data fetching strategies' (e.g., React Query, SWR, server-side data fetching patterns).",
              "Explain approaches for 'global state management' (e.g., Context API, Redux Toolkit, Zustand, Jotai) and how they integrate within Next.js applications.",
              "Connect the architectural choices more directly to maintaining performance and user experience with large-scale data.",
            ],
          },
          {
            id: 3,
            question:
              "Imagine your team is tasked with implementing a critical new feature in an existing Next.js application that has accumulated some technical debt. The project manager is pushing for a rapid delivery, but you foresee that a quick implementation without refactoring will significantly compromise future maintainability and performance. How would you, as the senior developer, approach this situation to balance business needs with technical quality?",
            answer:
              "Imagine your team is tasked with implementing a critical new feature in an existing Next.js application that has accumulated some technical debt. The project manager is pushing for a rapid delivery, but you foresee that a quick implementation without refactoring will significantly compromise future maintainability and performance. How would you, as the senior developer, approach this situation to balance business needs with technical quality?",
            feedback:
              "You've provided the question itself instead of an answer. Please provide your approach to this scenario.",
            better_answer:
              "I'd communicate the risks and propose a phased approach: deliver core functionality quickly with minimal refactoring where critical, then schedule follow-up sprints for strategic refactoring and technical debt reduction, aligning with the PM on priorities.",
            score: {
              structure: "0/10",
              content: "0/10",
              communication: "0/10",
              technical: "0/10",
            },
            strengths: [],
            improvements: [
              "Provide a detailed answer outlining your strategy for balancing rapid delivery with technical quality in a situation with existing technical debt.",
            ],
          },
        ],
      },
      summary: {
        totalQuestions: 3,
        totalAnswered: 3,
      },
    };

    // Transform using our new function
    const transformedFeedback = transformApiFeedback(testApiData);
    const { role, level } = extractRoleAndLevel(testApiData);

    setFeedback(transformedFeedback);
    setRole(role);
    setLevel(level);
    setSessionId(extractSessionId(testApiData));

    // Save to localStorage
    const feedbackData = {
      feedback: transformedFeedback,
      role,
      level,
      sessionId: extractSessionId(testApiData),
      overallScore: transformedFeedback.overall_score,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedbackData));

    setStage("feedback");
  };

  const renderContent = () => {
    if (isCheckingSavedData) {
      return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Checking for saved data...</p>
          </div>
        </div>
      );
    }

    switch (stage) {
      case "start":
        return (
          <div>
            {/* Test Data Button */}
            {process.env.NODE_ENV === "development" && (
              <div className="max-w-4xl mx-auto mb-6">
                <button
                  onClick={loadTestFeedbackData}
                  className="w-full px-4 py-3 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors border border-purple-300"
                >
                  🧪 Load Test Feedback Data (Development Only)
                </button>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  This button only appears in development mode
                </p>
              </div>
            )}

            <InterviewStart onStart={handleStartInterview} loading={loading} />
          </div>
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
          <div>
            {/* Saved Feedback Banner */}
            <div className="max-w-4xl mx-auto mb-6">
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <span className="mr-2">✅</span>
                  <span>
                    Loading saved feedback. This data is stored locally in your
                    browser.
                  </span>
                </div>
                <button
                  onClick={handleClearFeedback}
                  className="text-sm text-blue-700 hover:text-blue-900 font-medium"
                >
                  Clear Feedback
                </button>
              </div>
            </div>

            <InterviewFeedback
              feedback={feedback}
              role={role}
              level={level}
              sessionId={sessionId}
            />
          </div>
        );

      default:
        return null;
    }
  };

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

              {stage === "feedback" && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Score: {feedback.overall_score.toFixed(1)}/10
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
      {stage === "start" && hasSession && !isCheckingSavedData && (
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

      {/* Saved Feedback Notice */}
      {stage === "feedback" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">💾</span>
                <span>
                  Your interview results are saved locally. You can bookmark
                  this page and return anytime.
                </span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }}
                className="ml-4 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded hover:bg-green-200"
              >
                Copy Link
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
                <li className="text-sm text-gray-500">
                  • Results saved locally
                </li>
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
              {stage === "feedback" && (
                <p className="mt-2 text-xs text-blue-500">
                  💡 Your results are saved in your browser. Clear your browser
                  data to remove them.
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Quick Career Coach. Practice makes
              perfect!
            </p>
            {stage === "feedback" && (
              <p className="text-xs text-gray-400 mt-1">
                Feedback data stored locally in your browser
              </p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
