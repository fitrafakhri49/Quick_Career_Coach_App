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
} from "lucide-react";

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedCV, setParsedCV] = useState<string>("");
  const [readyToSubmit, setReadyToSubmit] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setParsedCV("");
      setReadyToSubmit(false);
      // Simulate file processing animation
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

      // Add a small delay for smooth transition
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
    <div className="flex flex-col items-center gap-4 p-8">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <Sparkles
          className="absolute -top-2 -right-2 text-yellow-500 animate-pulse"
          size={20}
        />
      </div>
      <div className="text-center">
        <p className="text-blue-700 font-semibold text-lg mb-2">
          AI is analyzing your CV...
        </p>
        <p className="text-gray-500 text-sm">
          Extracting insights and generating feedback
        </p>
        <div className="w-48 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-linear-to-br from-blue-500 to-purple-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 flex flex-col items-center p-6">
        <header className="w-full max-w-6xl mb-12">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold text-[#0118D8] ">
                  CoachAhead
                </h1>
                <p className="text-gray-600">
                  Your intelligent career companion
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700">
                Secure & Private
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="w-full max-w-6xl grid lg:grid-cols-3 gap-8">
          {/* Left Side - Upload Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-br from-blue-500 to-purple-500"></div>
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-8 h-8 text-blue-600" />
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    Upload Your CV
                  </CardTitle>
                </div>
                <CardDescription className="text-lg text-gray-600">
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
                      flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 cursor-pointer 
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
                      className={`p-4 rounded-full mb-4 ${
                        isDragging ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      <Upload
                        className={`w-8 h-8 ${
                          isDragging ? "text-blue-600" : "text-gray-400"
                        }`}
                      />
                    </div>
                    {file ? (
                      <>
                        <FileText className="w-12 h-12 text-green-500 mb-3" />
                        <p className="text-gray-700 font-medium">{file.name}</p>
                        <p className="text-gray-500 text-sm mt-1">
                          Ready for analysis
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-600 text-lg font-medium mb-2">
                          {isDragging
                            ? "Drop your CV here"
                            : "Drag & drop your CV"}
                        </p>
                        <p className="text-gray-400">or click to browse</p>
                      </>
                    )}
                    <div className="mt-4 flex gap-2">
                      {["PDF", "DOC", "DOCX"].map((format) => (
                        <span
                          key={format}
                          className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-600 border"
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
                    className="w-full py-6 text-lg font-semibold bg-linear-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl"
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
                        Analyzing... {progress}%
                      </div>
                    ) : parsedCV ? (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Upload Another CV
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Upload Your CV
                      </>
                    )}
                  </Button>
                </form>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 flex items-center gap-2">
                      <span className="font-semibold">Error:</span> {error}
                    </p>
                  </div>
                )}

                {/* Preview Section */}
                {parsedCV && (
                  <div className="mt-6 p-6 bg-linear-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-inner">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h2 className="text-xl font-bold text-gray-800">
                        CV Preview
                      </h2>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-4 bg-white rounded-xl border">
                      <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {parsedCV.substring(0, 500)}...
                      </p>
                    </div>

                    {loading ? (
                      <Loader />
                    ) : (
                      readyToSubmit && (
                        <Button
                          className="mt-6 w-full py-6 text-lg font-semibold bg-linear-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          onClick={handleSubmitFinal}
                        >
                          <Target className="w-5 h-5 mr-2" />
                          Preview Your Cv
                        </Button>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Features & Stats */}
          <div className="space-y-6">
            {/* Features */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Why Choose CoachAhead?
                </h3>
                <div className="space-y-4">
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
                      className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <feature.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-gray-600">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="border-0 shadow-lg bg-linear-to-br from-amber-50 to-orange-50">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  Pro Tips
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                    <span className="text-gray-700">
                      Include quantifiable achievements
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                    <span className="text-gray-700">
                      Use industry-specific keywords
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                    <span className="text-gray-700">
                      Keep your CV to 1-2 pages
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                    <span className="text-gray-700">
                      Highlight recent and relevant experience
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Features */}
        <section className="w-full max-w-6xl mt-12">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Transform Your Career Journey
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
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
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-xl bg-linear-to-br ${feature.gradient} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800 mb-2">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {feature.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer Note */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>
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
      `}</style>
    </div>
  );
}
