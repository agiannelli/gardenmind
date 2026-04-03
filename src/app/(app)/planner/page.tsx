"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useBeds } from "@/hooks/useBeds";
import { EmptyState } from "@/components/planner/EmptyState";
import { CreateBedModal } from "@/components/planner/CreateBedModal";
import { BedGrid } from "@/components/planner/BedGrid";
import { PlantSelector } from "@/components/planner/PlantSelector";
import { BedToolbar } from "@/components/planner/BedToolbar";
import { PlantList } from "@/components/planner/PlantList";
import { Modal, Button } from "@/components/ui";
import { PLANT_MAP } from "@/lib/plants";
import { analyzeDimensionChange, toExcelCoord } from "@/lib/bedUtils";
import type { Bed, CellData } from "@/types";

function PlannerPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    beds,
    loading,
    error,
    createBed,
    updateBed,
    deleteBed,
    plantInCell,
    removeFromCell,
  } = useBeds();

  const bedIdFromUrl = searchParams.get("bed");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingBed, setEditingBed] = useState<Bed | null>(null);
  const [plantModalOpen, setPlantModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [plantInfoModalOpen, setPlantInfoModalOpen] = useState(false);
  const [selectedPlantCell, setSelectedPlantCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [dimensionWarning, setDimensionWarning] = useState<{
    bedData: {
      name: string;
      widthFt: number;
      lengthFt: number;
      sunExposure: string;
      gardenType: string;
      color: string;
    };
    analysis: {
      affectedPlants: Array<{ key: string; plantId: string; row: number; col: number }>;
      willLosePlants: boolean;
      plantCount: number;
    };
  } | null>(null);

  const activeBed = bedIdFromUrl
    ? beds.find((bed) => bed.id === bedIdFromUrl) || null
    : null;

  const handleCreateBed = async (bedData: {
    name: string;
    widthFt: number;
    lengthFt: number;
    sunExposure: string;
    gardenType: string;
    color: string;
  }) => {
    try {
      const newBed = await createBed(bedData);
      setCreateModalOpen(false);
      router.push(`/planner?bed=${newBed.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create bed");
    }
  };

  const handleEditBed = async (bedData: {
    name: string;
    widthFt: number;
    lengthFt: number;
    sunExposure: string;
    gardenType: string;
    color: string;
  }) => {
    if (!editingBed) return;

    // Check if dimensions are changing and if it affects plants
    const dimensionsChanged =
      bedData.widthFt !== editingBed.widthFt ||
      bedData.lengthFt !== editingBed.lengthFt;

    if (dimensionsChanged) {
      const analysis = analyzeDimensionChange(
        editingBed,
        bedData.widthFt,
        bedData.lengthFt
      );

      // If plants will be affected, show warning
      if (analysis.willLosePlants) {
        setDimensionWarning({ bedData, analysis });
        setCreateModalOpen(false);
        return;
      }
    }

    // No dimension issues, proceed with update
    try {
      await updateBed(editingBed.id, bedData);
      setEditingBed(null);
      setCreateModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update bed");
    }
  };

  const handleConfirmDimensionChange = async () => {
    if (!editingBed || !dimensionWarning) return;

    try {
      await updateBed(editingBed.id, dimensionWarning.bedData);
      setEditingBed(null);
      setDimensionWarning(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update bed");
    }
  };

  const handleCancelDimensionChange = () => {
    // Reopen the edit modal so user can adjust
    setDimensionWarning(null);
    setCreateModalOpen(true);
  };

  const handleDeleteBed = async () => {
    if (!activeBed) return;

    try {
      await deleteBed(activeBed.id);
      setDeleteModalOpen(false);
      router.push("/planner");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete bed");
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (!activeBed) return;

    const key = `${row}_${col}`;
    const cell = activeBed.cells[key];

    if (cell) {
      // Cell is occupied - show plant info
      setSelectedPlantCell({ row, col });
      setPlantInfoModalOpen(true);
    } else {
      // Cell is empty - open plant selector
      setSelectedCell({ row, col });
      setPlantModalOpen(true);
    }
  };

  const handlePlantSelect = async (plantId: string) => {
    if (!activeBed || !selectedCell) return;

    try {
      await plantInCell(
        activeBed.id,
        selectedCell.row,
        selectedCell.col,
        plantId
      );
      setPlantModalOpen(false);
      setSelectedCell(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to plant");
    }
  };

  const handleRemovePlant = async () => {
    if (!activeBed || !selectedPlantCell) return;

    try {
      await removeFromCell(
        activeBed.id,
        selectedPlantCell.row,
        selectedPlantCell.col
      );
      setPlantInfoModalOpen(false);
      setSelectedPlantCell(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove plant");
    }
  };

  const handleMovePlant = async (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number
  ) => {
    if (!activeBed) return;

    try {
      // Get the plant at the source cell
      const sourceKey = `${fromRow}_${fromCol}`;
      const sourceCell = activeBed.cells[sourceKey];

      if (!sourceCell || !sourceCell.isAnchor) {
        alert("Can only move anchor cells");
        return;
      }

      // Check if target cell is empty
      const targetKey = `${toRow}_${toCol}`;
      if (activeBed.cells[targetKey]) {
        alert("Target cell is occupied");
        return;
      }

      const plantId = sourceCell.plantId;

      // Remove from old location
      await removeFromCell(activeBed.id, fromRow, fromCol);

      // Plant at new location
      await plantInCell(activeBed.id, toRow, toCol, plantId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to move plant");
    }
  };

  const getPlantInfo = () => {
    if (!activeBed || !selectedPlantCell) return null;

    const key = `${selectedPlantCell.row}_${selectedPlantCell.col}`;
    const cell = activeBed.cells[key] as CellData | undefined;

    if (!cell) return null;

    return PLANT_MAP[cell.plantId];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sage-600">Loading your beds...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  // ─── BED LIST VIEW ───────────────────────────────────────────────────
  // Show bed list when no ?bed= query param is present
  if (!bedIdFromUrl) {
    if (beds.length === 0) {
      return (
        <>
          <EmptyState onCreateClick={() => setCreateModalOpen(true)} />
          <CreateBedModal
            open={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onSave={handleCreateBed}
          />
        </>
      );
    }

    return (
      <div className="h-full overflow-auto">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-serif text-sage-700 mb-2">
                Garden Planner
              </h1>
              <p className="text-sage-600">
                Select a bed to view and edit, or create a new one.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => setCreateModalOpen(true)}
            >
              + Create New Bed
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {beds.map((bed) => {
              const plantCount = Object.values(bed.cells).filter(
                (c) => c.isAnchor
              ).length;

              return (
                <div
                  key={bed.id}
                  onClick={() => router.push(`/planner?bed=${bed.id}`)}
                  className="cursor-pointer"
                >
                  <div className="bg-white border border-sage-200 rounded-lg p-4 hover:border-sage-400 hover:shadow-md transition-all">
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                        style={{ backgroundColor: bed.color }}
                      />
                      <div className="flex-1">
                        <h3 className="font-serif text-lg text-sage-700">
                          {bed.name}
                        </h3>
                        <p className="text-sm text-sage-600">
                          {bed.widthFt}×{bed.lengthFt} ft · {bed.gardenType}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-sage-600">
                      <div>
                        <span className="font-medium">{plantCount}</span> plant
                        {plantCount !== 1 ? "s" : ""}
                      </div>
                      <div className="capitalize">
                        {bed.sunExposure.replace("-", " ")}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <CreateBedModal
            open={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onSave={handleCreateBed}
          />
        </div>
      </div>
    );
  }

  // ─── BED EDITOR VIEW ─────────────────────────────────────────────────
  // Show bed editor when ?bed=ID is present

  // Check if bed exists
  if (!activeBed) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-sage-600 mb-4">Bed not found</p>
          <Button onClick={() => router.push("/planner")} variant="outline">
            Back to Bed List
          </Button>
        </div>
      </div>
    );
  }

  const plantInfo = getPlantInfo();

  return (
    <div className="h-full flex flex-col">
      {activeBed && (
        <>
          {/* Back button */}
          <div className="px-4 pt-3 pb-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/planner")}
            >
              ← Back to Beds
            </Button>
          </div>

          <BedToolbar
            bed={activeBed}
            onEdit={() => {
              setEditingBed(activeBed);
              setCreateModalOpen(true);
            }}
            onDelete={() => setDeleteModalOpen(true)}
          />
          <div className="flex-1 overflow-auto flex gap-6 p-4">
            {/* Grid on the left */}
            <div className="flex-shrink-0">
              <BedGrid
                bed={activeBed}
                onCellClick={handleCellClick}
                onMovePlant={handleMovePlant}
              />
            </div>
            {/* Plant list on the right */}
            <div className="flex-shrink-0 w-80">
              <PlantList
                bed={activeBed}
                onPlantClick={(row, col) => {
                  setSelectedPlantCell({ row, col });
                  setPlantInfoModalOpen(true);
                }}
                onRemovePlant={(row, col) => {
                  setSelectedPlantCell({ row, col });
                  setPlantInfoModalOpen(true);
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* Create/Edit Bed Modal */}
      <CreateBedModal
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingBed(null);
        }}
        onSave={editingBed ? handleEditBed : handleCreateBed}
        bed={editingBed || undefined}
      />

      {/* Plant Selector Modal */}
      {activeBed && (
        <PlantSelector
          open={plantModalOpen}
          onClose={() => {
            setPlantModalOpen(false);
            setSelectedCell(null);
          }}
          onSelect={handlePlantSelect}
          bedSunExposure={activeBed.sunExposure}
          bedGardenType={activeBed.gardenType}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-2xl font-serif text-sage-700 mb-4">
            Delete Bed?
          </h2>
          <p className="text-sage-600 mb-6">
            Are you sure you want to delete &quot;{activeBed?.name}&quot;? This
            will remove all plants permanently.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => setDeleteModalOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteBed}
              variant="primary"
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Plant Info Modal */}
      {plantInfo && (
        <Modal
          open={plantInfoModalOpen}
          onClose={() => {
            setPlantInfoModalOpen(false);
            setSelectedPlantCell(null);
          }}
        >
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <span className="text-5xl">{plantInfo.emoji}</span>
              <div>
                <h2 className="text-2xl font-serif text-sage-700">
                  {plantInfo.name}
                </h2>
                <p className="text-sm text-sage-600 italic">
                  {plantInfo.latinName}
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-6 text-sage-700">
              <p>
                <strong>Spacing:</strong> {plantInfo.spacingIn} inches
              </p>
              <p>
                <strong>Sun Needs:</strong>{" "}
                <span className="capitalize">
                  {plantInfo.sunNeeds.replace("-", " ")}
                </span>
              </p>
              <p>
                <strong>Water Needs:</strong>{" "}
                <span className="capitalize">{plantInfo.waterNeeds}</span>
              </p>
              <p>
                <strong>Days to Harvest:</strong> {plantInfo.daysToHarvest}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                onClick={() => {
                  setPlantInfoModalOpen(false);
                  setSelectedPlantCell(null);
                }}
                variant="outline"
              >
                Close
              </Button>
              <Button
                onClick={handleRemovePlant}
                variant="primary"
                className="bg-red-600 hover:bg-red-700"
              >
                Remove Plant
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Dimension Change Warning Modal */}
      {dimensionWarning && (
        <Modal
          open={!!dimensionWarning}
          onClose={() => setDimensionWarning(null)}
        >
          <div className="p-6">
            <h2 className="text-2xl font-serif text-sage-700 mb-4">
              ⚠️ Plants Will Be Affected
            </h2>

            <div className="mb-6 space-y-3">
              <p className="text-sage-700">
                Changing the bed dimensions will affect{" "}
                <strong>{dimensionWarning.analysis.affectedPlants.length}</strong>{" "}
                of your <strong>{dimensionWarning.analysis.plantCount}</strong>{" "}
                planted {dimensionWarning.analysis.plantCount === 1 ? "item" : "items"}.
              </p>

              <div className="bg-sage-50 border border-sage-200 rounded-md p-4">
                <p className="font-medium text-sage-700 mb-2">
                  These plants will be removed:
                </p>
                <ul className="space-y-1">
                  {dimensionWarning.analysis.affectedPlants.map((plant) => {
                    const plantInfo = PLANT_MAP[plant.plantId];
                    const coord = toExcelCoord(plant.row, plant.col);
                    return (
                      <li key={plant.key} className="text-sage-600 text-sm">
                        {plantInfo?.emoji} {plantInfo?.name} at {coord}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <p className="text-sm text-sage-600">
                <strong>Note:</strong> These plants are outside the new bed dimensions
                and cannot be automatically repositioned. You will need to replant them manually.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button onClick={handleCancelDimensionChange} variant="outline">
                Cancel - Keep Current Size
              </Button>
              <Button
                onClick={handleConfirmDimensionChange}
                variant="primary"
                className="bg-red-600 hover:bg-red-700"
              >
                Proceed - Remove Plants
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <p className="text-sage-600">Loading planner...</p>
      </div>
    }>
      <PlannerPageContent />
    </Suspense>
  );
}
