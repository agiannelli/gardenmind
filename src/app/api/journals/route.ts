import { getSession } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGardenForUser } from "@/lib/gardenAuth";

export const dynamic = "force-dynamic";

/**
 * GET /api/journals?gardenId=xxx
 * List journal entries for the current user, optionally filtered by garden.
 */
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.sub as string;
    const { searchParams } = new URL(request.url);
    const gardenId = searchParams.get("gardenId");

    // Find all gardens the user has access to
    const memberGardenIds = (
      await prisma.gardenMember.findMany({
        where: { userId, status: "accepted" },
        select: { gardenId: true },
      })
    ).map((m) => m.gardenId);

    const where = gardenId
      ? { gardenId, OR: [{ userId }, { gardenId: { in: memberGardenIds } }] }
      : { OR: [{ userId }, { gardenId: { in: memberGardenIds } }] };

    const entries = await prisma.journalEntry.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 });
  }
}

/**
 * POST /api/journals
 * Create a new journal entry.
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.sub as string;
    const body = await request.json();
    const { gardenId, bedId, type, title, notes, tags, photos, date } = body;

    if (!gardenId) {
      return NextResponse.json({ error: "gardenId is required" }, { status: 400 });
    }

    const garden = await getGardenForUser(gardenId, userId);
    if (!garden) {
      return NextResponse.json({ error: "Garden not found or access denied" }, { status: 403 });
    }

    const validTypes = ["observation", "pest", "harvest", "watering"];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid entry type" }, { status: 400 });
    }

    if (!title || typeof title !== "string" || title.length < 1 || title.length > 100) {
      return NextResponse.json({ error: "Title must be 1–100 characters" }, { status: 400 });
    }

    const entry = await prisma.journalEntry.create({
      data: {
        userId,
        gardenId,
        bedId: bedId || null,
        type,
        title: title.trim(),
        notes: notes?.trim() || "",
        tags: Array.isArray(tags) ? tags : [],
        photos: Array.isArray(photos) ? photos : [],
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Error creating journal entry:", error);
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
  }
}
