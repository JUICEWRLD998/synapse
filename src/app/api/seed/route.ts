import { NextResponse } from "next/server";
import { seedDatabase } from "@/utils/seedData";
import { seedSynapses } from "@/utils/synapseData";

// Protect the seed endpoint with a secret token.
// Set SEED_SECRET in your environment variables (Vercel dashboard or .env).
// Call it as: GET /api/seed?secret=YOUR_SECRET
const SEED_SECRET = process.env.SEED_SECRET;

export async function GET(req: Request) {
  // ── Guard: reject if no secret is configured ──────────────────
  if (!SEED_SECRET) {
    return NextResponse.json(
      { success: false, error: "SEED_SECRET environment variable is not set. Seeding is disabled." },
      { status: 403 }
    );
  }

  // ── Guard: reject if the caller didn't provide the right token ─
  const { searchParams } = new URL(req.url);
  const provided = searchParams.get("secret");

  if (provided !== SEED_SECRET) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Provide the correct ?secret= token." },
      { status: 401 }
    );
  }

  // ── Authorised — run the seed ──────────────────────────────────
  try {
    await seedDatabase();
    await seedSynapses();
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully — talks, speakers, tracks, and synapses are ready.",
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
