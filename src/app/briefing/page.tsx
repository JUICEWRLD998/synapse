"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Calendar, BookOpen, AlertCircle, PlayCircle, Send, Check } from "lucide-react";
import { AIPrompt, AIPromptOutputInterface } from "@progress/kendo-react-conversational-ui";
import Header from "@/components/ui/Header";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { Briefing } from "@/types";

export default function BriefingPage() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [hasAttendance, setHasAttendance] = useState(false);

  // Kendo AIPrompt State
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

  // Generate new briefing
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

  // AIPrompt handler
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
        setActiveView("outputView"); // Switch view to show the result
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPromptLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans">
      <Header />
      <LoadingOverlay isVisible={generating} title="Synthesizing Briefing..." />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent flex items-center gap-2.5">
              <Sparkles className="h-8 w-8 text-violet-400" />
              Personalized AI Briefing
            </h1>
            <p className="text-sm text-zinc-400">
              Review customized insights, explore missed talks, and refine your experience interactively.
            </p>
          </div>
          
          {hasAttendance && (
            <button
              onClick={handleGenerateBriefing}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 px-5 text-xs font-bold text-white shadow-lg shadow-violet-900/30 hover:from-violet-500 hover:to-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all self-start md:self-auto"
            >
              Generate AI Briefing
            </button>
          )}
        </div>

        {loadingBriefing ? (
          <div className="flex-grow flex items-center justify-center py-20">
            <div className="h-8 w-8 rounded-full border-2 border-zinc-700 border-t-violet-500 animate-spin"></div>
          </div>
        ) : !hasAttendance ? (
          /* Empty Attendance Warning */
          <div className="flex-grow flex flex-col items-center justify-center text-center p-8 border border-zinc-800 border-dashed rounded-2xl bg-zinc-900/10 max-w-md mx-auto my-12">
            <AlertCircle className="h-12 w-12 text-zinc-500 mb-4" />
            <h3 className="text-lg font-bold text-zinc-300">No Scheduled Sessions</h3>
            <p className="text-xs text-zinc-500 mt-2 mb-6 leading-relaxed">
              We compile your personalized AI briefings by analyzing the specific sessions you plan to attend. Add a few talks first!
            </p>
            <Link
              href="/schedule"
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700/50 transition"
            >
              Go to Scheduler
            </Link>
          </div>
        ) : !briefing ? (
          /* Needs Generation */
          <div className="flex-grow flex flex-col items-center justify-center text-center p-8 border border-zinc-800 rounded-2xl bg-zinc-900/20 max-w-md mx-auto my-12 shadow-xl">
            <Sparkles className="h-12 w-12 text-violet-400 mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-white">Generate Your Briefing</h3>
            <p className="text-xs text-zinc-400 mt-2 mb-6 leading-relaxed">
              Your scheduled sessions are connected in our Neon database. Let Gemini analyze the intersections and summarize what you missed.
            </p>
            {errorMsg && <p className="text-xs text-rose-400 mb-4 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg w-full">{errorMsg}</p>}
            <button
              onClick={handleGenerateBriefing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 text-xs font-bold text-white shadow-lg shadow-violet-950/40 hover:from-violet-500 hover:to-indigo-500 transition-all"
            >
              Generate AI Briefing
            </button>
          </div>
        ) : (
          /* Briefing View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Briefing Contents (2/3 width on desktop) */}
            <div className="lg:col-span-2 space-y-8">
              {/* DNA Profile */}
              <div className="p-6 border border-zinc-800 rounded-2xl bg-zinc-900/40 backdrop-blur-sm shadow-xl space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-violet-400" />
                  <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Conference DNA Profile</h3>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed italic">
                  &ldquo;{briefing.conferenceDna}&rdquo;
                </p>
              </div>

              {/* Deeper Connections */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-zinc-200 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-violet-400"></span>
                  Attended Sessions — Deeper Intersections
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {briefing.content.deeperConnections.map((conn, idx) => (
                    <div key={idx} className="p-5 border border-zinc-800 rounded-xl bg-zinc-900/20 space-y-2.5 shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5">
                        <span className="text-xs font-bold text-violet-400">{conn.talkA}</span>
                        <span className="hidden sm:inline text-zinc-600">&amp;</span>
                        <span className="text-xs font-bold text-cyan-400">{conn.talkB}</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{conn.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* What You Missed */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-zinc-200 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                  What You Missed — Key Synapses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {briefing.content.whatYouMissed.map((miss, idx) => (
                    <div key={idx} className="p-5 border border-zinc-800 rounded-xl bg-zinc-900/20 flex flex-col justify-between gap-3 shadow-md">
                      <div className="space-y-1.5">
                        <div className="text-[10px] text-zinc-500 uppercase font-semibold">Speaker: {miss.speaker}</div>
                        <h4 className="text-xs font-bold text-white leading-snug">{miss.talk}</h4>
                        <div className="text-[11px] text-zinc-500 italic mt-1">{miss.connectionToYourTalks}</div>
                        <p className="text-xs text-zinc-400 leading-relaxed mt-2">{miss.whyItMatters}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Knowledge Gaps */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-zinc-200 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-400"></span>
                  Identified Gaps &amp; Actions
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {briefing.content.knowledgeGaps.map((gap, idx) => (
                    <div key={idx} className="p-5 border border-zinc-850 bg-zinc-900/30 rounded-xl flex flex-col sm:flex-row gap-4 justify-between sm:items-center shadow-inner">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Gap: {gap.topic}</div>
                        <p className="text-xs text-zinc-400 leading-relaxed">{gap.gapExplanation}</p>
                      </div>
                      <div className="shrink-0 bg-zinc-950 px-3.5 py-2 border border-zinc-850 rounded-lg text-right sm:max-w-xs">
                        <div className="text-[9px] text-zinc-500 uppercase font-bold">Action Plan</div>
                        <div className="text-[11px] text-violet-300 font-semibold">{gap.recommendedAction}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Recordings */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-zinc-200 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  Priority Post-Event Recordings
                </h3>
                <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-zinc-900/60 border-b border-zinc-800 text-zinc-400">
                          <th className="px-4 py-3 font-semibold">Recommended Session</th>
                          <th className="px-4 py-3 font-semibold">Priority</th>
                          <th className="px-4 py-3 font-semibold">AI Recommended Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {briefing.content.recommendedRecordings.map((rec, idx) => (
                          <tr key={idx} className="border-b border-zinc-850/50 hover:bg-zinc-900/10">
                            <td className="px-4 py-3">
                              <div className="font-bold text-zinc-100">{rec.title}</div>
                              <div className="text-[10px] text-zinc-500">Speaker: {rec.speaker}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                                rec.priority === "High"
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/25"
                                  : rec.priority === "Medium"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                                  : "bg-zinc-800 text-zinc-400 border-zinc-700/50"
                              }`}>
                                {rec.priority}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-zinc-400 leading-relaxed">
                              {rec.reason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Kendo AIPrompt Sidebar (1/3 width on desktop) */}
            <div className="space-y-4 lg:sticky lg:top-24 self-start h-[550px] flex flex-col">
              <div className="border border-zinc-800 rounded-2xl bg-zinc-900/40 backdrop-blur-sm overflow-hidden shadow-xl flex-1 flex flex-col p-5 gap-3.5">
                <div>
                  <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider">
                    Refine with Synapse AI
                  </h3>
                  <p className="text-[11px] text-zinc-500">Ask questions about your schedule, recommended tracks, or specific gaps</p>
                </div>

                {/* Kendo AIPrompt */}
                <div className="flex-1 k-aiprompt-dark rounded-xl overflow-hidden border border-zinc-850">
                  <AIPrompt
                    activeView={activeView}
                    onActiveViewChange={(view) => setActiveView(view)}
                    onPromptRequest={handlePromptRequest}
                    outputs={outputs}
                    loading={promptLoading}
                    promptPlaceholder="Ask: 'Which talks should I watch to cover CSS gaps?'"
                    style={{ height: "100%", width: "100%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
