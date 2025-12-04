"use client";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import {} from "@/components/privateRoute";
export default function Interview() {
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    setQuestions([]);
    setFeedback([]);

    try {
      const cvText = localStorage.getItem("cv_paragraph");
      if (!cvText) {
        alert("CV paragraph not found. Please analyze your CV first.");
        setLoading(false);
        return;
      }
      const res = await axios.post("http://localhost:3000/api/v1/interview", {
        role,
        level,
        parsedCv: cvText,
        answers: [],
      });

      const data = res.data.result;
      if (!res.data.success || !data?.questions) {
        alert("Invalid response from server.");
        setLoading(false);
        return;
      }
      setQuestions(data.questions);
    } catch (err: any) {
      console.log(err);
      alert("Failed to fetch interview questions.");
    }

    setLoading(false);
  };

  const handleAnswerChange = (index: number, value: string) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const handleSubmitAnswers = async () => {
    setLoading(true);
    try {
      const cvText = localStorage.getItem("cv_paragraph");
      const res = await axios.post("http://localhost:3000/api/v1/interview", {
        role,
        level,
        parsedCv: cvText,
        answers,
      });

      const data = res.data.result;
      if (data && Array.isArray(data.feedback)) {
        setFeedback(data.feedback);
      } else {
        alert("Feedback not received in expected format.");
      }
    } catch (err: any) {
      console.log(err);
      alert("Failed to submit answers.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 px-4 relative">
      <button
        onClick={() => (window.location.href = "/Analysis-Result")}
        className="absolute -top-6 left-0 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black cursor-pointer"
      >
        <ArrowBigLeft className="w-5 h-5" />
        Back
      </button>

      <Card className="border shadow-md mt-10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Interview Stage</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="font-semibold">Role</label>
            <input
              className="w-full border rounded p-2"
              placeholder="Frontend Developer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={questions.length > 0}
            />
          </div>

          <div className="space-y-2">
            <label className="font-semibold">Level</label>
            <input
              className="w-full border rounded p-2"
              placeholder="Junior"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              disabled={questions.length > 0}
            />
          </div>

          {!questions.length && (
            <Button
              onClick={handleStart}
              disabled={loading || !role || !level}
              className="w-full"
            >
              {loading ? "Generating..." : "Start Interview"}
            </Button>
          )}

          {questions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Interview Questions</h2>
              {questions.map((q, i) => (
                <div
                  key={i}
                  className="border rounded p-3 bg-gray-50 space-y-2"
                >
                  <p>
                    <strong>Q{i + 1}:</strong> {q.question}
                  </p>
                  <textarea
                    className="w-full border rounded p-2"
                    placeholder="Type your answer here..."
                    value={answers[i]}
                    onChange={(e) => handleAnswerChange(i, e.target.value)}
                  />

                  {feedback[i] && (
                    <div className="mt-2 p-2 border-t border-gray-300 bg-gray-100 space-y-1 text-sm">
                      <p>
                        <strong>Feedback:</strong> {feedback[i].feedback}
                      </p>
                      <p>
                        <strong>Better Answer:</strong>{" "}
                        {feedback[i].better_answer}
                      </p>
                      <p>
                        <strong>Score:</strong>
                        Structure: {feedback[i].score.structure}, Content:{" "}
                        {feedback[i].score.content}, Communication:{" "}
                        {feedback[i].score.communication}, Technical:{" "}
                        {feedback[i].score.technical}
                      </p>
                      {feedback[i].strengths.length > 0 && (
                        <p>
                          <strong>Strengths:</strong>{" "}
                          {feedback[i].strengths.join(", ")}
                        </p>
                      )}
                      {feedback[i].improvements.length > 0 && (
                        <p>
                          <strong>Improvements:</strong>{" "}
                          {feedback[i].improvements.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <Button
                onClick={handleSubmitAnswers}
                className="w-full mt-2"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Answer Questions"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <button
        onClick={() => (window.location.href = "/SkillAnalysis")}
        className="absolute -bottom-6 right-0 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black cursor-pointer"
      >
        <ArrowBigRight className="w-5 h-5" />
        Next
      </button>
    </div>
  );
}
