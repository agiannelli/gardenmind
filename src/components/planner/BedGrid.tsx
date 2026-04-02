"use client";

import { PLANT_MAP } from "@/lib/plants";
import { calculateCellsNeeded, calculatePlantsPerCell } from "@/lib/bedUtils";
import type { Bed, CellData } from "@/types";

interface BedGridProps {
  bed: Bed;
  onCellClick: (row: number, col: number) => void;
}

export function BedGrid({ bed, onCellClick }: BedGridProps) {
  const { widthFt, lengthFt, cells } = bed;

  // Create a map to track which cells are overflow cells
  const overflowCells = new Set<string>();
  const anchorCells = new Map<string, CellData>();

  // First pass: identify anchor cells
  for (const [key, cell] of Object.entries(cells)) {
    if (cell.isAnchor) {
      anchorCells.set(key, cell);
    } else {
      overflowCells.add(key);
    }
  }

  // Render a single cell
  const renderCell = (row: number, col: number) => {
    const key = `${row}_${col}`;
    const cell = cells[key];

    // If cell is empty
    if (!cell) {
      return (
        <button
          key={key}
          onClick={() => onCellClick(row, col)}
          className="w-12 h-12 border border-sage-200 hover:bg-sage-50 transition-colors flex items-center justify-center bg-white rounded-sm"
          aria-label={`Empty cell at row ${row}, column ${col}`}
        />
      );
    }

    // If cell is an overflow cell, don't render (anchor cell handles it)
    if (!cell.isAnchor) {
      return null;
    }

    // Render anchor cell with plant
    const plant = PLANT_MAP[cell.plantId];
    if (!plant) {
      return (
        <div
          key={key}
          className="w-12 h-12 border border-sage-200 bg-red-100 flex items-center justify-center rounded-sm"
        >
          ?
        </div>
      );
    }

    const { rows, cols } = calculateCellsNeeded(plant.spacingIn, bed.gardenType);
    const plantsPerCell = calculatePlantsPerCell(plant.spacingIn, bed.gardenType);

    return (
      <button
        key={key}
        onClick={() => onCellClick(row, col)}
        className="border border-sage-300 bg-white hover:bg-sage-50 transition-colors flex flex-col items-center justify-center rounded-sm relative group"
        style={{
          gridColumn: `span ${cols}`,
          gridRow: `span ${rows}`,
          width: `${cols * 48}px`,
          height: `${rows * 48}px`,
        }}
        aria-label={`${plant.name} at row ${row}, column ${col}`}
      >
        <span className="text-2xl">{plant.emoji}</span>
        {plantsPerCell > 1 && (
          <span className="text-xs text-sage-700 font-medium mt-1">
            ×{plantsPerCell}
          </span>
        )}
        {/* Tooltip on hover */}
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-sage-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          {plant.name}
        </span>
      </button>
    );
  };

  return (
    <div className="overflow-auto p-4">
      <div
        className="inline-grid gap-0"
        style={{
          gridTemplateColumns: `repeat(${widthFt}, 48px)`,
          gridTemplateRows: `repeat(${lengthFt}, 48px)`,
        }}
      >
        {Array.from({ length: lengthFt }, (_, row) =>
          Array.from({ length: widthFt }, (_, col) => {
            const key = `${row}_${col}`;
            // Skip rendering overflow cells
            if (overflowCells.has(key)) {
              return null;
            }
            return renderCell(row, col);
          })
        )}
      </div>
    </div>
  );
}
