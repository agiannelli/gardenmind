import { getSession } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { SunExposure, CellData, GardenType, BedFacing } from "@/types";

// NOTE: @auth0/nextjs-auth0@3.5.0 causes Next.js 15 cookies warnings
// This doesn't break functionality, but generates console warnings
// Resolution: Migrate to Auth0 v4 when migration path is clearer
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/beds/[id]
 * Get a single bed by ID
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const bed = await prisma.bed.findUnique({
      where: { id },
    });

    if (!bed) {
      return NextResponse.json({ error: "Bed not found" }, { status: 404 });
    }

    if (bed.userId !== session.user.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(bed);
  } catch (error) {
    console.error("Error fetching bed:", error);
    return NextResponse.json(
      { error: "Failed to fetch bed" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/beds/[id]
 * Update a bed
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const bed = await prisma.bed.findUnique({
      where: { id },
    });

    if (!bed) {
      return NextResponse.json({ error: "Bed not found" }, { status: 404 });
    }

    if (bed.userId !== session.user.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, widthFt, lengthFt, sunExposure, gardenType, facing, color, gardenId } = body;

    // Validation
    const updateData: {
      name?: string;
      widthFt?: number;
      lengthFt?: number;
      sunExposure?: string;
      gardenType?: string;
      facing?: string;
      color?: string;
      gardenId?: string | null;
      cells?: Record<string, CellData>;
    } = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.length < 1 || name.length > 50) {
        return NextResponse.json(
          { error: "Name must be between 1 and 50 characters" },
          { status: 400 }
        );
      }
      updateData.name = name;
    }

    if (widthFt !== undefined || lengthFt !== undefined) {
      const newWidth = widthFt !== undefined ? parseInt(widthFt, 10) : bed.widthFt;
      const newLength = lengthFt !== undefined ? parseInt(lengthFt, 10) : bed.lengthFt;

      if (newWidth < 1 || newWidth > 20 || newLength < 1 || newLength > 20) {
        return NextResponse.json(
          { error: "Dimensions must be between 1 and 20 feet" },
          { status: 400 }
        );
      }

      updateData.widthFt = newWidth;
      updateData.lengthFt = newLength;

      // Remove plants that are now out of bounds
      const cells = (bed.cells as unknown) as Record<string, CellData>;
      const updatedCells: Record<string, CellData> = {};

      for (const [key, value] of Object.entries(cells)) {
        const [row, col] = key.split("_").map(Number);
        if (row < newLength && col < newWidth) {
          updatedCells[key] = value;
        }
      }

      updateData.cells = (updatedCells as unknown) as Record<string, CellData>;
    }

    if (sunExposure !== undefined) {
      const validSunExposures: SunExposure[] = [
        "full-sun",
        "partial-sun",
        "full-shade",
      ];
      if (!validSunExposures.includes(sunExposure)) {
        return NextResponse.json(
          { error: "Invalid sun exposure" },
          { status: 400 }
        );
      }
      updateData.sunExposure = sunExposure;
    }

    if (gardenType !== undefined) {
      const validGardenTypes: GardenType[] = [
        "traditional",
        "square-foot",
        "intensive",
      ];
      if (!validGardenTypes.includes(gardenType)) {
        return NextResponse.json(
          { error: "Invalid garden type" },
          { status: 400 }
        );
      }
      updateData.gardenType = gardenType;
    }

    if (color !== undefined) {
      if (typeof color !== "string" || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
        return NextResponse.json(
          { error: "Invalid color format (must be hex code)" },
          { status: 400 }
        );
      }
      updateData.color = color;
    }

    if (facing !== undefined) {
      const validFacings: BedFacing[] = ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"];
      if (!validFacings.includes(facing)) {
        return NextResponse.json({ error: "Invalid facing direction" }, { status: 400 });
      }
      updateData.facing = facing;
    }

    if (gardenId !== undefined) {
      // null clears the assignment; a string value assigns to a garden
      updateData.gardenId = gardenId === "" ? null : gardenId || null;
    }

    const updatedBed = await prisma.bed.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: updateData as any,
    });

    return NextResponse.json(updatedBed);
  } catch (error) {
    console.error("Error updating bed:", error);
    return NextResponse.json(
      { error: "Failed to update bed" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/beds/[id]
 * Delete a bed
 */
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const bed = await prisma.bed.findUnique({
      where: { id },
    });

    if (!bed) {
      return NextResponse.json({ error: "Bed not found" }, { status: 404 });
    }

    if (bed.userId !== session.user.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.bed.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bed:", error);
    return NextResponse.json(
      { error: "Failed to delete bed" },
      { status: 500 }
    );
  }
}
