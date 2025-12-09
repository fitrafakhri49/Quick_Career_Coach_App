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
  ChevronDown,
  Eye,
  EyeOff,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  const [expandedRecommendations, setExpandedRecommendations] = useState<{
    [key: string]: boolean;
  }>({});
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "details" | "recommendations"
  >("overview");

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

  const generatePDFReport = async () => {
    if (!analysis) return;

    setIsGeneratingPDF(true);

    try {
      // Create PDF document
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPos = 15;

      // Add logo/header
      pdf.setFillColor(1, 24, 216); // #0118D8
      pdf.rect(0, 0, pageWidth, 25, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("CoachAhead", pageWidth / 2, 15, { align: "center" });
      pdf.setFontSize(14);
      pdf.text("CV Analysis Report", pageWidth / 2, 22, { align: "center" });

      yPos = 35;

      // Add report summary section
      pdf.setTextColor(0, 0, 0);
      pdf.setFillColor(240, 249, 255);
      pdf.roundedRect(10, yPos, pageWidth - 20, 30, 3, 3, "F");

      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Report Summary", 15, yPos + 8);

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");

      const scoreMatch = analysis.suggestions.overall_score.match(/(\d+)\/10/);
      const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0;

      pdf.text(
        `Overall Score: ${analysis.suggestions.overall_score}`,
        15,
        yPos + 16
      );
      pdf.text(
        `Generated: ${new Date().toLocaleDateString()}`,
        pageWidth - 15,
        yPos + 16,
        { align: "right" }
      );

      const totalRecs = getTotalRecommendations();
      pdf.text(`Total Recommendations: ${totalRecs}`, 15, yPos + 22);
      pdf.text(
        `High Priority Items: ${analysis.suggestions.recommendations["HIGH PRIORITY"].length}`,
        pageWidth - 15,
        yPos + 22,
        { align: "right" }
      );

      yPos += 40;

      // Personal Information
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Personal Information", 15, yPos);
      yPos += 8;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Name: ${analysis.extracted_data.personal_info.name}`, 20, yPos);
      yPos += 6;
      pdf.text(
        `Email: ${analysis.extracted_data.personal_info.contact.email}`,
        20,
        yPos
      );
      yPos += 6;
      pdf.text(
        `Phone: ${analysis.extracted_data.personal_info.contact.phone}`,
        20,
        yPos
      );
      yPos += 6;
      pdf.text(
        `Location: ${analysis.extracted_data.personal_info.contact.location}`,
        20,
        yPos
      );
      yPos += 6;
      pdf.text(
        `LinkedIn: ${
          analysis.extracted_data.personal_info.contact.linkedin ||
          "Not provided"
        }`,
        20,
        yPos
      );
      yPos += 10;

      // Skills Section
      if (yPos > pageHeight - 30) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Skills Summary", 15, yPos);
      yPos += 8;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");

      let xPos = 20;
      analysis.extracted_data.skills.slice(0, 20).forEach((skill, index) => {
        if (xPos + pdf.getStringUnitWidth(skill) * 2.5 > pageWidth - 20) {
          yPos += 6;
          xPos = 20;
        }
        pdf.text(`• ${skill}`, xPos, yPos);
        xPos += pdf.getStringUnitWidth(`• ${skill} `) * 2.5;
      });

      yPos += 10;

      // Education Section
      if (yPos > pageHeight - 50) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Education", 15, yPos);
      yPos += 8;

      analysis.extracted_data.education.forEach((edu, index) => {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;
        }

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text(edu.degree, 20, yPos);
        yPos += 6;

        pdf.setFont("helvetica", "normal");
        pdf.text(`${edu.university} | ${edu.year}`, 20, yPos);
        yPos += 6;

        if (edu.location) {
          pdf.text(`Location: ${edu.location}`, 20, yPos);
          yPos += 6;
        }
        yPos += 4;
      });

      // Work Experience
      if (analysis.extracted_data.work_experience.length > 0) {
        if (yPos > pageHeight - 50) {
          pdf.addPage();
          yPos = 20;
        }

        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Work Experience", 15, yPos);
        yPos += 8;

        analysis.extracted_data.work_experience.forEach((work, index) => {
          if (yPos > pageHeight - 40) {
            pdf.addPage();
            yPos = 20;
          }

          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.text(work.role, 20, yPos);
          yPos += 6;

          pdf.setFont("helvetica", "normal");
          pdf.text(`${work.company} | ${work.dates}`, 20, yPos);
          yPos += 6;

          if (work.location) {
            pdf.text(`Location: ${work.location}`, 20, yPos);
            yPos += 6;
          }

          work.description.slice(0, 3).forEach((desc, idx) => {
            if (yPos > pageHeight - 10) {
              pdf.addPage();
              yPos = 20;
            }
            pdf.text(`• ${desc}`, 25, yPos);
            yPos += 6;
          });

          yPos += 4;
        });
      }

      // Recommendations Section
      pdf.addPage();
      yPos = 20;

      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Recommendations & Improvements", pageWidth / 2, yPos, {
        align: "center",
      });
      yPos += 15;

      // High Priority Recommendations
      const highPriority =
        analysis.suggestions.recommendations["HIGH PRIORITY"];
      if (highPriority.length > 0) {
        pdf.setFillColor(254, 226, 226); // Light red
        pdf.rect(15, yPos, pageWidth - 30, 10, "F");
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(220, 38, 38); // Red
        pdf.text("HIGH PRIORITY", 20, yPos + 7);
        yPos += 15;

        highPriority.forEach((item, index) => {
          if (yPos > pageHeight - 30) {
            pdf.addPage();
            yPos = 20;
          }

          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(0, 0, 0);
          pdf.text(`${index + 1}. ${item.title}`, 20, yPos);
          yPos += 6;

          pdf.setFont("helvetica", "normal");
          const descriptionLines = pdf.splitTextToSize(
            item.description,
            pageWidth - 40
          );
          descriptionLines.forEach((line: string) => {
            pdf.text(line, 25, yPos);
            yPos += 5;
          });

          yPos += 3;

          pdf.setFont("helvetica", "italic");
          pdf.setTextColor(59, 130, 246); // Blue
          const exampleLines = pdf.splitTextToSize(
            `Example: ${item.example}`,
            pageWidth - 40
          );
          exampleLines.forEach((line: string) => {
            pdf.text(line, 25, yPos);
            yPos += 5;
          });

          yPos += 8;
        });
      }

      // Footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.setFont("helvetica", "italic");
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
          align: "center",
        });
        pdf.text(
          "Generated by CoachAhead AI",
          pageWidth - 15,
          pageHeight - 10,
          { align: "right" }
        );
      }

      // Save PDF
      const fileName = `coachahead_analysis_${analysis.extracted_data.personal_info.name.replace(
        /\s+/g,
        "_"
      )}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Fallback to JSON download
      downloadReportJSON();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const downloadReportJSON = () => {
    if (!analysis) return;

    const element = document.createElement("a");
    const text = JSON.stringify(analysis, null, 2);
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `coachahead-analysis-${new Date().getTime()}.json`;
    document.body.appendChild(element);
    element.click();
  };

  const generateScreenshotPDF = async () => {
    if (!analysis) return;

    setIsGeneratingPDF(true);

    try {
      // Create a temporary container for PDF generation
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "fixed";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "0";
      tempContainer.style.width = "800px";
      tempContainer.style.backgroundColor = "white";
      tempContainer.style.padding = "40px";
      tempContainer.style.fontFamily = "Arial, sans-serif";

      // Build HTML content for PDF
      tempContainer.innerHTML = `
        <div id="pdf-content">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(to right, #0118D8, #1B4CFF); color: white; border-radius: 10px;">
            <h1 style="font-size: 32px; margin: 0 0 10px 0; font-weight: bold;">CoachAhead</h1>
            <h2 style="font-size: 24px; margin: 0; font-weight: 500;">CV Analysis Report</h2>
            <p style="margin-top: 10px; font-size: 14px; opacity: 0.9;">Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <!-- Score Summary -->
          <div style="margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 10px; border-left: 5px solid #0118D8;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <h3 style="font-size: 20px; margin: 0; color: #0118D8; font-weight: bold;">Overall Score</h3>
              <div style="background: #0118D8; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold;">
                ${analysis.suggestions.overall_score}
              </div>
            </div>
            <div style="display: flex; gap: 30px;">
              <div>
                <p style="margin: 5px 0; font-size: 14px;"><strong>Name:</strong> ${
                  analysis.extracted_data.personal_info.name
                }</p>
                <p style="margin: 5px 0; font-size: 14px;"><strong>Email:</strong> ${
                  analysis.extracted_data.personal_info.contact.email
                }</p>
              </div>
              <div>
                <p style="margin: 5px 0; font-size: 14px;"><strong>Total Recommendations:</strong> ${getTotalRecommendations()}</p>
                <p style="margin: 5px 0; font-size: 14px;"><strong>High Priority:</strong> ${
                  analysis.suggestions.recommendations["HIGH PRIORITY"].length
                }</p>
              </div>
            </div>
          </div>
          
          <!-- Skills -->
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 20px; margin: 0 0 15px 0; color: #0118D8; font-weight: bold; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">Skills</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${analysis.extracted_data.skills
                .slice(0, 20)
                .map(
                  (skill) => `
                <span style="background: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">${skill}</span>
              `
                )
                .join("")}
            </div>
          </div>
          
          <!-- High Priority Recommendations -->
          <div style="margin-bottom: 30px;">
            <div style="background: #fee2e2; color: #dc2626; padding: 10px 15px; border-radius: 8px; margin-bottom: 15px;">
              <h3 style="font-size: 18px; margin: 0; font-weight: bold;">HIGH PRIORITY RECOMMENDATIONS</h3>
            </div>
            ${analysis.suggestions.recommendations["HIGH PRIORITY"]
              .slice(0, 5)
              .map(
                (item, index) => `
              <div style="margin-bottom: 20px; padding: 15px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #dc2626;">
                <h4 style="font-size: 16px; margin: 0 0 10px 0; color: #1f2937; font-weight: bold;">${
                  index + 1
                }. ${item.title}</h4>
                <p style="font-size: 14px; margin: 0 0 10px 0; color: #4b5563;">${
                  item.description
                }</p>
                <div style="background: white; padding: 10px; border-radius: 6px; border: 1px solid #e5e7eb;">
                  <p style="font-size: 14px; margin: 0; color: #3b82f6; font-style: italic;">"${
                    item.example
                  }"</p>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280; margin: 0;">Generated by CoachAhead AI • ${new Date().getFullYear()}</p>
            <p style="font-size: 11px; color: #9ca3af; margin: 5px 0 0 0;">coachahead.com</p>
          </div>
        </div>
      `;

      document.body.appendChild(tempContainer);

      // Generate PDF from HTML
      await new Promise((resolve) => setTimeout(resolve, 100));

      const pdfContent = tempContainer.querySelector(
        "#pdf-content"
      ) as HTMLElement;
      if (pdfContent) {
        const canvas = await html2canvas(pdfContent, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

        const fileName = `coachahead_analysis_${analysis.extracted_data.personal_info.name.replace(
          /\s+/g,
          "_"
        )}_${new Date().getTime()}.pdf`;
        pdf.save(fileName);
      }

      document.body.removeChild(tempContainer);
    } catch (error) {
      console.error("Error generating screenshot PDF:", error);
      generatePDFReport(); // Fallback to text PDF
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const toggleRecommendation = (priority: string, index: number) => {
    const key = `${priority}-${index}`;
    setExpandedRecommendations((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  i < Math.floor(score)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xl sm:text-2xl font-bold text-white ml-2">
            {scoreStr}
          </span>
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
        return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />;
      case "MEDIUM PRIORITY":
        return <Target className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />;
      case "LOW PRIORITY":
        return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />;
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

  // Mobile Navigation Tabs
  const MobileTabs = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 py-3 flex flex-col items-center text-xs ${
            activeTab === "overview"
              ? "text-blue-600 bg-blue-50"
              : "text-gray-600"
          }`}
        >
          <Star className="w-5 h-5 mb-1" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab("details")}
          className={`flex-1 py-3 flex flex-col items-center text-xs ${
            activeTab === "details"
              ? "text-blue-600 bg-blue-50"
              : "text-gray-600"
          }`}
        >
          <User className="w-5 h-5 mb-1" />
          Details
        </button>
        <button
          onClick={() => setActiveTab("recommendations")}
          className={`flex-1 py-3 flex flex-col items-center text-xs ${
            activeTab === "recommendations"
              ? "text-blue-600 bg-blue-50"
              : "text-gray-600"
          }`}
        >
          <Target className="w-5 h-5 mb-1" />
          Tips
        </button>
      </div>
    </div>
  );

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
          <div className="text-center space-y-4 mb-8 md:mb-12">
            <h1 className="text-2xl md:text-4xl font-bold text-[#0118D8]">
              CV ANALYSIS REPORT
            </h1>
            <p className="text-gray-600 text-base md:text-lg">
              AI-powered insights to improve your resume
            </p>
          </div>

          <Card className="max-w-2xl mx-auto shadow-xl border-0">
            <CardContent className="p-6 md:p-12 text-center">
              <div className="w-20 h-20 md:w-32 md:h-32 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-6 md:mb-8">
                <FileText className="w-10 h-10 md:w-20 md:h-20 text-blue-600" />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                No Analysis Found
              </h2>

              <p className="text-gray-600 text-base md:text-lg mb-6 md:mb-8 max-w-xl mx-auto">
                You need to upload your CV first to get personalized analysis
                and recommendations.
              </p>

              <div className="space-y-4 md:space-y-6">
                <div className="bg-blue-50 p-4 md:p-6 rounded-xl">
                  <h3 className="font-bold text-lg md:text-xl text-blue-800 mb-3">
                    Here's what you'll get:
                  </h3>
                  <ul className="space-y-2 md:space-y-3 text-left max-w-md mx-auto">
                    <li className="flex items-center gap-2 md:gap-3">
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 shrink-0" />
                      <span className="text-sm md:text-base">
                        Personalized CV score and feedback
                      </span>
                    </li>
                    <li className="flex items-center gap-2 md:gap-3">
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 shrink-0" />
                      <span className="text-sm md:text-base">
                        Priority-based improvement recommendations
                      </span>
                    </li>
                    <li className="flex items-center gap-2 md:gap-3">
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 shrink-0" />
                      <span className="text-sm md:text-base">
                        Skill gap analysis
                      </span>
                    </li>
                    <li className="flex items-center gap-2 md:gap-3">
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 shrink-0" />
                      <span className="text-sm md:text-base">
                        Downloadable report
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <Link href="/dashboard">
                    <Button className="gap-2 md:gap-3 px-6 md:px-8 py-4 md:py-6 text-base md:text-lg h-auto bg-[#0118D8] text-white hover:bg-[#1B4CFF] cursor-pointer w-full md:w-auto">
                      <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
                      Upload Your CV for Analysis
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="w-full md:w-auto">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Home
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-3 md:p-6 lg:p-8 pb-20 md:pb-8">
      {/* Mobile Header */}
      <div className="md:hidden mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-[#0118D8]">CV Analysis</h1>
            <p className="text-gray-600 text-sm">AI-powered insights</p>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="bg-white rounded-lg shadow-lg border p-4 mb-6 animate-slideDown">
            <div className="space-y-3">
              <Button
                onClick={generateScreenshotPDF}
                className="w-full justify-start gap-3"
                size="lg"
                disabled={isGeneratingPDF}
              >
                <Download className="w-4 h-4" />
                {isGeneratingPDF ? "Generating PDF..." : "Download Report"}
              </Button>
              <Button
                onClick={downloadReportJSON}
                variant="outline"
                className="w-full justify-start gap-3"
                size="lg"
              >
                <FileText className="w-4 h-4" />
                Download JSON
              </Button>
              <Link href="/dashboard" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  size="lg"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block text-center space-y-3 md:space-y-4 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-[#0118D8]">
          CV ANALYSIS REPORT
        </h1>
        <p className="text-gray-600 text-base md:text-lg">
          AI-powered insights to improve your resume
        </p>
      </div>

      {/* Score Card - Responsive */}
      <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white mb-6 md:mb-8">
        <CardContent className="p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <div className="md:col-span-2">
              <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
                Overall Score
              </h2>
              <p className="text-blue-100 text-sm md:text-base mb-4 md:mb-6">
                Based on our AI analysis of your skills, experience, and career
                profile
              </p>
              {renderStars(analysis.suggestions.overall_score)}
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6">
              <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">
                Quick Stats
              </h3>
              <div className="space-y-3 md:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-sm md:text-base">
                    Total Recommendations
                  </span>
                  <span className="text-xl md:text-2xl font-bold">
                    {getTotalRecommendations()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-sm md:text-base">
                    High Priority Items
                  </span>
                  <span className="text-xl md:text-2xl font-bold text-red-200">
                    {
                      analysis.suggestions.recommendations["HIGH PRIORITY"]
                        .length
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-sm md:text-base">
                    Report Date
                  </span>
                  <span className="text-base md:text-lg">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons - Desktop */}
      <div className="hidden md:flex flex-wrap gap-3 md:gap-4 justify-center mb-6 md:mb-8">
        <Button
          onClick={generateScreenshotPDF}
          className="gap-2 bg-[#0118D8] px-4 md:px-6"
          disabled={isGeneratingPDF}
          size="lg"
        >
          {isGeneratingPDF ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download PDF Report
            </>
          )}
        </Button>
        <Button
          onClick={downloadReportJSON}
          variant="outline"
          className="gap-2 px-4 md:px-6"
          size="lg"
        >
          <FileText className="w-4 h-4" />
          Download JSON
        </Button>
        <Link href="/skill-analysis">
          <Button variant="outline" className="gap-2 px-4 md:px-6" size="lg">
            <Target className="w-4 h-4" />
            Skill Analysis
          </Button>
        </Link>
      </div>

      {/* Mobile Content Tabs */}
      <div className="md:hidden space-y-6">
        {activeTab === "overview" && (
          <>
            {/* Personal Details Card - Mobile */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <User className="w-3 h-3" />
                      <span className="text-xs font-medium">Full Name</span>
                    </div>
                    <p className="text-gray-900 font-semibold">
                      {analysis.extracted_data.personal_info.name}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Mail className="w-3 h-3" />
                      <span className="text-xs font-medium">Email</span>
                    </div>
                    <p className="text-gray-900 text-sm">
                      {analysis.extracted_data.personal_info.contact.email}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Phone className="w-3 h-3" />
                      <span className="text-xs font-medium">Phone</span>
                    </div>
                    <p className="text-gray-900 text-sm">
                      {analysis.extracted_data.personal_info.contact.phone}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs font-medium">Location</span>
                    </div>
                    <p className="text-gray-900 text-sm">
                      {analysis.extracted_data.personal_info.contact.location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Card - Mobile */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Skills ({analysis.extracted_data.skills.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2">
                  {analysis.extracted_data.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "details" && (
          <>
            {/* Education Card - Mobile */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {analysis.extracted_data.education.map((edu, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                    >
                      <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">
                          {edu.degree}
                        </h4>
                        <p className="text-gray-600 text-xs truncate">
                          {edu.university}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          {edu.location && (
                            <p className="text-gray-500 text-xs">
                              {edu.location}
                            </p>
                          )}
                          <span className="text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {edu.year}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Work Experience Card - Mobile */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Work Experience (
                  {analysis.extracted_data.work_experience.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {analysis.extracted_data.work_experience.map(
                    (work, index) => (
                      <div key={index} className="p-3 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-sm truncate">
                              {work.role}
                            </h4>
                            <p className="text-blue-600 text-xs truncate">
                              {work.company}
                            </p>
                          </div>
                          <span className="text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded shrink-0">
                            {work.dates}
                          </span>
                        </div>
                        {work.description.length > 0 && (
                          <div className="text-gray-600 text-xs mt-2">
                            • {work.description[0]}
                            {work.description.length > 1 && (
                              <span className="text-gray-400 ml-1">
                                +{work.description.length - 1} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "recommendations" && (
          <>
            {/* High Priority Recommendations - Mobile */}
            <Card className="shadow-lg border-0 border-t-4 border-red-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span>HIGH PRIORITY</span>
                  </div>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200">
                    {
                      analysis.suggestions.recommendations["HIGH PRIORITY"]
                        .length
                    }
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.suggestions.recommendations["HIGH PRIORITY"]
                    .slice(0, 3)
                    .map((item, index) => {
                      const key = `HIGH PRIORITY-${index}`;
                      const isExpanded = expandedRecommendations[key] || false;

                      return (
                        <div
                          key={index}
                          className="p-3 rounded-lg border border-red-200 bg-red-50"
                        >
                          <div className="flex items-start gap-2">
                            <div className="shrink-0 w-5 h-5 rounded-full bg-white flex items-center justify-center border text-xs font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className="cursor-pointer"
                                onClick={() =>
                                  toggleRecommendation("HIGH PRIORITY", index)
                                }
                              >
                                <h4 className="font-bold text-gray-800 text-sm mb-1 pr-6 truncate">
                                  {item.title}
                                </h4>
                                <button className="text-xs text-blue-600 hover:text-blue-800">
                                  {isExpanded ? "Show less" : "View details"}
                                </button>
                              </div>

                              {isExpanded && (
                                <div className="mt-3 space-y-2 animate-fadeIn">
                                  <p className="text-gray-600 text-xs">
                                    {item.description}
                                  </p>
                                  <div className="bg-white/80 p-2 rounded border text-xs">
                                    <p className="text-blue-700 font-medium mb-1">
                                      <Sparkles className="w-3 h-3 inline mr-1" />
                                      Example:
                                    </p>
                                    <p className="text-gray-600 italic">
                                      "{item.example}"
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* View All Button for Mobile */}
                <Button
                  variant="ghost"
                  onClick={() => setViewAll((prev) => !prev)}
                  className="w-full mt-4 text-sm"
                  size="sm"
                >
                  <Sparkles className="w-3 h-3 mr-2" />
                  {viewAll ? "Show Less" : "View All Suggestions"}
                </Button>
              </CardContent>
            </Card>

            {/* Next Steps - Mobile */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/Interview">
                    <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-0 bg-white">
                      <CardContent className="p-3 flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm">
                            Practice Interview
                          </h4>
                          <p className="text-gray-600 text-xs">
                            Improve interview skills
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/skill-analysis">
                    <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-0 bg-white">
                      <CardContent className="p-3 flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Target className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm">
                            Skill Analysis
                          </h4>
                          <p className="text-gray-600 text-xs">
                            Detailed skill insights
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
        {/* Left Column - Personal Details & Summary */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* Personal Details Card */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                      {analysis.extracted_data.personal_info.contact.linkedin ||
                        "Not provided"}
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
                      <span className="text-sm font-medium">Current Role</span>
                    </div>
                    <p className="text-gray-900">
                      Aerospace Engineering Student
                    </p>
                  </div>
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
                    <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
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
        </div>

        {/* Right Column - Recommendations (Desktop) */}
        <div className="space-y-6 md:space-y-8 lg:sticky lg:top-24 self-start">
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
                      .map((item, index) => {
                        const key = `${priority}-${index}`;
                        const isExpanded =
                          expandedRecommendations[key] || false;

                        return (
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
                              <div className="shrink-0 w-6 h-6 rounded-full bg-white flex items-center justify-center border">
                                <span className="text-gray-700 font-bold text-sm">
                                  {index + 1}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div
                                  className="cursor-pointer"
                                  onClick={() =>
                                    toggleRecommendation(priority, index)
                                  }
                                >
                                  <div className="flex items-start justify-between">
                                    <h4 className="font-bold text-gray-800 mb-2 pr-2">
                                      {item.title}
                                    </h4>
                                    <button className="text-gray-500 hover:text-gray-700 mt-0.5">
                                      {isExpanded ? (
                                        <ChevronDown className="w-4 h-4" />
                                      ) : (
                                        <Eye className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>

                                  {!isExpanded && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <EyeOff className="w-3 h-3 text-gray-400" />
                                      <span className="text-xs text-gray-500">
                                        Click to view details
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {isExpanded && (
                                  <div className="mt-4 space-y-3 animate-fadeIn">
                                    <div>
                                      <p className="text-sm text-gray-700 mb-1 font-medium">
                                        Description:
                                      </p>
                                      <p className="text-gray-600 text-sm">
                                        {item.description}
                                      </p>
                                    </div>
                                    <div className="bg-white/80 p-3 rounded border">
                                      <p className="text-sm font-medium text-blue-700 mb-1">
                                        <Sparkles className="w-3 h-3 inline mr-1" />
                                        Recommended Action
                                      </p>
                                      <p className="text-gray-600 text-sm italic">
                                        "{item.example}"
                                      </p>
                                    </div>
                                    <button
                                      onClick={() =>
                                        toggleRecommendation(priority, index)
                                      }
                                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    >
                                      <EyeOff className="w-3 h-3" />
                                      Hide details
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
        </div>
      </div>

      {/* Mobile Navigation Tabs */}
      <MobileTabs />

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
