"use client";
import { useState, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Edit,
  Eye,
  Save,
  Plus,
  Trash2,
  Download,
  Printer,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  GraduationCap,
  Building,
  Award,
  X,
  Check,
  Sparkles,
  RefreshCw,
  Target,
} from "lucide-react";
import jsPDF from "jspdf";
import axios from "axios";

interface EducationItem {
  id: string;
  year: string;
  degree: string;
  location: string;
  university: string;
  gpa?: string;
}

interface WorkExperienceItem {
  id: string;
  role: string;
  dates: string;
  company: string;
  location: string;
  description: string[];
}

interface PersonalInfo {
  name: string;
  title: string;
  summary: string;
  contact: {
    email: string;
    phone: string;
    linkedin: string;
    location: string;
  };
}

interface CVData {
  personal_info: PersonalInfo;
  skills: string[];
  education: EducationItem[];
  work_experience: WorkExperienceItem[];
  certifications: string[];
}

export default function CVPreviewEditor() {
  const [cvData, setCvData] = useState<CVData>({
    personal_info: {
      name: "",
      title: "",
      summary: "",
      contact: {
        email: "",
        phone: "",
        linkedin: "",
        location: "",
      },
    },
    skills: [],
    education: [],
    work_experience: [],
    certifications: [],
  });

  const [editMode, setEditMode] = useState<"preview" | "edit">("preview");
  const [isSaving, setIsSaving] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [reanalyzeProgress, setReanalyzeProgress] = useState(0);

  // Load data from localStorage
  useEffect(() => {
    const loadCVData = () => {
      setIsLoading(true);
      try {
        // Try to get edited CV first
        const editedCV = localStorage.getItem("editedCV");
        const parsedCV = localStorage.getItem("parsedCV");
        const analysis = localStorage.getItem("analysis");

        console.log("Loading CV data from localStorage...");
        console.log("Edited CV exists:", !!editedCV);
        console.log("Parsed CV exists:", !!parsedCV);
        console.log("Analysis exists:", !!analysis);

        // Priority 1: Edited CV
        if (editedCV && editedCV !== "null") {
          console.log("Loading from editedCV");
          const parsedData = JSON.parse(editedCV);
          setCvData(parsedData);
        }
        // Priority 2: Analysis data (your specific JSON structure)
        else if (analysis && analysis !== "null") {
          console.log("Loading from analysis data");
          try {
            const analysisData = JSON.parse(analysis);
            console.log("Analysis data structure:", analysisData);

            // Check for your specific structure: analysis.extracted_data
            if (analysisData.analysis && analysisData.analysis.extracted_data) {
              const extractedData = analysisData.analysis.extracted_data;
              console.log("Found analysis.extracted_data:", extractedData);

              // Process your specific JSON structure
              setCvData({
                personal_info: {
                  name: extractedData.personal_info?.name || "Your Name",
                  title: "Aerospace Engineering Student", // You can customize this
                  summary: "", // Add a summary if available
                  contact: {
                    email: extractedData.personal_info?.contact?.email || "",
                    phone: extractedData.personal_info?.contact?.phone || "",
                    linkedin:
                      extractedData.personal_info?.contact?.linkedin || "",
                    location:
                      extractedData.personal_info?.contact?.location || "",
                  },
                },
                skills: extractedData.skills || [],
                education:
                  extractedData.education?.map((edu: any, index: number) => ({
                    id: `edu-${index}`,
                    year: edu.year || "",
                    degree: edu.degree || "",
                    location: edu.location || "",
                    university: edu.university || "",
                  })) || [],
                work_experience:
                  extractedData.work_experience?.map(
                    (work: any, index: number) => ({
                      id: `work-${index}`,
                      role: work.role || "",
                      dates: work.dates || "",
                      company: work.company || "",
                      location: work.location || "",
                      description: work.description || [],
                    })
                  ) || [],
                certifications: [], // Add certifications if available in your data
              });
            }
            // Also check for other possible structures
            else if (analysisData.extracted_data) {
              // Direct extracted_data format
              console.log("Found direct extracted_data");
              const extractedData = analysisData.extracted_data;
              setCvData({
                personal_info: {
                  name: extractedData.personal_info?.name || "Your Name",
                  title: "Professional",
                  summary: "",
                  contact: {
                    email: extractedData.personal_info?.contact?.email || "",
                    phone: extractedData.personal_info?.contact?.phone || "",
                    linkedin:
                      extractedData.personal_info?.contact?.linkedin || "",
                    location:
                      extractedData.personal_info?.contact?.location || "",
                  },
                },
                skills: extractedData.skills || [],
                education:
                  extractedData.education?.map((edu: any, index: number) => ({
                    id: `edu-${index}`,
                    year: edu.year || "",
                    degree: edu.degree || "",
                    location: edu.location || "",
                    university: edu.university || "",
                  })) || [],
                work_experience:
                  extractedData.work_experience?.map(
                    (work: any, index: number) => ({
                      id: `work-${index}`,
                      role: work.role || "",
                      dates: work.dates || "",
                      company: work.company || "",
                      location: work.location || "",
                      description: work.description || [],
                    })
                  ) || [],
                certifications: [],
              });
            }
            // Try to get from parsedCV as fallback
            else if (parsedCV && parsedCV !== "null") {
              console.log("Trying parsedCV as fallback");
              const parsedData = JSON.parse(parsedCV);

              if (parsedData.extracted_data) {
                const extractedData = parsedData.extracted_data;
                setCvData({
                  personal_info: {
                    name: extractedData.personal_info?.name || "Your Name",
                    title: "Professional",
                    summary: "",
                    contact: {
                      email: extractedData.personal_info?.contact?.email || "",
                      phone: extractedData.personal_info?.contact?.phone || "",
                      linkedin:
                        extractedData.personal_info?.contact?.linkedin || "",
                      location:
                        extractedData.personal_info?.contact?.location || "",
                    },
                  },
                  skills: extractedData.skills || [],
                  education:
                    extractedData.education?.map((edu: any, index: number) => ({
                      id: `edu-${index}`,
                      year: edu.year || "",
                      degree: edu.degree || "",
                      location: edu.location || "",
                      university: edu.university || "",
                    })) || [],
                  work_experience:
                    extractedData.work_experience?.map(
                      (work: any, index: number) => ({
                        id: `work-${index}`,
                        role: work.role || "",
                        dates: work.dates || "",
                        company: work.company || "",
                        location: work.location || "",
                        description: work.description || [],
                      })
                    ) || [],
                  certifications: [],
                });
              }
            } else {
              console.log("No valid CV data structure found in analysis");
              alert(
                "❌ No valid CV data found. Please upload and analyze your CV first."
              );
            }
          } catch (error) {
            console.error("Error parsing analysis data:", error);
            alert("❌ Error loading CV data. Please try uploading again.");
          }
        }
        // Priority 3: Parsed CV from upload
        else if (parsedCV && parsedCV !== "null") {
          console.log("Loading from parsedCV");
          const parsedData = JSON.parse(parsedCV);

          if (parsedData.extracted_data) {
            const extractedData = parsedData.extracted_data;
            setCvData({
              personal_info: {
                name: extractedData.personal_info?.name || "Your Name",
                title: "Professional",
                summary: "",
                contact: {
                  email: extractedData.personal_info?.contact?.email || "",
                  phone: extractedData.personal_info?.contact?.phone || "",
                  linkedin:
                    extractedData.personal_info?.contact?.linkedin || "",
                  location:
                    extractedData.personal_info?.contact?.location || "",
                },
              },
              skills: extractedData.skills || [],
              education:
                extractedData.education?.map((edu: any, index: number) => ({
                  id: `edu-${index}`,
                  year: edu.year || "",
                  degree: edu.degree || "",
                  location: edu.location || "",
                  university: edu.university || "",
                })) || [],
              work_experience:
                extractedData.work_experience?.map(
                  (work: any, index: number) => ({
                    id: `work-${index}`,
                    role: work.role || "",
                    dates: work.dates || "",
                    company: work.company || "",
                    location: work.location || "",
                    description: work.description || [],
                  })
                ) || [],
              certifications: [],
            });
          }
        } else {
          console.log("No CV data found in localStorage");
          // You might want to show a message to the user
        }
      } catch (error) {
        console.error("Error loading CV data:", error);
        alert("❌ Failed to load CV data");
      } finally {
        setIsLoading(false);
      }
    };

    loadCVData();
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    try {
      localStorage.setItem("editedCV", JSON.stringify(cvData));
      alert("✅ CV saved successfully!");
      setEditMode("preview");
    } catch (error) {
      alert("❌ Failed to save CV");
    } finally {
      setIsSaving(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;

    // Add name
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(cvData.personal_info.name || "Your Name", 20, yPos);
    yPos += 10;

    // Add title
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(cvData.personal_info.title || "Professional", 20, yPos);
    yPos += 15;

    // Add contact info
    doc.setFontSize(10);
    const contactInfo = [
      cvData.personal_info.contact.email,
      cvData.personal_info.contact.phone,
      cvData.personal_info.contact.location,
      cvData.personal_info.contact.linkedin,
    ]
      .filter(Boolean)
      .join(" | ");

    if (contactInfo) {
      doc.text(contactInfo, 20, yPos);
      yPos += 15;
    }

    // Add summary
    if (cvData.personal_info.summary) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("SUMMARY", 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const summaryLines = doc.splitTextToSize(
        cvData.personal_info.summary,
        170
      );
      doc.text(summaryLines, 20, yPos);
      yPos += summaryLines.length * 5 + 10;
    }

    // Add skills
    if (cvData.skills.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("SKILLS", 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(cvData.skills.join(", "), 20, yPos);
      yPos += 15;
    }

    // Add work experience
    if (cvData.work_experience.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("WORK EXPERIENCE", 20, yPos);
      yPos += 10;

      cvData.work_experience.forEach((work) => {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(work.role, 20, yPos);
        yPos += 6;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`${work.company} | ${work.dates}`, 20, yPos);
        yPos += 6;

        work.description.forEach((desc) => {
          const bulletLines = doc.splitTextToSize(`• ${desc}`, 170);
          doc.text(bulletLines, 25, yPos);
          yPos += bulletLines.length * 5 + 2;
        });

        yPos += 5;
      });
    }

    // Add education
    if (cvData.education.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("EDUCATION", 20, yPos);
      yPos += 10;

      cvData.education.forEach((edu) => {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(edu.degree, 20, yPos);
        yPos += 6;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`${edu.university} | ${edu.year}`, 20, yPos);
        if (edu.gpa) {
          yPos += 6;
          doc.text(`GPA: ${edu.gpa}`, 20, yPos);
        }
        yPos += 10;
      });
    }

    // Add certifications
    if (cvData.certifications.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("CERTIFICATIONS", 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      cvData.certifications.forEach((cert) => {
        doc.text(`• ${cert}`, 25, yPos);
        yPos += 7;
      });
    }

    // Save PDF
    doc.save(`${cvData.personal_info.name.replace(/\s+/g, "-")}-CV.pdf`);
    alert("✅ PDF exported successfully!");
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setCvData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    setCvData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setCvData((prev) => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()],
      }));
      setNewCertification("");
    }
  };

  const removeCertification = (index: number) => {
    setCvData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const addEducation = () => {
    setCvData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: `edu-${Date.now()}`,
          year: "",
          degree: "",
          location: "",
          university: "",
        },
      ],
    }));
  };

  const updateEducation = (
    id: string,
    field: keyof EducationItem,
    value: string
  ) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const removeEducation = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const addWorkExperience = () => {
    setCvData((prev) => ({
      ...prev,
      work_experience: [
        ...prev.work_experience,
        {
          id: `work-${Date.now()}`,
          role: "",
          dates: "",
          company: "",
          location: "",
          description: [""],
        },
      ],
    }));
  };

  const updateWorkExperience = (
    id: string,
    field: keyof WorkExperienceItem,
    value: any
  ) => {
    setCvData((prev) => ({
      ...prev,
      work_experience: prev.work_experience.map((work) =>
        work.id === id ? { ...work, [field]: value } : work
      ),
    }));
  };

  const addWorkDescription = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      work_experience: prev.work_experience.map((work) =>
        work.id === id
          ? { ...work, description: [...work.description, ""] }
          : work
      ),
    }));
  };

  const updateWorkDescription = (
    workId: string,
    index: number,
    value: string
  ) => {
    setCvData((prev) => ({
      ...prev,
      work_experience: prev.work_experience.map((work) =>
        work.id === workId
          ? {
              ...work,
              description: work.description.map((desc, i) =>
                i === index ? value : desc
              ),
            }
          : work
      ),
    }));
  };

  const removeWorkDescription = (workId: string, index: number) => {
    setCvData((prev) => ({
      ...prev,
      work_experience: prev.work_experience.map((work) =>
        work.id === workId
          ? {
              ...work,
              description: work.description.filter((_, i) => i !== index),
            }
          : work
      ),
    }));
  };

  const removeWorkExperience = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      work_experience: prev.work_experience.filter((work) => work.id !== id),
    }));
  };

  // Function to convert CV data back to text format for reanalysis
  const convertCVDataToText = () => {
    let text = "";

    // Personal Info
    text += `Name: ${cvData.personal_info.name}\n`;
    text += `Title: ${cvData.personal_info.title}\n`;
    text += `Email: ${cvData.personal_info.contact.email}\n`;
    text += `Phone: ${cvData.personal_info.contact.phone}\n`;
    text += `Location: ${cvData.personal_info.contact.location}\n`;
    text += `LinkedIn: ${cvData.personal_info.contact.linkedin}\n\n`;

    // Summary
    if (cvData.personal_info.summary) {
      text += `Professional Summary:\n${cvData.personal_info.summary}\n\n`;
    }

    // Skills
    if (cvData.skills.length > 0) {
      text += `Skills:\n${cvData.skills.join(", ")}\n\n`;
    }

    // Work Experience
    if (cvData.work_experience.length > 0) {
      text += `Work Experience:\n`;
      cvData.work_experience.forEach((work) => {
        text += `${work.role} at ${work.company} (${work.dates})\n`;
        text += `Location: ${work.location}\n`;
        work.description.forEach((desc) => {
          text += `• ${desc}\n`;
        });
        text += "\n";
      });
    }

    // Education
    if (cvData.education.length > 0) {
      text += `Education:\n`;
      cvData.education.forEach((edu) => {
        text += `${edu.degree} at ${edu.university} (${edu.year})\n`;
        if (edu.location) text += `Location: ${edu.location}\n`;
        if (edu.gpa) text += `GPA: ${edu.gpa}\n`;
        text += "\n";
      });
    }

    // Certifications
    if (cvData.certifications.length > 0) {
      text += `Certifications:\n`;
      cvData.certifications.forEach((cert) => {
        text += `• ${cert}\n`;
      });
    }

    return text;
  };

  // Function to reanalyze the edited CV
  const handleReanalyzeCV = async () => {
    setIsReanalyzing(true);
    setReanalyzeProgress(0);

    try {
      // Convert CV data to text format
      const cvText = convertCVDataToText();

      // Simulate progress animation
      const progressInterval = setInterval(() => {
        setReanalyzeProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      // Save the edited CV text to localStorage
      localStorage.setItem("cv_paragraph", cvText);
      localStorage.setItem("editedCV", JSON.stringify(cvData));

      // Send to AI analysis API
      const { data } = await axios.post(
        "http://localhost:3000/api/v1/analyze",
        {
          parsedCv: cvText,
        }
      );

      clearInterval(progressInterval);
      setReanalyzeProgress(100);

      // Save new analysis results
      localStorage.setItem("analysis", JSON.stringify(data.extract));

      // Show success message and redirect after a delay
      setTimeout(() => {
        alert(
          "✅ CV reanalyzed successfully! New insights have been generated."
        );
        window.location.href = "/Analysis-Result";
      }, 500);
    } catch (error: any) {
      alert(
        `❌ Failed to reanalyze CV: ${
          error.response?.data?.error || error.message
        }`
      );
      setReanalyzeProgress(0);
    } finally {
      setIsReanalyzing(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading CV data...</p>
        </div>
      </div>
    );
  }

  // No data found
  if (!cvData.personal_info.name) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="shadow-2xl border-0">
            <CardContent className="p-6 md:p-12">
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-6 md:mb-8">
                <FileText className="w-12 h-12 md:w-20 md:h-20 text-blue-600" />
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                No CV Data Found
              </h1>

              <p className="text-gray-600 text-base md:text-lg mb-6 md:mb-8 max-w-xl mx-auto px-4">
                You need to upload and analyze your CV first to use the preview
                and editor.
              </p>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 md:p-6 rounded-xl">
                  <h3 className="font-bold text-lg md:text-xl text-blue-800 mb-3">
                    How to get started:
                  </h3>
                  <ul className="space-y-3 text-left max-w-md mx-auto">
                    <li className="flex items-center gap-3 text-sm md:text-base">
                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                        1
                      </span>
                      <span>Go to the Dashboard</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm md:text-base">
                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                        2
                      </span>
                      <span>Upload your CV/Resume</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm md:text-base">
                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                        3
                      </span>
                      <span>Get AI analysis</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm md:text-base">
                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                        4
                      </span>
                      <span>Come back here to preview and edit</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <a href="/dashboard">
                    <Button className="gap-3 px-6 py-4 md:px-8 md:py-6 text-base md:text-lg h-auto bg-[#0118D8] text-white hover:bg-[#1B4CFF] cursor-pointer w-full md:w-auto">
                      <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                      Go to Dashboard to Upload CV
                    </Button>
                  </a>

                  <p className="text-gray-500 text-xs md:text-sm">
                    Already uploaded? Check if the analysis was completed
                    successfully.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Preview Component
  const PreviewView = () => (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-2xl border-0">
        <CardContent className="p-4 md:p-8">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 break-words">
              {cvData.personal_info.name || "Your Name"}
            </h1>
            <p className="text-base md:text-lg text-blue-600 mt-2 break-words">
              {cvData.personal_info.title || "Professional"}
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-2 md:gap-4 mt-3 md:mt-4 text-gray-600 text-sm md:text-base">
              {cvData.personal_info.contact.email && (
                <div className="flex items-center justify-center gap-1">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="break-words text-center sm:text-left">
                    {cvData.personal_info.contact.email}
                  </span>
                </div>
              )}
              {cvData.personal_info.contact.phone && (
                <div className="flex items-center justify-center gap-1">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span className="break-words">
                    {cvData.personal_info.contact.phone}
                  </span>
                </div>
              )}
              {cvData.personal_info.contact.location && (
                <div className="flex items-center justify-center gap-1">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="break-words">
                    {cvData.personal_info.contact.location}
                  </span>
                </div>
              )}
              {cvData.personal_info.contact.linkedin && (
                <div className="flex items-center justify-center gap-1">
                  <Globe className="w-4 h-4 flex-shrink-0" />
                  <span className="break-words">
                    {cvData.personal_info.contact.linkedin}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          {cvData.personal_info.summary && (
            <div className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 border-b pb-2 mb-3 md:mb-4 flex items-center gap-2">
                <User className="w-4 h-4 md:w-5 md:h-5" />
                Summary
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                {cvData.personal_info.summary}
              </p>
            </div>
          )}

          {/* Skills */}
          {cvData.skills.length > 0 && (
            <div className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 border-b pb-2 mb-3 md:mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 md:w-5 md:h-5" />
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {cvData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 md:px-3 md:py-1 bg-blue-100 text-blue-800 rounded-full text-xs md:text-sm break-words"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {cvData.work_experience.length > 0 && (
            <div className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 border-b pb-2 mb-3 md:mb-4 flex items-center gap-2">
                <Building className="w-4 h-4 md:w-5 md:h-5" />
                Work Experience
              </h2>
              <div className="space-y-4 md:space-y-6">
                {cvData.work_experience.map((work) => (
                  <div
                    key={work.id}
                    className="border-l-2 md:border-l-4 border-blue-500 pl-3 md:pl-4"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-base md:text-lg break-words">
                          {work.role}
                        </h3>
                        <p className="text-blue-600 font-medium text-sm md:text-base break-words">
                          {work.company}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-gray-600 text-sm md:text-base">
                          {work.dates}
                        </p>
                        <p className="text-gray-500 text-xs md:text-sm">
                          {work.location}
                        </p>
                      </div>
                    </div>
                    <ul className="mt-2 md:mt-3 space-y-1">
                      {work.description.map((desc, idx) => (
                        <li
                          key={idx}
                          className="text-gray-700 flex items-start gap-2 text-sm md:text-base"
                        >
                          <span className="text-blue-500 mt-1 md:mt-1.5 flex-shrink-0">
                            •
                          </span>
                          <span className="break-words">{desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {cvData.education.length > 0 && (
            <div className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 border-b pb-2 mb-3 md:mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 md:w-5 md:h-5" />
                Education
              </h2>
              <div className="space-y-3 md:space-y-4">
                {cvData.education.map((edu) => (
                  <div
                    key={edu.id}
                    className="flex flex-col md:flex-row md:justify-between md:items-start gap-2"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-base md:text-lg break-words">
                        {edu.degree}
                      </h3>
                      <p className="text-gray-600 text-sm md:text-base break-words">
                        {edu.university}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-gray-600 text-sm md:text-base">
                        {edu.year}
                      </p>
                      <p className="text-gray-500 text-xs md:text-sm">
                        {edu.location}
                      </p>
                      {edu.gpa && (
                        <p className="text-gray-500 text-xs md:text-sm">
                          GPA: {edu.gpa}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {cvData.certifications.length > 0 && (
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-800 border-b pb-2 mb-3 md:mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 md:w-5 md:h-5" />
                Certifications
              </h2>
              <ul className="space-y-2">
                {cvData.certifications.map((cert, index) => (
                  <li
                    key={index}
                    className="text-gray-700 flex items-center gap-2 text-sm md:text-base"
                  >
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="break-words">{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Edit Component
  const EditView = () => (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <User className="w-4 h-4 md:w-5 md:h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                Full Name *
              </label>
              <Input
                value={cvData.personal_info.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCvData((prev) => ({
                    ...prev,
                    personal_info: {
                      ...prev.personal_info,
                      name: e.target.value,
                    },
                  }))
                }
                placeholder="John Doe"
                className="text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                Professional Title
              </label>
              <Input
                value={cvData.personal_info.title}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCvData((prev) => ({
                    ...prev,
                    personal_info: {
                      ...prev.personal_info,
                      title: e.target.value,
                    },
                  }))
                }
                placeholder="Software Engineer"
                className="text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                Email *
              </label>
              <Input
                value={cvData.personal_info.contact.email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCvData((prev) => ({
                    ...prev,
                    personal_info: {
                      ...prev.personal_info,
                      contact: {
                        ...prev.personal_info.contact,
                        email: e.target.value,
                      },
                    },
                  }))
                }
                placeholder="john@example.com"
                type="email"
                className="text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                Phone
              </label>
              <Input
                value={cvData.personal_info.contact.phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCvData((prev) => ({
                    ...prev,
                    personal_info: {
                      ...prev.personal_info,
                      contact: {
                        ...prev.personal_info.contact,
                        phone: e.target.value,
                      },
                    },
                  }))
                }
                placeholder="+1 (123) 456-7890"
                className="text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                Location
              </label>
              <Input
                value={cvData.personal_info.contact.location}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCvData((prev) => ({
                    ...prev,
                    personal_info: {
                      ...prev.personal_info,
                      contact: {
                        ...prev.personal_info.contact,
                        location: e.target.value,
                      },
                    },
                  }))
                }
                placeholder="San Francisco, CA"
                className="text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                LinkedIn Profile
              </label>
              <Input
                value={cvData.personal_info.contact.linkedin}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCvData((prev) => ({
                    ...prev,
                    personal_info: {
                      ...prev.personal_info,
                      contact: {
                        ...prev.personal_info.contact,
                        linkedin: e.target.value,
                      },
                    },
                  }))
                }
                placeholder="linkedin.com/in/username"
                className="text-sm md:text-base"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
              Professional Summary
            </label>
            <textarea
              value={cvData.personal_info.summary}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setCvData((prev) => ({
                  ...prev,
                  personal_info: {
                    ...prev.personal_info,
                    summary: e.target.value,
                  },
                }))
              }
              placeholder="Experienced professional with expertise in..."
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Award className="w-4 h-4 md:w-5 md:h-5" />
            Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={newSkill}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewSkill(e.target.value)
              }
              placeholder="Add a skill"
              onKeyPress={(e: KeyboardEvent<HTMLInputElement>) =>
                e.key === "Enter" && addSkill()
              }
              className="flex-1 text-sm md:text-base"
            />
            <Button onClick={addSkill} className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
              <span className="sm:hidden">Add Skill</span>
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {cvData.skills.map((skill, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg max-w-full"
              >
                <span className="text-sm md:text-base break-words max-w-[200px] sm:max-w-none">
                  {skill}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSkill(index)}
                  className="h-6 w-6 p-0 flex-shrink-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Work Experience */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Building className="w-4 h-4 md:w-5 md:h-5" />
              Work Experience
            </CardTitle>
            <Button
              onClick={addWorkExperience}
              className="gap-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Add Experience
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {cvData.work_experience.map((work) => (
            <Card key={work.id} className="border">
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                          Job Title *
                        </label>
                        <Input
                          value={work.role}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            updateWorkExperience(
                              work.id,
                              "role",
                              e.target.value
                            )
                          }
                          placeholder="Senior Software Engineer"
                          className="text-sm md:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                          Company *
                        </label>
                        <Input
                          value={work.company}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            updateWorkExperience(
                              work.id,
                              "company",
                              e.target.value
                            )
                          }
                          placeholder="Tech Company Inc."
                          className="text-sm md:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                          Dates *
                        </label>
                        <Input
                          value={work.dates}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            updateWorkExperience(
                              work.id,
                              "dates",
                              e.target.value
                            )
                          }
                          placeholder="Jan 2020 - Present"
                          className="text-sm md:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                          Location
                        </label>
                        <Input
                          value={work.location}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            updateWorkExperience(
                              work.id,
                              "location",
                              e.target.value
                            )
                          }
                          placeholder="Remote"
                          className="text-sm md:text-base"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Responsibilities
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addWorkDescription(work.id)}
                          className="gap-1 w-full sm:w-auto"
                        >
                          <Plus className="w-3 h-3" />
                          Add Point
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {work.description.map((desc, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <textarea
                              value={desc}
                              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                                updateWorkDescription(
                                  work.id,
                                  idx,
                                  e.target.value
                                )
                              }
                              placeholder="Describe your responsibilities and achievements..."
                              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                              rows={2}
                            />
                            {work.description.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeWorkDescription(work.id, idx)
                                }
                                className="mt-2 flex-shrink-0"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeWorkExperience(work.id)}
                    className="self-end md:self-start md:ml-4"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <GraduationCap className="w-4 h-4 md:w-5 md:h-5" />
              Education
            </CardTitle>
            <Button onClick={addEducation} className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Add Education
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {cvData.education.map((edu) => (
            <Card key={edu.id} className="border">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 flex-1">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Degree *
                      </label>
                      <Input
                        value={edu.degree}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateEducation(edu.id, "degree", e.target.value)
                        }
                        placeholder="Bachelor of Science in Computer Science"
                        className="text-sm md:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        University *
                      </label>
                      <Input
                        value={edu.university}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateEducation(edu.id, "university", e.target.value)
                        }
                        placeholder="University of Technology"
                        className="text-sm md:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Year *
                      </label>
                      <Input
                        value={edu.year}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateEducation(edu.id, "year", e.target.value)
                        }
                        placeholder="2016 - 2020"
                        className="text-sm md:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Location
                      </label>
                      <Input
                        value={edu.location}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateEducation(edu.id, "location", e.target.value)
                        }
                        placeholder="New York, NY"
                        className="text-sm md:text-base"
                      />
                    </div>
                    <div className="sm:col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        GPA
                      </label>
                      <Input
                        value={edu.gpa || ""}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateEducation(edu.id, "gpa", e.target.value)
                        }
                        placeholder="3.8/4.0"
                        className="text-sm md:text-base"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(edu.id)}
                    className="self-end md:self-start md:ml-4"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <FileText className="w-4 h-4 md:w-5 md:h-5" />
            Certifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={newCertification}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewCertification(e.target.value)
              }
              placeholder="Add a certification"
              onKeyPress={(e: KeyboardEvent<HTMLInputElement>) =>
                e.key === "Enter" && addCertification()
              }
              className="flex-1 text-sm md:text-base"
            />
            <Button
              onClick={addCertification}
              className="gap-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
              <span className="sm:hidden">Add Certification</span>
            </Button>
          </div>
          <div className="space-y-3">
            {cvData.certifications.map((cert, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 md:p-4 bg-green-50 rounded-lg border border-green-100"
              >
                <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm md:text-base break-words">
                    {cert}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCertification(index)}
                  className="h-8 w-8 p-0 flex-shrink-0 ml-2"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-3 md:p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0118D8]">
              CV Editor & Preview
            </h1>
            <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">
              Edit your CV and see real-time preview
            </p>
            {cvData.personal_info.name && (
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                Currently editing:{" "}
                <span className="font-semibold break-words">
                  {cvData.personal_info.name}
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {/* Mode Toggle */}
            <div className="flex items-center bg-white rounded-lg border p-1 self-start">
              <Button
                variant={editMode === "preview" ? "default" : "ghost"}
                size="sm"
                onClick={() => setEditMode("preview")}
                className={`gap-2 text-xs md:text-sm ${
                  editMode === "preview" ? "bg-blue-100 text-blue-700" : ""
                }`}
              >
                <Eye className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden xs:inline">Preview</span>
                <span className="xs:hidden">View</span>
              </Button>
              <Button
                variant={editMode === "edit" ? "default" : "ghost"}
                size="sm"
                onClick={() => setEditMode("edit")}
                className={`gap-2 text-xs md:text-sm ${
                  editMode === "edit" ? "bg-blue-100 text-blue-700" : ""
                }`}
              >
                <Edit className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden xs:inline">Edit</span>
                <span className="xs:hidden">Edit</span>
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2 bg-green-600 hover:bg-green-700 text-xs md:text-sm flex-1 sm:flex-none"
                size="sm"
              >
                <Save className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">
                  {isSaving ? "Saving..." : "Save Changes"}
                </span>
                <span className="sm:hidden">
                  {isSaving ? "Saving..." : "Save"}
                </span>
              </Button>

              {/* Reanalyze Button - Only shown in preview mode */}
              {editMode === "preview" && (
                <Button
                  onClick={handleReanalyzeCV}
                  disabled={isReanalyzing}
                  className="gap-2 bg-purple-600 hover:bg-purple-700 text-xs md:text-sm flex-1 sm:flex-none"
                  size="sm"
                >
                  {isReanalyzing ? (
                    <>
                      <RefreshCw className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                      <span className="hidden sm:inline">
                        Reanalyzing... {reanalyzeProgress}%
                      </span>
                      <span className="sm:hidden">{reanalyzeProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Target className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Reanalyze CV</span>
                      <span className="sm:hidden">Reanalyze</span>
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={exportToPDF}
                variant="outline"
                className="gap-2 text-xs md:text-sm flex-1 sm:flex-none"
                size="sm"
              >
                <Download className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Export PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>

              <Button
                onClick={() => window.print()}
                variant="outline"
                className="gap-2 text-xs md:text-sm flex-1 sm:flex-none"
                size="sm"
              >
                <Printer className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Print</span>
                <span className="sm:hidden">Print</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6 md:mb-8">
          {editMode === "preview" ? <PreviewView /> : <EditView />}
        </div>

        {/* Tips with Reanalyze Explanation */}
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              <h3 className="font-bold text-base md:text-lg text-blue-800">
                Tips for a Great CV
              </h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-3 md:space-y-4">
                <div className="p-3 md:p-4 bg-white/50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 text-sm md:text-base mb-1 md:mb-2">
                    Use Action Verbs
                  </h4>
                  <p className="text-xs md:text-sm text-gray-600">
                    Start bullet points with strong verbs like "Developed",
                    "Managed", "Increased"
                  </p>
                </div>
                <div className="p-3 md:p-4 bg-white/50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 text-sm md:text-base mb-1 md:mb-2">
                    Quantify Results
                  </h4>
                  <p className="text-xs md:text-sm text-gray-600">
                    Include numbers and metrics to show your impact and
                    achievements
                  </p>
                </div>
                <div className="p-3 md:p-4 bg-white/50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 text-sm md:text-base mb-1 md:mb-2">
                    Tailor for Jobs
                  </h4>
                  <p className="text-xs md:text-sm text-gray-600">
                    Customize your CV for each job application by highlighting
                    relevant experience
                  </p>
                </div>
              </div>

              {/* Reanalyze Info Section */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-6 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                  <Target className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                  <h4 className="font-bold text-base md:text-lg text-purple-800">
                    Get AI Feedback on Your Edits
                  </h4>
                </div>
                <p className="text-gray-700 text-sm md:text-base mb-3 md:mb-4">
                  After making changes to your CV, click "Reanalyze CV with AI"
                  to get:
                </p>
                <ul className="space-y-2 md:space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm md:text-base">
                      Updated score and recommendations
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm md:text-base">
                      Analysis of your new improvements
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm md:text-base">
                      Suggestions for further optimization
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm md:text-base">
                      Track your CV's improvement over time
                    </span>
                  </li>
                </ul>
                <div className="mt-4 md:mt-6 p-3 md:p-4 bg-white/70 rounded-lg border">
                  <div className="flex items-center gap-2 md:gap-3">
                    <RefreshCw className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm md:text-base">
                        How it works:
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        1. Edit your CV → 2. Save changes → 3. Click "Reanalyze"
                        → 4. Get new AI feedback
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
