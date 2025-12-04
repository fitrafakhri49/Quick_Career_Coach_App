"use client";
import PrivateRoute from "../components/privateRoute";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function LandingCVPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedCV, setParsedCV] = useState<string>(""); // untuk preview
  const [readyToSubmit, setReadyToSubmit] = useState(false); // kontrol lanjut ke submit final

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setParsedCV("");
      setReadyToSubmit(false);
    }
  };

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setError("Please select a file.");

    setLoading(true);

    const formData = new FormData();
    formData.append("cv", file);

    try {
      const { data } = await axios.post(
        "http://localhost:3000/api/v1/parse",
        formData
      );

      setParsedCV(data.cleanText);

      localStorage.setItem("cv_paragraph", data.cleanText);

      setReadyToSubmit(true);
      setError(null);
      console.log("FORMDATA:", formData.get("cv"));
    } catch (err: any) {
      setError(err.response?.data?.error || "Error parsing CV");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFinal = async () => {
    const cvText = localStorage.getItem("cv_paragraph");

    if (!cvText) {
      setError("CV text not found. Please upload your CV again.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:3000/api/v1/analyze",
        {
          parsedCv: cvText,
        }
      );

      localStorage.setItem(
        "analysis",
        JSON.stringify(data.extract.analysis.suggestions)
      );

      window.location.href = "/Analysis-Result";
    } catch (err: any) {
      setError(err.response?.data?.error || "Error analyzing CV");
    } finally {
      setLoading(false);
    }
  };
  const Loader = () => (
    <div className="flex flex-col items-center gap-3 p-6">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-blue-700 font-semibold text-lg">
        Analyzing your CV...
      </p>
      <p className="text-gray-500 text-sm">This may take several seconds</p>
    </div>
  );
  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center p-6">
        <header className="w-full max-w-5xl flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-700">
            Quick Career Coach
          </h1>
          <Button
            className="cursor-pointer"
            variant="destructive"
            onClick={() => {
              document.cookie = "token=; Max-Age=0; path=/";
              localStorage.removeItem("access_token");
              window.location.href = "/login";
            }}
          >
            Logout
          </Button>
        </header>

        <Card className="w-full max-w-4xl shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle>AI-powered Career Coaching</CardTitle>
            <CardDescription>
              Upload your CV and get personalized feedback to level up your
              career.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form
              onSubmit={handlePreview}
              className="flex flex-col gap-4"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  setFile(e.dataTransfer.files[0]);
                  setError(null);
                  setParsedCV("");
                  setReadyToSubmit(false);
                }
              }}
            >
              <div
                className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-20 cursor-pointer hover:border-blue-500 transition-colors ${
                  file ? "bg-blue-50" : "bg-white"
                }`}
                onClick={() => document.getElementById("cvInput")?.click()}
              >
                <p className="text-gray-500 mb-2">
                  {file
                    ? `Selected file: ${file.name}`
                    : "Drag & drop your CV here"}
                </p>
                <p className="text-gray-400 text-sm">
                  or click to select a file
                </p>
              </div>

              <input
                id="cvInput"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />

              <Button
                className="cursor-pointer w-full"
                type="submit"
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Preview CV"}
              </Button>
            </form>
            <footer className="mt-6 text-gray-500 text-center">
              Supported formats: PDF, DOCX | Max file size: 5MB
            </footer>
            {error && <p className="text-red-600 mt-2">{error}</p>}
            {parsedCV && (
              <div className="mt-6 p-4 border rounded bg-gray-50">
                <h2 className="text-lg font-semibold mb-2">CV Preview:</h2>
                <p className="whitespace-pre-wrap text-gray-700">{parsedCV}</p>

                {loading ? (
                  <Loader />
                ) : (
                  readyToSubmit && (
                    <Button
                      className="mt-4 w-full cursor-pointer"
                      onClick={handleSubmitFinal}
                    >
                      Submit CV
                    </Button>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <section className="w-full max-w-4xl mt-12 grid md:grid-cols-3 gap-6">
          <Card className="text-center p-4 shadow-sm border">
            <CardTitle>Upload CV</CardTitle>
            <CardDescription>
              Get instant AI-driven analysis of your resume.
            </CardDescription>
          </Card>
          <Card className="text-center p-4 shadow-sm border">
            <CardTitle>Practice Mock Interviews</CardTitle>
            <CardDescription>
              Prepare for interviews with AI-generated questions.
            </CardDescription>
          </Card>
          <Card className="text-center p-4 shadow-sm border">
            <CardTitle>Identify Skill Gaps</CardTitle>
            <CardDescription>
              Understand what skills to improve to boost your career.
            </CardDescription>
          </Card>
        </section>
      </div>
    </PrivateRoute>
  );
}
