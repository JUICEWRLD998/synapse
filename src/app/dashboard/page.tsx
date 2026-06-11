import Header from "@/components/ui/Header";
import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts";
import TopSynapsesGrid from "@/components/dashboard/TopSynapsesGrid";
import { prisma } from "@/lib/prisma";
import { LayoutDashboard, Users, Flame, Network } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Fetch database records server-side
  const talks = await prisma.talk.findMany({
    include: {
      speaker: true,
      track: true,
    },
  });

  const synapses = await prisma.synapse.findMany({
    include: {
      talkA: {
        include: {
          speaker: true,
          track: true,
        },
      },
      talkB: {
        include: {
          speaker: true,
          track: true,
        },
      },
    },
  });

  // Calculate metrics
  const uniqueSpeakers = new Set(talks.map((t) => t.speakerId)).size;
  const avgStrength = synapses.length > 0 
    ? (synapses.reduce((sum, s) => sum + s.strength, 0) / synapses.length) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent flex items-center gap-2.5">
              <LayoutDashboard className="h-8 w-8 text-violet-400" />
              Organizer Intelligence
            </h1>
            <p className="text-sm text-zinc-400">
              High-level content distribution analytics, connection density, and semantic relationship audits.
            </p>
          </div>
        </div>

        {/* Analytics KPI Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 border border-zinc-800 bg-zinc-900/20 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Presentations</div>
              <div className="text-3xl font-extrabold text-white">{talks.length}</div>
            </div>
            <div className="h-10 w-10 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl flex items-center justify-center">
              <Flame className="h-5 w-5" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 border border-zinc-800 bg-zinc-900/20 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Speakers Scheduled</div>
              <div className="text-3xl font-extrabold text-white">{uniqueSpeakers}</div>
            </div>
            <div className="h-10 w-10 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 border border-zinc-800 bg-zinc-900/20 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Average Synapse Strength</div>
              <div className="text-3xl font-extrabold text-white">{avgStrength.toFixed(0)}%</div>
            </div>
            <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
              <Network className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Kendo Charts Section */}
        <AnalyticsCharts talks={talks} synapses={synapses} />

        {/* Kendo Grid Section */}
        <TopSynapsesGrid synapses={synapses} />
      </main>
    </div>
  );
}
