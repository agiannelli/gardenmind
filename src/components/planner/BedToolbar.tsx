import { Button } from "@/components/ui";
import type { Bed, BedFacing } from "@/types";

const FACING_DEGREES: Record<BedFacing, number> = {
  north: 0, northeast: 45, east: 90, southeast: 135,
  south: 180, southwest: 225, west: 270, northwest: 315,
};

function CompassIndicator({ facing }: { facing: BedFacing }) {
  const deg = FACING_DEGREES[facing];
  const label = facing.charAt(0).toUpperCase() + facing.slice(1);
  return (
    <div className="flex items-center gap-1.5" title={`Faces ${label}`}>
      <svg width="22" height="22" viewBox="0 0 22 22" className="shrink-0">
        <circle cx="11" cy="11" r="10" fill="none" stroke="#84A98C" strokeWidth="1.5" />
        <g transform={`rotate(${deg}, 11, 11)`}>
          {/* North (red) needle */}
          <polygon points="11,3 9.5,11 12.5,11" fill="#C45C4C" />
          {/* South (grey) needle */}
          <polygon points="11,19 9.5,11 12.5,11" fill="#B0BEC5" />
        </g>
        <circle cx="11" cy="11" r="1.5" fill="#52735A" />
      </svg>
      <span className="text-sm text-sage-600 capitalize">{label}</span>
    </div>
  );
}

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
          <div className="mt-1">
            <CompassIndicator facing={bed.facing} />
          </div>
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
