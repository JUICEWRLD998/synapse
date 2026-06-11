"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  AlertCircle,
  Send,
  ArrowRight,
  Lightbulb,
  BookOpen,
  Video,
  Layers,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AIPrompt, AIPromptOutputInterface } from "@progress/kendo-react-conversational-ui";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/ui/Header";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { Briefing } from "@/types";

const priorityStyle: Record<string, string> = {
  High:   "bg-rose-500/10  text-rose-400   border-rose-500/20",
  Medium: "bg-amber-500/10 text-amber-400  border-amber-500/20",
  Low:    "bg-zinc-700/30  text-zinc-400   border-zinc-700/40",
};

const priorityDot: Record<string, string> = {
  High:   "bg-rose-500",
  Medium: "bg-amber-500",
  Low:    "bg-zinc-500",
};

export default function BriefingPage() {
  const [briefing,        setBriefing]        = useState<Briefing | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(true);
  const [generating,      setGenerating]      = useState(false);
  const [errorMsg,        setErrorMsg]        = useState("");
  const [hasAttendance,   setHasAttendance]   = useState(false);

  const [activeView,    setActiveView]    = useState<string>("promptView");
  const [outputs,       setOutputs]       = useState<AIPromptOutputInterface[]>([]);
  const [promptLoading, setPromptLoading] = useState(false);

  // Collapsible sections state
  const [expandedGaps, setExpandedGaps] = useState<Set<number>>(new Set());

  // Parallel fetch — fixes the sequential 8–12 s load
  useEffect(() => {
    (async () => {
      try {
        const [resA, resB] = await Promise.all([
          fetch("/api/attendance"),
          fetch("/api/briefing"),
        ]);
        const [dataA, dataB] = await Promise.all([resA.json(), resB.json()]);
        setHasAttendance(dataA.success && dataA.attendedTalkIds?.length > 0);
        if (dataB.success && dataB.briefing) setBriefing(dataB.briefing);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingBriefing(false);
      }
    })();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setErrorMsg("");
    try {
      const res  = await fetch("/api/briefing", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setBriefing(data.briefing);
      } else {
        setErrorMsg(data.error || "Failed to generate briefing.");
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrompt = async (promptText?: string) => {
    if (!promptText) return;
    setPromptLoading(true);
    try {
      const res  = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ prompt: promptText }),
      });
      const data = await res.json();
      if (data.success) {
        setOutputs((prev) => [
          ...prev,
          { id: prev.length + 1, prompt: promptText, responseContent: data.answer },
        ]);
        setActiveView("outputView");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPromptLoading(false);
    }
  };

  const toggleGap = (index: number) => {
    setExpandedGaps(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <LoadingOverlay isVisible={generating} title="Synthesizing Briefing..." />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white mb-1.5">
              AI Briefing
            </h1>
            <p className="text-sm text-zinc-400">
              Personalized conference intelligence based on your attended sessions
            </p>
          </div>

          {hasAttendance && !loadingBriefing && (
            <button
              onClick={handleGenerate}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white hover:bg-violet-500 transition-colors shadow-sm shadow-violet-900/30 self-start md:self-center"
            >
              <Sparkles className="h-4 w-4" />
              {briefing ? "Regenerate" : "Generate Briefing"}
            </button>
          )}
        </div>

        {/* ── Loading ──────────────────────────────────────────────────────── */}
        {loadingBriefing ? (
          <div className="flex-1 flex items-center justify-center py-32">
            <div className="h-7 w-7 rounded-full border-2 border-zinc-800 border-t-violet-500 animate-spin" />
          </div>

        /* ── No attendance ─────────────────────────────────────────────────── */
        ) : !hasAttendance ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-32 gap-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-800/40 text-zinc-500 border border-zinc-800">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <p className="text-base font-medium text-zinc-200">No sessions selected yet</p>
              <p className="text-sm text-zinc-500 max-w-md">
                Mark a few talks as attended on the Schedule page, then return to generate your personalized briefing
              </p>
            </div>
            <Link
              href="/schedule"
              className="inline-flex h-9 items-center px-4 rounded-lg bg-zinc-800/60 text-sm font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all border border-zinc-700/50"
            >
              Go to Schedule
            </Link>
          </div>

        /* ── Ready to generate ──────────────────────────────────────────────── */
        ) : !briefing ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-32 gap-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 animate-glow-pulse border border-violet-500/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <p className="text-base font-medium text-white">Ready to generate your briefing</p>
              <p className="text-sm text-zinc-500 max-w-md">
                Gemini will analyze your sessions, surface missed connections, and identify knowledge gaps
              </p>
            </div>
            {errorMsg && (
              <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-lg max-w-md">
                {errorMsg}
              </p>
            )}
            <button
              onClick={handleGenerate}
              className="inline-flex h-10 items-center gap-2 px-5 rounded-lg bg-violet-600 text-sm font-medium text-white hover:bg-violet-500 transition-colors shadow-md shadow-violet-900/30"
            >
              <Sparkles className="h-4 w-4" />
              Generate Briefing
            </button>
          </div>

        /* ── Briefing view ──────────────────────────────────────────────────── */
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

            {/* Main column */}
            <div className="space-y-6">

              {/* Conference DNA — Hero Card */}
              <motion.div
                className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/5 via-zinc-900/40 to-zinc-900/60 border border-violet-500/10 p-6 shadow-lg shadow-black/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400 border border-violet-500/20">
                      <BookOpen className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                      Conference DNA
                    </span>
                  </div>
                  <p className="text-[15px] text-zinc-200 leading-relaxed">
                    {briefing.conferenceDna}
                  </p>
                </div>
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/[0.02] to-transparent pointer-events-none" />
              </motion.div>

              {/* Deeper Connections */}
              {briefing.content.deeperConnections.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.08 }}
                >
                  <SectionHeader icon={<Layers className="h-4 w-4" />} title="Deeper Connections" count={briefing.content.deeperConnections.length} />
                  <div className="mt-4 space-y-3">
                    {briefing.content.deeperConnections.map((conn, i) => (
                      <motion.div
                        key={i}
                        className="group rounded-xl bg-zinc-900/40 border border-zinc-800/60 p-4 hover:border-violet-500/20 hover:bg-zinc-900/60 transition-all duration-200 shadow-sm hover:shadow-md"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <div className="flex flex-wrap items-center gap-2 mb-2.5">
                          <span className="text-sm font-medium text-zinc-100">{conn.talkA}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-violet-500/60 shrink-0" />
                          <span className="text-sm font-medium text-zinc-100">{conn.talkB}</span>
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed">{conn.reason}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* What You Missed */}
              {briefing.content.whatYouMissed.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.16 }}
                >
                  <SectionHeader icon={<Eye className="h-4 w-4" />} title="What You Missed" count={briefing.content.whatYouMissed.length} color="amber" />
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {briefing.content.whatYouMissed.map((miss, i) => (
                      <motion.div
                        key={i}
                        className="group rounded-xl bg-zinc-900/40 border border-zinc-800/60 p-4 hover:border-amber-500/20 hover:bg-zinc-900/60 transition-all duration-200 shadow-sm hover:shadow-md"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <div className="space-y-2">
                          <div>
                            <p className="text-[11px] text-zinc-500 font-medium mb-0.5">{miss.speaker}</p>
                            <p className="text-sm font-semibold text-zinc-100 leading-snug">{miss.talk}</p>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">{miss.whyItMatters}</p>
                          {miss.connectionToYourTalks && (
                            <div className="pt-2 border-t border-white/[0.04]">
                              <p className="text-xs text-amber-400/80 leading-snug">
                                {miss.connectionToYourTalks}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Knowledge Gaps */}
              {briefing.content.knowledgeGaps.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.24 }}
                >
                  <SectionHeader icon={<Lightbulb className="h-4 w-4" />} title="Knowledge Gaps" count={briefing.content.knowledgeGaps.length} color="rose" />
                  <div className="mt-4 space-y-3">
                    {briefing.content.knowledgeGaps.map((gap, i) => {
                      const isExpanded = expandedGaps.has(i);
                      return (
                        <motion.div
                          key={i}
                          className="rounded-xl bg-zinc-900/40 border border-zinc-800/60 overflow-hidden hover:border-rose-500/20 transition-colors duration-200 shadow-sm"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <button
                            onClick={() => toggleGap(i)}
                            className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-zinc-900/60 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-rose-400 mb-1">{gap.topic}</p>
                              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                                {gap.gapExplanation}
                              </p>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                            )}
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 pt-1 border-t border-white/[0.04]">
                                  <div className="bg-rose-500/5 border border-rose-500/10 rounded-lg px-3 py-2.5">
                                    <p className="text-[10px] text-rose-400/60 uppercase font-semibold mb-1 tracking-wide">
                                      Recommended Action
                                    </p>
                                    <p className="text-xs text-zinc-300 leading-relaxed">
                                      {gap.recommendedAction}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {/* Priority Recordings */}
              {briefing.content.recommendedRecordings.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.32 }}
                >
                  <SectionHeader icon={<Video className="h-4 w-4" />} title="Priority Recordings" count={briefing.content.recommendedRecordings.length} color="emerald" />
                  <div className="mt-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 overflow-hidden shadow-sm">
                    <div className="divide-y divide-white/[0.04]">
                      {briefing.content.recommendedRecordings.map((rec, i) => (
                        <motion.div
                          key={i}
                          className="group p-4 hover:bg-zinc-900/60 transition-colors duration-150"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.04 }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${priorityDot[rec.priority] ?? priorityDot.Low}`} />
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1.5">
                                <p className="text-sm font-medium text-zinc-100 leading-snug">{rec.title}</p>
                                <span className={`inline-flex shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${priorityStyle[rec.priority] ?? priorityStyle.Low}`}>
                                  {rec.priority}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-500">{rec.speaker}</p>
                              <p className="text-xs text-zinc-400 leading-relaxed">{rec.reason}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.section>
              )}
            </div>

            {/* AI Chat sidebar */}
            <motion.div
              className="lg:sticky lg:top-24 rounded-xl bg-zinc-900/40 border border-zinc-800/60 overflow-hidden flex flex-col shadow-lg"
              style={{ height: 580 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.12 }}
            >
              <div className="px-5 py-4 border-b border-white/[0.06] bg-zinc-900/60">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    <Send className="h-3 w-3" />
                  </div>
                  <p className="text-sm font-semibold text-zinc-200">Ask Synapse</p>
                </div>
                <p className="text-xs text-zinc-500">
                  Ask about gaps, sessions, or connections
                </p>
              </div>
              <div className="flex-1 overflow-hidden">
                <AIPrompt
                  activeView={activeView}
                  onActiveViewChange={setActiveView}
                  onPromptRequest={handlePrompt}
                  outputs={outputs}
                  loading={promptLoading}
                  promptPlaceholder="e.g. What did I miss on performance?"
                  style={{ height: "100%", width: "100%" }}
                />
              </div>
            </motion.div>

          </div>
        )}
      </main>
    </div>
  );
}

/* ── Section Header Component ───────────────────────────────────────────── */
function SectionHeader({
  icon,
  title,
  count,
  color = "violet",
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
  color?: "violet" | "amber" | "rose" | "emerald";
}) {
  const colorClass = {
    violet:  "text-violet-400 bg-violet-500/10 border-violet-500/20",
    amber:   "text-amber-400 bg-amber-500/10 border-amber-500/20",
    rose:    "text-rose-400 bg-rose-500/10 border-rose-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  }[color];

  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${colorClass}`}>
        {icon}
      </div>
      <h2 className="text-base font-semibold text-zinc-100 tracking-tight">{title}</h2>
      {count !== undefined && (
        <span className="text-xs font-medium text-zinc-500 bg-zinc-800/40 px-2 py-0.5 rounded-md border border-zinc-800">
          {count}
        </span>
      )}
      <div className="flex-1 h-px bg-gradient-to-r from-zinc-800 to-transparent ml-2" />
    </div>
  );
}
