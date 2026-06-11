import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/analytics
 *
 * Returns pre-computed organizer intelligence metrics:
 * - Topic coverage (tag frequencies)
 * - Synapse type distribution
 * - Speaker overlap (talks sharing 2+ tags by different speakers)
 * - Most-connected talks (synapse leaderboard)
 * - Content gaps (tags with only 1 mention across all talks)
 */
export async function GET() {
  try {
    const [talks, synapses] = await Promise.all([
      prisma.talk.findMany({
        include: { speaker: true, track: true },
      }),
      prisma.synapse.findMany({
        include: {
          talkA: { include: { speaker: true } },
          talkB: { include: { speaker: true } },
        },
      }),
    ]);

    // ── Tag frequencies ──────────────────────────────────────────────────────
    const tagCounts: Record<string, number> = {};
    talks.forEach((t) => {
      t.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const topicCoverage = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    // ── Synapse type distribution ─────────────────────────────────────────────
    const typeCounts: Record<string, number> = {
      complementary: 0,
      contradictory: 0,
      foundational: 0,
      "cross-domain": 0,
      evolutionary: 0,
    };
    synapses.forEach((s) => {
      if (s.type in typeCounts) typeCounts[s.type]++;
    });
    const synapseTypes = Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
    }));

    // ── Most-connected talks leaderboard ─────────────────────────────────────
    const connectionCounts: Record<string, number> = {};
    synapses.forEach((s) => {
      connectionCounts[s.talkAId] = (connectionCounts[s.talkAId] || 0) + 1;
      connectionCounts[s.talkBId] = (connectionCounts[s.talkBId] || 0) + 1;
    });

    const talkLeaderboard = talks
      .map((t) => ({
        id: t.id,
        title: t.title,
        speaker: t.speaker.name,
        company: t.speaker.company ?? "",
        track: t.track.name,
        connections: connectionCounts[t.id] ?? 0,
        avgStrength:
          synapses
            .filter((s) => s.talkAId === t.id || s.talkBId === t.id)
            .reduce((sum, s) => sum + s.strength, 0) /
            Math.max(connectionCounts[t.id] ?? 0, 1),
      }))
      .sort((a, b) => b.connections - a.connections);

    // ── Speaker leaderboard ───────────────────────────────────────────────────
    const speakerConnections: Record<
      string,
      { name: string; company: string; connections: number }
    > = {};
    talks.forEach((t) => {
      const key = t.speakerId;
      if (!speakerConnections[key]) {
        speakerConnections[key] = {
          name: t.speaker.name,
          company: t.speaker.company ?? "",
          connections: 0,
        };
      }
      speakerConnections[key].connections += connectionCounts[t.id] ?? 0;
    });
    const speakerLeaderboard = Object.values(speakerConnections).sort(
      (a, b) => b.connections - a.connections
    );

    // ── Content gaps — tags mentioned only once ───────────────────────────────
    const contentGaps = Object.entries(tagCounts)
      .filter(([, count]) => count === 1)
      .map(([tag]) => ({ tag, count: 1 }));

    // ── Speaker overlap (pairs of talks from different speakers sharing ≥2 tags) ──
    const speakerOverlap: Array<{
      talkA: string;
      speakerA: string;
      talkB: string;
      speakerB: string;
      sharedTags: string[];
    }> = [];

    for (let i = 0; i < talks.length; i++) {
      for (let j = i + 1; j < talks.length; j++) {
        const a = talks[i];
        const b = talks[j];
        if (a.speakerId === b.speakerId) continue;
        const shared = a.tags.filter((tag) => b.tags.includes(tag));
        if (shared.length >= 2) {
          speakerOverlap.push({
            talkA: a.title,
            speakerA: a.speaker.name,
            talkB: b.title,
            speakerB: b.speaker.name,
            sharedTags: shared,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      analytics: {
        topicCoverage,
        synapseTypes,
        talkLeaderboard,
        speakerLeaderboard,
        contentGaps,
        speakerOverlap,
        summary: {
          totalTalks: talks.length,
          totalSpeakers: new Set(talks.map((t) => t.speakerId)).size,
          totalSynapses: synapses.length,
          avgSynapseStrength:
            synapses.length > 0
              ? synapses.reduce((sum, s) => sum + s.strength, 0) /
                synapses.length
              : 0,
        },
      },
    });
  } catch (error) {
    console.error("Analytics endpoint error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
