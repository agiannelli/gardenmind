import { getSession } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

/**
 * GET /api/gardens/[id]/members
 * List members (owner only).
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
    const garden = await prisma.garden.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!garden) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (garden.userId !== (session.user.sub as string)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(garden.members);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gardens/[id]/members
 * Invite a member by email (owner only). Returns the invite URL.
 */
export async function POST(
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

    const garden = await prisma.garden.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!garden) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (garden.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { email, role } = body;

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const validRoles = ["editor", "viewer"];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: "Role must be editor or viewer" }, { status: 400 });
    }

    // Check for existing invite
    const existing = garden.members.find((m) => m.email === email);
    if (existing) {
      return NextResponse.json(
        { error: "An invite for this email already exists" },
        { status: 409 }
      );
    }

    const inviteToken = randomBytes(24).toString("hex");

    const member = await prisma.gardenMember.create({
      data: {
        gardenId: id,
        email,
        role: role || "editor",
        inviteToken,
        status: "pending",
      },
    });

    return NextResponse.json({ member, inviteToken }, { status: 201 });
  } catch (error) {
    console.error("Error inviting member:", error);
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    );
  }
}
