"use client";

import { useState, useEffect, useRef } from "react";
import { Question } from "@/types/interview";
import { LoadingSpinner } from "./LoadingSpinner";

interface InterviewQuestionProps {
  sessionId: string;
  question: Question;
  current: number;
  total: number;
  onSubmitAnswer: (answer: string) => Promise<void>;
  loading?: boolean;
}

export const InterviewQuestion = ({
  sessionId,
  question,
  current,
  total,
  onSubmitAnswer,
  loading = false,
}: InterviewQuestionProps) => {
  const [answer, setAnswer] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-focus textarea when question changes
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [question.id]);

  const handleSubmit = async () => {
    if (!answer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmitAnswer(answer.trim());
      setAnswer("");
      setCharCount(0);
    } catch (error) {
      console.error("Failed to submit answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-sm text-gray-500">Question</span>
            <div className="text-2xl font-bold text-gray-900">
              {current} of {total}
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500">Session</span>
            <div className="text-sm font-medium text-gray-700">
              {sessionId.slice(0, 8)}...
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(current / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Question {current}
            </span>
            <span className="text-sm text-gray-500">
              {question.id === 1
                ? "Behavioral"
                : question.id === 2
                ? "Technical"
                : "Situational"}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            {question.question}
          </h2>
        </div>

        {/* Tips based on question type */}
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="flex items-start">
            <div className="text-blue-500 mr-2">💡</div>
            <div className="text-sm text-gray-700">
              {question.id === 1
                ? "Use the STAR method (Situation, Task, Action, Result) for this behavioral question."
                : question.id === 2
                ? "Be specific about your technical approach and mention relevant tools/technologies."
                : "Explain your problem-solving process and consider different scenarios."}
            </div>
          </div>
        </div>

        {/* Answer Area */}
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Your Answer *
          </label>
          <textarea
            ref={textareaRef}
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setCharCount(e.target.value.length);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer here... (Press Ctrl+Enter to submit)"
            className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
            disabled={isSubmitting || loading}
          />

          <div className="flex justify-between items-center mt-3">
            <div className="text-sm text-gray-500">
              {charCount} characters • Aim for 150-300 words
            </div>
            <div className="text-sm text-gray-500">Ctrl + Enter to submit</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <div>
          <button
            onClick={() => {
              if (
                answer.trim() &&
                !confirm("Are you sure? Your current answer will be lost.")
              )
                return;
              setAnswer("");
              setCharCount(0);
            }}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            disabled={isSubmitting || loading}
          >
            Clear Answer
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!answer.trim() || isSubmitting || loading}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSubmitting || loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">
                {isSubmitting ? "Submitting..." : "Processing..."}
              </span>
            </>
          ) : (
            <>
              Submit Answer
              <span className="ml-2">→</span>
            </>
          )}
        </button>
      </div>

      {/* Interview Tips */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="font-medium text-gray-900 mb-3">
          Interview Best Practices:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-blue-500 mb-2">🎯</div>
            <h4 className="font-medium mb-1">Be Specific</h4>
            <p className="text-sm text-gray-600">
              Use concrete examples from your experience
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-blue-500 mb-2">📊</div>
            <h4 className="font-medium mb-1">Quantify Results</h4>
            <p className="text-sm text-gray-600">
              Use numbers to show impact when possible
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-blue-500 mb-2">🗣️</div>
            <h4 className="font-medium mb-1">Clear Communication</h4>
            <p className="text-sm text-gray-600">
              Structure your answer logically
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
