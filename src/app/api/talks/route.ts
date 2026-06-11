import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const talks = await prisma.talk.findMany({
      include: {
        speaker: true,
        track: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    const speakers = await prisma.speaker.findMany();
    const tracks = await prisma.track.findMany();

    return NextResponse.json({
      success: true,
      talks,
      speakers,
      tracks,
    });
  } catch (error) {
    console.error("Failed to fetch talks:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
