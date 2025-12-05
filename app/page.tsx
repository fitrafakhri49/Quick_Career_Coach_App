import Link from "next/link";
import { ArrowRight, Users, Target, Zap } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description:
        "Get instant, intelligent feedback on your CV and skills using cutting-edge AI technology.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Mock Interviews",
      description:
        "Practice with realistic interview simulations and receive detailed feedback.",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Skill Gap Analysis",
      description:
        "Identify missing skills and get personalized learning recommendations.",
    },
  ];

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#FFF8F8" }}>
      {/* Hero Section */}
      <section
        className="relative text-center py-24 px-4 text-white overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0118D8 0%, #1B56FD 50%, #4A7CFF 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-white rounded-full"></div>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Advance Your Career with{" "}
            <span className="text-white bg-clip-text text-transparent">
              CoachAhead
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed">
            Get personalized career guidance and build your professional path
            with AI-powered insights and real-time feedback.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <button className="group flex items-center gap-3 text-xl px-12 py-5 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-2xl cursor-pointer">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: "#0118D8" }}
          >
            Why Choose CoachAhead?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We combine artificial intelligence with human expertise to provide
            comprehensive career development.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white hover:-translate-y-2"
            >
              <div
                className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors"
                style={{ color: "#0118D8" }}
              >
                {feature.icon}
              </div>
              <h3
                className="font-bold text-2xl mb-4"
                style={{ color: "#0118D8" }}
              >
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20  from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2
            className="text-4xl font-bold text-center mb-16"
            style={{ color: "#0118D8" }}
          >
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="relative text-center">
              <div className="w-20 h-20 rounded-full bg-blue-600 text-white text-3xl font-bold flex items-center justify-center mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4">Upload & Analyze</h3>
              <p className="text-gray-600">
                Upload your Professional CV. Our AI analyzes your experience,
                skills, and career goals.
              </p>
            </div>
            <div className="relative text-center">
              <div className="w-20 h-20 rounded-full bg-blue-600 text-white text-3xl font-bold flex items-center justify-center mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4">Practice Interview</h3>
              <p className="text-gray-600">
                Practice with realistic interview simulations and receive
                detailed feedback on your interview performance
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-20 h-20 rounded-full bg-blue-600 text-white text-3xl font-bold flex items-center justify-center mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4">Practice & Improve</h3>
              <p className="text-gray-600">
                Use our mock interviews and skill builders to practice and track
                your improvement over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer
        className="py-12 text-white"
        style={{ backgroundColor: "#0118D8" }}
      >
        <div className="max-w-6xl mx-auto px-4 justify-items-center">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">CoachAhead</h3>
              <p className="text-blue-200">
                AI-powered career development platform for professionals.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Product</h4>
              <ul className="space-y-2 text-blue-200">
                <li>
                  <Link href="/dashboard" className="hover:text-white">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/Interview" className="hover:text-white">
                    Interview Practice
                  </Link>
                </li>
                <li>
                  <Link href="/SkillAnalysis" className="hover:text-white">
                    Skill Analysis
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-500 pt-8 text-center text-blue-200">
            &copy; {new Date().getFullYear()} CoachAhead. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
