"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Target,
  Search,
  CheckCircle,
  XCircle,
  Star,
  BookOpen,
  Rocket,
  TrendingUp,
  Zap,
  Download,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Lightbulb,
  Brain,
  GraduationCap,
  Briefcase,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function SkillAnalysisPage() {
  const [targetRole, setTargetRole] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentRoles, setRecentRoles] = useState<string[]>([]);
  const [cvAvailable, setCvAvailable] = useState(false);

  // Check if CV is available and load recent roles
  useEffect(() => {
    const parsedCv = localStorage.getItem("cv_paragraph");
    setCvAvailable(!!parsedCv);

    // Load recent target roles from localStorage
    const savedRoles = localStorage.getItem("recent_roles");
    if (savedRoles) {
      setRecentRoles(JSON.parse(savedRoles).slice(0, 5));
    }
  }, []);

  const saveRecentRole = (role: string) => {
    const updatedRoles = [role, ...recentRoles.filter((r) => r !== role)].slice(
      0,
      5
    );
    setRecentRoles(updatedRoles);
    localStorage.setItem("recent_roles", JSON.stringify(updatedRoles));
  };

  const handleAnalyze = async () => {
    const parsedCv = localStorage.getItem("cv_paragraph");

    if (!parsedCv) {
      setError(
        "CV text not found in localStorage. Please upload your CV first from the Dashboard."
      );
      return;
    }

    if (!targetRole.trim()) {
      setError("Please enter a target role to analyze.");
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
        saveRecentRole(targetRole);
        // Save analysis to localStorage for the results page
        localStorage.setItem("skill_analysis", JSON.stringify(data.analysis));
      } else {
        setError(data.message || "Failed to analyze skills.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Error connecting to server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (role: string) => {
    setTargetRole(role);
  };

  const downloadAnalysis = () => {
    if (!analysis) return;

    const element = document.createElement("a");
    const text = JSON.stringify(analysis, null, 2);
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "skill-analysis-report.txt";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0118D8] mb-4">
            AI Skill Gap Analysis
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Discover your skill gaps and get personalized learning
            recommendations for your dream role
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Input and Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* CV Status Card */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <FileText className="w-5 h-5" />
                  CV Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`p-4 rounded-lg ${
                    cvAvailable
                      ? "bg-green-50 text-green-800"
                      : "bg-yellow-50 text-yellow-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {cvAvailable ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <AlertCircle className="w-6 h-6" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {cvAvailable ? "CV Uploaded ✓" : "CV Required"}
                      </p>
                      <p className="text-sm mt-1">
                        {cvAvailable
                          ? "Your Skill is ready to be analyze"
                          : "Upload your CV first to analyze skills"}
                      </p>
                    </div>
                  </div>
                </div>

                {!cvAvailable && (
                  <Link href="/dashboard">
                    <Button className="w-full mt-4 gap-2 bg-blue-600 hover:bg-blue-700">
                      <Upload className="w-4 h-4" />
                      Upload CV First
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Target Role Input Card */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Target className="w-5 h-5" />
                  Target Role Analysis
                </CardTitle>
                <CardDescription>
                  Enter your desired job role for skill gap analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desired Position
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g., Frontend Developer, Data Scientist, Product Manager"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                    />
                    <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {recentRoles.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Recent searches:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recentRoles.map((role, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickSelect(role)}
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleAnalyze}
                  disabled={loading || !cvAvailable}
                  className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Analyzing Skills...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      Analyze Skill Gaps
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Tips Card */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Lightbulb className="w-5 h-5" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    Be specific with role titles for better analysis
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    Analysis takes about 30-60 seconds
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    Download your results for future reference
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            {error && (
              <Card className="shadow-lg border-0 border-l-4 border-red-500 mb-6">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-700 mb-1">Error</h3>
                      <p className="text-gray-700">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {analysis ? (
              <div className="space-y-6">
                {/* Analysis Summary */}
                <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">
                          Analysis Complete!
                        </h2>
                        <p className="text-blue-100">
                          Skill gap analysis for{" "}
                          <span className="font-semibold">{targetRole}</span>
                        </p>
                      </div>
                      <Button
                        onClick={downloadAnalysis}
                        variant="outline"
                        className="bg-white/10 hover:bg-white/20 border-white text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Skills Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Matched Skills */}
                  <Card className="shadow-lg border-0 border-t-4 border-green-500">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-gray-900">Matched Skills</span>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                          {analysis.matched_skills?.length || 0}
                        </span>
                      </CardTitle>
                      <CardDescription>Skills you already have</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysis.matched_skills?.map(
                          (skill: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-green-50 rounded-lg"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-gray-700">{skill}</span>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Missing Skills */}
                  <Card className="shadow-lg border-0 border-t-4 border-red-500">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-5 h-5 text-red-500" />
                          <span className="text-gray-900">Missing Skills</span>
                        </div>
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                          {analysis.missing_skills?.length || 0}
                        </span>
                      </CardTitle>
                      <CardDescription>Skills to develop</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysis.missing_skills?.map(
                          (skill: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-red-50 rounded-lg"
                            >
                              <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                              <span className="text-gray-700">{skill}</span>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Nice-to-Have Skills */}
                  <Card className="shadow-lg border-0 border-t-4 border-yellow-500">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-yellow-500" />
                          <span className="text-gray-900">Nice-to-Have</span>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                          {analysis.nice_to_have_skills?.length || 0}
                        </span>
                      </CardTitle>
                      <CardDescription>
                        Bonus skills for advantage
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysis.nice_to_have_skills?.map(
                          (skill: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg"
                            >
                              <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                              <span className="text-gray-700">{skill}</span>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommendations */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Courses */}
                  <Card className="shadow-lg border-0">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-gray-900">
                        <GraduationCap className="w-5 h-5" />
                        Recommended Courses
                      </CardTitle>
                      <CardDescription>
                        Learn the missing skills
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysis.recommendations?.courses?.map(
                          (course: string, index: number) => (
                            <div
                              key={index}
                              className="group p-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <div className="flex items-start gap-3">
                                <BookOpen className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {course}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Online Course
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Projects */}
                  <Card className="shadow-lg border-0">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-gray-900">
                        <Briefcase className="w-5 h-5" />
                        Project Ideas
                      </CardTitle>
                      <CardDescription>
                        Practice with real projects
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysis.recommendations?.projects?.map(
                          (project: string, index: number) => (
                            <div
                              key={index}
                              className="group p-4 bg-gray-50 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <div className="flex items-start gap-3">
                                <Rocket className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {project}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Hands-on Project
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Link href="/interview">
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                      <TrendingUp className="w-4 h-4" />
                      Practice Interview
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" className="gap-2">
                      <ArrowRight className="w-4 h-4" />
                      Back to Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => setAnalysis(null)}
                    className="gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    New Analysis
                  </Button>
                </div>
              </div>
            ) : (
              /* Placeholder/Instruction Card */
              <Card className="shadow-lg border-0 h-full">
                <CardContent className="p-12 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                    <Brain className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready for Skill Analysis?
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Enter your target role above to discover your skill gaps and
                    get personalized learning recommendations.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
                    <div className="text-center p-4">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                        <Target className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="font-medium text-gray-900">Enter Role</p>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                        <Search className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="font-medium text-gray-900">AI Analysis</p>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                        <Lightbulb className="w-6 h-6 text-purple-600" />
                      </div>
                      <p className="font-medium text-gray-900">Get Insights</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Missing icon components
const FileText = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" x2="8" y1="13" y2="13" />
    <line x1="16" x2="8" y1="17" y2="17" />
    <line x1="10" x2="8" y1="9" y2="9" />
  </svg>
);

const Upload = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);
