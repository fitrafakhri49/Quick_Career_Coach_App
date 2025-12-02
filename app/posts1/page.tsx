"use client";

import { useState } from "react";
import axios from "axios";

export default function PostCVPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setError("Please select a file");

    setLoading(true);
    setError(null);

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

      setResult(data);
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Error connecting to server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Upload CV for Analysis</h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 cursor-pointer"
      >
        <input
          className="cursor-pointer"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Submit CV"}
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {result && (
        <div className="bg-gray-100 p-4 rounded space-y-2">
          <h2 className="font-bold text-xl">CV Analysis Result</h2>
          <pre className="overflow-x-auto text-sm">
            {JSON.stringify(result.analysis, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
