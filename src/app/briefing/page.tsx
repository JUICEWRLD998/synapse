"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  AlertCircle,
  Send,
  ArrowRight,
  Check,
  Lightbulb,
  Target,
  PlayCircle,
} from "lucide-react";
import { AIPrompt, AIPromptOutputInterface } from "@progress/kendo-react-conversational-ui";
import { motion } from "framer-motion";
import Header from "@/components/ui/Header";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { Briefing } from "@/types";

export default function BriefingPage() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [hasAttendance, setHasAttendance] = useState(false);

  const [activeView, setActiveView] = useState<string>("promptView");
  const [outputs, setOutputs] = useState<AIPromptOutputInterface[]>([]);
  const [promptLoading, setPromptLoading] = useState(false);

  const checkAttendanceAndLoadBriefing = async () => {
    try {
      const resAttendance = await fetch("/api/attendance");
      const dataAttendance = await resAttendance.json();
      if (dataAttendance.success && dataAttendance.attendedTalkIds.length > 0) {
        setHasAttendance(true);
      } else {
        setHasAttendance(false);
      }

      const resBriefing = await fetch("/api/briefing");
      const dataBriefing = await resBriefing.json();
      if (dataBriefing.success && dataBriefing.briefing) {
        setBriefing(dataBriefing.briefing);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBriefing(false);
    }
  };

  useEffect(() => {
    checkAttendanceAndLoadBriefing();
  }, []);

  const handleGenerateBriefing = async () => {
    setGenerating(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/briefing", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setBriefing(data.briefing);
      } else {
        setErrorMsg(data.error || "Failed to generate briefing.");
      }
    } catch (e) {
      setErrorMsg("An error occurred during briefing generation.");
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handlePromptRequest = async (promptText?: string) => {
    if (!promptText) return;
    setPromptLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
      });
      const data = await res.json();
      if (data.success) {
        setOutputs((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            prompt: promptText,
            responseContent: data.answer,
          },
        ]);
        setActiveView("outputView");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPromptLoading(false);
    }
  };

  const sectionColors = {
    connections: { dot: "bg-violet-400", border: "border-l-violet-500/40" },
    missed: { dot: "bg-amber-400", border: "border-l-amber-500/40" },
    gaps: { dot: "bg-rose-400", border: "border-l-rose-500/40" },
    recordings: { dot: "bg-emerald-400", border: "border-l-emerald-500/40" },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <LoadingOverlay isVisible={generating} title="Synthesizing Briefing..." />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.04]">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                <Sparkles className="h-4 w-4" />
              </div>
              AI Briefing
            </h1>
            <p className="text-sm text-zinc-400">
              Review customized insights, explore missed talks, and refine your
              experience interactively.
            </p>
          </div>

          {hasAttendance && (
            <button
              onClick={handleGenerateBriefing}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-xs font-semibold text-white shadow-lg shadow-violet-900/20 hover:shadow-violet-900/40 hover:from-violet-500 hover:to-indigo-500 transition-all self-start md:self-auto"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Generate Briefing
            </button>
          )}
        </div>

        {loadingBriefing ? (
          <div className="flex-grow flex items-center justify-center py-20">
            <div className="h-7 w-7 rounded-full border-2 border-zinc-800 border-t-violet-500 animate-spin" />
          </div>
        ) : !hasAttendance ? (
          /* No attendance */
          <div className="flex-grow flex flex-col items-center justify-center text-center p-8 glass-card rounded-2xl max-w-md mx-auto my-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800/50 text-zinc-400 mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-zinc-200">
              No Scheduled Sessions
            </h3>
            <p className="text-xs text-zinc-500 mt-2 mb-6 leading-relaxed max-w-xs">
              We compile personalized AI briefings by analyzing the sessions you
              plan to attend. Add a few talks first.
            </p>
            <Link
              href="/schedule"
              className="px-5 py-2.5 rounded-xl glass text-xs font-semibold text-zinc-200 hover:text-white hover:border-zinc-600 transition"
            >
              Go to Scheduler
            </Link>
          </div>
        ) : !briefing ? (
          /* Needs generation */
          <div className="flex-grow flex flex-col items-center justify-center text-center p-8 glass-card rounded-2xl max-w-md mx-auto my-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 mb-4 animate-glow-pulse">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-white">
              Generate Your Briefing
            </h3>
            <p className="text-xs text-zinc-400 mt-2 mb-6 leading-relaxed max-w-xs">
              Your scheduled sessions are ready. Let Gemini analyze the
              intersections and summarize what you missed.
            </p>
            {errorMsg && (
              <p className="text-xs text-rose-400 mb-4 bg-rose-500/8 border border-rose-500/15 p-2.5 rounded-lg w-full">
                {errorMsg}
              </p>
            )}
            <button
              onClick={handleGenerateBriefing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-xs font-semibold text-white shadow-lg shadow-violet-900/20 hover:from-violet-500 hover:to-indigo-500 transition-all"
            >
              Generate AI Briefing
            </button>
          </div>
        ) : (
          /* Briefing View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Conference DNA */}
              <motion.div
                className="glass-card rounded-2xl p-6 space-y-3 border-l-2 border-l-violet-500/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-violet-400" />
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Conference DNA Profile
                  </h3>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed italic">
                  &ldquo;{briefing.conferenceDna}&rdquo;
                </p>
              </motion.div>

              {/* Deeper Connections */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${sectionColors.connections.dot}`} />
                  Deeper Intersections
                </h3>
                <div className="space-y-3">
                  {briefing.content.deeperConnections.map((conn, idx) => (
                    <div
                      key={idx}
                      className={`glass-card rounded-xl p-5 space-y-2 border-l-2 ${sectionColors.connections.border}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5">
                        <span className="text-xs font-semibold text-violet-400">
                          {conn.talkA}
                        </span>
                        <ArrowRight className="hidden sm:block h-3 w-3 text-zinc-600" />
                        <span className="text-xs font-semibold text-cyan-400">
                          {conn.talkB}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {conn.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* What You Missed */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${sectionColors.missed.dot}`} />
                  What You Missed
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {briefing.content.whatYouMissed.map((miss, idx) => (
                    <div
                      key={idx}
                      className={`glass-card rounded-xl p-5 flex flex-col gap-2.5 border-l-2 ${sectionColors.missed.border}`}
                    >
                      <div className="space-y-1">
                        <div className="text-[10px] text-zinc-500 uppercase font-semibold">
                          {miss.speaker}
                        </div>
                        <h4 className="text-xs font-semibold text-white leading-snug">
                          {miss.talk}
                        </h4>
                        <div className="text-[11px] text-zinc-500 italic">
                          {miss.connectionToYourTalks}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {miss.whyItMatters}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Knowledge Gaps */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${sectionColors.gaps.dot}`} />
                  Identified Gaps
                </h3>
                <div className="space-y-3">
                  {briefing.content.knowledgeGaps.map((gap, idx) => (
                    <div
                      key={idx}
                      className={`glass-card rounded-xl p-5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center border-l-2 ${sectionColors.gaps.border}`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Target className="h-3 w-3 text-rose-400" />
                          <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">
                            {gap.topic}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {gap.gapExplanation}
                        </p>
                      </div>
                      <div className="shrink-0 bg-white/[0.02] px-3.5 py-2.5 border border-white/[0.04] rounded-lg sm:max-w-xs">
                        <div className="flex items-center gap-1 mb-1">
                          <Lightbulb className="h-2.5 w-2.5 text-zinc-500" />
                          <span className="text-[9px] text-zinc-500 uppercase font-semibold">
                            Action
                          </span>
                        </div>
                        <div className="text-[11px] text-violet-300 font-medium">
                          {gap.recommendedAction}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recommended Recordings */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${sectionColors.recordings.dot}`} />
                  Priority Recordings
                </h3>
                <div className="glass-card rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-white/[0.02] border-b border-white/[0.04] text-zinc-500">
                          <th className="px-4 py-3 font-semibold text-[10px] uppercase tracking-wider">
                            Session
                          </th>
                          <th className="px-4 py-3 font-semibold text-[10px] uppercase tracking-wider">
                            Priority
                          </th>
                          <th className="px-4 py-3 font-semibold text-[10px] uppercase tracking-wider">
                            Reason
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {briefing.content.recommendedRecordings.map(
                          (rec, idx) => (
                            <tr
                              key={idx}
                              className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors"
                            >
                              <td className="px-4 py-3">
                                <div className="font-medium text-zinc-200">
                                  {rec.title}
                                </div>
                                <div className="text-[10px] text-zinc-500 mt-0.5">
                                  {rec.speaker}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider border ${
                                    rec.priority === "High"
                                      ? "bg-rose-500/8 text-rose-400 border-rose-500/15"
                                      : rec.priority === "Medium"
                                      ? "bg-amber-500/8 text-amber-400 border-amber-500/15"
                                      : "bg-white/[0.03] text-zinc-400 border-white/[0.06]"
                                  }`}
                                >
                                  {rec.priority}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-zinc-400 leading-relaxed">
                                {rec.reason}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* AIPrompt Sidebar */}
            <div className="space-y-4 lg:sticky lg:top-20 self-start h-[520px] flex flex-col">
              <motion.div
                className="glass-card rounded-2xl overflow-hidden flex-1 flex flex-col p-5 gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div>
                  <h3 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Send className="h-3 w-3 text-violet-400" />
                    Synapse AI Chat
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Ask about your schedule, tracks, or specific gaps
                  </p>
                </div>

                <div className="flex-1 rounded-xl overflow-hidden border border-white/[0.04]">
                  <AIPrompt
                    activeView={activeView}
                    onActiveViewChange={(view) => setActiveView(view)}
                    onPromptRequest={handlePromptRequest}
                    outputs={outputs}
                    loading={promptLoading}
                    promptPlaceholder="Ask: 'Which talks cover my CSS gaps?'"
                    style={{ height: "100%", width: "100%" }}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
