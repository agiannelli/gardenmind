import { getSession } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PLANT_MAP } from "@/lib/plants";
import {
  calculateCellsNeeded,
  canPlant,
  cellKey,
  getOccupiedCells,
} from "@/lib/bedUtils";
import type { CellData, Bed, SunExposure, GardenType } from "@/types";

// Required for Next.js 15 cookies() API
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/beds/[id]/plant
 * Plant a plant in a bed
 */
export async function POST(request: Request, context: RouteContext) {
  try {
    // NOTE: Auth0 v3.5.0 uses cookies() synchronously, causing warnings in Next.js 15
    // This is a known compatibility issue. The app still works correctly.
    // Resolution: Upgrade to @auth0/nextjs-auth0 v4+ when available/documented
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
    const { row, col, plantId } = body;

    // Validation
    if (
      typeof row !== "number" ||
      typeof col !== "number" ||
      row < 0 ||
      col < 0
    ) {
      return NextResponse.json(
        { error: "Invalid row or column" },
        { status: 400 }
      );
    }

    const plant = PLANT_MAP[plantId];
    if (!plant) {
      return NextResponse.json({ error: "Invalid plant ID" }, { status: 400 });
    }

    // Convert bed to typed Bed object
    const typedBed: Bed = {
      ...bed,
      sunExposure: bed.sunExposure as SunExposure,
      gardenType: (bed.gardenType as GardenType) || "square-foot",
      cells: (bed.cells as unknown) as Record<string, CellData>,
      createdAt: bed.createdAt.toISOString(),
      updatedAt: bed.updatedAt.toISOString(),
    };

    // Check if plant can be planted
    if (!canPlant(typedBed, row, col, plant)) {
      return NextResponse.json(
        { error: "Cannot plant here - insufficient space or cells occupied" },
        { status: 400 }
      );
    }

    // Calculate cells needed based on bed's garden type
    const { rows, cols } = calculateCellsNeeded(plant.spacingIn, typedBed.gardenType);

    // Update cells
    const updatedCells = { ...typedBed.cells };
    const anchorKey = cellKey(row, col);

    // Set anchor cell
    updatedCells[anchorKey] = {
      plantId: plant.id,
      isAnchor: true,
    };

    // Set overflow cells (if any)
    for (let r = row; r < row + rows; r++) {
      for (let c = col; c < col + cols; c++) {
        const key = cellKey(r, c);
        if (key !== anchorKey) {
          updatedCells[key] = {
            plantId: plant.id,
            isAnchor: false,
            anchorCell: anchorKey,
          };
        }
      }
    }

    // Update bed in database
    const updatedBed = await prisma.bed.update({
      where: { id },
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cells: updatedCells as any,
      },
    });

    return NextResponse.json(updatedBed);
  } catch (error) {
    console.error("Error planting:", error);
    return NextResponse.json(
      { error: "Failed to plant" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/beds/[id]/plant
 * Remove a plant from a bed
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

    const body = await request.json();
    const { row, col } = body;

    // Validation
    if (
      typeof row !== "number" ||
      typeof col !== "number" ||
      row < 0 ||
      col < 0
    ) {
      return NextResponse.json(
        { error: "Invalid row or column" },
        { status: 400 }
      );
    }

    const key = cellKey(row, col);
    const cells = (bed.cells as unknown) as Record<string, CellData>;
    const cell = cells[key];

    if (!cell) {
      return NextResponse.json(
        { error: "No plant at this location" },
        { status: 400 }
      );
    }

    // Convert bed to typed Bed object
    const typedBed: Bed = {
      ...bed,
      sunExposure: bed.sunExposure as SunExposure,
      gardenType: (bed.gardenType as GardenType) || "square-foot",
      cells,
      createdAt: bed.createdAt.toISOString(),
      updatedAt: bed.updatedAt.toISOString(),
    };

    // Get anchor cell
    const anchorKey = cell.isAnchor ? key : cell.anchorCell;
    if (!anchorKey) {
      return NextResponse.json(
        { error: "Invalid cell data" },
        { status: 400 }
      );
    }

    const [anchorRow, anchorCol] = anchorKey
      .split("_")
      .map(Number) as [number, number];

    // Get all occupied cells
    const occupiedCells = getOccupiedCells(typedBed, anchorRow, anchorCol);

    // Remove all occupied cells
    const updatedCells = { ...cells };
    for (const cellKey of occupiedCells) {
      delete updatedCells[cellKey];
    }

    // Update bed in database
    const updatedBed = await prisma.bed.update({
      where: { id },
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cells: updatedCells as any,
      },
    });

    return NextResponse.json(updatedBed);
  } catch (error) {
    console.error("Error removing plant:", error);
    return NextResponse.json(
      { error: "Failed to remove plant" },
      { status: 500 }
    );
  }
}
