"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/ui/Header";
import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts";
import TopSynapsesGrid from "@/components/dashboard/TopSynapsesGrid";
import { LayoutDashboard, Users, Flame, Network } from "lucide-react";
import { motion } from "framer-motion";
import { Talk, Synapse } from "@/types";

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

export default function DashboardPage() {
  const [talks, setTalks] = useState<Talk[]>([]);
  const [synapses, setSynapses] = useState<Synapse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [tRes, sRes] = await Promise.all([
          fetch("/api/talks"),
          fetch("/api/synapses"),
        ]);
        const tData = await tRes.json();
        const sData = await sRes.json();
        if (tData.success) setTalks(tData.talks);
        if (sData.success) setSynapses(sData.synapses);
      } catch (e) {
        console.error("Dashboard load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const uniqueSpeakers = new Set(talks.map((t) => t.speakerId)).size;
  const avgStrength =
    synapses.length > 0
      ? (synapses.reduce((sum, s) => sum + s.strength, 0) / synapses.length) *
        100
      : 0;

  const kpis = [
    {
      label: "Total Sessions",
      value: talks.length,
      suffix: "",
      icon: Flame,
      color: "violet",
    },
    {
      label: "Speakers",
      value: uniqueSpeakers,
      suffix: "",
      icon: Users,
      color: "cyan",
    },
    {
      label: "Avg. Strength",
      value: Math.round(avgStrength),
      suffix: "%",
      icon: Network,
      color: "emerald",
    },
  ];

  const kpiColorMap: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
    violet: {
      bg: "bg-violet-500/8",
      text: "text-violet-400",
      border: "border-violet-500/15",
      gradient: "from-violet-500/10 to-violet-500/0",
    },
    cyan: {
      bg: "bg-cyan-500/8",
      text: "text-cyan-400",
      border: "border-cyan-500/15",
      gradient: "from-cyan-500/10 to-cyan-500/0",
    },
    emerald: {
      bg: "bg-emerald-500/8",
      text: "text-emerald-400",
      border: "border-emerald-500/15",
      gradient: "from-emerald-500/10 to-emerald-500/0",
    },
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
              Analytics Dashboard
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
                    {/* Subtle gradient accent */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${c.gradient}`}
                    />
                    <div className="space-y-1">
                      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                        {kpi.label}
                      </div>
                      <div className="text-2xl font-bold text-white">
                        <KpiCounter target={kpi.value} suffix={kpi.suffix} />
                      </div>
                    </div>
                    <div
                      className={`h-9 w-9 ${c.bg} border ${c.border} ${c.text} rounded-xl flex items-center justify-center`}
                    >
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

            {/* Synapse Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <TopSynapsesGrid synapses={synapses} />
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}
