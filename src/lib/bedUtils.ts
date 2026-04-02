import type { Bed, Plant, GardenType } from "@/types";

/**
 * Get spacing multiplier based on garden type.
 * - traditional: 1.0x (traditional row spacing)
 * - square-foot: 0.5x (intensive SFG spacing)
 * - intensive: 0.35x (chaos garden, very tight)
 */
export function getSpacingMultiplier(gardenType: GardenType): number {
  switch (gardenType) {
    case "traditional":
      return 1.0;
    case "square-foot":
      return 0.5;
    case "intensive":
      return 0.35;
    default:
      return 0.5; // Default to square-foot
  }
}

/**
 * Calculate effective spacing for a plant based on garden type.
 */
export function getEffectiveSpacing(
  spacingIn: number,
  gardenType: GardenType
): number {
  const multiplier = getSpacingMultiplier(gardenType);
  return Math.max(3, Math.round(spacingIn * multiplier)); // Minimum 3 inches
}

/**
 * Calculate the number of cells needed for a plant based on its spacing in inches.
 * 1 square foot = 12 inches.
 */
export function calculateCellsNeeded(
  spacingIn: number,
  gardenType: GardenType = "square-foot"
): {
  rows: number;
  cols: number;
} {
  const effectiveSpacing = getEffectiveSpacing(spacingIn, gardenType);
  const cellsPerDimension = Math.ceil(effectiveSpacing / 12);
  return { rows: cellsPerDimension, cols: cellsPerDimension };
}

/**
 * Calculate how many plants can fit in a single cell for plants with spacing < 12 inches.
 * Formula: (12 / effectiveSpacing) ^ 2
 */
export function calculatePlantsPerCell(
  spacingIn: number,
  gardenType: GardenType = "square-foot"
): number {
  const effectiveSpacing = getEffectiveSpacing(spacingIn, gardenType);
  if (effectiveSpacing >= 12) return 1;
  const plantsPerDimension = Math.floor(12 / effectiveSpacing);
  return plantsPerDimension * plantsPerDimension;
}

/**
 * Check if a plant can be planted at a given position in the bed.
 */
export function canPlant(
  bed: Bed,
  row: number,
  col: number,
  plant: Plant
): boolean {
  const { rows, cols } = calculateCellsNeeded(plant.spacingIn, bed.gardenType);

  // Check bounds
  if (row + rows > bed.lengthFt || col + cols > bed.widthFt) {
    return false;
  }

  // Check all required cells are empty
  for (let r = row; r < row + rows; r++) {
    for (let c = col; c < col + cols; c++) {
      const key = cellKey(r, c);
      if (bed.cells[key]) return false;
    }
  }

  return true;
}

/**
 * Get all cells occupied by a plant starting from its anchor cell.
 */
export function getOccupiedCells(
  bed: Bed,
  anchorRow: number,
  anchorCol: number
): string[] {
  const anchorKey = cellKey(anchorRow, anchorCol);
  const anchorCell = bed.cells[anchorKey];

  if (!anchorCell || !anchorCell.isAnchor) {
    return [];
  }

  const occupiedCells: string[] = [anchorKey];

  // Find all cells that reference this anchor
  for (const [key, cell] of Object.entries(bed.cells)) {
    if (!cell.isAnchor && cell.anchorCell === anchorKey) {
      occupiedCells.push(key);
    }
  }

  return occupiedCells;
}

/**
 * Format a cell key from row and column indices.
 */
export function cellKey(row: number, col: number): string {
  return `${row}_${col}`;
}

/**
 * Parse a cell key into row and column indices.
 */
export function parseCellKey(key: string): { row: number; col: number } {
  const [row, col] = key.split("_").map(Number);
  return { row, col };
}

/**
 * Analyze dimension changes and determine which plants will be affected.
 * Returns information about plants that will be lost and those that can be kept.
 */
