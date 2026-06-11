import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Import KendoReact Premium Dark Theme CSS
import "@progress/kendo-theme-default/dist/default-main-dark.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Synapse — AI Conference Intelligence Platform",
  description:
    "Discover hidden connections between conference talks with AI-powered semantic analysis. Build personalized schedules, explore knowledge graphs, and generate intelligent briefings.",
  keywords: [
    "conference",
    "AI",
    "knowledge graph",
    "GitNation",
    "hackathon",
    "KendoReact",
  ],
  openGraph: {
    title: "Synapse — AI Conference Intelligence",
    description:
      "The hidden connections between conference talks, found. Powered by Gemini AI & Neon PostgreSQL.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#09090b] text-white">
        {/* Subtle background grid pattern */}
        <div className="fixed inset-0 bg-dot-pattern pointer-events-none opacity-50 z-0" />
        {/* Content layer */}
        <div className="relative z-10 flex flex-col min-h-full">
          {children}
        </div>
      </body>
    </html>
  );
}
