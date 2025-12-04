"use client";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-md">
      <div className="max-w-5xl mx-auto flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold text-blue-700">CoachAhead</h1>
        <div className="flex items-center gap-4">
          <button
            className="text-gray-600 hover:text-black cursor-pointer"
            onClick={() => (window.location.href = "/")}
          >
            Dashboard
          </button>
          <button
            className="text-gray-600 hover:text-black cursor-pointer"
            onClick={() => (window.location.href = "/SkillAnalysis")}
          >
            Skill Gap Analysis
          </button>
          <Button
            variant="destructive"
            className="cursor-pointer"
            onClick={() => {
              document.cookie = "token=; Max-Age=0; path=/";
              localStorage.removeItem("access_token");
              window.location.href = "/login";
            }}
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
