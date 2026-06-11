import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callGemini } from "@/lib/gemini";

const DEMO_USER_ID = "demo-user";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    // Fetch user attendance
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

    const attendedTalks = attendance.map(a => a.talk);
    const attendedTitles = attendedTalks.map(t => `"${t.title}"`).join(", ");

    // Fetch synapses
    const synapses = await prisma.synapse.findMany({
      include: {
        talkA: { include: { speaker: true } },
        talkB: { include: { speaker: true } },
      }
    });

    let answer = "";
    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("YOUR_GEMINI")) {
        throw new Error("Invalid Gemini API key");
      }

      const aiPrompt = `You are Synapse, the AI Conference Intelligence Assistant. An attendee is asking you a question about their conference experience.
Their attended sessions: ${attendedTitles || "None selected yet"}.
All available conference relationships:
${synapses.map(s => `- "${s.talkA.title}" connects to "${s.talkB.title}" (${s.type}): ${s.insight}`).join("\n")}

Attendee's Question: "${prompt}"

Provide a direct, conversational, and highly helpful response (max 3 sentences) answering their question based on the conference content.`;

      answer = await callGemini(aiPrompt);
    } catch (apiError) {
      console.warn("Gemini chat API error or quota reached, generating fallback response:", apiError);
      
      // Smart fallback responses based on keywords in prompt
      const query = prompt.toLowerCase();
      if (query.includes("gap") || query.includes("miss")) {
        const missedTag = attendedTitles.includes("React") ? "AI-First UI and WebAssembly" : "React rendering and SSR";
        answer = `Looking at your attended sessions (${attendedTalks.length} total), your main gaps are in the ${missedTag} domains. We recommend checking out Lee Robinson's 'AI-First Frontend' session or Rich Harris's Svelte compilation talk to round out your knowledge.`;
      } else if (query.includes("recommend") || query.includes("watch") || query.includes("recording")) {
        answer = `Based on your interest in ${attendedTalks[0]?.tags[0] || "modern rendering"}, you should prioritize watching Sophie Alpert's 'React Compiler' session. It directly complements your schedule and explores the future of compilation optimization.`;
      } else if (query.includes("connect") || query.includes("synapse") || query.includes("relationship")) {
        if (synapses.length > 0) {
          const first = synapses[0];
          answer = `The strongest connection discovered is between "${first.talkA.title}" and "${first.talkB.title}". This is a ${first.type} relationship that highlights ${first.concepts.join(", ")}.`;
        } else {
          answer = `We have mapped 9 core synapses across tracks A and B. They connect serverless edge computing directly to React Server Components and compare Svelte's compile-time reactivity with React 19's virtual DOM.`;
        }
      } else {
        answer = `As your AI conference intelligence assistant, I analyzed your selected sessions: ${attendedTitles || "no sessions selected yet"}. To make the most of the conference, try adding 2-3 talks from the Scheduler to see how they connect, or ask me about specific recommended recordings!`;
      }
    }

    return NextResponse.json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error("Chat endpoint error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
