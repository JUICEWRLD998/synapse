"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/ui/Header";
import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts";
import TopSynapsesGrid from "@/components/dashboard/TopSynapsesGrid";
import { LayoutDashboard, Users, Flame, Network, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Talk, Synapse } from "@/types";

interface TalkLeaderboardEntry {
  id: string;
  title: string;
  speaker: string;
  company: string;
  track: string;
  connections: number;
  avgStrength: number;
}

/* ---- Animated KPI Counter ---- */
function KpiCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          let start = 0;
          const duration = 1200;
          const step = (ts: number) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            setCount(Math.floor(p * target));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, started]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

export default function AnalyticsPage() {
  const [talks, setTalks] = useState<Talk[]>([]);
  const [synapses, setSynapses] = useState<Synapse[]>([]);
  const [leaderboard, setLeaderboard] = useState<TalkLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [tRes, sRes, aRes] = await Promise.all([
          fetch("/api/talks"),
          fetch("/api/synapses"),
          fetch("/api/analytics"),
        ]);
        const tData = await tRes.json();
        const sData = await sRes.json();
        const aData = await aRes.json();
        if (tData.success) setTalks(tData.talks);
        if (sData.success) setSynapses(sData.synapses);
        if (aData.success) setLeaderboard(aData.analytics.talkLeaderboard);
      } catch (e) {
        console.error("Analytics load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const uniqueSpeakers = new Set(talks.map((t) => t.speakerId)).size;
  const avgStrength =
    synapses.length > 0
      ? (synapses.reduce((sum, s) => sum + s.strength, 0) / synapses.length) * 100
      : 0;

  const kpis = [
    { label: "Total Sessions", value: talks.length,          suffix: "", icon: Flame,   color: "violet"  },
    { label: "Speakers",       value: uniqueSpeakers,        suffix: "", icon: Users,   color: "cyan"    },
    { label: "Avg. Strength",  value: Math.round(avgStrength), suffix: "%", icon: Network, color: "emerald" },
  ];

  const kpiColorMap: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
    violet:  { bg: "bg-violet-500/8",  text: "text-violet-400",  border: "border-violet-500/15",  gradient: "from-violet-500/10 to-violet-500/0"  },
    cyan:    { bg: "bg-cyan-500/8",    text: "text-cyan-400",    border: "border-cyan-500/15",    gradient: "from-cyan-500/10 to-cyan-500/0"      },
    emerald: { bg: "bg-emerald-500/8", text: "text-emerald-400", border: "border-emerald-500/15", gradient: "from-emerald-500/10 to-emerald-500/0" },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.04]">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              Analytics
            </h1>
            <p className="text-sm text-zinc-400">
              Content distribution analytics, connection density, and semantic
              relationship audits.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="h-7 w-7 rounded-full border-2 border-zinc-800 border-t-violet-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* KPI Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {kpis.map((kpi, i) => {
                const Icon = kpi.icon;
                const c = kpiColorMap[kpi.color];
                return (
                  <motion.div
                    key={kpi.label}
                    className="glass-card rounded-2xl p-5 flex items-center justify-between relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${c.gradient}`} />
                    <div className="space-y-1">
                      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                        {kpi.label}
                      </div>
                      <div className="text-2xl font-bold text-white">
                        <KpiCounter target={kpi.value} suffix={kpi.suffix} />
                      </div>
                    </div>
                    <div className={`h-9 w-9 ${c.bg} border ${c.border} ${c.text} rounded-xl flex items-center justify-center`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Charts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <AnalyticsCharts talks={talks} synapses={synapses} />
            </motion.div>

            {/* Synapse Directory Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <TopSynapsesGrid synapses={synapses} />
            </motion.div>

            {/* Synapse Leaderboard */}
            {leaderboard.length > 0 && (
              <motion.div
                className="glass-card rounded-2xl p-5 space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Synapse Leaderboard
                  </h4>
                  <span className="text-[10px] text-zinc-600 ml-auto">Most-connected sessions</span>
                </div>

                <ol className="space-y-2">
                  {leaderboard.slice(0, 8).map((entry, idx) => (
                    <li
                      key={entry.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors group"
                    >
                      <span className={`text-sm font-bold tabular-nums w-6 text-center shrink-0 ${
                        idx === 0 ? "text-amber-400" : idx === 1 ? "text-zinc-300" : idx === 2 ? "text-amber-600" : "text-zinc-600"
                      }`}>
                        {idx + 1}
                      </span>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/talks/${entry.id}`}
                          className="text-xs font-medium text-zinc-200 group-hover:text-violet-300 transition-colors truncate block"
                        >
                          {entry.title}
                        </Link>
                        <div className="text-[10px] text-zinc-500 mt-0.5 truncate">
                          {entry.speaker}{entry.company ? ` · ${entry.company}` : ""}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="text-sm font-bold text-white tabular-nums">{entry.connections}</div>
                        <div className="text-[9px] text-zinc-600 uppercase tracking-wider">synapses</div>
                      </div>

                      <div className="shrink-0 w-16 hidden sm:block">
                        <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                            style={{ width: `${Math.round(entry.avgStrength * 100)}%` }}
                          />
                        </div>
                        <div className="text-[9px] text-zinc-600 mt-0.5 text-right tabular-nums">
                          {Math.round(entry.avgStrength * 100)}% avg
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
