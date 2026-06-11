"use client";

import Link from "next/link";
import { Network, Calendar, Sparkles, LayoutDashboard, ArrowRight, Brain } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/ui/Header";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 90,
        damping: 14,
      },
    },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans selection:bg-violet-500/30 selection:text-violet-200">
      <Header />

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

        <motion.div
          className="max-w-4xl text-center space-y-6 relative z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Subtle Tagline Badge */}
          <motion.div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/25"
            variants={itemVariants}
          >
            <Brain className="h-3.5 w-3.5 text-violet-400" />
            <span>AI Content Intelligence Platform</span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none"
            variants={itemVariants}
          >
            The Hidden Connections Between
            <span className="block mt-2 bg-gradient-to-r from-violet-400 via-indigo-200 to-cyan-400 bg-clip-text text-transparent">
              Conference Talks, Found.
            </span>
          </motion.h1>

          <motion.p
            className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400 leading-relaxed"
            variants={itemVariants}
          >
            At multi-track conferences, you attend ~25% of sessions. You miss 75% of the content—but worse, you miss 100% of the connections between them. Synapse stitches the event together with AI.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
            variants={itemVariants}
          >
            <Link
              href="/explore"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 px-6 text-sm font-bold text-white shadow-xl shadow-violet-900/30 hover:from-violet-500 hover:to-indigo-500 hover:scale-[1.02] transition-all"
            >
              Explore Knowledge Graph
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            <Link
              href="/schedule"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-850 px-6 text-sm font-bold text-zinc-300 border border-zinc-800 hover:text-white transition-all"
            >
              Personalize Schedule
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Grid Section */}
        <motion.div
          className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 px-4 mt-20 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Feature 1 */}
          <motion.div variants={itemVariants}>
            <Link
              href="/explore"
              className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-800 backdrop-blur-sm group transition-all duration-300 shadow-md hover:shadow-lg flex flex-col justify-between h-48 block"
            >
              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 group-hover:scale-105 transition-transform">
                  <Network className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-100 mt-2">D3 Knowledge Graph</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Interact with a force-directed visual map of sessions linked by semantic synapses.
                </p>
              </div>
              <span className="text-[10px] font-bold text-violet-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Launch Graph <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </motion.div>

          {/* Feature 2 */}
          <motion.div variants={itemVariants}>
            <Link
              href="/schedule"
              className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-800 backdrop-blur-sm group transition-all duration-300 shadow-md hover:shadow-lg flex flex-col justify-between h-48 block"
            >
              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-100 mt-2">Kendo Scheduler</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Organize your sessions across tracks in real-time. Toggles live attendance database persistence.
                </p>
              </div>
              <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Open Scheduler <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </motion.div>

          {/* Feature 3 */}
          <motion.div variants={itemVariants}>
            <Link
              href="/briefing"
              className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-800 backdrop-blur-sm group transition-all duration-300 shadow-md hover:shadow-lg flex flex-col justify-between h-48 block"
            >
              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-100 mt-2">Personalized AI Briefs</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Receive custom "what you missed" intelligence reports and check knowledge gaps with Kendo AIPrompt.
                </p>
              </div>
              <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Generate Brief <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </motion.div>

          {/* Feature 4 */}
          <motion.div variants={itemVariants}>
            <Link
              href="/dashboard"
              className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-800 backdrop-blur-sm group transition-all duration-300 shadow-md hover:shadow-lg flex flex-col justify-between h-48 block"
            >
              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-100 mt-2">Content Intelligence</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Unlock organizer dashboards with interactive Kendo Charts highlighting topic saturation.
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                View Analytics <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-zinc-900 text-center text-[10px] text-zinc-650 bg-zinc-950/60 backdrop-blur-sm">
        <p>© 2026 Synapse. Built for the GitNation Hackathon. Backed by Neon PostgreSQL &amp; Google Gemini AI.</p>
      </footer>
    </div>
  );
}
