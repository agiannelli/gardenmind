import type { Bed } from "@/types";

interface BedCardProps {
  bed: Bed;
  isActive: boolean;
  onClick: () => void;
}

export function BedCard({ bed, isActive, onClick }: BedCardProps) {
  // Count plants in bed (count anchor cells only)
  const plantCount = Object.values(bed.cells).filter(
    (cell) => cell.isAnchor
  ).length;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? "bg-sage-100 border-2 border-sage-400"
          : "bg-white border border-sage-200 hover:bg-sage-50"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Color indicator */}
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: bed.color }}
        />

        {/* Bed info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sage-800 truncate">{bed.name}</h3>
          <p className="text-sm text-sage-600">
            {bed.widthFt}×{bed.lengthFt} ft • {plantCount} plant
            {plantCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </button>
  );
}
