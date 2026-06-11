import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callGemini } from "@/lib/gemini";

const DEMO_USER_ID = "demo-user";

// Structured types matching Briefing content
interface BriefingContent {
  deeperConnections: Array<{ talkA: string; talkB: string; reason: string }>;
  whatYouMissed: Array<{ talk: string; speaker: string; connectionToYourTalks: string; whyItMatters: string }>;
  knowledgeGaps: Array<{ topic: string; gapExplanation: string; recommendedAction: string }>;
  recommendedRecordings: Array<{ talkId: string; title: string; speaker: string; priority: "High" | "Medium" | "Low"; reason: string }>;
}

export async function GET() {
  try {
    const briefing = await prisma.briefing.findUnique({
      where: { userId: DEMO_USER_ID },
    });

    return NextResponse.json({
      success: true,
      briefing,
    });
  } catch (error) {
    console.error("Failed to fetch briefing:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // 1. Get attended talks
    const attendance = await prisma.attendance.findMany({
      where: { userId: DEMO_USER_ID },
      include: {
        talk: {
          include: {
            speaker: true,
            track: true,
          }
        }
      }
    });

    if (attendance.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please attend at least one talk on the schedule before generating your briefing." },
        { status: 400 }
      );
    }

    const attendedTalks = attendance.map(a => a.talk);
    const attendedTalkIds = attendedTalks.map(t => t.id);

    // 2. Fetch all talks and speakers to analyze gaps/missed content
    const allTalks = await prisma.talk.findMany({
      include: { speaker: true, track: true }
    });

    const missedTalks = allTalks.filter(t => !attendedTalkIds.includes(t.id));

    // 3. Fetch synapses that involve the attended talks
    const synapses = await prisma.synapse.findMany({
      where: {
        OR: [
          { talkAId: { in: attendedTalkIds } },
          { talkBId: { in: attendedTalkIds } }
        ]
      },
      include: {
        talkA: { include: { speaker: true } },
        talkB: { include: { speaker: true } }
      }
    });

    // Attempt Gemini Generation
    let briefingContent: BriefingContent;
    let methodUsed = "gemini";

    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("YOUR_GEMINI")) {
        throw new Error("Invalid Gemini API key");
      }

      const prompt = `You are Synapse, an AI conference intelligence engine. Generate a personalized conference briefing based on the user's attended talks and the discovered connection synapses.

## ATTENDED TALKS:
${attendedTalks.map(t => `- "${t.title}" by ${t.speaker.name} (Tags: ${t.tags.join(", ")})`).join("\n")}

## DISCOVERED SYNAPSE CONNECTIONS AVAILABLE:
${synapses.map(s => `- Connection: "${s.talkA.title}" <-> "${s.talkB.title}"
  Type: ${s.type} (Strength: ${s.strength})
  Insight: ${s.insight}
  Attendee Implication: ${s.attendeeImplication}`).join("\n")}

## ALL OTHER MISSED TALKS:
${missedTalks.map(t => `- "${t.title}" by ${t.speaker.name} (Tags: ${t.tags.join(", ")}, ID: ${t.id})`).join("\n")}

## YOUR TASK:
Generate a structured JSON report summarizing the attendee's conference experience. You MUST return ONLY a valid JSON object. Do not wrap in markdown or backticks.

## JSON STRUCTURE REQUIREMENTS:
{
  "deeperConnections": [
    {
      "talkA": "Title of attended talk A",
      "talkB": "Title of attended talk B",
      "reason": "Explain how these two talks you attended connect conceptually in a deeper way, referencing actual technologies."
    }
  ],
  "whatYouMissed": [
    {
      "talk": "Title of missed talk",
      "speaker": "Speaker Name",
      "connectionToYourTalks": "How this connects directly to the talks you actually attended",
      "whyItMatters": "Why you should care about this specific session"
    }
  ],
  "knowledgeGaps": [
    {
      "topic": "Topic area (e.g. AI-First UI, Web Runtimes, CSS Layouts, Wasm)",
      "gapExplanation": "Why you have a gap here based on your attended talks",
      "recommendedAction": "A specific concrete recommendation to close the gap"
    }
  ],
  "recommendedRecordings": [
    {
      "talkId": "Exact ID of missed talk from list",
      "title": "Title of missed talk",
      "speaker": "Speaker Name",
      "priority": "High" | "Medium" | "Low",
      "reason": "Specific rationale linking to what they saw"
    }
  ]
}

Ensure the response is strict JSON.`;

      const aiResponse = await callGemini(prompt);
      const cleanJson = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      briefingContent = JSON.parse(cleanJson);
    } catch (apiError) {
      console.warn("Gemini API error or quota reached, compiling high-quality fallback briefing:", apiError);
      methodUsed = "fallback";

      // Build data-driven fallback briefing
      // A. Find "deeper connections" between attended talks using DB synapses
      const internalSynapses = synapses.filter(
        s => attendedTalkIds.includes(s.talkAId) && attendedTalkIds.includes(s.talkBId)
      );

      const deeperConnections = internalSynapses.map(s => ({
        talkA: s.talkA.title,
        talkB: s.talkB.title,
        reason: s.insight
      }));

      // If no internal connections, generate a nice default connection
      if (deeperConnections.length === 0 && attendedTalks.length >= 2) {
        deeperConnections.push({
          talkA: attendedTalks[0].title,
          talkB: attendedTalks[1].title,
          reason: `Both talks focus on modern front-end engineering principles, specifically addressing client-server coordination, performance optimization, and developer workflow scaling.`
        });
      }

      // B. Find "what you missed" by looking at synapses connecting attended talks to missed talks
      const boundarySynapses = synapses.filter(
        s => (attendedTalkIds.includes(s.talkAId) && !attendedTalkIds.includes(s.talkBId)) ||
             (!attendedTalkIds.includes(s.talkAId) && attendedTalkIds.includes(s.talkBId))
      );

      const whatYouMissedList = [];
      const recommendedRecordingsList = [];

      for (const s of boundarySynapses.slice(0, 3)) {
        const attended = attendedTalkIds.includes(s.talkAId) ? s.talkA : s.talkB;
        const missed = attendedTalkIds.includes(s.talkAId) ? s.talkB : s.talkA;

        whatYouMissedList.push({
          talk: missed.title,
          speaker: missed.speaker?.name || "Expert Speaker",
          connectionToYourTalks: `Directly related to your attendance of "${attended.title}" through the concept of ${s.concepts[0] || "modern architecture"}.`,
          whyItMatters: s.insight
        });

        recommendedRecordingsList.push({
          talkId: missed.id,
          title: missed.title,
          speaker: missed.speaker?.name || "Expert Speaker",
          priority: s.strength > 0.85 ? ("High" as const) : ("Medium" as const),
          reason: s.attendeeImplication
        });
      }

      // Add a default if lists are empty
      if (whatYouMissedList.length === 0 && missedTalks.length > 0) {
        const fallbackMissed = missedTalks[0];
        whatYouMissedList.push({
          talk: fallbackMissed.title,
          speaker: fallbackMissed.speaker.name,
          connectionToYourTalks: `An architectural session on the parallel track.`,
          whyItMatters: fallbackMissed.abstract
        });

        recommendedRecordingsList.push({
          talkId: fallbackMissed.id,
          title: fallbackMissed.title,
          speaker: fallbackMissed.speaker.name,
          priority: "Medium" as const,
          reason: `Highly rated session on modern web development.`
        });
      }

      // C. Analyze Knowledge Gaps based on tags
      const attendedTags = new Set(attendedTalks.flatMap(t => t.tags));
      const knowledgeGaps = [];

      if (!attendedTags.has("ai") && !attendedTags.has("agents")) {
        knowledgeGaps.push({
          topic: "AI-First Interfaces & Agents",
          gapExplanation: "You did not attend any talks covering LLMs, WebMCP, or AI UI generation.",
          recommendedAction: "Watch Lee Robinson's talk on 'AI-First Frontend: Agentic UI Generation and WebMCP'."
        });
      }
      if (!attendedTags.has("css") && !attendedTags.has("design-systems")) {
        knowledgeGaps.push({
          topic: "Modern styling & Native Web APIs",
          gapExplanation: "You skipped sessions on zero-runtime CSS compilers and browser-native styling features.",
          recommendedAction: "Review Sophie Alpert's session on Compiler-First Styles or Una Kravets on Web Platform Features."
        });
      }
      if (!attendedTags.has("performance") && !attendedTags.has("wasm")) {
        knowledgeGaps.push({
          topic: "High-Performance Compilations",
          gapExplanation: "You missed talks on WebAssembly calculation speeds and TypeScript compiler performance optimizations.",
          recommendedAction: "Check out Lin Clark's talk on WebAssembly or Sarah Drasner's TypeScript Performance patterns."
        });
      }

      if (knowledgeGaps.length === 0) {
        knowledgeGaps.push({
          topic: "Cross-Framework Paradigms",
          gapExplanation: "Your selections are highly balanced, but there is always room to explore alternative compilation patterns.",
          recommendedAction: "Watch Rich Harris's Svelte vs. React comparison to see compiled reactivity vs Virtual DOM reconciliation."
        });
      }

      briefingContent = {
        deeperConnections,
        whatYouMissed: whatYouMissedList,
        knowledgeGaps,
        recommendedRecordings: recommendedRecordingsList
      };
    }

    // 4. Calculate Conference DNA (summarized tags & tracks)
    const trackCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};

    attendedTalks.forEach(t => {
      trackCounts[t.track.name] = (trackCounts[t.track.name] || 0) + 1;
      t.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const primaryTrack = Object.entries(trackCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Web Development";
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0])
      .join(", ");

    const conferenceDna = `Your conference focus was highly centered on "${primaryTrack}" with a specific interest in: ${topTags || "general architecture"}. You spent your time analyzing client-side state and compiler-driven solutions.`;

    // 5. Save/Update in DB
    const briefing = await prisma.briefing.upsert({
      where: { userId: DEMO_USER_ID },
      update: {
        content: briefingContent as any,
        conferenceDna,
      },
      create: {
        userId: DEMO_USER_ID,
        content: briefingContent as any,
        conferenceDna,
      }
    });

    return NextResponse.json({
      success: true,
      method: methodUsed,
      briefing,
    });
  } catch (error) {
    console.error("Failed to generate briefing:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
