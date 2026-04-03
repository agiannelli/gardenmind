"use client";

import { useState, useMemo } from "react";
import { PLANTS } from "@/lib/plants";
import { searchPlants, filterPlants } from "@/lib/plantUtils";
import { PlantCard } from "@/components/library/PlantCard";
import { PlantFilters } from "@/components/library/PlantFilters";
import { PlantDetailModal } from "@/components/library/PlantDetailModal";
import { Button } from "@/components/ui/Button";
import type { Plant } from "@/types";

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSun, setSelectedSun] = useState<string | null>(null);
  const [selectedWater, setSelectedWater] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Filter and search plants
  const filteredPlants = useMemo(() => {
    let results = PLANTS;

    // Apply search
    if (searchQuery) {
      results = searchPlants(searchQuery);
    }

    // Apply filters
    results = filterPlants(results, {
      type: selectedType,
      sunNeeds: selectedSun,
      waterNeeds: selectedWater,
    });

    return results;
  }, [searchQuery, selectedType, selectedSun, selectedWater]);

  const handlePlantClick = (plant: Plant) => {
    setSelectedPlant(plant);
    setDetailModalOpen(true);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedType(null);
    setSelectedSun(null);
    setSelectedWater(null);
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-sage-700 mb-2">
            Plant Library
          </h1>
          <p className="text-sage-600">
            Browse {PLANTS.length} plants with detailed care information and
            companion planting guides.
          </p>
        </div>

        {/* Filters */}
        <PlantFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedSun={selectedSun}
          onSunChange={setSelectedSun}
          selectedWater={selectedWater}
          onWaterChange={setSelectedWater}
          onClearFilters={handleClearFilters}
        />

        {/* Results Count */}
        <p className="text-sm text-sage-600 mb-4">
          Showing {filteredPlants.length} of {PLANTS.length} plants
        </p>

        {/* Plant Grid */}
        {filteredPlants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                onClick={() => handlePlantClick(plant)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-sage-500">No plants match your filters.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="mt-4"
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Detail Modal */}
        <PlantDetailModal
          plant={selectedPlant}
          open={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedPlant(null);
          }}
        />
      </div>
    </div>
  );
}
