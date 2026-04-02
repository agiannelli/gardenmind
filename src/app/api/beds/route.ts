import { getSession } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { SunExposure, GardenType } from "@/types";

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

    const beds = await prisma.bed.findMany({
      where: {
        userId: session.user.sub,
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
    const { name, widthFt, lengthFt, sunExposure, gardenType, color } = body;

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

    const bed = await prisma.bed.create({
      data: {
        userId: session.user.sub,
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
