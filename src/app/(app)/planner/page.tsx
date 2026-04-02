"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useBeds } from "@/hooks/useBeds";
import { EmptyState } from "@/components/planner/EmptyState";
import { CreateBedModal } from "@/components/planner/CreateBedModal";
import { BedGrid } from "@/components/planner/BedGrid";
import { PlantSelector } from "@/components/planner/PlantSelector";
import { BedToolbar } from "@/components/planner/BedToolbar";
import { Modal, Button } from "@/components/ui";
import { PLANT_MAP } from "@/lib/plants";
import type { Bed, CellData } from "@/types";

function PlannerPageContent() {
  const searchParams = useSearchParams();
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

  const [activeBedId, setActiveBedId] = useState<string | null>(null);
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

  const activeBed = beds.find((bed) => bed.id === activeBedId) || null;

  // Set active bed from URL query param or auto-select first bed
  useEffect(() => {
    if (beds.length === 0) return;

    const bedIdFromUrl = searchParams.get("bed");
    if (bedIdFromUrl && beds.find((bed) => bed.id === bedIdFromUrl)) {
      setActiveBedId(bedIdFromUrl);
    } else if (!activeBedId) {
      setActiveBedId(beds[0].id);
    }
  }, [beds, searchParams, activeBedId]);

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
      setActiveBedId(newBed.id);
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

    try {
      await updateBed(editingBed.id, bedData);
      setEditingBed(null);
      setCreateModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update bed");
    }
  };

  const handleDeleteBed = async () => {
    if (!activeBed) return;

    try {
      await deleteBed(activeBed.id);
      setDeleteModalOpen(false);
      setActiveBedId(null);
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

  const plantInfo = getPlantInfo();

  return (
    <div className="h-full flex flex-col">
      {activeBed && (
        <>
          <BedToolbar
            bed={activeBed}
            onEdit={() => {
              setEditingBed(activeBed);
              setCreateModalOpen(true);
            }}
            onDelete={() => setDeleteModalOpen(true)}
          />
          <div className="flex-1 overflow-auto">
            <BedGrid bed={activeBed} onCellClick={handleCellClick} />
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
