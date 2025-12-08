"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FrontendFeedback, FeedbackItem } from "@/types/interview";
import { LoadingSpinner } from "./LoadingSpinner";
import { clearInterviewSession } from "@/lib/api-utils";

interface InterviewFeedbackProps {
  feedback: FrontendFeedback;
  role: string;
  level: string;
  sessionId?: string;
}

export const InterviewFeedback = ({
  feedback,
  role,
  level,
  sessionId,
}: InterviewFeedbackProps) => {
  const router = useRouter();
  const [overallScore, setOverallScore] = useState<number>(0);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Key for localStorage
  const STORAGE_KEY = "interview_feedback_data";

  // Helper function to calculate score from score object
  const calculateItemScore = (scoreObj: any): number => {
    if (!scoreObj || typeof scoreObj !== "object") return 0;

    const scores = Object.values(scoreObj).map((v: any) => {
      const num = parseFloat(v);
      return isNaN(num) ? 0 : num;
    });

    if (scores.length === 0) return 0;
    const sum = scores.reduce((a: number, b: number) => a + b, 0);
    return sum / scores.length;
  };

  // Save feedback to localStorage
  const saveFeedbackToStorage = () => {
    try {
      const feedbackData = {
        feedback,
        role,
        level,
        sessionId,
        overallScore: feedback.overall_score,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbackData));
      console.log("Feedback saved to localStorage:", feedbackData);
    } catch (error) {
      console.error("Error saving feedback to localStorage:", error);
    }
  };

  // Load feedback from localStorage on component mount
  useEffect(() => {
    console.log("Current feedback prop:", feedback);
    console.log("Current sessionId:", sessionId);

    // Save current feedback to localStorage
    saveFeedbackToStorage();

    // Set overall score
    setOverallScore(feedback.overall_score);

    // Load previous feedback if exists (for debugging/verification)
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        console.log("Found stored feedback data:", JSON.parse(storedData));
      } else {
        console.log("No stored feedback data found");
      }
    } catch (error) {
      console.error("Error loading stored feedback:", error);
    }
  }, [feedback, role, level, sessionId]);

  // Function to check if there's saved feedback
  const hasSavedFeedback = () => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      return storedData !== null && storedData !== "undefined";
    } catch (error) {
      return false;
    }
  };

  // Function to get saved feedback
  const getSavedFeedback = () => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error("Error getting saved feedback:", error);
    }
    return null;
  };

  // Clear saved feedback (optional, can be called from other components)
  const clearSavedFeedback = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log("Cleared feedback from localStorage");
    } catch (error) {
      console.error("Error clearing feedback:", error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreDisplay = (score: number) => {
    return `${score.toFixed(1)}/10`;
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 9) return "Excellent";
    if (score >= 8) return "Very Good";
    if (score >= 7) return "Good";
    if (score >= 6) return "Satisfactory";
    return "Needs Improvement";
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 9) return "bg-green-100 text-green-800";
    if (score >= 8) return "bg-blue-100 text-blue-800";
    if (score >= 7) return "bg-yellow-100 text-yellow-800";
    if (score >= 6) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setIsPrinting(false), 500);
    }, 100);
  };

  const handleShare = async () => {
    if (!navigator.share) {
      // Fallback for browsers that don't support Web Share API
      const shareText = `I scored ${overallScore.toFixed(
        1
      )}/10 on my ${role} (${level}) interview practice!`;
      await navigator.clipboard.writeText(shareText);
      alert("Results copied to clipboard!");
      return;
    }

    setIsSharing(true);
    try {
      await navigator.share({
        title: "My Interview Results",
        text: `I scored ${overallScore.toFixed(
          1
        )}/10 on my ${role} (${level}) interview practice! Performance: ${getPerformanceLevel(
          overallScore
        )}`,
        url: window.location.href,
      });
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error sharing:", error);
        // Fallback to clipboard
        const shareText = `Interview Results - Role: ${role}, Level: ${level}, Score: ${overallScore.toFixed(
          1
        )}/10`;
        await navigator.clipboard.writeText(shareText);
        alert("Results copied to clipboard!");
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleStartNewInterview = () => {
    // Clear interview session and saved feedback
    clearInterviewSession();
    clearSavedFeedback();
    router.push("/interview");
  };

  const handleViewAllInterviews = () => {
    router.push("/history");
  };

  // Save feedback when navigating away (optional safety measure)
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveFeedbackToStorage();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [feedback, role, level, sessionId]);

  const downloadResultsAsText = () => {
    const textContent = `
===========================================
QUICK CAREER COACH - INTERVIEW RESULTS REPORT
===========================================

Interview Details
-----------------
Role: ${role}
Level: ${level}
Overall Score: ${overallScore.toFixed(1)}/10
Performance: ${getPerformanceLevel(overallScore)}
Date: ${new Date().toLocaleDateString()}
Session ID: ${sessionId || "N/A"}

Summary
-------
${
  feedback.strengths.length > 0
    ? `
Key Strengths:
${feedback.strengths.map((strength, i) => `  ${i + 1}. ${strength}`).join("\n")}
`
    : ""
}

${
  feedback.areas_for_improvement.length > 0
    ? `
Areas for Improvement:
${feedback.areas_for_improvement
  .map((area, i) => `  ${i + 1}. ${area}`)
  .join("\n")}
`
    : ""
}

${
  feedback.recommendations.length > 0
    ? `
Recommendations:
${feedback.recommendations.map((rec, i) => `  ${i + 1}. ${rec}`).join("\n")}
`
    : ""
}

Detailed Feedback
-----------------
${feedback.feedback
  .map((item: FeedbackItem, index: number) => {
    const itemScore = calculateItemScore(item.score);
    return `
Question ${index + 1}
${"=".repeat(50)}
Question: ${item.question}

Your Answer:
${item.answer}

Score: ${itemScore.toFixed(1)}/10
Feedback: ${item.feedback}

${item.better_answer ? `Better Answer Example:\n${item.better_answer}\n` : ""}

Detailed Scores:
${
  item.score
    ? Object.entries(item.score)
        .map(
          ([key, value]) =>
            `  • ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}/10`
        )
        .join("\n")
    : "N/A"
}

${
  item.strengths.length > 0
    ? `Strengths:\n${item.strengths.map((s) => `  • ${s}`).join("\n")}\n`
    : ""
}

${
  item.improvements && item.improvements.length > 0
    ? `Improvements:\n${item.improvements.map((i) => `  • ${i}`).join("\n")}\n`
    : ""
}

${
  item.suggestions && item.suggestions.length > 0
    ? `Suggestions:\n${item.suggestions.map((s) => `  • ${s}`).join("\n")}\n`
    : ""
}
`;
  })
  .join("\n")}

-------------------------------------------
Report generated on ${new Date().toLocaleString()}
Quick Career Coach - AI Interview Practice
-------------------------------------------
    `.trim();

    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-results-${role
      .toLowerCase()
      .replace(/\s+/g, "-")}-${level.toLowerCase()}-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadResultsAsJSON = () => {
    const jsonData = {
      metadata: {
        role,
        level,
        overallScore: feedback.overall_score,
        performanceLevel: getPerformanceLevel(feedback.overall_score),
        date: new Date().toISOString(),
        sessionId: sessionId || null,
      },
      summary: {
        strengths: feedback.strengths,
        areasForImprovement: feedback.areas_for_improvement,
        recommendations: feedback.recommendations,
      },
      detailedFeedback: feedback.feedback.map((item: FeedbackItem) => ({
        ...item,
        calculatedScore: calculateItemScore(item.score),
      })),
    };

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-results-${role
      .toLowerCase()
      .replace(/\s+/g, "-")}-${level.toLowerCase()}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadResultsAsPDF = () => {
    alert(
      "PDF export coming soon! For now, use the Print option or download as text/JSON."
    );
  };

  // Calculate category averages
  const calculateCategoryAverages = () => {
    const categories = ["structure", "content", "communication", "technical"];
    const averages: Record<string, number> = {};

    categories.forEach((category) => {
      const scores = feedback.feedback
        .map(
          (item) =>
            parseFloat(
              item.score?.[category as keyof typeof item.score] as string
            ) || 0
        )
        .filter((score) => score > 0);

      averages[category] =
        scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;
    });

    return averages;
  };

  const categoryAverages = calculateCategoryAverages();

  // Function to safely access suggestions from FeedbackItem
  const getSuggestions = (item: FeedbackItem): string[] => {
    // First check if suggestions exist directly
    if (item.suggestions && Array.isArray(item.suggestions)) {
      return item.suggestions;
    }

    // Fallback to improvements if suggestions doesn't exist
    if (item.improvements && Array.isArray(item.improvements)) {
      return item.improvements.map((imp) => `Consider: ${imp}`);
    }

    return [];
  };

  // Debug function to show what's actually in localStorage
  const debugLocalStorage = () => {
    console.log("=== DEBUG LOCALSTORAGE ===");
    const data = localStorage.getItem(STORAGE_KEY);
    console.log("Raw localStorage data:", data);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log("Parsed data:", parsed);
        console.log("Data structure:", {
          hasFeedback: !!parsed.feedback,
          feedbackType: typeof parsed.feedback,
          feedbackKeys: parsed.feedback ? Object.keys(parsed.feedback) : [],
          feedbackData: parsed.feedback,
        });
      } catch (e) {
        console.error("Failed to parse localStorage data:", e);
      }
    }
    console.log("=== END DEBUG ===");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Debug button for development */}
      {process.env.NODE_ENV === "development" && (
        <button
          onClick={debugLocalStorage}
          className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded text-xs z-50 no-print"
        >
          🐛 Debug
        </button>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container,
          .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white;
          }
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-before: always;
          }
          a {
            text-decoration: none !important;
            color: inherit !important;
          }
          .print-no-border {
            border: none !important;
          }
          .print-shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="print-container">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 sm:p-8 mb-6 sm:mb-8 text-white print-no-border print-shadow-none">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Interview Results
              </h1>
              <div className="space-y-1">
                <p className="text-blue-100">
                  <span className="font-medium">Role:</span> {role}
                </p>
                <p className="text-blue-100">
                  <span className="font-medium">Level:</span> {level}
                </p>
                <p className="text-blue-100 text-sm">
                  {new Date().toLocaleDateString()} • Session:{" "}
                  {sessionId?.slice(0, 12) || "N/A"}
                </p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-4xl sm:text-5xl font-bold">
                {overallScore.toFixed(1)}
                <span className="text-2xl">/10</span>
              </div>
              <p className="text-blue-100 mb-2">Overall Score</p>
              <div
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(
                  overallScore
                )}`}
              >
                {getPerformanceLevel(overallScore)}
              </div>
            </div>
          </div>
        </div>

        {/* Saved Feedback Indicator */}
        {hasSavedFeedback() && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✅</span>
              <span className="text-green-800 text-sm">
                Feedback saved locally. You can return to this page anytime.
              </span>
            </div>
            <button
              onClick={() => {
                clearSavedFeedback();
                alert("Saved feedback cleared.");
              }}
              className="text-xs text-red-600 hover:text-red-800 no-print"
            >
              Clear
            </button>
          </div>
        )}

        {/* No Feedback Available Warning */}
        {overallScore === 0 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-yellow-600 mr-2">⚠️</span>
              <div>
                <p className="text-yellow-800 font-medium">
                  No AI Feedback Available
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  The interview has been completed, but detailed AI feedback is
                  not available yet. Your answers have been recorded and
                  feedback will be generated soon.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Category Scores */}
        {overallScore > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Performance by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(categoryAverages).map(([category, score]) => (
                <div
                  key={category}
                  className="bg-white rounded-lg shadow p-4 text-center"
                >
                  <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                    {score.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 capitalize mt-1">
                    {category}
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${
                        score >= 7
                          ? "bg-green-500"
                          : score >= 5
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${score * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Strengths */}
          <div className="bg-white rounded-lg shadow p-6 print-no-border print-shadow-none">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-green-600 text-xl">✓</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Key Strengths
              </h3>
            </div>
            {feedback.strengths && feedback.strengths.length > 0 ? (
              <ul className="space-y-3">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">•</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">
                No specific strengths identified yet.
              </p>
            )}
          </div>

          {/* Areas for Improvement */}
          <div className="bg-white rounded-lg shadow p-6 print-no-border print-shadow-none">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-yellow-600 text-xl">📈</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Areas for Improvement
              </h3>
            </div>
            {feedback.areas_for_improvement &&
            feedback.areas_for_improvement.length > 0 ? (
              <ul className="space-y-3">
                {feedback.areas_for_improvement.map((area, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-500 mr-2 mt-1">•</span>
                    <span className="text-gray-700">{area}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">
                No specific improvement areas identified yet.
              </p>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {feedback.recommendations && feedback.recommendations.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6 mb-8 border border-blue-100 print-no-border print-shadow-none">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 text-xl">💡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Recommendations
              </h3>
            </div>
            <ul className="space-y-3">
              {feedback.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">•</span>
                  <span className="text-gray-800">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Detailed Feedback */}
        <div className="space-y-6 print-break">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Detailed Question Feedback
            </h2>
            <div className="text-sm text-gray-500 no-print">
              Click on questions to expand
            </div>
          </div>

          {feedback.feedback &&
            feedback.feedback.map((item: FeedbackItem, index: number) => {
              const itemScore = calculateItemScore(item.score);
              const suggestions = getSuggestions(item);

              return (
                <div
                  key={item.id || index}
                  className="bg-white rounded-lg shadow overflow-hidden print-no-border print-shadow-none"
                >
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors no-print"
                    onClick={() =>
                      setExpandedQuestion(
                        expandedQuestion === index ? null : index
                      )
                    }
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              Question {index + 1}
                            </span>
                            <span className="text-sm text-gray-500 capitalize">
                              {index === 0
                                ? "Behavioral"
                                : index === 1
                                ? "Technical"
                                : "Situational"}
                            </span>
                          </div>
                          {itemScore > 0 && (
                            <div
                              className={`px-3 py-1 text-sm font-medium rounded-full ${getPerformanceColor(
                                itemScore
                              )}`}
                            >
                              {getScoreDisplay(itemScore)} •{" "}
                              {getPerformanceLevel(itemScore)}
                            </div>
                          )}
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                          {item.question}
                        </h3>
                      </div>

                      <button className="text-gray-400 hover:text-gray-600 sm:ml-4 no-print">
                        {expandedQuestion === index ? "▲" : "▼"}
                      </button>
                    </div>
                  </div>

                  {(expandedQuestion === index || isPrinting) && (
                    <div className="border-t border-gray-200 p-6 space-y-6">
                      {/* Your Answer */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                          <span className="mr-2">✏️</span> Your Answer
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-800 whitespace-pre-wrap">
                            {item.answer}
                          </p>
                        </div>
                      </div>

                      {/* Better Answer (if exists) */}
                      {item.better_answer && (
                        <div>
                          <h4 className="font-medium text-green-700 mb-2 flex items-center">
                            <span className="mr-2">🌟</span> Better Answer
                            Example
                          </h4>
                          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                            <p className="text-green-800 whitespace-pre-wrap">
                              {item.better_answer}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Feedback */}
                      {item.feedback &&
                        item.feedback !== "No feedback available." && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                              <span className="mr-2">💬</span> AI Feedback
                            </h4>
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                              <p className="text-blue-800">{item.feedback}</p>
                            </div>
                          </div>
                        )}

                      {/* Detailed Scores */}
                      {itemScore > 0 &&
                        item.score &&
                        typeof item.score === "object" && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">
                              Detailed Scores
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {Object.entries(item.score).map(
                                ([key, value]) => {
                                  const numValue =
                                    parseFloat(value as string) || 0;
                                  if (numValue === 0) return null;
                                  return (
                                    <div
                                      key={key}
                                      className="bg-gray-50 rounded-lg p-3 text-center"
                                    >
                                      <div
                                        className={`text-lg font-bold ${getScoreColor(
                                          numValue
                                        )}`}
                                      >
                                        {value}/10
                                      </div>
                                      <div className="text-xs text-gray-600 capitalize mt-1">
                                        {key.replace(/_/g, " ")}
                                      </div>
                                      <div className="h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                                        <div
                                          className={`h-full ${
                                            numValue >= 7
                                              ? "bg-green-500"
                                              : numValue >= 5
                                              ? "bg-yellow-500"
                                              : "bg-red-500"
                                          }`}
                                          style={{ width: `${numValue * 10}%` }}
                                        />
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        )}

                      {/* Strengths and Improvements */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Strengths */}
                        <div>
                          <h4 className="font-medium text-green-700 mb-2 flex items-center">
                            <span className="mr-2">✓</span> Strengths
                          </h4>
                          {item.strengths && item.strengths.length > 0 ? (
                            <ul className="space-y-2">
                              {item.strengths.map((strength, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-green-500 mr-2 mt-1">
                                    •
                                  </span>
                                  <span className="text-gray-700">
                                    {strength}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500 italic text-sm">
                              No specific strengths identified for this
                              question.
                            </p>
                          )}
                        </div>

                        {/* Improvements */}
                        <div>
                          <h4 className="font-medium text-yellow-700 mb-2 flex items-center">
                            <span className="mr-2">📈</span> Improvements
                          </h4>
                          {item.improvements && item.improvements.length > 0 ? (
                            <ul className="space-y-2">
                              {item.improvements.map((improvement, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-yellow-500 mr-2 mt-1">
                                    •
                                  </span>
                                  <span className="text-gray-700">
                                    {improvement}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500 italic text-sm">
                              No specific improvements identified for this
                              question.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Suggestions */}
                      {suggestions.length > 0 && (
                        <div>
                          <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                            <span className="mr-2">💡</span> Suggestions for
                            Next Time
                          </h4>
                          <ul className="space-y-2">
                            {suggestions.map((suggestion, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-blue-500 mr-2 mt-1">
                                  •
                                </span>
                                <span className="text-gray-700">
                                  {suggestion}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Action Buttons - Hide in print */}
      <div className="mt-8 pt-8 border-t border-gray-200 no-print">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          {/* Left side buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleStartNewInterview}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
            >
              <span className="mr-2">🔄</span>
              Start New Interview
            </button>
            <button
              onClick={handleViewAllInterviews}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center"
            >
              <span className="mr-2">📋</span>
              View History
            </button>
          </div>

          {/* Right side buttons */}
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={downloadResultsAsText}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm transition-colors flex items-center"
              >
                <span className="mr-2">📄</span>
                Text
              </button>
              <button
                onClick={downloadResultsAsJSON}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm transition-colors flex items-center"
              >
                <span className="mr-2">🔧</span>
                JSON
              </button>
              <button
                onClick={downloadResultsAsPDF}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm transition-colors flex items-center"
              >
                <span className="mr-2">📊</span>
                PDF
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isPrinting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Printing...</span>
                  </>
                ) : (
                  <>
                    <span className="mr-2">🖨️</span>
                    Print
                  </>
                )}
              </button>
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSharing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Sharing...</span>
                  </>
                ) : (
                  <>
                    <span className="mr-2">📤</span>
                    Share
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            💡 <strong>Pro Tip:</strong> Review your feedback and practice
            similar questions to improve your interview skills.
          </p>
          <p className="mt-1">
            Your interview feedback is saved locally and will be available until
            you clear it.
          </p>
          <p className="mt-2">
            <button
              onClick={() => {
                const savedData = getSavedFeedback();
                if (savedData) {
                  alert(
                    `Feedback saved on: ${new Date(
                      savedData.timestamp
                    ).toLocaleString()}`
                  );
                } else {
                  alert("No saved feedback found.");
                }
              }}
              className="text-blue-600 hover:text-blue-800 underline text-xs"
            >
              Check saved feedback
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
