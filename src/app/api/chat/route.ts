import { NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { callGemini } from "@/lib/gemini";

const DEMO_USER_ID = "demo-user";

/** Race callGemini against a timeout so we fail fast and fall back. */
function callGeminiWithTimeout(prompt: string, ms = 8000): Promise<string> {
  return Promise.race([
    callGemini(prompt),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini timeout after ${ms}ms`)), ms)
    ),
  ]);
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    // ── Fetch context from DB (with retry for cold-starts) ────────
    let attendedTalks: Array<{ id: string; title: string; tags: string[] }> = [];
    let synapses: Array<{
      talkA: { title: string };
      talkB: { title: string };
      type: string;
      insight: string;
      concepts: string[];
    }> = [];

    try {
      const [attendance, rawSynapses] = await Promise.all([
        withRetry(() =>
          prisma.attendance.findMany({
            where: { userId: DEMO_USER_ID },
            include: { talk: { include: { speaker: true, track: true } } },
          })
        ),
        withRetry(() =>
          prisma.synapse.findMany({
            include: {
              talkA: { include: { speaker: true } },
              talkB: { include: { speaker: true } },
            },
          })
        ),
      ]);
      attendedTalks = attendance.map((a) => a.talk);
      synapses = rawSynapses;
    } catch (dbErr) {
      console.warn("DB unavailable for chat context, using empty context:", dbErr);
    }

    const attendedTitles = attendedTalks.map((t) => `"${t.title}"`).join(", ");

    // ── Try Gemini (with 8 s timeout) ─────────────────────────────
    let answer = "";
    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("YOUR_GEMINI")) {
        throw new Error("Invalid Gemini API key");
      }

      const aiPrompt = `You are Synapse, the AI Conference Intelligence Assistant. An attendee is asking you a question about their conference experience.
Their attended sessions: ${attendedTitles || "None selected yet"}.
Conference session relationships:
${synapses.map((s) => `- "${s.talkA.title}" → "${s.talkB.title}" (${s.type}): ${s.insight}`).join("\n")}

Attendee's question: "${prompt}"

Respond in 2–3 sentences. Be direct, helpful, and specific to the conference content.`;

      answer = await callGeminiWithTimeout(aiPrompt, 8000);
    } catch (apiError) {
      console.warn("Gemini unavailable, using smart fallback:", (apiError as Error).message);

      // ── Smart keyword-based fallback ──────────────────────────
      const q = prompt.toLowerCase();

      if (q.includes("gap") || q.includes("miss")) {
        const domain = attendedTitles.includes("React")
          ? "AI-first interfaces and WebAssembly"
          : "React Server Components and SSR";
        answer = `Based on your ${attendedTalks.length} attended sessions, your main gaps are in ${domain}. Check out Lee Robinson's 'AI-First Frontend' or Rich Harris's Svelte compilation talk to fill those in.`;
      } else if (q.includes("recommend") || q.includes("watch") || q.includes("recording")) {
        const tag = attendedTalks[0]?.tags[0] ?? "modern rendering";
        answer = `Given your interest in ${tag}, start with Sophie Alpert's 'React Compiler' session — it directly extends what you've already attended and covers the future of compile-time optimisation.`;
      } else if (q.includes("connect") || q.includes("synapse") || q.includes("relationship")) {
        if (synapses.length > 0) {
          const s = synapses[0];
          answer = `The strongest synapse links "${s.talkA.title}" to "${s.talkB.title}" — a ${s.type} connection around ${s.concepts[0] ?? "shared architecture patterns"}. ${s.insight}`;
        } else {
          answer =
            "We've mapped 9 core synapses connecting RSC, edge compute, and compile-time optimisation themes across the two conference tracks.";
        }
      } else if (q.includes("first") || q.includes("priority") || q.includes("start")) {
        answer = `Your highest-priority watch is any session tagged with the same themes as your attended talks. Start with the recordings most connected to "${attendedTalks[0]?.title ?? "your first session"}" and follow the synapse chain from there.`;
      } else {
        answer = `You've selected ${attendedTalks.length > 0 ? `${attendedTalks.length} sessions: ${attendedTitles}` : "no sessions yet"}. Add a few more from the Schedule page and I can surface the hidden connections between them — or ask me about any specific topic from the conference.`;
      }
    }

    return NextResponse.json({ success: true, answer });
  } catch (error) {
    console.error("Chat endpoint error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
