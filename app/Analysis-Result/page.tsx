"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Download,
  Sparkles,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  Award,
  Target,
  Zap,
  ArrowRight,
  Star,
  GraduationCap,
  Building,
  Calendar,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface RecommendationItem {
  title: string;
  description: string;
  example: string;
}

interface EducationItem {
  year: string;
  degree: string;
  location: string;
  university: string;
}

interface WorkExperienceItem {
  role: string;
  dates: string;
  company: string;
  location: string;
  description: string[];
}

interface ExtractedData {
  skills: string[];
  projects: any[];
  education: EducationItem[];
  personal_info: {
    name: string;
    contact: {
      email: string;
      phone: string;
      linkedin: string;
      location: string;
    };
  };
  work_experience: WorkExperienceItem[];
}

interface AnalysisData {
  suggestions: {
    overall_score: string;
    recommendations: {
      "LOW PRIORITY": RecommendationItem[];
      "HIGH PRIORITY": RecommendationItem[];
      "MEDIUM PRIORITY": RecommendationItem[];
    };
  };
  extracted_data: ExtractedData;
}

export default function Analysis_Result() {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [viewAll, setViewAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get data from localStorage with key "analysis"
  useEffect(() => {
    const saved = localStorage.getItem("analysis");
    console.log("LocalStorage data:", saved);

    if (saved && saved !== "null" && saved !== "undefined") {
      try {
        const parsedData = JSON.parse(saved);
        console.log("Parsed data structure:", parsedData);

        let analysisData = null;

        if (parsedData.analysis) {
          analysisData = parsedData.analysis;
        } else if (parsedData.suggestions && parsedData.extracted_data) {
          analysisData = parsedData;
        } else if (parsedData.data && parsedData.data.suggestions) {
          analysisData = parsedData.data;
        } else if (parsedData.suggestions || parsedData.extracted_data) {
          analysisData = parsedData;
        }

        if (analysisData) {
          console.log("Setting analysis data:", analysisData);
          setAnalysis(analysisData);
        } else {
          console.warn("No valid analysis data found in localStorage");
          setAnalysis(null);
        }
      } catch (error) {
        console.error("Error parsing analysis data:", error);
        setAnalysis(null);
      }
    } else {
      console.log("No analysis data found in localStorage or data is empty");
      setAnalysis(null);
    }

    setIsLoading(false);
  }, []);

  const downloadReport = () => {
    if (!analysis) return;

    const element = document.createElement("a");
    const text = JSON.stringify(analysis, null, 2);
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "coachahead-analysis-report.txt";
    document.body.appendChild(element);
    element.click();
  };

  const renderStars = (scoreStr: string) => {
    const scoreMatch = scoreStr.match(/(\d+)\/10/);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0;
    const percentage = (score / 10) * 100;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(10)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(score)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-2xl font-bold text-white ml-2">{scoreStr}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-300 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "HIGH PRIORITY":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "MEDIUM PRIORITY":
        return <Target className="w-5 h-5 text-yellow-500" />;
      case "LOW PRIORITY":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTotalRecommendations = () => {
    if (!analysis) return 0;
    const recs = analysis.suggestions.recommendations;
    return (
      recs["HIGH PRIORITY"].length +
      recs["MEDIUM PRIORITY"].length +
      recs["LOW PRIORITY"].length
    );
  };

  const getSummary = () => {
    if (!analysis) return "";
    const scoreMatch = analysis.suggestions.overall_score.match(/(\d+)\/10/);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0;

    if (score >= 8) {
      return "Excellent - Your resume demonstrates strong qualifications with clear achievements and relevant skills. It's well-structured and would stand out to recruiters.";
    } else if (score >= 6) {
      return "Good - Your resume has a solid foundation with relevant experience and skills. Some improvements could make it more competitive.";
    } else {
      return "Needs Improvement - Your resume has the basic information but requires significant enhancements to be competitive in today's job market.";
    }
  };

  const priorityOrder = viewAll
    ? ["HIGH PRIORITY", "MEDIUM PRIORITY", "LOW PRIORITY"]
    : ["HIGH PRIORITY"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#0118D8]">
              CV ANALYSIS REPORT
            </h1>
            <p className="text-gray-600 text-lg">
              AI-powered insights to improve your resume
            </p>
          </div>

          <Card className="max-w-2xl mx-auto shadow-xl border-0">
            <CardContent className="p-12 text-center">
              <div className="w-32 h-32 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-8">
                <FileText className="w-20 h-20 text-blue-600" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                No Analysis Found
              </h2>

              <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
                You need to upload your CV first to get personalized analysis
                and recommendations.
              </p>

              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-xl">
                  <h3 className="font-bold text-xl text-blue-800 mb-3">
                    Here's what you'll get:
                  </h3>
                  <ul className="space-y-3 text-left max-w-md mx-auto">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>Personalized CV score and feedback</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>Priority-based improvement recommendations</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>Skill gap analysis</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>Downloadable report</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <Link href="/">
                    <Button className="gap-3 px-8 py-6 text-lg h-auto bg-[#0118D8] text-white hover:bg-[#1B4CFF] cursor-pointer">
                      <TrendingUp className="w-6 h-6" />
                      Upload Your CV for Analysis
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0118D8]">
            CV ANALYSIS REPORT
          </h1>
          <p className="text-gray-600 text-lg">
            AI-powered insights to improve your resume
          </p>
        </div>

        {/* Score Card - Full width at top */}
        <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white mb-8">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold mb-4">Overall Score</h2>
                <p className="text-blue-100 mb-6">
                  Based on our AI analysis of your skills, experience, and
                  career profile
                </p>
                {renderStars(analysis.suggestions.overall_score)}
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Total Recommendations</span>
                    <span className="text-2xl font-bold">
                      {getTotalRecommendations()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">High Priority Items</span>
                    <span className="text-2xl font-bold text-red-200">
                      {
                        analysis.suggestions.recommendations["HIGH PRIORITY"]
                          .length
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Button onClick={downloadReport} className="gap-2 bg-[#0118D8]">
            <Download className="w-4 h-4" />
            Download Report
          </Button>
          <Link href="/skill-analysis"></Link>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Details & Summary */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Details Card */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">Full Name</span>
                      </div>
                      <p className="text-gray-900 font-semibold text-lg">
                        {analysis.extracted_data.personal_info.name}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm font-medium">Email</span>
                      </div>
                      <p className="text-gray-900">
                        {analysis.extracted_data.personal_info.contact.email}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm font-medium">Phone</span>
                      </div>
                      <p className="text-gray-900">
                        {analysis.extracted_data.personal_info.contact.phone}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Globe className="w-4 h-4" />
                        <span className="text-sm font-medium">LinkedIn</span>
                      </div>
                      <p className="text-gray-900">
                        {analysis.extracted_data.personal_info.contact
                          .linkedin || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">Location</span>
                      </div>
                      <p className="text-gray-900">
                        {analysis.extracted_data.personal_info.contact.location}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Briefcase className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Current Role
                        </span>
                      </div>
                      <p className="text-gray-900">
                        Aerospace Engineering Student
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Card */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      {getSummary()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Card */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Skills ({analysis.extracted_data.skills.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  {analysis.extracted_data.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Education Card */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {analysis.extracted_data.education.map((edu, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 group hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {edu.degree}
                            </h4>
                            <p className="text-gray-600">{edu.university}</p>
                          </div>
                          <span className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded">
                            {edu.year}
                          </span>
                        </div>
                        {edu.location && (
                          <p className="text-gray-500 text-sm mt-1">
                            {edu.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Work Experience Card */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Work Experience (
                  {analysis.extracted_data.work_experience.length} positions)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {analysis.extracted_data.work_experience.map(
                    (work, index) => (
                      <div
                        key={index}
                        className="group hover:bg-gray-50 p-4 rounded-lg transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {work.role}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-blue-600 font-medium">
                                {work.company}
                              </p>
                              {work.location && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <p className="text-gray-500 text-sm">
                                    {work.location}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                          <span className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded">
                            {work.dates}
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {work.description.map((desc, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-gray-700"
                            >
                              <ChevronRight className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                              <span>{desc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Recommendations */}
          <div className="space-y-8">
            {/* Priority Sections */}
            {priorityOrder.map((priority) => {
              const items =
                analysis.suggestions.recommendations[
                  priority as keyof typeof analysis.suggestions.recommendations
                ] || [];
              if (!items.length) return null;

              return (
                <Card
                  key={priority}
                  className={`shadow-lg border-0 ${
                    priority === "HIGH PRIORITY"
                      ? "border-t-4 border-red-500"
                      : priority === "MEDIUM PRIORITY"
                      ? "border-t-4 border-yellow-500"
                      : "border-t-4 border-green-500"
                  }`}
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(priority)}
                        <span className="text-lg">{priority}</span>
                      </div>
                      <span className="px-3 py-1 text-sm rounded-full bg-gray-200">
                        {items.length}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {items
                        .slice(0, viewAll ? items.length : 3)
                        .map((item, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border ${
                              priority === "HIGH PRIORITY"
                                ? "border-red-200 bg-red-50"
                                : priority === "MEDIUM PRIORITY"
                                ? "border-yellow-200 bg-yellow-50"
                                : "border-green-200 bg-green-50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white flex items-center justify-center border">
                                <span className="text-gray-700 font-bold text-sm">
                                  {index + 1}
                                </span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-800 mb-2">
                                  {item.title}
                                </h4>
                                <p className="text-gray-700 text-sm mb-3">
                                  {item.description}
                                </p>
                                <div className="bg-white/80 p-3 rounded border">
                                  <p className="text-sm font-medium text-blue-700 mb-1">
                                    <Sparkles className="w-3 h-3 inline mr-1" />
                                    Recommended Action
                                  </p>
                                  <p className="text-gray-600 text-sm italic">
                                    "{item.example}"
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* View Toggle */}
            <div className="text-center pt-2">
              <Button
                variant="ghost"
                onClick={() => setViewAll((prev) => !prev)}
                className="gap-2 w-full"
              >
                <Sparkles className="w-4 h-4" />
                {viewAll ? "Show Only High Priority" : "View All Suggestions"}
                <ArrowRight
                  className={`w-4 h-4 transition-transform ${
                    viewAll ? "rotate-90" : "-rotate-90"
                  }`}
                />
              </Button>
            </div>

            {/* Next Steps */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Recommended Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Link href="/Interview">
                    <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-0 bg-white group">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">
                            Practice Interview
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Improve interview skills
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/skill-analysis">
                    <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-0 bg-white group">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                          <Target className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">
                            Skill Analysis
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Detailed skill insights
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/dashboard">
                    <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-0 bg-white group">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">Dashboard</h4>
                          <p className="text-gray-600 text-sm">
                            Track your progress
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
