import { getSession } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canWriteGarden } from "@/lib/gardenAuth";
import type { SunExposure, GardenType } from "@/types";

// NOTE: @auth0/nextjs-auth0@3.5.0 causes Next.js 15 cookies warnings
// This doesn't break functionality, but generates console warnings
// Resolution: Migrate to Auth0 v4 when migration path is clearer
export const dynamic = 'force-dynamic';

/**
 * GET /api/beds
 * List all beds for the current user
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.sub as string;

    // Find gardens the user is a member of (accepted)
    const memberGardenIds = (
      await prisma.gardenMember.findMany({
        where: { userId, status: "accepted" },
        select: { gardenId: true },
      })
    ).map((m) => m.gardenId);

    const beds = await prisma.bed.findMany({
      where: {
        OR: [
          { userId },
          { gardenId: { in: memberGardenIds } },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(beds);
  } catch (error) {
    console.error("Error fetching beds:", error);
    return NextResponse.json(
      { error: "Failed to fetch beds" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/beds
 * Create a new bed
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, widthFt, lengthFt, sunExposure, gardenType, color, gardenId } = body;

    // Validation
    if (!name || typeof name !== "string" || name.length < 1 || name.length > 50) {
      return NextResponse.json(
        { error: "Name must be between 1 and 50 characters" },
        { status: 400 }
      );
    }

    if (!widthFt || !lengthFt || widthFt < 1 || widthFt > 20 || lengthFt < 1 || lengthFt > 20) {
      return NextResponse.json(
        { error: "Dimensions must be between 1 and 20 feet" },
        { status: 400 }
      );
    }

    const validSunExposures: SunExposure[] = ["full-sun", "partial-sun", "full-shade"];
    if (!validSunExposures.includes(sunExposure)) {
      return NextResponse.json(
        { error: "Invalid sun exposure" },
        { status: 400 }
      );
    }

    const validGardenTypes: GardenType[] = ["traditional", "square-foot", "intensive"];
    if (gardenType && !validGardenTypes.includes(gardenType)) {
      return NextResponse.json(
        { error: "Invalid garden type" },
        { status: 400 }
      );
    }

    if (!color || typeof color !== "string" || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return NextResponse.json(
        { error: "Invalid color format (must be hex code)" },
        { status: 400 }
      );
    }

    // If a gardenId is provided, verify the user can write to it
    if (gardenId) {
      const canWrite = await canWriteGarden(gardenId, session.user.sub as string);
      if (!canWrite) {
        return NextResponse.json(
          { error: "You do not have access to this garden" },
          { status: 403 }
        );
      }
    }

    const bed = await prisma.bed.create({
      data: {
        userId: session.user.sub as string,
        gardenId: gardenId || null,
        name,
        widthFt: parseInt(widthFt, 10),
        lengthFt: parseInt(lengthFt, 10),
        sunExposure,
        gardenType: gardenType || "square-foot",
        color,
        cells: {},
      },
    });

    return NextResponse.json(bed, { status: 201 });
  } catch (error) {
    console.error("Error creating bed:", error);
    return NextResponse.json(
      { error: "Failed to create bed" },
      { status: 500 }
    );
  }
}
