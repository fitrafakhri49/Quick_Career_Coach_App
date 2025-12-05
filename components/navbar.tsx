"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Analysis CV", href: "/Analysis-Result" },
    { name: "Interview", href: "/Interview" },
    { name: "Skill Analysis", href: "/SkillAnalysis" },
  ];

  const handleResetLocalStorage = () => {
    localStorage.removeItem("analysis");
    localStorage.removeItem("cv_paragraph");
  };

  return (
    <nav className="w-full bg-gradient-to-r from-blue-600 to-blue-800 py-4 fixed z-50 top-0 left-0 shadow-xl">
      <div className="max-w-5xl mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-xl font-bold text-blue-600">CA</span>
          </div>
          <Link href="/" onClick={handleResetLocalStorage}>
            <h1 className="text-2xl font-bold text-white">CoachAhead</h1>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link key={link.name} href={link.href}>
                <Button
                  className={`transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-white text-blue-700 shadow-lg"
                      : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                  }`}
                >
                  {link.name}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
