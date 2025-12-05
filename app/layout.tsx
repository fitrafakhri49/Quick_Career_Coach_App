"use client";

import { useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "../components/navbar"; // pastikan path sesuai

import { usePathname } from "next/navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] = useState<string | null>(null);
  const pathname = usePathname();

  const showNavbar = pathname !== "/";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased  ${
          showNavbar ? "pt-[80px]" : ""
        }`}
      >
        {showNavbar && <Navbar />}
        {children}
      </body>
    </html>
  );
}
