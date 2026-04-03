import { getSession } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGardenForUser } from "@/lib/gardenAuth";

export const dynamic = "force-dynamic";

/**
 * GET /api/gardens/[id]
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const garden = await getGardenForUser(id, session.user.sub as string);
    if (!garden) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(garden);
  } catch (error) {
    console.error("Error fetching garden:", error);
    return NextResponse.json(
      { error: "Failed to fetch garden" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/gardens/[id]
 * Update garden name/description/color (owner only).
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.sub as string;

    const existing = await prisma.garden.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (existing.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, color } = body;

    if (name !== undefined) {
      if (typeof name !== "string" || name.length < 1 || name.length > 50) {
        return NextResponse.json(
          { error: "Name must be between 1 and 50 characters" },
          { status: 400 }
        );
      }
    }

    if (color !== undefined && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return NextResponse.json(
        { error: "Invalid color format" },
        { status: 400 }
      );
    }

    const updated = await prisma.garden.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(color !== undefined && { color }),
      },
      include: { members: true, beds: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating garden:", error);
    return NextResponse.json(
      { error: "Failed to update garden" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/gardens/[id]
 * Delete a garden (owner only). Beds are set to gardenId=null (not deleted).
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.sub as string;

    const existing = await prisma.garden.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (existing.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.garden.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting garden:", error);
    return NextResponse.json(
      { error: "Failed to delete garden" },
      { status: 500 }
    );
  }
}
