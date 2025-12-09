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
  ChevronDown,
  ChevronUp,
  FileText,
  Upload as UploadIcon,
} from "lucide-react";
import Link from "next/link";

export default function SkillAnalysisPage() {
  const [targetRole, setTargetRole] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentRoles, setRecentRoles] = useState<string[]>([]);
  const [cvAvailable, setCvAvailable] = useState(false);

  // State for expandable sections
  const [showAllMatched, setShowAllMatched] = useState(false);
  const [showAllMissing, setShowAllMissing] = useState(false);
  const [showAllNiceToHave, setShowAllNiceToHave] = useState(false);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);

  // Check if CV is available and load recent roles
  useEffect(() => {
    const parsedCv = localStorage.getItem("cv_paragraph");
    setCvAvailable(!!parsedCv);

    // Load recent target roles from localStorage
    const savedRoles = localStorage.getItem("recent_roles");
    if (savedRoles) {
      setRecentRoles(JSON.parse(savedRoles).slice(0, 5));
    }
    const savedAnalysis = localStorage.getItem("skill_analysis");
    if (savedAnalysis) {
      setAnalysis(JSON.parse(savedAnalysis));
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

        // Reset expandable sections
        setShowAllMatched(false);
        setShowAllMissing(false);
        setShowAllNiceToHave(false);
        setShowAllCourses(false);
        setShowAllProjects(false);
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

  // Helper function to get limited items for display
  const getLimitedItems = (items: any[], limit: number, showAll: boolean) => {
    if (!items) return [];
    return showAll ? items : items.slice(0, limit);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0118D8] mb-3 sm:mb-4">
            AI Skill Gap Analysis
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Discover your skill gaps and get personalized learning
            recommendations for your dream role
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Input and Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* CV Status Card */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900 text-base sm:text-lg">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  CV Status
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div
                  className={`p-3 sm:p-4 rounded-lg ${
                    cvAvailable
                      ? "bg-green-50 text-green-800"
                      : "bg-yellow-50 text-yellow-800"
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    {cvAvailable ? (
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold text-sm sm:text-base">
                        {cvAvailable ? "CV Uploaded ✓" : "CV Required"}
                      </p>
                      <p className="text-xs sm:text-sm mt-0.5 sm:mt-1">
                        {cvAvailable
                          ? "Your skills are ready to be analyzed"
                          : "Upload your CV first to analyze skills"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Button when CV is NOT uploaded */}
                {!cvAvailable && (
                  <Link href="/dashboard" className="block w-full">
                    <Button className="w-full mt-3 sm:mt-4 gap-2 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base py-2.5 sm:py-3">
                      <UploadIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Upload CV First
                    </Button>
                  </Link>
                )}

                {/* Button when CV IS uploaded */}
                {cvAvailable && (
                  <Link href="/dashboard" className="block w-full">
                    <Button
                      variant="outline"
                      className="w-full mt-3 sm:mt-4 gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-sm sm:text-base py-2.5 sm:py-3"
                    >
                      <UploadIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Change CV
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Target Role Input Card */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900 text-base sm:text-lg">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                  Target Role Analysis
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Enter your desired job role for skill gap analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Desired Position
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g., Frontend Developer, Data Scientist"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                      onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                    />
                    <Search className="absolute right-2.5 sm:right-3 top-2.5 sm:top-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                </div>

                {recentRoles.length > 0 && (
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Recent searches:
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {recentRoles.map((role, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickSelect(role)}
                          className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
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
                  className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-sm sm:text-base py-2.5 sm:py-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                      <span className="truncate">Analyzing Skills...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="truncate">Analyze Skill Gaps</span>
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Tips Card */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900 text-base sm:text-lg">
                  <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-xs sm:text-sm text-gray-700">
                    Be specific with role titles for better analysis
                  </p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-xs sm:text-sm text-gray-700">
                    Analysis takes about 30-60 seconds
                  </p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <Download className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-xs sm:text-sm text-gray-700">
                    Download your results for future reference
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            {error && (
              <Card className="shadow-lg border-0 border-l-4 border-red-500 mb-4 sm:mb-6">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-700 mb-1 text-sm sm:text-base">
                        Error
                      </h3>
                      <p className="text-gray-700 text-xs sm:text-sm">
                        {error}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {analysis ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Analysis Summary */}
                <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
                          Analysis Complete!
                        </h2>
                        <p className="text-blue-100 text-sm sm:text-base">
                          Skill gap analysis for{" "}
                          <span className="font-semibold">{targetRole}</span>
                        </p>
                      </div>
                      <Button
                        onClick={downloadAnalysis}
                        variant="outline"
                        className="bg-white/10 hover:bg-white/20 border-white text-white text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4"
                      >
                        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Skills Grid - Changed to rows */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Matched Skills Row */}
                  <Card className="shadow-lg border-0">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                              Matched Skills
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Skills you already have
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-6 sm:ml-0">
                          <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-semibold">
                            {analysis.matched_skills?.length || 0}
                          </span>
                          {analysis.matched_skills?.length > 3 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowAllMatched(!showAllMatched)}
                              className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                            >
                              {showAllMatched ? (
                                <>
                                  <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                  Show All
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {getLimitedItems(
                          analysis.matched_skills,
                          3,
                          showAllMatched
                        ).map((skill: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-green-50 rounded-lg border border-green-200"
                          >
                            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 shrink-0" />
                            <span className="text-gray-700 text-xs sm:text-sm">
                              {skill}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Missing Skills Row */}
                  <Card className="shadow-lg border-0">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                              Missing Skills
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Skills to develop
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-6 sm:ml-0">
                          <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-red-100 text-red-800 rounded-full text-xs sm:text-sm font-semibold">
                            {analysis.missing_skills?.length || 0}
                          </span>
                          {analysis.missing_skills?.length > 3 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowAllMissing(!showAllMissing)}
                              className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                            >
                              {showAllMissing ? (
                                <>
                                  <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                  Show All
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {getLimitedItems(
                          analysis.missing_skills,
                          3,
                          showAllMissing
                        ).map((skill: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-red-50 rounded-lg border border-red-200"
                          >
                            <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 shrink-0" />
                            <span className="text-gray-700 text-xs sm:text-sm">
                              {skill}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Nice-to-Have Skills Row */}
                  <Card className="shadow-lg border-0">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                              Nice-to-Have Skills
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Bonus skills for advantage
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-6 sm:ml-0">
                          <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs sm:text-sm font-semibold">
                            {analysis.nice_to_have_skills?.length || 0}
                          </span>
                          {analysis.nice_to_have_skills?.length > 3 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setShowAllNiceToHave(!showAllNiceToHave)
                              }
                              className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                            >
                              {showAllNiceToHave ? (
                                <>
                                  <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                  Show All
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {getLimitedItems(
                          analysis.nice_to_have_skills,
                          3,
                          showAllNiceToHave
                        ).map((skill: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-yellow-50 rounded-lg border border-yellow-200"
                          >
                            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500 shrink-0" />
                            <span className="text-gray-700 text-xs sm:text-sm">
                              {skill}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommendations Grid - Show as rows */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Courses Row */}
                  <Card className="shadow-lg border-0">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                              Recommended Courses
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Learn the missing skills
                            </p>
                          </div>
                        </div>
                        {analysis.recommendations?.courses?.length > 3 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAllCourses(!showAllCourses)}
                            className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                          >
                            {showAllCourses ? (
                              <>
                                <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                Show Less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                Show All (
                                {analysis.recommendations.courses.length})
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        {getLimitedItems(
                          analysis.recommendations?.courses,
                          3,
                          showAllCourses
                        ).map((course: string, index: number) => (
                          <div
                            key={index}
                            className="group p-3 sm:p-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <div className="flex items-start gap-2.5 sm:gap-3">
                              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 sm:mt-1 shrink-0" />
                              <div>
                                <p className="font-medium text-gray-900 text-sm sm:text-base">
                                  {course}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                                  Online Course
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Projects Row */}
                  <Card className="shadow-lg border-0">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                              Project Ideas
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Practice with real projects
                            </p>
                          </div>
                        </div>
                        {analysis.recommendations?.projects?.length > 3 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAllProjects(!showAllProjects)}
                            className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                          >
                            {showAllProjects ? (
                              <>
                                <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                Show Less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                Show All (
                                {analysis.recommendations.projects.length})
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        {getLimitedItems(
                          analysis.recommendations?.projects,
                          3,
                          showAllProjects
                        ).map((project: string, index: number) => (
                          <div
                            key={index}
                            className="group p-3 sm:p-4 bg-gray-50 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <div className="flex items-start gap-2.5 sm:gap-3">
                              <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 sm:mt-1 shrink-0" />
                              <div>
                                <p className="font-medium text-gray-900 text-sm sm:text-base">
                                  {project}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                                  Hands-on Project
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <Link href="/interview" className="flex-1 min-w-[140px]">
                    <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm py-2">
                      <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Practice Interview
                    </Button>
                  </Link>
                  <Link href="/dashboard" className="flex-1 min-w-[140px]">
                    <Button
                      variant="outline"
                      className="w-full gap-2 text-xs sm:text-sm py-2"
                    >
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Back to Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setAnalysis(null);
                      setTargetRole("");
                    }}
                    className="gap-2 text-xs sm:text-sm py-2 flex-1 min-w-[140px]"
                  >
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    New Analysis
                  </Button>
                </div>
              </div>
            ) : (
              /* Placeholder/Instruction Card */
              <Card className="shadow-lg border-0 h-full">
                <CardContent className="p-6 sm:p-8 md:p-12 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                    <Brain className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                    Ready for Skill Analysis?
                  </h3>
                  <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                    Enter your target role above to discover your skill gaps and
                    get personalized learning recommendations.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto">
                    <div className="text-center p-3 sm:p-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                        <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                      <p className="font-medium text-gray-900 text-xs sm:text-sm">
                        Enter Role
                      </p>
                    </div>
                    <div className="text-center p-3 sm:p-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full bg-green-100 flex items-center justify-center">
                        <Search className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      </div>
                      <p className="font-medium text-gray-900 text-xs sm:text-sm">
                        AI Analysis
                      </p>
                    </div>
                    <div className="text-center p-3 sm:p-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                      </div>
                      <p className="font-medium text-gray-900 text-xs sm:text-sm">
                        Get Insights
                      </p>
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
