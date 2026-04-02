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
