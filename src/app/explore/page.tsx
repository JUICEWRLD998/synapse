import Header from "@/components/ui/Header";
import KnowledgeGraph from "@/components/graph/KnowledgeGraph";
import { prisma } from "@/lib/prisma";
import { Network, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  // Fetch data on the server
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
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent flex items-center gap-2.5">
              <Network className="h-8 w-8 text-violet-400" />
              Knowledge Graph
            </h1>
            <p className="text-sm text-zinc-400">
              Visualize semantic connections and hidden cross-talk intersections discovered by AI.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-zinc-900/40 border border-zinc-800 px-4 py-2 rounded-xl backdrop-blur-sm self-start md:self-auto">
            <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />
            <div className="text-xs text-zinc-300">
              <span className="font-semibold text-white">{synapses.length}</span> semantic synapses mapped
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
