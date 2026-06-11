"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, Calendar, Sparkles, Network } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { name: "Explore Graph", href: "/explore", icon: Network },
    { name: "Scheduler", href: "/schedule", icon: Calendar },
    { name: "AI Briefing", href: "/briefing", icon: Sparkles },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-900/30 transition-transform group-hover:scale-105">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              SYNAPSE
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-zinc-850 text-white shadow-inner border border-zinc-700/50"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-violet-400" : "text-zinc-500"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Neon PostgreSQL Live
          </span>
          
          <Link
            href="/schedule"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-xs font-semibold text-white shadow-md shadow-violet-900/20 hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-900/40 transition-all"
          >
            Get Started
          </Link>
        </div>
      </div>
      
      {/* Mobile nav indicator bar */}
      <div className="flex md:hidden border-t border-zinc-800 bg-zinc-950 px-2 py-1 justify-around text-[10px]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded text-[10px] ${
                isActive ? "text-violet-400 font-semibold" : "text-zinc-400"
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              <span>{item.name.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
