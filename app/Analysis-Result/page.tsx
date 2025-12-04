"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Star, StarHalf, StarOff } from "lucide-react";

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
    localStorage.removeItem("cv_paragraph");
    window.location.href = "/";
  };

  useEffect(() => {
    const saved = localStorage.getItem("analysis");
    if (saved) {
      setResult(JSON.parse(saved));
    }
  }, []);

  const renderItems = (items: any[]) =>
    items.map((item: any, i: number) => (
      <li
        key={i}
        className="space-y-1 p-2 rounded hover:bg-blue-50 transition-colors"
      >
        {typeof item === "string" && <span>• {item}</span>}
        {typeof item === "object" && !Array.isArray(item) && (
          <div className="space-y-1">
            {item.title && (
              <p className="font-semibold text-blue-700">• {item.title}</p>
            )}
            {item.description && (
              <p className="text-gray-700">{item.description}</p>
            )}
            {item.example && (
              <p className="text-gray-500 italic">Example: {item.example}</p>
            )}
          </div>
        )}
        {Array.isArray(item) &&
          item.map((sub: any, j: number) => (
            <p key={j} className="text-gray-700">
              • {sub}
            </p>
          ))}
      </li>
    ));

  const priorityColors: Record<string, string> = {
    "HIGH PRIORITY": "bg-red-100 border-red-400",
    "MEDIUM PRIORITY": "bg-yellow-100 border-yellow-400",
    "LOW PRIORITY": "bg-green-100 border-green-400",
  };

  const priorityOrder = viewAll
    ? ["HIGH PRIORITY", "MEDIUM PRIORITY", "LOW PRIORITY"]
    : ["HIGH PRIORITY"];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Button
        variant="ghost"
        className="flex items-center gap-2 mb-6 cursor-pointer"
        onClick={back}
      >
        <ArrowBigLeft /> BACK
      </Button>

      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold text-center text-blue-700">
          Analysis Result
        </h1>
        <hr className="border-2 border-blue-200" />

        {!result && (
          <p className="text-center text-gray-500">No analysis data found.</p>
        )}

        {result && (
          <Card className="shadow-lg border border-gray-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-xl font-bold text-blue-800">
                Overall Score
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                {renderStars(result?.overall_score)}
                <span className="ml-2 text-gray-600 font-semibold">
                  {result?.overall_score || "0/10"}
                </span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {priorityOrder.map((priority) => {
                const items = result?.recommendations?.[priority] || [];
                if (!items.length) return null;

                return (
                  <div
                    key={priority}
                    className={`border-l-4 p-4 rounded shadow-sm ${priorityColors[priority]}`}
                  >
                    <p className="font-semibold text-lg mb-2">{priority}</p>
                    <ul className="list-none space-y-2">
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

      <div className="flex justify-end mt-6">
        <Button
          variant="ghost"
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => (window.location.href = "/Interview")}
        >
          NEXT <ArrowBigRight />
        </Button>
      </div>
    </div>
  );
}
