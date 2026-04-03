import { getSession } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/gardens
 * List all gardens the current user owns or is a member of.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.sub as string;

    // Gardens where user is owner
    const ownedGardens = await prisma.garden.findMany({
      where: { userId },
      include: { members: true, beds: true },
      orderBy: { createdAt: "desc" },
    });

    // Gardens where user is an accepted member
    const memberGardens = await prisma.garden.findMany({
      where: {
        members: {
          some: { userId, status: "accepted" },
        },
        NOT: { userId }, // exclude gardens already fetched above
      },
      include: { members: true, beds: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json([...ownedGardens, ...memberGardens]);
  } catch (error) {
    console.error("Error fetching gardens:", error);
    return NextResponse.json(
      { error: "Failed to fetch gardens" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gardens
 * Create a new garden.
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color } = body;

    if (!name || typeof name !== "string" || name.length < 1 || name.length > 50) {
      return NextResponse.json(
        { error: "Name must be between 1 and 50 characters" },
        { status: 400 }
      );
    }

    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return NextResponse.json(
        { error: "Invalid color format (must be hex code)" },
        { status: 400 }
      );
    }

    const garden = await prisma.garden.create({
      data: {
        userId: session.user.sub as string,
        name: name.trim(),
        description: description?.trim() || null,
        color: color || "#84A98C",
      },
      include: { members: true, beds: true },
    });

    return NextResponse.json(garden, { status: 201 });
  } catch (error) {
    console.error("Error creating garden:", error);
    return NextResponse.json(
      { error: "Failed to create garden" },
      { status: 500 }
    );
  }
}
