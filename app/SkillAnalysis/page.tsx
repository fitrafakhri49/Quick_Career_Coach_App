"use client";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";

export default function SkillAnalysisPage() {
  const [targetRole, setTargetRole] = useState("Telecommunication Engineer");
  const [analysis, setAnalysis] = useState<any>(null); // tanpa interface
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    const parsedCv = localStorage.getItem("cv_paragraph");

    if (!parsedCv) {
      setError(
        "CV text not found in localStorage. Please upload your CV first."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(
        "http://localhost:3000/api/v1/skillAnalysis",
        { targetRole, parsedCv }
      );

      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        setError(data.message || "Failed to analyze skills.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 relative">
      <button
        onClick={() => (window.location.href = "/Interview")}
        className=" flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black cursor-pointer"
      >
        <ArrowBigLeft className="w-5 h-5" />
        Back
      </button>

      <h1 className="text-3xl font-bold mb-6">Skill Analysis</h1>

      <div className="mb-4">
        <label className="block mb-2 font-semibold">Target Role:</label>
        <input
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="border p-2 w-full rounded"
        />
      </div>

      <Button
        className="cursor-pointer"
        onClick={handleAnalyze}
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Analyze Skills"}
      </Button>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {analysis && (
        <div className="mt-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Matched Skills ✓</h2>
            <ul className="list-disc list-inside">
              {analysis.matched_skills.map((skill: string) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Missing Skills ✗</h2>
            <ul className="list-disc list-inside text-red-600">
              {analysis.missing_skills.map((skill: string) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Nice-to-Have Skills</h2>
            <ul className="list-disc list-inside text-yellow-700">
              {analysis.nice_to_have_skills.map((skill: string) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              Learning Recommendations
            </h2>

            <div className="mb-2">
              <h3 className="font-semibold">Courses:</h3>
              <ul className="list-disc list-inside">
                {analysis.recommendations.courses.map((course: string) => (
                  <li key={course}>{course}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Projects:</h3>
              <ul className="list-disc list-inside">
                {analysis.recommendations.projects.map((project: string) => (
                  <li key={project}>{project}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
