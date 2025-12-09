"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCvFromStorage } from "@/lib/api-utils";
import { LoadingSpinner } from "./LoadingSpinner";

interface InterviewStartProps {
  onStart: (data: { role: string; level: string; parsedCv: string }) => void;
  loading?: boolean;
}

export const InterviewStart = ({
  onStart,
  loading = false,
}: InterviewStartProps) => {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("Mid");
  const [error, setError] = useState("");
  const [hasCv, setHasCv] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check for CV only on client side
  useEffect(() => {
    setIsClient(true);
    const cvData = getCvFromStorage();
    setHasCv(!!cvData);
  }, []);

  const handleStart = () => {
    if (!role.trim()) {
      setError("Please enter a job role");
      return;
    }

    // Get CV from localStorage
    const cvData = getCvFromStorage();
    if (!cvData) {
      setError("No CV found. Please upload a CV first.");
      return;
    }

    // Format CV data for the API
    const parsedCv = JSON.stringify(cvData);

    onStart({
      role: role.trim(),
      level,
      parsedCv,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">
            AI Interview Practice
          </h1>
          <p className="text-gray-600">
            Practice with AI-generated questions tailored to your CV and desired
            role
          </p>
        </div>

        <div className="space-y-6">
          {/* Job Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desired Job Role *
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setError("");
              }}
              placeholder="e.g., Frontend Developer, Data Scientist, Product Manager"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["Junior", "Mid", "Senior", "Lead", "Manager", "Executive"].map(
                (lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`px-4 py-3 rounded-lg border transition-colors ${
                      level === lvl
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {lvl}
                  </button>
                )
              )}
            </div>
          </div>

          {/* CV Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">CV Status</h3>
                {!isClient ? (
                  <p className="text-sm text-gray-600">Checking CV status...</p>
                ) : hasCv ? (
                  <p className="text-sm text-green-600 flex items-center">
                    <span className="mr-1">✓</span> CV loaded from your profile
                  </p>
                ) : (
                  <p className="text-sm text-red-600">No CV found</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                {hasCv ? "Change CV" : "Upload CV"}
              </button>
            </div>
          </div>
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={loading || (isClient && !hasCv)}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Starting Interview...</span>
              </>
            ) : (
              "Start Interview Practice"
            )}
          </button>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-6">
            <h4 className="font-medium text-blue-900 mb-2">
              💡 Tips for a great interview:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use the STAR method for behavioral questions</li>
              <li>• Be specific with examples from your experience</li>
              <li>• Quantify your achievements when possible</li>
              <li>• Keep answers concise but comprehensive</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
