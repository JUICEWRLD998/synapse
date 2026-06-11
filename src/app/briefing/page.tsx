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
} from "lucide-react";
import { AIPrompt, AIPromptOutputInterface } from "@progress/kendo-react-conversational-ui";
import { motion } from "framer-motion";
import Header from "@/components/ui/Header";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { Briefing } from "@/types";

const priorityStyle: Record<string, string> = {
  High:   "bg-rose-500/8   text-rose-400   border-rose-500/15",
  Medium: "bg-amber-500/8  text-amber-400  border-amber-500/15",
  Low:    "bg-white/[0.03] text-zinc-400   border-white/[0.06]",
};

export default function BriefingPage() {
  const [briefing,        setBriefing]        = useState<Briefing | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(true);
  const [generating,      setGenerating]      = useState(false);
  const [errorMsg,        setErrorMsg]        = useState("");
  const [hasAttendance,   setHasAttendance]   = useState(false);

  const [activeView,   setActiveView]   = useState<string>("promptView");
  const [outputs,      setOutputs]      = useState<AIPromptOutputInterface[]>([]);
  const [promptLoading, setPromptLoading] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <LoadingOverlay isVisible={generating} title="Synthesizing Briefing..." />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.04]">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                <Sparkles className="h-4 w-4" />
              </div>
              AI Briefing
            </h1>
            <p className="text-sm text-zinc-500">
              Personalized conference intelligence based on your attended sessions.
            </p>
          </div>

          {hasAttendance && !loadingBriefing && (
            <button
              onClick={handleGenerate}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-xs font-semibold text-white hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-900/20 self-start md:self-auto"
            >
              <Sparkles className="h-3 w-3" />
              {briefing ? "Regenerate" : "Generate Briefing"}
            </button>
          )}
        </div>

        {/* ── Loading ──────────────────────────────────────────────────────── */}
        {loadingBriefing ? (
          <div className="flex-1 flex items-center justify-center py-24">
            <div className="h-6 w-6 rounded-full border-2 border-zinc-800 border-t-violet-500 animate-spin" />
          </div>

        /* ── No attendance ─────────────────────────────────────────────────── */
        ) : !hasAttendance ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-24 gap-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800/60 text-zinc-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-200">No sessions selected yet</p>
              <p className="text-xs text-zinc-500 max-w-xs">
                Mark a few talks as attended on the Schedule page, then come back to generate your briefing.
              </p>
            </div>
            <Link
              href="/schedule"
              className="inline-flex h-8 items-center px-4 rounded-lg glass text-xs font-semibold text-zinc-300 hover:text-white transition-all"
            >
              Go to Schedule
            </Link>
          </div>

        /* ── Ready to generate ──────────────────────────────────────────────── */
        ) : !briefing ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-24 gap-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 animate-glow-pulse">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Ready to generate your briefing</p>
              <p className="text-xs text-zinc-500 max-w-xs">
                Gemini will analyse your sessions, surface missed connections, and identify knowledge gaps.
              </p>
            </div>
            {errorMsg && (
              <p className="text-xs text-rose-400 bg-rose-500/8 border border-rose-500/15 px-4 py-2.5 rounded-lg max-w-sm">
                {errorMsg}
              </p>
            )}
            <button
              onClick={handleGenerate}
              className="inline-flex h-9 items-center gap-1.5 px-5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-xs font-semibold text-white hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-900/20"
            >
              <Sparkles className="h-3 w-3" />
              Generate Briefing
            </button>
          </div>

        /* ── Briefing view ──────────────────────────────────────────────────── */
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* Main column */}
            <div className="lg:col-span-2 space-y-5">

              {/* Conference DNA */}
              <motion.div
                className="glass-card rounded-2xl p-5 border-l-2 border-l-violet-500/40 space-y-2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                  <span className="text-[10px] font-semibold text-violet-400/70 uppercase tracking-widest">
                    Conference DNA
                  </span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {briefing.conferenceDna}
                </p>
              </motion.div>

              {/* Deeper Connections */}
              {briefing.content.deeperConnections.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.06 }}
                >
                  <SectionLabel icon={<Layers className="h-3.5 w-3.5" />} color="violet" label="Deeper Connections" />
                  <div className="mt-3 space-y-2">
                    {briefing.content.deeperConnections.map((conn, i) => (
                      <div key={i} className="glass-card rounded-xl p-4 space-y-2 border-l-2 border-l-violet-500/25">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-medium text-zinc-200">{conn.talkA}</span>
                          <ArrowRight className="h-3 w-3 text-zinc-600 shrink-0" />
                          <span className="text-xs font-medium text-zinc-200">{conn.talkB}</span>
                        </div>
                        <p className="text-xs text-zinc-500 leading-relaxed">{conn.reason}</p>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* What You Missed */}
              {briefing.content.whatYouMissed.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.12 }}
                >
                  <SectionLabel icon={<Eye className="h-3.5 w-3.5" />} color="amber" label="What You Missed" />
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {briefing.content.whatYouMissed.map((miss, i) => (
                      <div key={i} className="glass-card rounded-xl p-4 flex flex-col gap-2 border-l-2 border-l-amber-500/25">
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-zinc-500 font-medium">{miss.speaker}</p>
                          <p className="text-xs font-semibold text-zinc-200 leading-snug">{miss.talk}</p>
                        </div>
                        <p className="text-xs text-zinc-500 leading-relaxed">{miss.whyItMatters}</p>
                        {miss.connectionToYourTalks && (
                          <p className="text-[11px] text-amber-400/70 leading-snug border-t border-white/[0.04] pt-2">
                            {miss.connectionToYourTalks}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Knowledge Gaps */}
              {briefing.content.knowledgeGaps.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.18 }}
                >
                  <SectionLabel icon={<Lightbulb className="h-3.5 w-3.5" />} color="rose" label="Knowledge Gaps" />
                  <div className="mt-3 space-y-2">
                    {briefing.content.knowledgeGaps.map((gap, i) => (
                      <div key={i} className="glass-card rounded-xl p-4 grid sm:grid-cols-[1fr_auto] gap-4 border-l-2 border-l-rose-500/25">
                        <div className="space-y-1 min-w-0">
                          <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">{gap.topic}</p>
                          <p className="text-xs text-zinc-500 leading-relaxed">{gap.gapExplanation}</p>
                        </div>
                        <div className="shrink-0 bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-2.5 sm:max-w-[220px] w-full sm:w-auto">
                          <p className="text-[9px] text-zinc-600 uppercase font-semibold mb-1">Recommended action</p>
                          <p className="text-xs text-violet-300 leading-snug">{gap.recommendedAction}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Priority Recordings */}
              {briefing.content.recommendedRecordings.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.24 }}
                >
                  <SectionLabel icon={<Video className="h-3.5 w-3.5" />} color="emerald" label="Priority Recordings" />
                  <div className="mt-3 glass-card rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/[0.05]">
                          <th className="px-4 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Session</th>
                          <th className="px-4 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider w-24">Priority</th>
                          <th className="px-4 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {briefing.content.recommendedRecordings.map((rec, i) => (
                          <tr key={i} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.01] transition-colors">
                            <td className="px-4 py-3">
                              <p className="text-xs font-medium text-zinc-200 leading-snug">{rec.title}</p>
                              <p className="text-[10px] text-zinc-500 mt-0.5">{rec.speaker}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider border ${priorityStyle[rec.priority] ?? priorityStyle.Low}`}>
                                {rec.priority}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-zinc-500 leading-relaxed hidden sm:table-cell">
                              {rec.reason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.section>
              )}
            </div>

            {/* AI Chat sidebar */}
            <motion.div
              className="lg:sticky lg:top-20 glass-card rounded-2xl overflow-hidden flex flex-col"
              style={{ height: 500 }}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
            >
              <div className="px-5 pt-5 pb-3 border-b border-white/[0.04]">
                <p className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Send className="h-3 w-3 text-violet-400" />
                  Ask Synapse
                </p>
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  Ask about your gaps, sessions, or any connections
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

/* ── Shared section label component ─────────────────────────────────────── */
function SectionLabel({
  icon,
  color,
  label,
}: {
  icon: React.ReactNode;
  color: "violet" | "amber" | "rose" | "emerald";
  label: string;
}) {
  const colorClass = {
    violet:  "text-violet-400",
    amber:   "text-amber-400",
    rose:    "text-rose-400",
    emerald: "text-emerald-400",
  }[color];

  return (
    <div className={`flex items-center gap-2 ${colorClass}`}>
      {icon}
      <span className="text-xs font-semibold tracking-wide">{label}</span>
      <div className="flex-1 h-px bg-white/[0.04] ml-1" />
    </div>
  );
}
