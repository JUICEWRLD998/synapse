"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Activity,
  LayoutDashboard,
  Calendar,
  Sparkles,
  Network,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Theme helpers ───────────────────────────────────────────────── */
function getInitialTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("synapse-theme") as "dark" | "light" | null;
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme: "dark" | "light") {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  // Tailwind dark-mode class approach (in case Tailwind class strategy is used)
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  localStorage.setItem("synapse-theme", theme);
}

export default function Header() {
  const pathname   = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [theme,      setTheme]      = useState<"dark" | "light">("dark");
  const [mounted,    setMounted]    = useState(false);

  // Initialise theme on mount (client-only)
  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  const navItems = [
    { name: "Explore",    href: "/explore",    icon: Network        },
    { name: "Schedule",   href: "/schedule",   icon: Calendar       },
    { name: "Briefing",   href: "/briefing",   icon: Sparkles       },
    { name: "Analytics",  href: "/analytics",  icon: LayoutDashboard},
  ];

  const headerBg = scrolled
    ? theme === "dark" ? "rgba(9,9,11,0.95)"    : "rgba(255,255,255,0.95)"
    : theme === "dark" ? "rgba(15,15,18,0.80)"  : "rgba(255,255,255,0.80)";

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Gradient accent line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      <div
        className={`glass-strong transition-all duration-300 ${scrolled ? "shadow-lg shadow-black/10" : "shadow-none"}`}
        style={{ background: headerBg }}
      >
        <div className="mx-auto flex max-w-7xl h-14 items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/20 group-hover:shadow-violet-900/40 transition-shadow overflow-hidden">
              <Activity className="h-4 w-4 relative z-10" />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-base font-bold tracking-tight text-zinc-900 dark-text-white" style={{ color: theme === "dark" ? "#fff" : "#09090b" }}>
              SYNAPSE
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? theme === "dark" ? "text-white" : "text-zinc-900"
                      : theme === "dark" ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute inset-0 rounded-lg border ${
                        theme === "dark"
                          ? "bg-white/[0.06] border-white/[0.08]"
                          : "bg-black/[0.05] border-black/[0.06]"
                      }`}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={`h-3.5 w-3.5 relative z-10 ${isActive ? "text-violet-400" : ""}`} />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-2">

            {/* Live pill */}
            <span className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              theme === "dark"
                ? "bg-emerald-500/8 text-emerald-400 border-emerald-500/15"
                : "bg-emerald-50 text-emerald-600 border-emerald-200"
            }`}>
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Live
            </span>

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                  theme === "dark"
                    ? "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]"
                    : "text-zinc-500 hover:text-zinc-800 hover:bg-black/[0.05]"
                }`}
              >
                {theme === "dark"
                  ? <Sun  className="h-4 w-4" />
                  : <Moon className="h-4 w-4" />
                }
              </button>
            )}

            {/* Get Started CTA */}
            <Link
              href="/schedule"
              className="hidden sm:inline-flex h-8 items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-[12px] font-semibold text-white hover:from-violet-500 hover:to-indigo-500 transition-all hover:shadow-lg hover:shadow-violet-900/20"
            >
              Get Started
            </Link>

            {/* Mobile burger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                theme === "dark"
                  ? "text-zinc-400 hover:text-white hover:bg-white/5"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-black/5"
              }`}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-[57px] bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-[57px] right-0 bottom-0 w-64 z-50 md:hidden p-4"
              style={{
                background: theme === "dark" ? "rgba(9,9,11,0.97)" : "rgba(255,255,255,0.97)",
                backdropFilter: "blur(24px) saturate(1.4)",
                WebkitBackdropFilter: "blur(24px) saturate(1.4)",
                borderLeft: theme === "dark"
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? theme === "dark"
                            ? "text-white bg-white/[0.06] border border-white/[0.08]"
                            : "text-zinc-900 bg-black/[0.05] border border-black/[0.06]"
                          : theme === "dark"
                            ? "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                            : "text-zinc-500 hover:text-zinc-900 hover:bg-black/[0.03]"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-violet-400" : ""}`} />
                      {item.name}
                    </Link>
                  );
                })}

                <div className={`border-t mt-3 pt-3 space-y-2 ${theme === "dark" ? "border-white/[0.06]" : "border-black/[0.06]"}`}>
                  <Link
                    href="/schedule"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-semibold text-white"
                  >
                    Get Started
                  </Link>
                  <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                      theme === "dark"
                        ? "text-zinc-400 border-white/[0.06] hover:bg-white/[0.03]"
                        : "text-zinc-600 border-black/[0.06] hover:bg-black/[0.03]"
                    }`}
                  >
                    {theme === "dark"
                      ? <><Sun  className="h-4 w-4" />Switch to Light</>
                      : <><Moon className="h-4 w-4" />Switch to Dark</>
                    }
                  </button>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
