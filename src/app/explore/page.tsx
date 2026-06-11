import Header from "@/components/ui/Header";
import KnowledgeGraph from "@/components/graph/KnowledgeGraph";
import { prisma } from "@/lib/prisma";
import { Network, Sparkles, GitBranch } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.04]">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/15">
                <Network className="h-4 w-4" />
              </div>
              Knowledge Graph
            </h1>
            <p className="text-sm text-zinc-400">
              Visualize semantic connections and hidden cross-talk intersections
              discovered by AI.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 glass px-3 py-2 rounded-lg">
              <GitBranch className="h-3.5 w-3.5 text-zinc-400" />
              <span className="text-xs text-zinc-300">
                <span className="font-semibold text-white">{talks.length}</span>{" "}
                nodes
              </span>
            </div>
            <div className="flex items-center gap-2 glass px-3 py-2 rounded-lg">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <span className="text-xs text-zinc-300">
                <span className="font-semibold text-white">{synapses.length}</span>{" "}
                synapses
              </span>
            </div>
          </div>
        </div>

        {/* Knowledge Graph container */}
        <div className="flex-1 min-h-[550px] flex flex-col">
          <KnowledgeGraph talks={talks} synapses={synapses} />
        </div>
      </main>
    </div>
  );
}
