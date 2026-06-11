import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/ui/Header";
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Tag,
  Sparkles,
  Network,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface TalkPageProps {
  params: Promise<{ id: string }>;
}

const typeColors: Record<string, string> = {
  complementary: "#10B981",
  contradictory: "#EF4444",
  foundational: "#3B82F6",
  "cross-domain": "#F59E0B",
  evolutionary: "#EC4899",
};

export default async function TalkDetailPage({ params }: TalkPageProps) {
  const { id } = await params;

  const talk = await prisma.talk.findUnique({
    where: { id },
    include: {
      speaker: true,
      track: true,
    },
  });

  if (!talk) notFound();

  // Fetch all synapses that involve this talk
  const synapses = await prisma.synapse.findMany({
    where: {
      OR: [{ talkAId: id }, { talkBId: id }],
    },
    include: {
      talkA: { include: { speaker: true } },
      talkB: { include: { speaker: true } },
    },
    orderBy: { strength: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Back navigation */}
        <Link
          href="/schedule"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Schedule
        </Link>

        {/* Talk header */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: talk.track?.color }}
            />
            <span className="text-xs font-medium text-zinc-400">
              {talk.track?.name}
            </span>
            <span className="text-zinc-700">·</span>
            <span className="text-xs text-zinc-500">Day {talk.day}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
            {talk.title}
          </h1>

          {/* Speaker card */}
          <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-900/40 text-violet-300 shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-zinc-100 text-sm">
                {talk.speaker.name}
              </div>
              <div className="text-xs text-zinc-500">
                {talk.speaker.company || "Independent"}
              </div>
              {talk.speaker.bio && (
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed max-w-lg">
                  {talk.speaker.bio}
                </p>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-zinc-500" />
              <span>Day {talk.day}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-zinc-500" />
              <span>
                {new Date(talk.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" — "}
                {new Date(talk.endTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Network className="h-3.5 w-3.5 text-violet-400" />
              <span>
                <span className="text-white font-semibold">{synapses.length}</span> synapse
                {synapses.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Abstract */}
          <div className="space-y-2">
            <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              Abstract
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{talk.abstract}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {talk.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 text-[10px] font-medium bg-white/[0.04] text-zinc-400 px-2.5 py-0.5 rounded border border-white/[0.06]"
              >
                <Tag className="h-2.5 w-2.5 text-zinc-600" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Synapses section */}
        {synapses.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-400" />
              Connected Synapses ({synapses.length})
            </h2>

            <div className="space-y-3">
              {synapses.map((syn) => {
                const other = syn.talkAId === id ? syn.talkB : syn.talkA;
                const color = typeColors[syn.type] || "#71717a";
                return (
                  <div
                    key={syn.id}
                    className="glass-card rounded-xl p-5 space-y-3 border-l-2"
                    style={{ borderLeftColor: color }}
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-0.5">
                        <div
                          className="text-[10px] font-semibold uppercase tracking-wider"
                          style={{ color }}
                        >
                          {syn.type}
                        </div>
                        <Link
                          href={`/talks/${other.id}`}
                          className="text-sm font-semibold text-white hover:text-violet-300 transition-colors"
                        >
                          {other.title}
                        </Link>
                        <div className="text-xs text-zinc-500">
                          {other.speaker?.name}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-zinc-500">Strength</div>
                        <div className="text-sm font-bold text-white">
                          {(syn.strength * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {syn.insight}
                    </p>

                    <p className="text-[11px] italic text-violet-300 bg-violet-950/15 border border-violet-900/20 px-3 py-2 rounded-lg">
                      &ldquo;{syn.attendeeImplication}&rdquo;
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {syn.concepts.map((c) => (
                        <span
                          key={c}
                          className="text-[10px] bg-white/[0.04] text-zinc-400 px-2 py-0.5 rounded border border-white/[0.06]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {synapses.length === 0 && (
          <div className="glass-card rounded-2xl p-8 text-center space-y-2">
            <Network className="h-8 w-8 text-zinc-600 mx-auto" />
            <p className="text-sm text-zinc-500">
              No synapses discovered yet for this talk.
            </p>
            <p className="text-xs text-zinc-600">
              Trigger analysis from the{" "}
              <Link href="/explore" className="text-violet-400 hover:underline">
                Knowledge Graph
              </Link>{" "}
              page.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
