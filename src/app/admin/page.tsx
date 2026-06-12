"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Download,
  Loader2,
  Table2,
  Sparkles,
  Trash2,
  Tag,
  Clock,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/ui/Header";

interface PreviewRow {
  title: string;
  speaker: string;
  company: string;
  track: string;
  day: string;
  time: string;
  tags: string[];
}

interface ImportResult {
  tracks: number;
  speakers: number;
  talks: number;
  synapses: number;
  synapseSource: string;
}

type Step = "upload" | "preview" | "importing" | "done" | "error";

const REQUIRED_COLUMNS = [
  "title", "speaker_name", "speaker_company", "speaker_bio",
  "track_name", "track_color", "start_time", "end_time", "day", "tags", "abstract",
];

export default function AdminPage() {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    if (!f.name.endsWith(".csv") && !f.name.endsWith(".txt")) {
      setError("Please upload a .csv file.");
      return;
    }
    setFile(f);
    setError("");

    const fd = new FormData();
    fd.append("file", f);
    fd.append("mode", "preview");

    try {
      const res = await fetch("/api/admin/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.success) { setError(data.error); return; }
      setPreview(data.preview);
      setStep("preview");
    } catch {
      setError("Failed to parse file. Please check the format.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setStep("importing");
    setError("");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("mode", "import");

    try {
      const res = await fetch("/api/admin/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.success) { setError(data.error); setStep("error"); return; }
      setResult(data.imported);
      setStep("done");
    } catch {
      setError("Import failed. Please try again.");
      setStep("error");
    }
  };

  const reset = () => {
    setStep("upload");
    setFile(null);
    setPreview([]);
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">

        {/* Page header */}
        <div className="pb-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Conference Import</h1>
          </div>
          <p className="text-zinc-400 text-sm max-w-2xl">
            Upload a CSV file with your conference programme. Sessions, speakers, and tracks are
            imported instantly. Gemini AI then automatically discovers semantic connections between talks.
          </p>

          {/* Demo warning */}
          <div className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-sm text-amber-300 max-w-2xl">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              <strong>Demo mode:</strong> This page is publicly accessible for hackathon testing.
              In production it would be protected by organiser authentication.
            </span>
          </div>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-3 text-sm">
          {(["upload","preview","importing","done"] as const).map((s, i) => {
            const labels = ["Upload CSV", "Preview Data", "Importing", "Complete"];
            const active = step === s;
            const done = (
              (s === "upload"    && ["preview","importing","done"].includes(step)) ||
              (s === "preview"   && ["importing","done"].includes(step)) ||
              (s === "importing" && step === "done")
            );
            return (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className="h-px w-6 bg-zinc-800" />}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  active ? "bg-violet-600 text-white border-violet-500"
                  : done  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  :         "text-zinc-500 border-zinc-800"
                }`}>
                  {done ? <CheckCircle2 className="h-3 w-3" /> : <span>{i + 1}</span>}
                  {labels[i]}
                </div>
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">

          {/* ── Step 1: Upload ────────────────────────────────────── */}
          {step === "upload" && (
            <motion.div key="upload" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-16 cursor-pointer transition-all ${
                  dragging
                    ? "border-violet-500/60 bg-violet-500/5"
                    : "border-zinc-800 hover:border-zinc-700 hover:bg-white/[0.01]"
                }`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                  <Upload className="h-7 w-7" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-base font-semibold text-zinc-200">Drop your CSV file here</p>
                  <p className="text-sm text-zinc-500">or click to browse — .csv files only</p>
                </div>
                <input ref={inputRef} type="file" accept=".csv,.txt" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Download template + column reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-card rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
                    <Download className="h-4 w-4 text-violet-400" />
                    Download Template
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Pre-filled with real GitNation 2026 data. Open in Excel or Google Sheets, edit the rows for your conference, export as CSV.
                  </p>
                  <a
                    href="/gitnation-template.csv"
                    download="gitnation-template.csv"
                    onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-500 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    gitnation-template.csv
                  </a>
                </div>

                <div className="glass-card rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
                    <Table2 className="h-4 w-4 text-cyan-400" />
                    Required Columns
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {REQUIRED_COLUMNS.map(col => (
                      <span key={col} className="tag-chip font-mono">{col}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Preview ───────────────────────────────────── */}
          {step === "preview" && (
            <motion.div key="preview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-base font-semibold text-zinc-100">{preview.length} sessions parsed</p>
                  <p className="text-sm text-zinc-400">Review before importing. This will replace all existing conference data.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:border-zinc-700 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                    Change file
                  </button>
                  <button onClick={handleImport} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition-colors">
                    <Sparkles className="h-4 w-4" />
                    Import &amp; Discover Connections
                  </button>
                </div>
              </div>

              {/* Preview cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
                {preview.map((row, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="rounded-xl bg-zinc-900/40 border border-zinc-800/60 p-4 space-y-2"
                  >
                    <p className="text-sm font-semibold text-zinc-100 leading-snug">{row.title}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-400">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{row.speaker}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{row.time} · Day {row.day}</span>
                      <span className="text-zinc-500">{row.track}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {row.tags.map(tag => (
                        <span key={tag} className="tag-chip flex items-center gap-1">
                          <Tag className="h-2.5 w-2.5" />{tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Importing ─────────────────────────────────── */}
          {step === "importing" && (
            <motion.div key="importing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-base font-semibold text-zinc-200">Importing conference data…</p>
                <p className="text-sm text-zinc-400 max-w-sm">
                  Creating talks and speakers, then asking Gemini AI to discover semantic connections between sessions. This may take 15–30 seconds.
                </p>
              </div>
              <div className="flex gap-2 text-xs text-zinc-500">
                <span className="px-2.5 py-1 rounded-full border border-zinc-800">Seeding DB</span>
                <span className="px-2.5 py-1 rounded-full border border-violet-500/30 text-violet-400">Discovering synapses</span>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Done ──────────────────────────────────────── */}
          {step === "done" && result && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="flex flex-col items-center text-center py-10 gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-semibold text-white">Conference imported successfully</p>
                  <p className="text-sm text-zinc-400">Your programme is live. Attendees can now explore sessions and generate briefings.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg">
                  {[
                    { label: "Tracks",   value: result.tracks,   color: "text-cyan-400"    },
                    { label: "Speakers", value: result.speakers, color: "text-violet-400"  },
                    { label: "Sessions", value: result.talks,    color: "text-indigo-400"  },
                    { label: "Synapses", value: result.synapses, color: "text-emerald-400" },
                  ].map(s => (
                    <div key={s.label} className="glass-card rounded-xl p-4 text-center">
                      <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {result.synapseSource === "skipped" && (
                  <p className="text-xs text-amber-400/80 bg-amber-500/8 border border-amber-500/15 px-4 py-2 rounded-lg max-w-md">
                    Gemini was unavailable — synapses could not be generated or loaded. You can trigger synapse discovery manually from the Analytics page.
                  </p>
                )}
                {result.synapseSource === "fallback" && (
                  <p className="text-xs text-cyan-400/80 bg-cyan-500/8 border border-cyan-500/15 px-4 py-2 rounded-lg max-w-md">
                    Gemini was temporarily overloaded — pre-built semantic synapses were used instead. The knowledge graph is fully populated.
                  </p>
                )}

                <div className="flex flex-wrap gap-3 justify-center">
                  <Link href="/explore" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition-colors">
                    <ArrowRight className="h-4 w-4" />
                    Open Knowledge Graph
                  </Link>
                  <Link href="/schedule" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass text-zinc-200 text-sm font-medium hover:text-white transition-colors border border-zinc-800">
                    View Schedule
                  </Link>
                  <button onClick={reset} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-zinc-400 text-sm hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    Import another
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Error state ───────────────────────────────────────── */}
          {step === "error" && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-24 gap-5 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-zinc-200">Import failed</p>
                <p className="text-sm text-rose-400 max-w-md">{error}</p>
              </div>
              <button onClick={reset} className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-200 text-sm hover:bg-zinc-700 transition-colors">
                Try again
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
