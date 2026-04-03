import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface PlantFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
  selectedSun: string | null;
  onSunChange: (sun: string | null) => void;
  selectedWater: string | null;
  onWaterChange: (water: string | null) => void;
  onClearFilters: () => void;
}

export function PlantFilters({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedSun,
  onSunChange,
  selectedWater,
  onWaterChange,
  onClearFilters,
}: PlantFiltersProps) {
  const hasActiveFilters =
    searchQuery || selectedType || selectedSun || selectedWater;

  return (
    <div className="bg-white border border-sage-200 rounded-lg p-4 mb-6">
      {/* Search Input */}
      <Input
        type="text"
        placeholder="Search plants..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {/* Filter Buttons */}
      <div className="mt-4 space-y-3">
        {/* Type Filter */}
        <div>
          <label className="text-sm font-medium text-sage-700 mb-2 block">
            Plant Type
          </label>
          <div className="flex gap-2 flex-wrap">
            {["vegetable", "herb", "flower", "fruit"].map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "primary" : "outline"}
                size="sm"
                onClick={() =>
                  onTypeChange(selectedType === type ? null : type)
                }
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Sun Filter */}
        <div>
          <label className="text-sm font-medium text-sage-700 mb-2 block">
            Sun Exposure
          </label>
          <div className="flex gap-2 flex-wrap">
            {["full-sun", "partial-sun", "full-shade"].map((sun) => (
              <Button
                key={sun}
                variant={selectedSun === sun ? "primary" : "outline"}
                size="sm"
                onClick={() => onSunChange(selectedSun === sun ? null : sun)}
              >
                {sun.replace("-", " ")}
              </Button>
            ))}
          </div>
        </div>

        {/* Water Filter */}
        <div>
          <label className="text-sm font-medium text-sage-700 mb-2 block">
            Water Needs
          </label>
          <div className="flex gap-2 flex-wrap">
            {["low", "moderate", "regular", "high"].map((water) => (
              <Button
                key={water}
                variant={selectedWater === water ? "primary" : "outline"}
                size="sm"
                onClick={() =>
                  onWaterChange(selectedWater === water ? null : water)
                }
              >
                {water}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="mt-3"
        >
          Clear all filters
        </Button>
      )}
    </div>
  );
}
