"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  AlertCircle,
  ArrowRight,
  Lightbulb,
  BookOpen,
  Video,
  Layers,
  Eye,
  ChevronDown,
  ChevronUp,
  Bot,
  User,
  Send,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/ui/Header";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { Briefing } from "@/types";

/* ── Priority styling ────────────────────────────────────────────── */
const priorityBadge: Record<string, string> = {
  High:   "bg-rose-500/10  text-rose-400   border-rose-500/20",
  Medium: "bg-amber-500/10 text-amber-400  border-amber-500/20",
  Low:    "bg-zinc-700/30  text-zinc-400   border-zinc-700/40",
};
const priorityDot: Record<string, string> = {
  High:   "bg-rose-500",
  Medium: "bg-amber-500",
  Low:    "bg-zinc-500",
};

/* ── Chat message type ───────────────────────────────────────────── */
interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  loading?: boolean;
}

/* ── Suggested prompts ───────────────────────────────────────────── */
const SUGGESTED_PROMPTS = [
  "What did I miss most?",
  "What are my main knowledge gaps?",
  "Which recording should I watch first?",
  "How do my sessions connect?",
];

/* ── Chat UI ─────────────────────────────────────────────────────── */
function ChatPanel() {
  const [messages,   setMessages]   = useState<ChatMessage[]>([]);
  const [input,      setInput]      = useState("");
  const [isLoading,  setIsLoading]  = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const nextId    = useRef(1);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const prompt = text.trim();
    if (!prompt || isLoading) return;

    const userMsg: ChatMessage = { id: nextId.current++, role: "user", content: prompt };
    const placeholder: ChatMessage = { id: nextId.current++, role: "assistant", content: "", loading: true };

    setMessages((prev) => [...prev, userMsg, placeholder]);
    setInput("");
    setIsLoading(true);

    try {
      const res  = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ prompt }),
      });
      const data = await res.json();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholder.id
            ? { ...m, content: data.success ? data.answer : "Sorry, something went wrong. Please try again.", loading: false }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholder.id
            ? { ...m, content: "Network error — please check your connection and try again.", loading: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">

      {/* ── Messages ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {isEmpty ? (
          /* Empty state */
          <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <Bot className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-200">Ask Synapse</p>
              <p className="text-xs text-zinc-500 max-w-[220px] leading-relaxed">
                Ask anything about your sessions, gaps, or connections
              </p>
            </div>
            {/* Suggested prompts */}
            <div className="w-full space-y-2 mt-2">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-zinc-300 bg-zinc-900/60 border border-zinc-800 hover:border-violet-500/30 hover:bg-zinc-900/80 hover:text-zinc-100 transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message bubbles */
          <>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-full border text-xs ${
                    msg.role === "user"
                      ? "bg-violet-600/20 border-violet-500/30 text-violet-300"
                      : "bg-zinc-800/60 border-zinc-700/50 text-zinc-400"
                  }`}
                >
                  {msg.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-violet-600 text-white rounded-tr-sm"
                      : "bg-zinc-800/60 border border-zinc-700/40 text-zinc-200 rounded-tl-sm"
                  }`}
                >
                  {msg.loading ? (
                    <span className="flex items-center gap-2 text-zinc-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span className="text-xs">Thinking…</span>
                    </span>
                  ) : (
                    msg.content
                  )}
                </div>
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* ── Input bar ────────────────────────────────────────────── */}
      <div className="px-4 pb-4 pt-3 border-t border-white/[0.05]">
        <div className="flex items-center gap-2 rounded-xl bg-zinc-900/60 border border-zinc-800 focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all px-3 py-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your sessions…"
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none disabled:opacity-60"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-violet-500 transition-colors"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-zinc-600 mt-1.5 text-center">Powered by Gemini AI</p>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function BriefingPage() {
  const [briefing,        setBriefing]        = useState<Briefing | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(true);
  const [generating,      setGenerating]      = useState(false);
  const [errorMsg,        setErrorMsg]        = useState("");
  const [hasAttendance,   setHasAttendance]   = useState(false);
  const [expandedGaps,    setExpandedGaps]    = useState<Set<number>>(new Set());

  /* Parallel fetch */
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
      if (data.success) setBriefing(data.briefing);
      else setErrorMsg(data.error ?? "Failed to generate briefing.");
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const toggleGap = (i: number) => {
    setExpandedGaps((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <LoadingOverlay isVisible={generating} title="Synthesizing Briefing…" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">

        {/* ── Page header ─────────────────────────────────────────── */}
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

        {/* ── States ──────────────────────────────────────────────── */}
        {loadingBriefing ? (
          <div className="flex-1 flex items-center justify-center py-32">
            <div className="h-7 w-7 rounded-full border-2 border-zinc-800 border-t-violet-500 animate-spin" />
          </div>

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
              className="inline-flex h-9 items-center px-4 rounded-lg bg-zinc-800/60 text-sm font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white border border-zinc-700/50 transition-all"
            >
              Go to Schedule
            </Link>
          </div>

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

        ) : (
          /* ── Briefing content ───────────────────────────────────── */
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

            {/* Left column — briefing sections */}
            <div className="space-y-6">

              {/* Conference DNA */}
              <motion.div
                className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/5 via-zinc-900/40 to-zinc-900/60 border border-violet-500/10 p-6 shadow-lg shadow-black/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400 border border-violet-500/20">
                    <BookOpen className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                    Conference DNA
                  </span>
                </div>
                <p className="text-base text-zinc-200 leading-relaxed">
                  {briefing.conferenceDna}
                </p>
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
                        className="rounded-xl bg-zinc-900/40 border border-zinc-800/60 p-4 hover:border-violet-500/20 hover:bg-zinc-900/60 transition-all duration-200"
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
                        className="rounded-xl bg-zinc-900/40 border border-zinc-800/60 p-4 hover:border-amber-500/20 hover:bg-zinc-900/60 transition-all duration-200"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <p className="text-[11px] text-zinc-500 font-medium mb-0.5">{miss.speaker}</p>
                        <p className="text-sm font-semibold text-zinc-100 leading-snug mb-2">{miss.talk}</p>
                        <p className="text-sm text-zinc-400 leading-relaxed">{miss.whyItMatters}</p>
                        {miss.connectionToYourTalks && (
                          <p className="text-xs text-amber-400/80 leading-snug border-t border-white/[0.04] pt-2 mt-2">
                            {miss.connectionToYourTalks}
                          </p>
                        )}
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
                      const open = expandedGaps.has(i);
                      return (
                        <div
                          key={i}
                          className="rounded-xl bg-zinc-900/40 border border-zinc-800/60 overflow-hidden hover:border-rose-500/20 transition-colors duration-200"
                        >
                          <button
                            onClick={() => toggleGap(i)}
                            className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-zinc-900/60 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-rose-400 mb-1">{gap.topic}</p>
                              <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">{gap.gapExplanation}</p>
                            </div>
                            {open ? (
                              <ChevronUp className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                            )}
                          </button>
                          <AnimatePresence>
                            {open && (
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
                                    <p className="text-sm text-zinc-300 leading-relaxed">{gap.recommendedAction}</p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
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
                  <div className="mt-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 overflow-hidden divide-y divide-white/[0.04]">
                    {briefing.content.recommendedRecordings.map((rec, i) => (
                      <motion.div
                        key={i}
                        className="p-4 hover:bg-zinc-900/60 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${priorityDot[rec.priority] ?? priorityDot.Low}`} />
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5">
                              <p className="text-sm font-medium text-zinc-100 leading-snug">{rec.title}</p>
                              <span className={`inline-flex shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${priorityBadge[rec.priority] ?? priorityBadge.Low}`}>
                                {rec.priority}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-500">{rec.speaker}</p>
                            <p className="text-sm text-zinc-400 leading-relaxed">{rec.reason}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}
            </div>

            {/* Right column — AI Chat */}
            <motion.div
              className="lg:sticky lg:top-24 flex flex-col rounded-xl bg-zinc-900/40 border border-zinc-800/60 shadow-lg overflow-hidden"
              style={{ height: 600 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.12 }}
            >
              {/* Chat header */}
              <div className="px-5 py-4 border-b border-white/[0.06] bg-zinc-900/60 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-200 leading-none mb-0.5">Synapse AI</p>
                    <p className="text-xs text-zinc-500 leading-none">Conference intelligence assistant</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium">Online</span>
                  </div>
                </div>
              </div>

              {/* Chat body */}
              <div className="flex-1 min-h-0">
                <ChatPanel />
              </div>
            </motion.div>

          </div>
        )}
      </main>
    </div>
  );
}

/* ── Section header ──────────────────────────────────────────────── */
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
  const cls = {
    violet:  "text-violet-400 bg-violet-500/10 border-violet-500/20",
    amber:   "text-amber-400 bg-amber-500/10 border-amber-500/20",
    rose:    "text-rose-400 bg-rose-500/10 border-rose-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  }[color];

  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${cls}`}>
        {icon}
      </div>
      <h2 className="text-base font-semibold text-zinc-100 tracking-tight">{title}</h2>
      {count !== undefined && (
        <span className="text-xs font-medium text-zinc-500 bg-zinc-800/40 px-2 py-0.5 rounded-md border border-zinc-800">
          {count}
        </span>
      )}
      <div className="flex-1 h-px bg-gradient-to-r from-zinc-800 to-transparent ml-1" />
    </div>
  );
}
