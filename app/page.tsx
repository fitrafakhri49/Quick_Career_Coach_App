import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <h1 className="text-5xl font-bold mb-4">
          Advance Your Career with CoachAhead
        </h1>
        <p className="text-xl mb-8">
          Get personalized career guidance and build your professional path with
          AI-powered insights.
        </p>
        <Link href="/dashboard">
          <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition">
            Get Started
          </button>
        </Link>
      </section>

      <section className="py-20 px-10 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">
          Why Choose Our Website ?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="font-semibold text-xl mb-2">Easy to Use</h3>
            <p>
              Analyze cv resume from with simple drag and drop interface. Each
              suggestions is with example
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="font-semibold text-xl mb-2">
              Free Practice Mock Interview
            </h3>
            <p>Including the feedback from the interview</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="font-semibold text-xl mb-2">Skill Gap Analysis</h3>
            <p>Get to know your skill to become a professional</p>
          </div>
        </div>
      </section>

      <footer className="py-10 bg-blue-600 text-white text-center">
        &copy; {new Date().getFullYear()} Resume.io Clone. All rights reserved.
      </footer>
    </main>
  );
}
