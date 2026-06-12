"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Network,
  Calendar,
  Sparkles,
  LayoutDashboard,
  ArrowRight,
  Zap,
  Brain,
  GitBranch,
  Database,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/ui/Header";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Animated Mini Knowledge-Graph (SVG)                                 */
/* ------------------------------------------------------------------ */
function MiniGraph() {
  const nodes = [
    { cx: 80, cy: 60, r: 6, color: "#8B5CF6", delay: 0 },
    { cx: 200, cy: 40, r: 8, color: "#06B6D4", delay: 0.15 },
    { cx: 320, cy: 70, r: 5, color: "#6366F1", delay: 0.3 },
    { cx: 140, cy: 140, r: 7, color: "#06B6D4", delay: 0.2 },
    { cx: 260, cy: 130, r: 9, color: "#8B5CF6", delay: 0.35 },
    { cx: 380, cy: 150, r: 6, color: "#6366F1", delay: 0.1 },
    { cx: 100, cy: 220, r: 5, color: "#8B5CF6", delay: 0.4 },
    { cx: 220, cy: 210, r: 7, color: "#06B6D4", delay: 0.25 },
    { cx: 340, cy: 230, r: 6, color: "#6366F1", delay: 0.45 },
  ];
  const links = [
    [0, 1], [1, 2], [0, 3], [1, 4], [2, 5],
    [3, 4], [4, 5], [3, 6], [4, 7], [5, 8],
    [6, 7], [7, 8], [1, 3], [2, 4],
  ];

  return (
    <svg viewBox="0 0 440 280" className="w-full h-full" fill="none">
      {/* Links */}
      {links.map(([a, b], i) => (
        <motion.line
          key={`l-${i}`}
          x1={nodes[a].cx}
          y1={nodes[a].cy}
          x2={nodes[b].cx}
          y2={nodes[b].cy}
          stroke="url(#linkGrad)"
          strokeWidth="1"
          strokeOpacity="0.3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.5 + i * 0.08 }}
        />
      ))}
      {/* Nodes */}
      {nodes.map((n, i) => (
        <motion.g key={`n-${i}`}>
          {/* Glow */}
          <motion.circle
            cx={n.cx}
            cy={n.cy}
            r={n.r * 2.5}
            fill={n.color}
            opacity={0}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.12, scale: 1 }}
            transition={{ duration: 0.8, delay: n.delay + 0.3 }}
          />
          {/* Core */}
          <motion.circle
            cx={n.cx}
            cy={n.cy}
            r={n.r}
            fill={n.color}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: n.delay + 0.3,
            }}
          />
        </motion.g>
      ))}
      <defs>
        <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Animated Counter                                                    */
