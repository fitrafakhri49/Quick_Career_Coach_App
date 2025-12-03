"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ArrowBigLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Star, StarHalf, StarOff } from "lucide-react";

interface AnalysisResultProps {
  result: any;
  back: () => void;
}

export default function Analysis_Result() {
  const [result, setResult] = useState<any>(null);
  const [viewAll, setViewAll] = useState(false);

  const renderStars = (scoreStr: string) => {
    const score = parseFloat(scoreStr) || 0;
    const stars = [];

    for (let i = 1; i <= 10; i++) {
      if (score >= i) {
        stars.push(<Star key={i} className="text-yellow-400 inline-block" />);
      } else if (score >= i - 0.5) {
        stars.push(
          <StarHalf key={i} className="text-yellow-400 inline-block" />
        );
      } else {
        stars.push(<StarOff key={i} className="text-gray-300 inline-block" />);
      }
    }

    return stars;
  };
  const back = () => {
    localStorage.removeItem("analysis");
    window.location.href = "/";
  };

  useEffect(() => {
    const saved = localStorage.getItem("analysis");
    if (saved) {
      const parsed = JSON.parse(saved);
      setResult(parsed);
    }
  }, []);

  const renderItems = (items: any[]) =>
    items.map((item: any, i: number) => (
      <li key={i} className="space-y-1">
        {typeof item === "string" && <span>{item}</span>}
        {typeof item === "object" && !Array.isArray(item) && (
          <div className="space-y-1">
            {item.title && <p className="font-semibold">{item.title}</p>}
            {item.description && <p>{item.description}</p>}
            {item.example && (
              <p className="text-gray-500 italic">Example: {item.example}</p>
            )}
          </div>
        )}
        {Array.isArray(item) &&
          item.map((sub: any, j: number) => <p key={j}>{sub}</p>)}
      </li>
    ));
  const priorityOrder = viewAll
    ? ["HIGH PRIORITY", "MEDIUM PRIORITY", "LOW PRIORITY"]
    : ["HIGH PRIORITY"];

  return (
    <div className="p-6">
      <Button
        variant="ghost"
        className="flex items-center gap-2 mb-6 cursor-pointer"
        onClick={back}
      >
        <ArrowBigLeft /> BACK
      </Button>

      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold text-center">Analysis Result</h1>
        <hr className="border-2" />

        {!result && (
          <p className="text-center text-gray-500">No analysis data found.</p>
        )}

        {result && (
          <Card className="shadow-md border">
            <CardHeader>
              <CardTitle>Overall Score</CardTitle>
              <CardDescription className="flex items-center gap-2">
                {renderStars(result?.overall_score)}
                <span className="ml-2 text-gray-600">
                  {result?.overall_score || "0/10"}
                </span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {priorityOrder.map((priority) => {
                const items = result?.recommendations?.[priority] || [];
                if (!items.length) return null;

                return (
                  <div key={priority}>
                    <p className="font-semibold text-lg text-blue-700 mb-2 capitalize">
                      {priority.replace("_", " ")}
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      {renderItems(items.slice(0, viewAll ? items.length : 3))}
                    </ul>
                  </div>
                );
              })}

              {result && (
                <Button
                  variant="link"
                  className="mt-2 cursor-pointer"
                  onClick={() => setViewAll((prev) => !prev)}
                >
                  {viewAll ? "View Less" : "View All Suggestions"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
