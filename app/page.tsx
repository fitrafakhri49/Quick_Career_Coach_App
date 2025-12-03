"use client";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LandingCVPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setError("Please select a file");

    setLoading(true);

    const formData = new FormData();
    formData.append("cv", file);

    try {
      const { data } = await axios.post(
        "http://localhost:3000/api/v1/analyze",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      localStorage.setItem(
        "analysis",
        JSON.stringify(data.extract.analysis.suggestions)
      );

      localStorage.setItem("cv_paragraph", data.parsedText);
      window.location.href = "/Analysis-Result";
    } catch (err: any) {
      setError(err.response?.data?.error || "Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
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
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                setFile(e.dataTransfer.files[0]);
                setError(null);
              }
            }}
          >
            <div
              className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-10 cursor-pointer hover:border-blue-500 transition-colors ${
                file ? "bg-blue-50" : "bg-white"
              }`}
              onClick={() => document.getElementById("cvInput")?.click()}
            >
              <p className="text-gray-500 mb-2">
                {file
                  ? `Selected file: ${file.name}`
                  : "Drag & drop your CV here"}
              </p>
              <p className="text-gray-400 text-sm">or click to select a file</p>
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
              {loading ? "Analyzing..." : "Submit CV"}
            </Button>
          </form>
          {error && <p className="text-red-600 mt-2">{error}</p>}
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

      <footer className="mt-12 text-gray-500">
        Supported formats: PDF, DOCX | Max file size: 5MB
      </footer>
    </div>
  );
}
