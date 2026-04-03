import { getSession } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGardenForUser } from "@/lib/gardenAuth";

export const dynamic = "force-dynamic";

async function getEntryForUser(id: string, userId: string) {
  const entry = await prisma.journalEntry.findUnique({ where: { id } });
  if (!entry) return null;
  // Check ownership or garden membership
  if (entry.userId === userId) return entry;
  const garden = await getGardenForUser(entry.gardenId, userId);
  return garden ? entry : null;
}

/**
 * GET /api/journals/[id]
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const entry = await getEntryForUser(id, session.user.sub as string);
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(entry);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch entry" }, { status: 500 });
  }
}

/**
 * PUT /api/journals/[id]
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const userId = session.user.sub as string;

    const entry = await getEntryForUser(id, userId);
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const { type, title, notes, tags, photos, date, bedId } = body;

    const validTypes = ["observation", "pest", "harvest", "watering"];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid entry type" }, { status: 400 });
    }
    if (title !== undefined && (typeof title !== "string" || title.length < 1 || title.length > 100)) {
      return NextResponse.json({ error: "Title must be 1–100 characters" }, { status: 400 });
    }

    const updated = await prisma.journalEntry.update({
      where: { id },
      data: {
        ...(type !== undefined && { type }),
        ...(title !== undefined && { title: title.trim() }),
        ...(notes !== undefined && { notes: notes.trim() }),
        ...(tags !== undefined && { tags }),
        ...(photos !== undefined && { photos }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(bedId !== undefined && { bedId: bedId || null }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
  }
}

/**
 * DELETE /api/journals/[id]
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const userId = session.user.sub as string;

    const entry = await prisma.journalEntry.findUnique({ where: { id } });
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
    // Only the entry author can delete
    if (entry.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.journalEntry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}
