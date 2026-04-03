"use client";

import { Modal, Button } from "@/components/ui";
import type { Bed } from "@/types";

interface AssignBedModalProps {
  open: boolean;
  onClose: () => void;
  gardenName: string;
  ungroupedBeds: Bed[];
  onAssign: (bedId: string) => Promise<void>;
}

export function AssignBedModal({
  open,
  onClose,
  gardenName,
  ungroupedBeds,
  onAssign,
}: AssignBedModalProps) {
  const handleAssign = async (bedId: string) => {
    await onAssign(bedId);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-serif text-sage-700 mb-1">
          Add existing bed
        </h2>
        <p className="text-sm text-sage-600 mb-5">
          Move an ungrouped bed into{" "}
          <span className="font-medium">{gardenName}</span>.
        </p>

        <div className="space-y-2">
          {ungroupedBeds.map((bed) => {
            const plantCount = Object.values(bed.cells).filter(
              (c) => c.isAnchor
            ).length;
            return (
              <button
                key={bed.id}
                onClick={() => handleAssign(bed.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 border border-sage-200 rounded-lg hover:border-sage-400 hover:bg-sage-50 transition-all text-left"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: bed.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sage-800 truncate">
                    {bed.name}
                  </p>
                  <p className="text-xs text-sage-500">
                    {bed.widthFt}×{bed.lengthFt} ft · {plantCount} plant
                    {plantCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <span className="text-xs text-sage-400 shrink-0">Add →</span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end mt-5">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
