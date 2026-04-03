import { getSession } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/gardens/[id]/members/[memberId]
 * Remove a member or cancel a pending invite (owner only).
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, memberId } = await params;
    const userId = session.user.sub as string;

    const garden = await prisma.garden.findUnique({ where: { id } });
    if (!garden) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (garden.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const member = await prisma.gardenMember.findUnique({
      where: { id: memberId },
    });
    if (!member || member.gardenId !== id) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    await prisma.gardenMember.delete({ where: { id: memberId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/gardens/[id]/members/[memberId]
 * Update a member's role (owner only).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, memberId } = await params;
    const userId = session.user.sub as string;

    const garden = await prisma.garden.findUnique({ where: { id } });
    if (!garden) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (garden.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { role } = body;

    if (!["editor", "viewer"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be editor or viewer" },
        { status: 400 }
      );
    }

    const updated = await prisma.gardenMember.update({
      where: { id: memberId },
      data: { role },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating member role:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}
