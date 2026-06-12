"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [signUpClicked, setSignUpClicked] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignUp = () => {
    setSignUpClicked(true);
    setTimeout(() => setSignUpClicked(false), 2500);
  };

  const navItems = [
    { name: "Explore",   href: "/explore"   },
    { name: "Schedule",  href: "/schedule"  },
    { name: "Briefing",  href: "/briefing"  },
    { name: "Analytics", href: "/analytics" },
    { name: "Admin",     href: "/admin"     },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Gradient top accent line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      <div
        className={`glass-strong transition-all duration-300 ${scrolled ? "shadow-lg shadow-black/20" : "shadow-none"}`}
        style={{ background: scrolled ? "rgba(10,10,20,0.95)" : "rgba(14,14,26,0.82)" }}
      >
        <div className="mx-auto flex max-w-7xl h-14 items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="text-base font-bold tracking-tight text-white">SYNAPSE</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
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
                  <span className="relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSignUp}
              suppressHydrationWarning
              className="hidden sm:inline-flex h-8 items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-[12px] font-semibold text-white hover:from-violet-500 hover:to-indigo-500 transition-all hover:shadow-lg hover:shadow-violet-900/20 min-w-[90px]"
            >
              {signUpClicked ? "Coming Soon" : "Sign Up"}
            </button>

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
                background: "rgba(10, 10, 20, 0.97)",
                backdropFilter: "blur(24px) saturate(1.4)",
                WebkitBackdropFilter: "blur(24px) saturate(1.4)",
                borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "text-white bg-white/[0.06] border border-white/[0.08]"
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
                <div className="border-t border-white/[0.06] mt-3 pt-3">
                  <button
                    suppressHydrationWarning
                    onClick={() => { setMobileOpen(false); handleSignUp(); }}
                    className="flex w-full items-center justify-center py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-semibold text-white"
                  >
                    {signUpClicked ? "Coming Soon" : "Sign Up"}
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
