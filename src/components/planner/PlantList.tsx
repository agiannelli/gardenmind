"use client";

import { Button } from "@/components/ui";
import { PLANT_MAP } from "@/lib/plants";
import { toExcelCoord, parseCellKey } from "@/lib/bedUtils";
import type { Bed } from "@/types";

interface PlantListProps {
  bed: Bed;
  onPlantClick: (row: number, col: number) => void;
  onRemovePlant: (row: number, col: number) => void;
}

interface PlantEntry {
  plantId: string;
  row: number;
  col: number;
  coord: string;
}

export function PlantList({ bed, onPlantClick, onRemovePlant }: PlantListProps) {
  // Extract all anchor cells (actual plants, not overflow cells)
  const plants: PlantEntry[] = [];

  for (const [key, cell] of Object.entries(bed.cells)) {
    if (cell.isAnchor) {
      const { row, col } = parseCellKey(key);
      plants.push({
        plantId: cell.plantId,
        row,
        col,
        coord: toExcelCoord(row, col),
      });
    }
  }

  // Sort by coordinate for consistent display
  plants.sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });

  if (plants.length === 0) {
    return (
      <div className="bg-white border border-sage-200 rounded-lg p-6">
        <h3 className="text-lg font-serif text-sage-700 mb-4">Plants in Bed</h3>
        <p className="text-sage-500 text-sm text-center py-8">
          No plants yet. Click a cell in the grid to start planting!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-sage-200 rounded-lg p-6">
      <h3 className="text-lg font-serif text-sage-700 mb-4">
        Plants in Bed ({plants.length})
      </h3>
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {plants.map((plant) => {
          const plantInfo = PLANT_MAP[plant.plantId];
          if (!plantInfo) return null;

          return (
            <div
              key={`${plant.row}_${plant.col}`}
              className="flex items-center gap-3 p-3 bg-sage-50 rounded-md hover:bg-sage-100 transition-colors group"
            >
              <span className="text-2xl">{plantInfo.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="font-medium text-sage-700 truncate">
                    {plantInfo.name}
                  </p>
                  <span className="text-xs text-sage-500 font-mono">
                    {plant.coord}
                  </span>
                </div>
                <p className="text-xs text-sage-600 italic truncate">
                  {plantInfo.latinName}
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  onClick={() => onPlantClick(plant.row, plant.col)}
                  variant="outline"
                  className="text-xs px-2 py-1 h-auto"
                >
                  Info
                </Button>
                <Button
                  onClick={() => onRemovePlant(plant.row, plant.col)}
                  variant="outline"
                  className="text-xs px-2 py-1 h-auto text-red-600 hover:bg-red-50"
                >
                  Remove
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
