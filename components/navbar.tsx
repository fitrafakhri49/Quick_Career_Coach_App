"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Preview CV", href: "/PreviewCv" },
    { name: "Analysis CV", href: "/Analysis-Result" },
    { name: "Interview", href: "/interview" },
    { name: "Skill Analysis", href: "/SkillAnalysis" },
  ];

  const handleResetLocalStorage = () => {
    localStorage.removeItem("analysis");
    localStorage.removeItem("cv_paragraph");
    localStorage.removeItem("editedCV");
    localStorage.removeItem("skill_analysis");
    localStorage.removeItem("interview_feedback_data");
    localStorage.removeItem("recent_roles");
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="w-full bg-gradient-to-r from-blue-600 to-blue-800 py-3 md:py-4 fixed z-50 top-0 left-0 shadow-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-lg md:text-xl font-bold text-blue-600">
                CA
              </span>
            </div>
            <Link href="/" onClick={handleResetLocalStorage}>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                CoachAhead
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation Links - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link key={link.name} href={link.href}>
                  <Button
                    size="sm"
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>
      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />
      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-64 bg-gradient-to-b from-blue-600 to-blue-800 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600">CA</span>
              </div>
              <h2 className="text-xl font-bold text-white">Menu</h2>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div
                      className={`w-full px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-white text-blue-700 shadow-lg"
                          : "bg-white/20 text-white hover:bg-white/30"
                      }`}
                    >
                      <span className="font-medium">{link.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile Menu Footer */}
          <div className="p-4 border-t border-white/20">
            <Link href="/" onClick={handleResetLocalStorage}>
              <Button className="w-full bg-white text-blue-700 hover:bg-blue-50">
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
      {/* Spacer to prevent content from going under fixed navbar
      <div className="h-16 md:h-20" /> */}
    </>
  );
}
