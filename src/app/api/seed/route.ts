import { NextResponse } from "next/server";
import { seedDatabase } from "@/utils/seedData";
import { seedSynapses } from "@/utils/synapseData";

export async function GET() {
  try {
    await seedDatabase();
    await seedSynapses();
    return NextResponse.json({ success: true, message: "Database and synapses seeded successfully!" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
