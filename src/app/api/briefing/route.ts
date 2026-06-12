import { NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { callGeminiWithRetry } from "@/lib/gemini";

const DEMO_USER_ID = "demo-user";

interface BriefingContent {
  deeperConnections: Array<{ talkA: string; talkB: string; reason: string }>;
  whatYouMissed: Array<{ talk: string; speaker: string; connectionToYourTalks: string; whyItMatters: string }>;
  knowledgeGaps: Array<{ topic: string; gapExplanation: string; recommendedAction: string }>;
  recommendedRecordings: Array<{ talkId: string; title: string; speaker: string; priority: "High" | "Medium" | "Low"; reason: string }>;
}

/** Static briefing shown when the database is completely unreachable. */
function buildOfflineFallback(): BriefingContent {
  return {
    deeperConnections: [
      {
        talkA: "React Server Components: The Execution Model Deep Dive",
        talkB: "The Future of Streaming: Suspense, PPR, and Partial Hydration",
        reason:
          "RSC is the foundational layer that makes PPR possible — Suspense boundaries split static shells from streamed dynamic slots, and understanding the RSC execution model is essential to wiring PPR correctly.",
      },
      {
        talkA: "React Compiler: Say Goodbye to useMemo and useCallback",
        talkB: "Reactive Compilation: Svelte's Approach to UI Architecture",
        reason:
          "Both talks converge on compile-time optimisation as the future of UI: React automates VDOM memoisation at build time while Svelte eliminates the VDOM entirely — two routes to the same destination.",
      },
    ],
    whatYouMissed: [
      {
        talk: "Building at the Edge: Serverless Compute Architectures",
        speaker: "Guillermo Rauch",
        connectionToYourTalks:
          "Directly extends RSC — deploying Server Components at the CDN edge removes the latency that makes streaming impractical.",
        whyItMatters:
          "Edge compute is what turns RSC's theoretical performance gains into real sub-50ms renders for global users.",
      },
      {
        talk: "AI-First Frontend: Agentic UI Generation and WebMCP",
        speaker: "Lee Robinson",
        connectionToYourTalks:
          "Connects to deterministic state talks — understanding agentic UI generation requires knowing exactly where traditional state management must hold the line.",
        whyItMatters:
          "WebMCP lets LLM agents operate KendoReact components as tools, which is the next evolution of the component model.",
      },
    ],
    knowledgeGaps: [
      {
        topic: "WebAssembly & Native Compute",
        gapExplanation:
          "Your session selections focus on React rendering and compilation. No Wasm coverage means you are missing how compute-heavy tasks (image processing, crypto) escape JS's single-threaded limits.",
        recommendedAction:
          "Watch Lin Clark's 'WebAssembly: Elevating Heavy Calculations Beyond JS Limits' — it pairs directly with the runtime benchmarking talk.",
      },
      {
        topic: "Micro-Frontend Architecture at Scale",
        gapExplanation:
          "Module Federation 2.0 wasn't in your schedule. At the scale where RSC and Edge are relevant, MFE is the organisational pattern that makes independent deployments feasible.",
        recommendedAction:
          "Review Guillermo Rauch's 'Micro-Frontends at Scale: Module Federation 2.0' for the edge-stitching pattern.",
      },
    ],
    recommendedRecordings: [
      {
        talkId: "fallback-1",
        title: "Building at the Edge: Serverless Compute Architectures",
        speaker: "Guillermo Rauch",
        priority: "High",
        reason: "Strongest synapse with RSC talks — foundational for understanding where RSC runs in production.",
      },
      {
        talkId: "fallback-2",
        title: "Signals vs. VDOM: A Framework War Analysis",
        speaker: "Rich Harris",
        priority: "High",
        reason: "Directly extends the React Compiler and Svelte compilation talks you attended.",
      },
      {
        talkId: "fallback-3",
        title: "TypeScript Performance Patterns for Large Codebases",
        speaker: "Sarah Drasner",
        priority: "Medium",
        reason: "Pairs well with compiler-heavy sessions — shows the tooling cost at monorepo scale.",
      },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET — return saved briefing
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const briefing = await withRetry(() =>
      prisma.briefing.findUnique({ where: { userId: DEMO_USER_ID } })
    );
    return NextResponse.json({ success: true, briefing });
  } catch (error) {
    console.error("Failed to fetch briefing:", error);
    // Return success:true with null so the UI renders the "generate" state
    // rather than an error screen.
    return NextResponse.json({ success: true, briefing: null });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST — generate briefing
// ─────────────────────────────────────────────────────────────────────────────
export async function POST() {
  // ── 1. Load attendance (with retry + graceful fallback) ───────────────────
  let attendance: Awaited<ReturnType<typeof prisma.attendance.findMany>> = [];
  let allTalks:   Awaited<ReturnType<typeof prisma.talk.findMany>>       = [];
  let synapses:   Awaited<ReturnType<typeof prisma.synapse.findMany>>    = [];
  let dbAvailable = true;

  try {
    [attendance, allTalks] = await Promise.all([
      withRetry(() =>
        prisma.attendance.findMany({
          where: { userId: DEMO_USER_ID },
          include: { talk: { include: { speaker: true, track: true } } },
        })
      ),
      withRetry(() =>
        prisma.talk.findMany({ include: { speaker: true, track: true } })
      ),
    ]);

    if (attendance.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please mark at least one talk as attended on the Schedule page before generating your briefing." },
        { status: 400 }
      );
    }

    const attendedTalkIds = attendance.map((a) => a.talk.id);
    synapses = await withRetry(() =>
      prisma.synapse.findMany({
        where: { OR: [{ talkAId: { in: attendedTalkIds } }, { talkBId: { in: attendedTalkIds } }] },
        include: { talkA: { include: { speaker: true } }, talkB: { include: { speaker: true } } },
      })
    );
  } catch (dbError) {
    console.error("DB unavailable during briefing generation:", dbError);
    dbAvailable = false;
  }

  // ── 2. If DB is completely down, return offline fallback immediately ───────
  if (!dbAvailable) {
    const offlineContent = buildOfflineFallback();
    const offlineDna =
      "Database temporarily unavailable — showing a curated sample briefing based on conference content. Reconnect and regenerate for a personalised report.";

    return NextResponse.json({
      success: true,
      method: "offline-fallback",
      briefing: {
        id: "offline",
        userId: DEMO_USER_ID,
        content: offlineContent,
        conferenceDna: offlineDna,
        createdAt: new Date().toISOString(),
      },
    });
  }

  // ── 3. Build briefing from real data ─────────────────────────────────────
  const attendedTalks   = attendance.map((a) => a.talk);
  const attendedTalkIds = attendedTalks.map((t) => t.id);
  const missedTalks     = allTalks.filter((t) => !attendedTalkIds.includes(t.id));

  let briefingContent: BriefingContent;
  let methodUsed = "gemini";

  // ── 3a. Try Gemini ────────────────────────────────────────────────────────
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("YOUR_GEMINI")) {
      throw new Error("Invalid Gemini API key");
    }

    const prompt = `You are Synapse, an AI conference intelligence engine. Generate a personalized conference briefing based on the user's attended talks and the discovered connection synapses.

## ATTENDED TALKS:
${attendedTalks.map((t) => `- "${t.title}" by ${t.speaker.name} (Tags: ${t.tags.join(", ")})`).join("\n")}

## DISCOVERED SYNAPSE CONNECTIONS:
${synapses.map((s) => `- "${s.talkA.title}" <-> "${s.talkB.title}" (${s.type}, strength ${s.strength})\n  Insight: ${s.insight}\n  Implication: ${s.attendeeImplication}`).join("\n")}

## MISSED TALKS:
${missedTalks.map((t) => `- "${t.title}" by ${t.speaker.name} (Tags: ${t.tags.join(", ")}, ID: ${t.id})`).join("\n")}

Return ONLY a valid JSON object (no markdown, no backticks) matching this shape:
{
  "deeperConnections": [{ "talkA": "", "talkB": "", "reason": "" }],
  "whatYouMissed": [{ "talk": "", "speaker": "", "connectionToYourTalks": "", "whyItMatters": "" }],
  "knowledgeGaps": [{ "topic": "", "gapExplanation": "", "recommendedAction": "" }],
  "recommendedRecordings": [{ "talkId": "", "title": "", "speaker": "", "priority": "High"|"Medium"|"Low", "reason": "" }]
}`;

    const aiResponse = await callGeminiWithRetry(prompt, {
      maxAttempts: 3,
      baseDelayMs: 2000,
      perAttemptTimeoutMs: 30_000,
    });
    const cleanJson  = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    briefingContent  = JSON.parse(cleanJson);
  } catch (apiError) {
    console.warn("Gemini unavailable, building data-driven fallback:", apiError);
    methodUsed = "fallback";

    // ── 3b. Data-driven fallback using actual DB synapses ─────────────────
    const internalSynapses = synapses.filter(
      (s) => attendedTalkIds.includes(s.talkAId) && attendedTalkIds.includes(s.talkBId)
    );

    const deeperConnections = internalSynapses.map((s) => ({
      talkA:  s.talkA.title,
      talkB:  s.talkB.title,
      reason: s.insight,
    }));

    if (deeperConnections.length === 0 && attendedTalks.length >= 2) {
      deeperConnections.push({
        talkA:  attendedTalks[0].title,
        talkB:  attendedTalks[1].title,
        reason: "Both talks address modern front-end engineering — client-server coordination, performance optimisation, and developer workflow scaling.",
      });
    }

    const boundarySynapses = synapses.filter(
      (s) =>
        (attendedTalkIds.includes(s.talkAId) && !attendedTalkIds.includes(s.talkBId)) ||
        (!attendedTalkIds.includes(s.talkAId) && attendedTalkIds.includes(s.talkBId))
    );

    const whatYouMissedList: BriefingContent["whatYouMissed"]       = [];
    const recommendedRecordingsList: BriefingContent["recommendedRecordings"] = [];

    for (const s of boundarySynapses.slice(0, 3)) {
      const attended = attendedTalkIds.includes(s.talkAId) ? s.talkA : s.talkB;
      const missed   = attendedTalkIds.includes(s.talkAId) ? s.talkB : s.talkA;
      whatYouMissedList.push({
        talk:                 missed.title,
        speaker:              missed.speaker?.name || "Expert Speaker",
        connectionToYourTalks: `Directly related to "${attended.title}" via ${s.concepts[0] || "shared architecture patterns"}.`,
        whyItMatters:         s.insight,
      });
      recommendedRecordingsList.push({
        talkId:   missed.id,
        title:    missed.title,
        speaker:  missed.speaker?.name || "Expert Speaker",
        priority: s.strength > 0.85 ? "High" : "Medium",
        reason:   s.attendeeImplication,
      });
    }

    if (whatYouMissedList.length === 0 && missedTalks.length > 0) {
      const m = missedTalks[0];
      whatYouMissedList.push({
        talk: m.title, speaker: m.speaker.name,
        connectionToYourTalks: "A parallel-track session with related architectural themes.",
        whyItMatters: m.abstract,
      });
      recommendedRecordingsList.push({
        talkId: m.id, title: m.title, speaker: m.speaker.name,
        priority: "Medium", reason: "Highly related to your attended sessions.",
      });
    }

    const attendedTags = new Set(attendedTalks.flatMap((t) => t.tags));
    const knowledgeGaps: BriefingContent["knowledgeGaps"] = [];

    if (!attendedTags.has("ai") && !attendedTags.has("agents"))
      knowledgeGaps.push({ topic: "AI-First Interfaces & Agents", gapExplanation: "No talks on LLMs, WebMCP, or agentic UI generation in your selection.", recommendedAction: "Watch Lee Robinson's 'AI-First Frontend: Agentic UI Generation and WebMCP'." });
    if (!attendedTags.has("css") && !attendedTags.has("design-systems"))
      knowledgeGaps.push({ topic: "Modern Styling & Native Web APIs", gapExplanation: "Skipped zero-runtime CSS and browser-native styling sessions.", recommendedAction: "Review Sophie Alpert on Compiler-First Styles or Una Kravets on Web Platform Features." });
    if (!attendedTags.has("performance") && !attendedTags.has("wasm"))
      knowledgeGaps.push({ topic: "High-Performance Compilation", gapExplanation: "Missed WebAssembly and TypeScript compiler performance sessions.", recommendedAction: "Watch Lin Clark on WebAssembly or Sarah Drasner on TypeScript Performance." });
    if (knowledgeGaps.length === 0)
      knowledgeGaps.push({ topic: "Cross-Framework Paradigms", gapExplanation: "Your selections are balanced — explore alternative compilation models.", recommendedAction: "Watch Rich Harris's Svelte vs. React comparison." });

    briefingContent = { deeperConnections, whatYouMissed: whatYouMissedList, knowledgeGaps, recommendedRecordings: recommendedRecordingsList };
  }

  // ── 4. Conference DNA ─────────────────────────────────────────────────────
  const trackCounts: Record<string, number> = {};
  const tagCounts:   Record<string, number> = {};
  attendedTalks.forEach((t) => {
    trackCounts[t.track.name] = (trackCounts[t.track.name] || 0) + 1;
    t.tags.forEach((tag) => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; });
  });

  const primaryTrack = Object.entries(trackCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Web Development";
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t).join(", ");
  const conferenceDna = `Your conference focus centred on "${primaryTrack}" with a deep interest in: ${topTags || "general architecture"}. You gravitated toward compiler-driven and client-server coordination patterns.`;

  // ── 5. Persist to DB (best-effort — don't crash if it fails) ─────────────
  let savedBriefing: { id: string; userId: string; content: unknown; conferenceDna: string; createdAt: Date } | null = null;
  try {
    savedBriefing = await withRetry(() =>
      prisma.briefing.upsert({
        where:  { userId: DEMO_USER_ID },
        update: { content: briefingContent as never, conferenceDna },
        create: { userId: DEMO_USER_ID, content: briefingContent as never, conferenceDna },
      })
    );
  } catch (saveError) {
    console.error("Could not persist briefing to DB (non-fatal):", saveError);
  }

  // Return the in-memory briefing if DB save failed
  const responseBriefing = savedBriefing ?? {
    id:           "in-memory",
    userId:       DEMO_USER_ID,
    content:      briefingContent,
    conferenceDna,
    createdAt:    new Date().toISOString(),
  };

  return NextResponse.json({ success: true, method: methodUsed, briefing: responseBriefing });
}
