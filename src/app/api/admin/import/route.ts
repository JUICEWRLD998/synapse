import { NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { callGeminiWithRetry } from "@/lib/gemini";
import { seedSynapses } from "@/utils/synapseData";

// Synapse types and their metadata
const SYNAPSE_TYPES = [
  "complementary",
  "contradictory",
  "foundational",
  "cross-domain",
  "evolutionary",
] as const;

// Generate synapses from actual DB talks using tag overlap scoring.
// Used as the last-resort fallback when both Gemini and the hardcoded
// title-matched seed produce 0 results (e.g. after a custom CSV import).
async function generateFallbackSynapsesFromTalks(): Promise<number> {
  const talks = await prisma.talk.findMany({ include: { speaker: true } });
  if (talks.length < 2) return 0;

  // Score every unique pair by shared tag count
  const pairs: {
    a: (typeof talks)[0];
    b: (typeof talks)[0];
    shared: string[];
    score: number;
  }[] = [];

  for (let i = 0; i < talks.length; i++) {
    for (let j = i + 1; j < talks.length; j++) {
      const tagsA = new Set(talks[i].tags.map((t) => t.toLowerCase()));
      const tagsB = new Set(talks[j].tags.map((t) => t.toLowerCase()));
      const shared = [...tagsA].filter((t) => tagsB.has(t));
      if (shared.length > 0) {
        pairs.push({
          a: talks[i],
          b: talks[j],
          shared,
          score: shared.length,
        });
      }
    }
  }

  // Sort by score desc, take top 9 (or all if fewer)
  pairs.sort((x, y) => y.score - x.score);
  const chosen = pairs.slice(0, 9);

  // If we have fewer than 4 tag-overlap pairs, pad with arbitrary cross-track pairs
  if (chosen.length < 4) {
    const trackIds = [...new Set(talks.map((t) => t.trackId))];
    const hasMultipleTracks = trackIds.length > 1;

    for (let i = 0; i < talks.length && chosen.length < 6; i++) {
      for (let j = i + 1; j < talks.length && chosen.length < 6; j++) {
        const alreadyIncluded = chosen.some(
          (p) =>
            (p.a.id === talks[i].id && p.b.id === talks[j].id) ||
            (p.a.id === talks[j].id && p.b.id === talks[i].id)
        );
        if (alreadyIncluded) continue;
        // Prefer cross-track pairs if multiple tracks exist
        if (
          !hasMultipleTracks ||
          talks[i].trackId !== talks[j].trackId
        ) {
          chosen.push({ a: talks[i], b: talks[j], shared: [], score: 0 });
        }
      }
    }
  }

  let count = 0;
  for (let idx = 0; idx < chosen.length; idx++) {
    const { a, b, shared, score } = chosen[idx];
    const type = SYNAPSE_TYPES[idx % SYNAPSE_TYPES.length];
    const strength = Math.min(0.95, 0.65 + score * 0.06);
    const concepts =
      shared.length > 0
        ? shared.slice(0, 4)
        : [a.tags[0] ?? "frontend", b.tags[0] ?? "architecture"];

    const insight =
      shared.length > 0
        ? `Both "${a.title}" and "${b.title}" address ${concepts.slice(0, 2).join(" and ")}, making them natural companions for attendees interested in these themes.`
        : `"${a.title}" and "${b.title}" approach complementary aspects of modern web development — attending both gives a fuller picture.`;

    const attendeeImplication = `Pairing these two sessions will deepen your understanding of ${concepts[0] ?? "the topic"}.`;

    await withRetry(() =>
      prisma.synapse.upsert({
        where: { talkAId_talkBId: { talkAId: a.id, talkBId: b.id } },
        update: { type, strength, insight, concepts, attendeeImplication },
        create: {
          talkAId: a.id,
          talkBId: b.id,
          type,
          strength,
          insight,
          concepts,
          attendeeImplication,
        },
      })
    );
    count++;
  }

  return count;
}

interface CsvRow {
  title: string;
  speaker_name: string;
  speaker_company: string;
  speaker_bio: string;
  track_name: string;
  track_color: string;
  start_time: string;
  end_time: string;
  day: string;
  tags: string;
  abstract: string;
}

// Simple CSV parser — handles quoted fields with commas inside
function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");

  const headers = parseCsvLine(lines[0]);
  const required = ["title","speaker_name","speaker_company","speaker_bio","track_name","track_color","start_time","end_time","day","tags","abstract"];
  for (const col of required) {
    if (!headers.includes(col)) throw new Error(`Missing required column: "${col}"`);
  }

  return lines.slice(1).filter(l => l.trim()).map((line, i) => {
    const values = parseCsvLine(line);
    if (values.length !== headers.length) {
      throw new Error(`Row ${i + 2} has ${values.length} columns but header has ${headers.length}.`);
    }
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx]; });
    return row as unknown as CsvRow;
  });
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const mode = (formData.get("mode") as string) ?? "preview";

    if (!file) return NextResponse.json({ success: false, error: "No file uploaded." }, { status: 400 });

    const text = await file.text();
    let rows: CsvRow[];
    try {
      rows = parseCsv(text);
    } catch (parseErr) {
      return NextResponse.json({ success: false, error: String(parseErr) }, { status: 422 });
    }

    if (rows.length === 0) return NextResponse.json({ success: false, error: "CSV contains no data rows." }, { status: 422 });

    // ── Preview mode — just return parsed data, don't write to DB ─
    if (mode === "preview") {
      return NextResponse.json({
        success: true,
        preview: rows.map(r => ({
          title: r.title,
          speaker: r.speaker_name,
          company: r.speaker_company,
          track: r.track_name,
          day: r.day,
          time: `${new Date(r.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${new Date(r.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          tags: r.tags.split(",").map(t => t.trim()),
        })),
        rowCount: rows.length,
      });
    }

    // ── Import mode — write to DB ──────────────────────────────────

    // 1. Clear existing data (preserve demo-user attendance/briefing shape)
    await withRetry(() => prisma.attendance.deleteMany({}));
    await withRetry(() => prisma.briefing.deleteMany({}));
    await withRetry(() => prisma.synapse.deleteMany({}));
    await withRetry(() => prisma.talk.deleteMany({}));
    await withRetry(() => prisma.speaker.deleteMany({}));
    await withRetry(() => prisma.track.deleteMany({}));
    await withRetry(() => prisma.user.deleteMany({}));

    // 2. Collect unique tracks and speakers
    const trackMap = new Map<string, string>(); // name → color
    const speakerMap = new Map<string, { company: string; bio: string }>();

    for (const row of rows) {
      if (!trackMap.has(row.track_name)) trackMap.set(row.track_name, row.track_color || "#8B5CF6");
      if (!speakerMap.has(row.speaker_name)) {
        speakerMap.set(row.speaker_name, { company: row.speaker_company, bio: row.speaker_bio });
      }
    }

    // 3. Seed tracks
    const createdTracks = new Map<string, string>(); // name → id
    let trackIndex = 0;
    for (const [name, color] of trackMap.entries()) {
      const id = `track-${++trackIndex}`;
      await withRetry(() => prisma.track.create({ data: { id, name, color } }));
      createdTracks.set(name, id);
    }

    // 4. Seed speakers
    const createdSpeakers = new Map<string, string>(); // name → id
    for (const [name, info] of speakerMap.entries()) {
      const speaker = await withRetry(() =>
        prisma.speaker.create({ data: { name, company: info.company, bio: info.bio } })
      );
      createdSpeakers.set(name, speaker.id);
    }

    // 5. Seed talks
    const createdTalks: { id: string; title: string }[] = [];
    for (const row of rows) {
      const trackId = createdTracks.get(row.track_name);
      const speakerId = createdSpeakers.get(row.speaker_name);
      if (!trackId || !speakerId) continue;

      const talk = await withRetry(() =>
        prisma.talk.create({
          data: {
            title: row.title,
            abstract: row.abstract,
            tags: row.tags.split(",").map(t => t.trim()).filter(Boolean),
            trackId,
            speakerId,
            startTime: new Date(row.start_time),
            endTime: new Date(row.end_time),
            day: parseInt(row.day, 10) || 1,
          },
        })
      );
      createdTalks.push({ id: talk.id, title: talk.title });
    }

    // 6. Generate synapses via Gemini with retry (falls back to pre-built synapses on failure)
    let synapseCount = 0;
    let synapseSource = "none";

    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("YOUR_GEMINI")) {
        throw new Error("No Gemini key");
      }

      const allTalks = await prisma.talk.findMany({ include: { speaker: true } });
      const prompt = `You are a conference intelligence engine. Analyze these talks and find 6-9 meaningful semantic connections ("synapses") between pairs.

TALKS:
${allTalks.map(t => `ID: ${t.id}\nTitle: "${t.title}"\nSpeaker: ${t.speaker.name}\nTags: ${t.tags.join(", ")}`).join("\n\n")}

Return ONLY a valid JSON array (no markdown) with objects matching this shape exactly:
[{"talkAId":"...","talkBId":"...","type":"complementary|contradictory|foundational|cross-domain|evolutionary","strength":0.85,"insight":"2-3 sentences explaining the connection.","concepts":["concept1","concept2"],"attendeeImplication":"One sentence about why this matters to an attendee."}]

Only use IDs from the list above. Minimum strength 0.7.`;

      // Retry up to 4 times on 503 with exponential back-off
      const raw = await callGeminiWithRetry(prompt, {
        maxAttempts: 4,
        baseDelayMs: 3000,
        perAttemptTimeoutMs: 30_000,
      });

      const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned) as Array<{
        talkAId: string; talkBId: string; type: string; strength: number;
        insight: string; concepts: string[]; attendeeImplication: string;
      }>;

      for (const s of parsed) {
        if (!s.talkAId || !s.talkBId) continue;
        await withRetry(() =>
          prisma.synapse.upsert({
            where: { talkAId_talkBId: { talkAId: s.talkAId, talkBId: s.talkBId } },
            update: { type: s.type, strength: s.strength, insight: s.insight, concepts: s.concepts, attendeeImplication: s.attendeeImplication },
            create: { talkAId: s.talkAId, talkBId: s.talkBId, type: s.type, strength: s.strength, insight: s.insight, concepts: s.concepts || [], attendeeImplication: s.attendeeImplication || "" },
          })
        );
        synapseCount++;
      }
      synapseSource = "gemini";
    } catch (synapseErr) {
      // Gemini unavailable even after retries — try pre-built synapses first
      // (these only match if the hardcoded talk titles are present in the DB),
      // then fall back to tag-overlap generated synapses so the graph is always
      // populated regardless of which CSV was imported.
      console.warn(
        "Gemini synapse generation failed after retries, attempting pre-built synapses:",
        (synapseErr as Error).message
      );
      try {
        await seedSynapses();
        const count = await prisma.synapse.count();

        if (count > 0) {
          synapseCount = count;
          synapseSource = "fallback";
        } else {
          // Pre-built titles didn't match — generate from the actual imported talks
          console.warn(
            "Pre-built synapses produced 0 matches (custom CSV titles). " +
              "Generating tag-overlap synapses from imported talks…"
          );
          synapseCount = await generateFallbackSynapsesFromTalks();
          synapseSource = synapseCount > 0 ? "fallback" : "skipped";
        }
      } catch (fallbackErr) {
        console.error("Pre-built synapse seed failed:", fallbackErr);
        // Last resort — try tag-overlap generation directly
        try {
          synapseCount = await generateFallbackSynapsesFromTalks();
          synapseSource = synapseCount > 0 ? "fallback" : "skipped";
        } catch (lastErr) {
          console.error("Tag-overlap synapse generation also failed:", lastErr);
          synapseSource = "skipped";
        }
      }
    }

    return NextResponse.json({
      success: true,
      imported: {
        tracks: createdTracks.size,
        speakers: createdSpeakers.size,
        talks: createdTalks.length,
        synapses: synapseCount,
        synapseSource,
      },
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
