import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callGeminiWithRetry } from "@/lib/gemini";
import { seedSynapses } from "@/utils/synapseData";

export async function GET() {
  try {
    const synapses = await prisma.synapse.findMany({
      include: {
        talkA: {
          include: {
            speaker: true,
            track: true,
          }
        },
        talkB: {
          include: {
            speaker: true,
            track: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      synapses,
    });
  } catch (error) {
    console.error("Failed to fetch synapses:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Attempt dynamic AI synapse analysis using Gemini 2.5 Flash
    // We retrieve all talks, construct a prompt, and parse the result.
    const talks = await prisma.talk.findMany({
      include: {
        speaker: true,
        track: true,
      }
    });

    if (talks.length === 0) {
      return NextResponse.json(
        { success: false, error: "No talks in database to analyze. Please seed first." },
        { status: 400 }
      );
    }

    const prompt = `You are a conference content intelligence engine. Analyze the following conference talks and discover hidden connections ("synapses") between them.

## TALKS TO ANALYZE
${talks.map(t => `
### ${t.id}: "${t.title}"
Speaker: ${t.speaker.name} (${t.speaker.company || 'Independent'})
Abstract: ${t.abstract}
Tags: ${t.tags.join(', ')}
Track: ${t.trackId}
`).join('\n')}

## YOUR TASK
Find meaningful connections between pairs of talks (at least 6-8 total). For each connection, provide:
1. **talkAId**: The exact ID of the first talk
2. **talkBId**: The exact ID of the second talk
3. **type**: One of: "complementary", "contradictory", "foundational", "cross-domain", "evolutionary"
4. **strength**: 0.0-1.0 (importance of this connection)
5. **insight**: 2-3 sentences explaining the connection. Reference actual concepts.
6. **concepts**: Array of 2-4 shared/related concept keywords
7. **attendeeImplication**: One sentence telling an attendee why this connection matters to them

## RULES
- Do not make up IDs. Only use IDs from the input.
- Return a valid JSON array of synapse objects. Do not include markdown code block syntax (like \`\`\`json) in your response, just the raw JSON.

## OUTPUT FORMAT EXAMPLE:
[
  {
    "talkAId": "some-uuid-1",
    "talkBId": "some-uuid-2",
    "type": "cross-domain",
    "strength": 0.85,
    "insight": "...",
    "concepts": ["concept1", "concept2"],
    "attendeeImplication": "..."
  }
]`;

    let synapsesData;
    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("YOUR_GEMINI")) {
        throw new Error("Invalid Gemini API key");
      }
      
      const aiResponse = await callGeminiWithRetry(prompt, {
        maxAttempts: 3,
        baseDelayMs: 2000,
        perAttemptTimeoutMs: 30_000,
      });
      // Clean potential markdown wrap
      const cleanJson = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      synapsesData = JSON.parse(cleanJson);
      
      // Seed these to DB
      let createdCount = 0;
      for (const syn of synapsesData) {
        if (!syn.talkAId || !syn.talkBId || !syn.type || !syn.strength) continue;
        
        await prisma.synapse.upsert({
          where: {
            talkAId_talkBId: {
              talkAId: syn.talkAId,
              talkBId: syn.talkBId
            }
          },
          update: {
            type: syn.type,
            strength: Number(syn.strength),
            insight: syn.insight || "",
            concepts: syn.concepts || [],
            attendeeImplication: syn.attendeeImplication || ""
          },
          create: {
            talkAId: syn.talkAId,
            talkBId: syn.talkBId,
            type: syn.type,
            strength: Number(syn.strength),
            insight: syn.insight || "",
            concepts: syn.concepts || [],
            attendeeImplication: syn.attendeeImplication || ""
          }
        });
        createdCount++;
      }
      
      return NextResponse.json({
        success: true,
        source: "gemini",
        count: createdCount,
      });
    } catch (apiError) {
      console.warn("Gemini API error or quota reached, seeding fallback synapses:", apiError);
      
      // If LLM fails/quota hit, run the seedSynapses helper to load high-quality fallbacks
      await seedSynapses();
      
      return NextResponse.json({
        success: true,
        source: "fallback",
        message: "Gemini quota/auth failed, fell back to high-quality pre-defined synapses.",
      });
    }
  } catch (error) {
    console.error("Synapse analysis endpoint error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