export function analyzeDimensionChange(
  bed: Bed,
  newWidth: number,
  newLength: number
): {
  affectedPlants: Array<{ key: string; plantId: string; row: number; col: number }>;
  willLosePlants: boolean;
  plantCount: number;
} {
  const affectedPlants: Array<{ key: string; plantId: string; row: number; col: number }> = [];
  let plantCount = 0;

  // Find all anchor cells (actual plants, not overflow cells)
  for (const [key, cell] of Object.entries(bed.cells)) {
    if (cell.isAnchor) {
      plantCount++;
      const { row, col } = parseCellKey(key);

      // Check if this plant will be out of bounds
      if (row >= newLength || col >= newWidth) {
        affectedPlants.push({ key, plantId: cell.plantId, row, col });
      }
    }
  }

  return {
    affectedPlants,
    willLosePlants: affectedPlants.length > 0,
    plantCount,
  };
}

/**
 * Attempt to auto-reposition plants when dimensions change.
 * Returns updated cells with plants moved to available spots when possible.
 */
export function attemptAutoReposition(
  bed: Bed,
  newWidth: number,
  newLength: number,
  plantMap: Record<string, Plant>
): {
  cells: Bed["cells"];
  repositioned: Array<{ plantId: string; from: string; to: string }>;
  lost: Array<{ plantId: string; at: string }>;
} {
  const repositioned: Array<{ plantId: string; from: string; to: string }> = [];
  const lost: Array<{ plantId: string; at: string }> = [];

  // Start with empty cells for the new dimensions
  const newCells: Bed["cells"] = {};

  // Create a temporary bed object for canPlant checks
  const tempBed: Bed = {
    ...bed,
    widthFt: newWidth,
    lengthFt: newLength,
    cells: newCells,
  };

  // First, keep all plants that are still in bounds
  for (const [key, cell] of Object.entries(bed.cells)) {
    if (!cell.isAnchor) continue; // Only process anchor cells

    const { row, col } = parseCellKey(key);
    const plant = plantMap[cell.plantId];

    if (!plant) continue;

    // Check if plant is still in bounds and has space
    if (row < newLength && col < newWidth) {
      const { rows, cols } = calculateCellsNeeded(plant.spacingIn, bed.gardenType);

      // Check if all cells needed are still in bounds
      if (row + rows <= newLength && col + cols <= newWidth) {
        // Plant fits in its current position
        const anchorKey = cellKey(row, col);
        newCells[anchorKey] = { plantId: plant.id, isAnchor: true };

        // Add overflow cells
        for (let r = row; r < row + rows; r++) {
          for (let c = col; c < col + cols; c++) {
            const k = cellKey(r, c);
            if (k !== anchorKey) {
              newCells[k] = {
                plantId: plant.id,
                isAnchor: false,
                anchorCell: anchorKey,
              };
            }
          }
        }
        continue;
      }
    }

    // Plant doesn't fit at current position, try to find a new spot
    let foundSpot = false;

    for (let r = 0; r < newLength; r++) {
      for (let c = 0; c < newWidth; c++) {
        if (canPlant({ ...tempBed, cells: newCells }, r, c, plant)) {
          // Found a spot!
          const { rows, cols } = calculateCellsNeeded(plant.spacingIn, bed.gardenType);
          const newAnchorKey = cellKey(r, c);

          newCells[newAnchorKey] = { plantId: plant.id, isAnchor: true };

          // Add overflow cells
          for (let rr = r; rr < r + rows; rr++) {
            for (let cc = c; cc < c + cols; cc++) {
              const k = cellKey(rr, cc);
              if (k !== newAnchorKey) {
                newCells[k] = {
                  plantId: plant.id,
                  isAnchor: false,
                  anchorCell: newAnchorKey,
                };
              }
            }
          }

          repositioned.push({
            plantId: plant.id,
            from: key,
            to: newAnchorKey,
          });

          foundSpot = true;
          break;
        }
      }
      if (foundSpot) break;
    }

    if (!foundSpot) {
      lost.push({ plantId: plant.id, at: key });
    }
  }

  return { cells: newCells, repositioned, lost };
}
