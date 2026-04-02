"use client";

import { useState, useMemo } from "react";
import { Modal, Button } from "@/components/ui";
import { PLANTS } from "@/lib/plants";
import { calculateCellsNeeded } from "@/lib/bedUtils";
import type { SunExposure, Plant, GardenType } from "@/types";

interface PlantSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (plantId: string) => void;
  bedSunExposure: SunExposure;
  bedGardenType: GardenType;
}

export function PlantSelector({
  open,
  onClose,
  onSelect,
  bedSunExposure,
  bedGardenType,
}: PlantSelectorProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Filter plants
  const filteredPlants = useMemo(() => {
    return PLANTS.filter((plant) => {
      // Search filter
      if (
        search &&
        !plant.name.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }

      // Type filter
      if (typeFilter !== "all" && plant.type !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [search, typeFilter]);

  const handleSelect = (plant: Plant) => {
    onSelect(plant.id);
    setSearch("");
    setTypeFilter("all");
  };

  const handleClose = () => {
    setSearch("");
    setTypeFilter("all");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="p-6">
        <h2 className="text-2xl font-serif text-sage-700 mb-6">
          Select a Plant
        </h2>

        {/* Filters */}
        <div className="space-y-4 mb-6">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plants..."
            className="w-full px-4 py-2 border border-sage-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-400"
          />

          {/* Type filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                typeFilter === "all"
                  ? "bg-sage-600 text-white"
                  : "bg-sage-100 text-sage-700 hover:bg-sage-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter("vegetable")}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                typeFilter === "vegetable"
                  ? "bg-sage-600 text-white"
                  : "bg-sage-100 text-sage-700 hover:bg-sage-200"
              }`}
            >
              Vegetables
            </button>
            <button
              onClick={() => setTypeFilter("herb")}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                typeFilter === "herb"
                  ? "bg-sage-600 text-white"
                  : "bg-sage-100 text-sage-700 hover:bg-sage-200"
              }`}
            >
              Herbs
            </button>
            <button
              onClick={() => setTypeFilter("flower")}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                typeFilter === "flower"
                  ? "bg-sage-600 text-white"
                  : "bg-sage-100 text-sage-700 hover:bg-sage-200"
              }`}
            >
              Flowers
            </button>
            <button
              onClick={() => setTypeFilter("fruit")}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                typeFilter === "fruit"
                  ? "bg-sage-600 text-white"
                  : "bg-sage-100 text-sage-700 hover:bg-sage-200"
              }`}
            >
              Fruits
            </button>
          </div>
        </div>

        {/* Plant list */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {filteredPlants.length === 0 ? (
            <p className="text-center text-sage-600 py-8">No plants found</p>
          ) : (
            filteredPlants.map((plant) => {
              const { rows, cols } = calculateCellsNeeded(plant.spacingIn, bedGardenType);
              const cellsNeeded = rows * cols;
              const sunMismatch = plant.sunNeeds !== bedSunExposure;

              return (
                <button
                  key={plant.id}
                  onClick={() => handleSelect(plant)}
                  className="w-full text-left p-4 border border-sage-200 rounded-lg hover:bg-sage-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{plant.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sage-800">
                          {plant.name}
                        </h3>
                        {sunMismatch && (
                          <span
                            className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full"
                            title={`This plant prefers ${plant.sunNeeds}, but your bed has ${bedSunExposure}`}
                          >
                            ⚠️ Sun mismatch
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-sage-600 italic">
                        {plant.latinName}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm text-sage-600">
                        <span>{plant.spacingIn}&quot; spacing</span>
                        <span>
                          {cellsNeeded} cell{cellsNeeded > 1 ? "s" : ""}
                        </span>
                        <span>{plant.daysToHarvest} days</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end mt-6">
          <Button onClick={handleClose} variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
