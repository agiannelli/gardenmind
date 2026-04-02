import { Button } from "@/components/ui";
import type { Bed } from "@/types";

interface BedToolbarProps {
  bed: Bed;
  onEdit: () => void;
  onDelete: () => void;
}

export function BedToolbar({ bed, onEdit, onDelete }: BedToolbarProps) {
  // Count plants in bed (anchor cells only)
  const plantCount = Object.values(bed.cells).filter(
    (cell) => cell.isAnchor
  ).length;

  // Total capacity
  const totalCells = bed.widthFt * bed.lengthFt;

  return (
    <div className="bg-white border-b border-sage-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif text-sage-800">{bed.name}</h1>
          <p className="text-sm text-sage-600">
            {bed.widthFt}×{bed.lengthFt} ft ({totalCells} cells) • {plantCount}{" "}
            plant{plantCount !== 1 ? "s" : ""} planted •{" "}
            <span className="capitalize">{bed.sunExposure.replace("-", " ")}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={onEdit} variant="outline">
            Edit
          </Button>
          <Button onClick={onDelete} variant="outline">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
