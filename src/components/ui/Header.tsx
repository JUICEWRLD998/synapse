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
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { name: "Explore",   href: "/explore",   icon: Network         },
    { name: "Schedule",  href: "/schedule",  icon: Calendar        },
    { name: "Briefing",  href: "/briefing",  icon: Sparkles        },
    { name: "Analytics", href: "/analytics", icon: LayoutDashboard },
    { name: "Admin",     href: "/admin",     icon: Settings        },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Gradient top accent line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      <div
        className={`glass-strong transition-all duration-300 ${scrolled ? "shadow-lg shadow-black/20" : "shadow-none"}`}
        style={{ background: scrolled ? "rgba(9,9,11,0.92)" : "rgba(15,15,18,0.8)" }}
      >
        <div className="mx-auto flex max-w-7xl h-14 items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/20 group-hover:shadow-violet-900/40 transition-shadow overflow-hidden">
              <Activity className="h-4 w-4 relative z-10" />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">SYNAPSE</span>
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
                    isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white/[0.06] rounded-lg border border-white/[0.08]"
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
          <div className="flex items-center gap-2.5">
            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/8 text-emerald-400 border border-emerald-500/15">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Live
            </span>

            <Link
              href="/schedule"
              className="hidden sm:inline-flex h-8 items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-[12px] font-semibold text-white hover:from-violet-500 hover:to-indigo-500 transition-all hover:shadow-lg hover:shadow-violet-900/20"
            >
              Get Started
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
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
                background: "rgba(9, 9, 11, 0.97)",
                backdropFilter: "blur(24px) saturate(1.4)",
                WebkitBackdropFilter: "blur(24px) saturate(1.4)",
                borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
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
                          ? "text-white bg-white/[0.06] border border-white/[0.08]"
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-violet-400" : ""}`} />
                      {item.name}
                    </Link>
                  );
                })}
                <div className="border-t border-white/[0.06] mt-3 pt-3">
                  <Link
                    href="/schedule"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-semibold text-white"
                  >
                    Get Started
                  </Link>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
