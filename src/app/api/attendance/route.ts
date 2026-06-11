import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_USER_ID = "demo-user";

async function getOrCreateDemoUser() {
  let user = await prisma.user.findUnique({
    where: { id: DEMO_USER_ID }
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: DEMO_USER_ID,
        name: "Hackathon Attendee",
        email: "attendee@gitnation.com"
      }
    });
  }
  return user;
}

export async function GET() {
  try {
    await getOrCreateDemoUser();
    const attendance = await prisma.attendance.findMany({
      where: { userId: DEMO_USER_ID },
      select: { talkId: true }
    });

    return NextResponse.json({
      success: true,
      attendedTalkIds: attendance.map(a => a.talkId)
    });
  } catch (error) {
    console.error("Failed to fetch attendance:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await getOrCreateDemoUser();
    const body = await req.json();
    const { talkId, attended } = body;

    if (!talkId) {
      return NextResponse.json(
        { success: false, error: "talkId is required" },
        { status: 400 }
      );
    }

    if (attended) {
      await prisma.attendance.upsert({
        where: {
          userId_talkId: {
            userId: DEMO_USER_ID,
            talkId
          }
        },
        update: {},
        create: {
          userId: DEMO_USER_ID,
          talkId
        }
      });
    } else {
      await prisma.attendance.deleteMany({
        where: {
          userId: DEMO_USER_ID,
          talkId
        }
      });
    }

    return NextResponse.json({
      success: true,
      talkId,
      attended
    });
  } catch (error) {
    console.error("Failed to update attendance:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