/* ------------------------------------------------------------------ */
function AnimatedCounter({ target, label }: { target: number; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const duration = 1500;
          const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl sm:text-4xl font-bold gradient-text-brand">
        {count}+
      </div>
      <div className="text-xs text-zinc-500 mt-1 font-medium">{label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Landing Page                                                        */
/* ------------------------------------------------------------------ */
export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  const features = [
    {
      href: "/explore",
      icon: Network,
      color: "violet",
      title: "Knowledge Graph",
      desc: "Interactive force-directed visualization of sessions linked by semantic synapses.",
      cta: "Launch Graph",
    },
    {
      href: "/schedule",
      icon: Calendar,
      color: "cyan",
      title: "Smart Scheduler",
      desc: "Organize sessions across tracks with live attendance and database persistence.",
      cta: "Open Scheduler",
    },
    {
      href: "/briefing",
      icon: Sparkles,
      color: "indigo",
      title: "AI Briefings",
      desc: "Receive personalized intelligence reports on what you missed and knowledge gaps.",
      cta: "Generate Brief",
    },
    {
      href: "/analytics",
      icon: LayoutDashboard,
      color: "emerald",
      title: "Analytics Dashboard",
      desc: "Content distribution analytics, connection density, and semantic relationship audits.",
      cta: "View Analytics",
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    violet: {
      bg: "bg-violet-500/8",
      text: "text-violet-400",
      border: "border-violet-500/15",
      glow: "group-hover:shadow-violet-500/10",
    },
    cyan: {
      bg: "bg-cyan-500/8",
      text: "text-cyan-400",
      border: "border-cyan-500/15",
      glow: "group-hover:shadow-cyan-500/10",
    },
    indigo: {
      bg: "bg-indigo-500/8",
      text: "text-indigo-400",
      border: "border-indigo-500/15",
      glow: "group-hover:shadow-indigo-500/10",
    },
    emerald: {
      bg: "bg-emerald-500/8",
      text: "text-emerald-400",
      border: "border-emerald-500/15",
      glow: "group-hover:shadow-emerald-500/10",
    },
  };

  const steps = [
    {
      num: "01",
      icon: Calendar,
      title: "Attend Sessions",
      desc: "Select the talks you plan to attend from the interactive scheduler.",
    },
    {
      num: "02",
      icon: Brain,
      title: "AI Discovers Connections",
      desc: "Gemini 2.5 Flash analyzes all talks and discovers hidden semantic connections.",
    },
    {
      num: "03",
      icon: Sparkles,
      title: "Get Personalized Insights",
      desc: "Receive tailored briefings on what you missed and how talks connect.",
    },
  ];

  const techStack = [
    { name: "KendoReact", icon: BarChart3 },
    { name: "Neon PostgreSQL", icon: Database },
    { name: "Google Gemini", icon: Sparkles },
    { name: "D3.js", icon: GitBranch },
    { name: "Next.js", icon: Zap },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* ===== HERO SECTION ===== */}
      <section className="relative flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-16 pb-24 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[120px] pointer-events-none" style={{ animation: "orb-drift-1 20s ease-in-out infinite" }} />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-[400px] h-[400px] rounded-full bg-cyan-500/6 blur-[100px] pointer-events-none" style={{ animation: "orb-drift-2 25s ease-in-out infinite" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />

        <motion.div
          className="max-w-4xl w-full text-center space-y-6 relative z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Badge removed per user request */}

          {/* Headline */}
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-balance"
            variants={itemVariants}
          >
            The Hidden Connections Between{" "}
            <span className="gradient-text-brand">Conference Talks, Found.</span>
          </motion.h1>

          {/* Sub copy */}
          <motion.p
            className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400 leading-relaxed"
            variants={itemVariants}
          >
            At multi-track conferences, you attend ~25% of sessions. You miss 75%
            of the content — and 100% of the connections between them.
            Synapse stitches the event together with AI.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
            variants={itemVariants}
          >
            <Link
              href="/explore"
              className="group inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 hover:shadow-violet-900/40 hover:from-violet-500 hover:to-indigo-500 transition-all"
            >
              Explore Knowledge Graph
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/schedule"
              className="inline-flex h-11 items-center justify-center rounded-xl glass px-6 text-sm font-semibold text-zinc-300 hover:text-white hover:border-zinc-600 transition-all"
            >
              Personalize Schedule
            </Link>
          </motion.div>

          {/* Trust bar */}
          <motion.div
            className="flex items-center justify-center gap-2 text-[11px] text-zinc-500 pt-2"
            variants={itemVariants}
          >
            <span>Powered by</span>
            <span className="text-zinc-400 font-medium">Google Gemini</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-400 font-medium">Neon PostgreSQL</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-400 font-medium">KendoReact</span>
          </motion.div>
        </motion.div>

        {/* Product Preview — animated mini graph + hero image */}
        <motion.div
          className="max-w-3xl w-full mt-14 relative z-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="glass-card rounded-2xl p-1 glow-violet">
            <div className="rounded-xl overflow-hidden bg-[#0a0a14] relative">
              {/* Hero image as background */}
              <div className="absolute inset-0 opacity-40">
                <Image
                  src="/hero-synapse.png"
                  alt="Neural network visualization"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 768px"
                  className="object-cover"
                  priority
                />
              </div>
              {/* Animated graph overlay */}
              <div className="relative z-10 p-6 sm:p-10">
                <MiniGraph />
              </div>
              {/* Gradient overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a0a14] to-transparent z-10" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              How Synapse Works
            </h2>
            <p className="text-sm text-zinc-400 mt-2 max-w-md mx-auto">
              Three simple steps to unlock the full potential of any multi-track
              conference.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Static connecting line (desktop only) */}
            <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-[1px] bg-gradient-to-r from-violet-500/20 via-indigo-500/20 to-cyan-500/20" />

            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  className="relative glass-card rounded-2xl p-6 text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/15 text-violet-400 mb-4 mx-auto">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                    Step {step.num}
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Intelligent Features
            </h2>
            <p className="text-sm text-zinc-400 mt-2 max-w-md mx-auto">
              Every tool you need to maximize your conference experience.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={containerVariants}
          >
            {features.map((f) => {
              const Icon = f.icon;
              const c = colorMap[f.color];
              return (
                <motion.div key={f.href} variants={itemVariants}>
                  <Link
                    href={f.href}
                    className={`group glass-card rounded-2xl p-6 flex flex-col justify-between min-h-[180px] transition-all duration-300 hover:shadow-lg ${c.glow}`}
                  >
                    <div className="space-y-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} ${c.text} border ${c.border} group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-semibold text-white">
                        {f.title}
                      </h3>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-semibold ${c.text} flex items-center gap-1 mt-4 group-hover:translate-x-0.5 transition-transform`}
                    >
                      {f.cta}
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ===== ANIMATED STATS ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y border-white/[0.04]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
          <AnimatedCounter target={15} label="Conference Talks" />
          <AnimatedCounter target={10} label="Expert Speakers" />
          <AnimatedCounter target={9} label="Synapses Discovered" />
          <AnimatedCounter target={7} label="Kendo Components" />
        </div>
      </section>

      {/* ===== TECH STACK ===== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-8">
            Built With
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {techStack.map((tech) => {
              const Icon = tech.icon;
              return (
                <div
                  key={tech.name}
                  className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{tech.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/[0.04] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Zap className="h-2.5 w-2.5 text-white" />
            </div>
            <span className="font-medium text-zinc-400">Synapse</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/explore" className="hover:text-zinc-300 transition-colors">Explore</Link>
            <Link href="/schedule" className="hover:text-zinc-300 transition-colors">Schedule</Link>
            <Link href="/briefing" className="hover:text-zinc-300 transition-colors">Briefing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
