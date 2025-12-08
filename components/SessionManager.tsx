"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useInterview } from "@/hooks/useInterview";
import {
  getCurrentSession,
  clearInterviewSession,
  hasActiveInterview,
} from "@/lib/api-utils";
import { LoadingSpinner } from "./LoadingSpinner";

interface SessionManagerProps {
  onSessionChange?: (hasSession: boolean) => void;
  showResumeOption?: boolean;
  showSessionInfo?: boolean;
}

export const SessionManager = ({
  onSessionChange,
  showResumeOption = true,
  showSessionInfo = true,
}: SessionManagerProps) => {
  const router = useRouter();
  const { getQuestion, loading, error, clearError } = useInterview();

  const [hasActiveSession, setHasActiveSession] = useState<boolean>(false);
  const [sessionInfo, setSessionInfo] = useState<{
    sessionId: string;
    role: string | null;
    level: string | null;
    progress?: string;
  } | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [resumeStatus, setResumeStatus] = useState<
    "idle" | "resuming" | "error"
  >("idle");

  // Check for active session on component mount
  useEffect(() => {
    checkActiveSession();
  }, []);

  // Notify parent component when session status changes
  useEffect(() => {
    if (onSessionChange) {
      onSessionChange(hasActiveSession);
    }
  }, [hasActiveSession, onSessionChange]);

  const checkActiveSession = () => {
    setIsCheckingSession(true);
    const currentSession = getCurrentSession();

    if (currentSession?.sessionId) {
      setHasActiveSession(true);
      setSessionInfo(currentSession);
    } else {
      setHasActiveSession(false);
      setSessionInfo(null);
    }

    setIsCheckingSession(false);
  };

  const handleResumeSession = async () => {
    if (!sessionInfo?.sessionId) return;

    setResumeStatus("resuming");
    clearError();

    try {
      const response = await getQuestion(sessionInfo.sessionId);

      if (response.success) {
        if (response.stage === "complete") {
          // Interview was completed, clear session
          clearInterviewSession();
          setHasActiveSession(false);
          setSessionInfo(null);
          alert(
            "This interview session has already been completed. Please start a new interview."
          );
        } else {
          // Resume interview
          router.push(`/interview`);
        }
      }
    } catch (err) {
      console.error("Failed to resume session:", err);
      setResumeStatus("error");

      // If session is invalid, clear it
      clearInterviewSession();
      setHasActiveSession(false);
      setSessionInfo(null);
    } finally {
      setResumeStatus("idle");
    }
  };

  const handleClearSession = () => {
    if (
      confirm(
        "Are you sure you want to clear your current interview session? Any unsaved progress will be lost."
      )
    ) {
      clearInterviewSession();
      setHasActiveSession(false);
      setSessionInfo(null);
      alert("Session cleared successfully.");
    }
  };

  const handleNewInterview = () => {
    if (hasActiveSession) {
      if (
        confirm(
          "Starting a new interview will clear your current session. Continue?"
        )
      ) {
        clearInterviewSession();
        router.push("/interview");
      }
    } else {
      router.push("/interview");
    }
  };

  const formatSessionId = (sessionId: string) => {
    if (sessionId.length <= 12) return sessionId;
    return `${sessionId.substring(0, 8)}...`;
  };

  if (isCheckingSession) {
    return (
      <div className="flex items-center justify-center p-4">
        <LoadingSpinner size="sm" />
        <span className="ml-2 text-sm text-gray-600">Checking session...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm">{error}</span>
            <button
              onClick={clearError}
              className="text-red-700 hover:text-red-900 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Session Status Card */}
      {hasActiveSession && sessionInfo && showSessionInfo && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
            <h3 className="text-sm font-semibold text-white flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Active Interview Session
            </h3>
          </div>

          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Role
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {sessionInfo.role || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Level
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {sessionInfo.level || "Not specified"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Session ID
              </p>
              <div className="flex items-center space-x-2">
                <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {formatSessionId(sessionInfo.sessionId)}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sessionInfo.sessionId);
                    alert("Session ID copied to clipboard!");
                  }}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                  title="Copy Session ID"
                >
                  📋
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {showResumeOption && (
                <button
                  onClick={handleResumeSession}
                  disabled={resumeStatus === "resuming"}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {resumeStatus === "resuming" ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Resuming...</span>
                    </>
                  ) : (
                    "Resume Interview"
                  )}
                </button>
              )}

              <button
                onClick={handleClearSession}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Clear Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Active Session */}
      {!hasActiveSession && showSessionInfo && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center">
          <div className="text-gray-400 mb-3">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Active Interview
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            You don't have an active interview session. Start a new one to
            practice your skills.
          </p>
          <button
            onClick={handleNewInterview}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start New Interview
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Quick Actions
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleNewInterview}
            className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            New Interview
          </button>

          <button
            onClick={checkActiveSession}
            disabled={loading}
            className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh Status
          </button>
        </div>
      </div>

      {/* Session Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Session Statistics
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {hasActiveSession ? "1" : "0"}
            </div>
            <div className="text-xs text-gray-500">Active Sessions</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {localStorage.getItem("currentInterviewSession") ? "✓" : "✗"}
            </div>
            <div className="text-xs text-gray-500">Session Saved</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            <p className="mb-1">
              💡 <span className="font-medium">Tip:</span> Your session is
              automatically saved in your browser.
            </p>
            <p>Use the same device to resume your interview later.</p>
          </div>
        </div>
      </div>

      {/* Storage Information */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Storage Information
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">CV Data:</span>
            <span
              className={`px-2 py-1 rounded-full ${
                localStorage.getItem("cv_paragraph")
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {localStorage.getItem("cv_paragraph") ? "Available" : "Not found"}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">Session Data:</span>
            <span
              className={`px-2 py-1 rounded-full ${
                hasActiveSession
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {hasActiveSession ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">Saved Answers:</span>
            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              {
                Object.keys(localStorage).filter((key) =>
                  key.includes("interview_")
                ).length
              }{" "}
              saved
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            // Clear all interview-related data
            clearInterviewSession();
            const keys = Object.keys(localStorage);
            keys.forEach((key) => {
              if (key.startsWith("interview_")) {
                localStorage.removeItem(key);
              }
            });
            alert("All interview data cleared!");
            checkActiveSession();
          }}
          className="mt-3 w-full text-xs text-red-600 hover:text-red-800 text-center"
        >
          Clear All Interview Data
        </button>
      </div>
    </div>
  );
};
