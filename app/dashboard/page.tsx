"use client";
import { useState, useEffect, useRef } from "react";
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
  Upload,
  FileText,
  Zap,
  Target,
  Sparkles,
  Brain,
  TrendingUp,
  Shield,
  Menu,
  X,
} from "lucide-react";

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedCV, setParsedCV] = useState<string>("");
  const [readyToSubmit, setReadyToSubmit] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setParsedCV("");
      setReadyToSubmit(false);
      simulateProgress();
    }
  };

  const simulateProgress = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
      }
    }, 50);
  };

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setError("Please select a file.");

    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("cv", file);

    try {
      const { data } = await axios.post(
        "http://localhost:3000/api/v1/parse",
        formData
      );

      setParsedCV(data.cleanText);
      localStorage.setItem("cv_paragraph", data.cleanText);
      setReadyToSubmit(true);
      setError(null);

      // Success animation
      setProgress(100);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error parsing CV");
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFinal = async () => {
    const cvText = localStorage.getItem("cv_paragraph");
    if (!cvText) {
      setError("CV text not found. Please upload your CV again.");
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      const { data } = await axios.post(
        "http://localhost:3000/api/v1/analyze",
        {
          parsedCv: cvText,
        }
      );

      localStorage.setItem("analysis", JSON.stringify(data.extract));

      setTimeout(() => {
        window.location.href = "/PreviewCv";
      }, 500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error analyzing CV");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedCV = localStorage.getItem("cv_paragraph");
    if (savedCV) {
      setParsedCV(savedCV);
      setReadyToSubmit(true);
    }
  }, []);

  const Loader = () => (
    <div className="flex flex-col items-center gap-4 p-4 sm:p-8">
      <div className="relative">
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <Sparkles
          className="absolute -top-2 -right-2 text-yellow-500 animate-pulse"
          size={16}
        />
      </div>
      <div className="text-center">
        <p className="text-blue-700 font-semibold text-base sm:text-lg mb-2">
          AI is analyzing your CV...
        </p>
        <p className="text-gray-500 text-xs sm:text-sm">
          Extracting insights and generating feedback
        </p>
        <div className="w-32 sm:w-48 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-br from-blue-500 to-purple-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decorative elements - Reduced on mobile */}
      <div className="hidden sm:block absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="hidden sm:block absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="hidden sm:block absolute -bottom-8 left-20 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 flex flex-col items-center p-4 sm:p-6">
        <header className="w-full max-w-6xl mb-8 sm:mb-12">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0118D8]">
                  CoachAhead
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Your intelligent career companion
                </p>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="sm:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700">
                Secure & Private
              </span>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="sm:hidden mt-4 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full border border-gray-200 mb-4">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">
                  Secure & Private
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 px-2">
                  Upload your CV to get started
                </p>
                <p className="text-xs text-gray-500 px-2">
                  Supported: PDF, DOC, DOCX
                </p>
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <div className="w-full max-w-6xl grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Side - Upload Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl sm:shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-br from-blue-500 to-purple-500"></div>
              <CardHeader className="pb-4 sm:pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
                    Upload Your CV
                  </CardTitle>
                </div>
                <CardDescription className="text-sm sm:text-lg text-gray-600">
                  Get personalized AI feedback to elevate your career journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Area */}
                <form
                  onSubmit={handlePreview}
                  className="space-y-4"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (
                      e.dataTransfer.files &&
                      e.dataTransfer.files.length > 0
                    ) {
                      setFile(e.dataTransfer.files[0]);
                      setError(null);
                      setParsedCV("");
                      setReadyToSubmit(false);
                      simulateProgress();
                    }
                  }}
                >
                  <div
                    className={`
                      flex flex-col items-center justify-center border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-12 cursor-pointer 
                      transition-all duration-300 ${
                        isDragging
                          ? "border-blue-500 bg-blue-50 scale-[1.02] shadow-lg"
                          : file
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div
                      className={`p-3 sm:p-4 rounded-full mb-3 sm:mb-4 ${
                        isDragging ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      <Upload
                        className={`w-6 h-6 sm:w-8 sm:h-8 ${
                          isDragging ? "text-blue-600" : "text-gray-400"
                        }`}
                      />
                    </div>
                    {file ? (
                      <>
                        <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-green-500 mb-2 sm:mb-3" />
                        <p className="text-gray-700 font-medium text-sm sm:text-base text-center">
                          {file.name.length > 30
                            ? `${file.name.substring(0, 30)}...`
                            : file.name}
                        </p>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1">
                          Ready for analysis
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-600 text-base sm:text-lg font-medium mb-2 text-center">
                          {isDragging
                            ? "Drop your CV here"
                            : "Drag & drop your CV"}
                        </p>
                        <p className="text-gray-400 text-sm sm:text-base">
                          or click to browse
                        </p>
                      </>
                    )}
                    <div className="mt-3 sm:mt-4 flex gap-2 flex-wrap justify-center">
                      {["PDF", "DOC", "DOCX"].map((format) => (
                        <span
                          key={format}
                          className="px-2 sm:px-3 py-1 bg-white rounded-full text-xs sm:text-sm font-medium text-gray-600 border"
                        >
                          {format}
                        </span>
                      ))}
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <Button
                    className="w-full py-4 sm:py-6 text-base sm:text-lg font-semibold bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl active:scale-95"
                    type={parsedCV ? "button" : "submit"}
                    disabled={loading}
                    onClick={(e) => {
                      if (parsedCV) {
                        e.preventDefault();
                        setFile(null);
                        setParsedCV("");
                        setReadyToSubmit(false);
                        localStorage.removeItem("cv_paragraph");
                        setProgress(0);
                      }
                    }}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">Analyzing...</span>{" "}
                        {progress}%
                      </div>
                    ) : parsedCV ? (
                      <>
                        <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        <span className="hidden sm:inline">
                          Upload Another CV
                        </span>
                        <span className="sm:hidden">Change CV</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Upload Your CV
                      </>
                    )}
                  </Button>
                </form>

                {error && (
                  <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl">
                    <p className="text-red-600 text-sm sm:text-base flex items-center gap-2">
                      <span className="font-semibold">Error:</span> {error}
                    </p>
                  </div>
                )}

                {/* Preview Section */}
                {parsedCV && (
                  <div className="mt-6 p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-inner">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                        CV Preview
                      </h2>
                    </div>
                    <div className="max-h-48 sm:max-h-64 overflow-y-auto p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border">
                      <p className="whitespace-pre-wrap text-gray-700 text-sm sm:text-base leading-relaxed">
                        {parsedCV.substring(
                          0,
                          window.innerWidth < 640 ? 300 : 500
                        )}
                        ...
                      </p>
                    </div>

                    {loading ? (
                      <Loader />
                    ) : (
                      readyToSubmit && (
                        <Button
                          className="mt-4 sm:mt-6 w-full py-4 sm:py-6 text-base sm:text-lg font-semibold bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          onClick={handleSubmitFinal}
                        >
                          <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          <span className="hidden sm:inline">
                            Preview Your CV
                          </span>
                          <span className="sm:hidden">Preview CV</span>
                        </Button>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Features & Stats */}
          <div className="space-y-4 sm:space-y-6">
            {/* Features */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
                  Why Choose CoachAhead?
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    {
                      icon: Brain,
                      title: "AI-Powered Analysis",
                      desc: "Deep learning algorithms extract key insights",
                    },
                    {
                      icon: Target,
                      title: "Personalized Feedback",
                      desc: "Tailored recommendations for your career path",
                    },
                    {
                      icon: Shield,
                      title: "Secure & Private",
                      desc: "Your data is encrypted and never shared",
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                          {feature.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 truncate-2-lines">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                  Pro Tips
                </h3>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm sm:text-base">
                      Include quantifiable achievements
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm sm:text-base">
                      Use industry-specific keywords
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm sm:text-base">
                      Keep your CV to 1-2 pages
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm sm:text-base">
                      Highlight recent and relevant experience
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Features */}
        <section className="w-full max-w-6xl mt-8 sm:mt-12">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6 sm:mb-8">
            Transform Your Career Journey
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                title: "Smart CV Analysis",
                icon: Brain,
                gradient: "from-blue-500 to-cyan-500",
                desc: "Get detailed insights on strengths & improvements",
              },
              {
                title: "Mock Interviews",
                icon: Target,
                gradient: "from-purple-500 to-pink-500",
                desc: "Practice with AI-generated interview questions",
              },
              {
                title: "Skill Gap Analysis",
                icon: TrendingUp,
                gradient: "from-green-500 to-emerald-500",
                desc: "Identify and bridge your skill gaps effectively",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-4 sm:p-6">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 sm:mb-4`}
                  >
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm sm:text-base">
                    {feature.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer Note */}
        <footer className="mt-8 sm:mt-12 text-center text-gray-500 text-xs sm:text-sm px-4">
          <p className="leading-relaxed">
            Supported formats: PDF, DOC, DOCX | Max file size: 5MB | Your data
            is processed securely
          </p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        /* Custom CSS for multi-line truncation */
        .truncate-2-lines {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Better touch targets on mobile */
        @media (max-width: 640px) {
          button,
          [role="button"],
          .cursor-pointer {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
    </div>
  );
}
