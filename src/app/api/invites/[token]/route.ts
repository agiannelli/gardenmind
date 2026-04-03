import { getSession } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/invites/[token]
 * Accept a garden invite. User must be logged in.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await params;
    const userId = session.user.sub as string;
    const userEmail = session.user.email as string;

    const member = await prisma.gardenMember.findUnique({
      where: { inviteToken: token },
      include: { garden: true },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Invite not found or already used" },
        { status: 404 }
      );
    }

    if (member.status === "accepted") {
      return NextResponse.json(
        { error: "Invite already accepted" },
        { status: 409 }
      );
    }

    // Check the invite email matches (loose: allow if emails match or user is accepting their own invite)
    if (member.email !== userEmail) {
      return NextResponse.json(
        { error: "This invite was sent to a different email address" },
        { status: 403 }
      );
    }

    // Check user isn't already a member
    const alreadyMember = await prisma.gardenMember.findFirst({
      where: { gardenId: member.gardenId, userId, status: "accepted" },
    });
    if (alreadyMember) {
      return NextResponse.json(
        { error: "You are already a member of this garden" },
        { status: 409 }
      );
    }

    const updated = await prisma.gardenMember.update({
      where: { id: member.id },
      data: { userId, status: "accepted", inviteToken: null },
      include: { garden: true },
    });

    return NextResponse.json({ gardenId: updated.gardenId, gardenName: updated.garden.name });
  } catch (error) {
    console.error("Error accepting invite:", error);
    return NextResponse.json(
      { error: "Failed to accept invite" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/invites/[token]
 * Preview invite details (no auth required, so user can see what they're accepting).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const member = await prisma.gardenMember.findUnique({
      where: { inviteToken: token },
      include: { garden: { select: { name: true, color: true, userId: true } } },
    });

    if (!member) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    return NextResponse.json({
      gardenName: member.garden.name,
      gardenColor: member.garden.color,
      role: member.role,
      status: member.status,
    });
  } catch (error) {
    console.error("Error fetching invite:", error);
    return NextResponse.json(
      { error: "Failed to fetch invite" },
      { status: 500 }
    );
  }
}
