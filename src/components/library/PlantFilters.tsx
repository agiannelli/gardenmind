import { useRef } from "react";

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

const TYPE_OPTIONS = [
  { value: "vegetable", label: "🥦 Veg" },
  { value: "herb",      label: "🌿 Herb" },
  { value: "flower",    label: "🌸 Flower" },
  { value: "fruit",     label: "🍓 Fruit" },
];

const SUN_OPTIONS = [
  { value: "full-sun",     label: "☀️ Full" },
  { value: "partial-sun",  label: "⛅ Partial" },
  { value: "full-shade",   label: "🌑 Shade" },
];

const WATER_OPTIONS = [
  { value: "low",      label: "💧 Low" },
  { value: "moderate", label: "💧💧 Mid" },
  { value: "regular",  label: "💧💧💧 Reg" },
  { value: "high",     label: "🚿 High" },
];

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
        active
          ? "bg-sage-600 text-white"
          : "bg-white border border-sage-200 text-sage-600 hover:border-sage-400 hover:text-sage-800"
      }`}
    >
      {label}
    </button>
  );
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
  const inputRef = useRef<HTMLInputElement>(null);
  const hasActiveFilters = searchQuery || selectedType || selectedSun || selectedWater;

  return (
    <div className="mb-6 space-y-2">
      {/* Row 1: Search */}
      <div className="flex items-center gap-2 bg-white border border-sage-200 rounded-lg px-3 py-2 focus-within:border-sage-400 transition-colors">
        <svg
          className="w-4 h-4 text-sage-400 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search plants..."
          className="flex-1 text-sm bg-transparent outline-none text-sage-800 placeholder:text-sage-400"
        />
        {searchQuery && (
          <button
            onClick={() => {
              onSearchChange("");
              inputRef.current?.focus();
            }}
            className="text-sage-400 hover:text-sage-600 text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Row 2: Filter chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-sage-400 mr-1">Type:</span>
        {TYPE_OPTIONS.map((opt) => (
          <FilterChip
            key={opt.value}
            label={opt.label}
            active={selectedType === opt.value}
            onClick={() =>
              onTypeChange(selectedType === opt.value ? null : opt.value)
            }
          />
        ))}

        <span className="text-xs text-sage-400 mx-1">☀</span>
        {SUN_OPTIONS.map((opt) => (
          <FilterChip
            key={opt.value}
            label={opt.label}
            active={selectedSun === opt.value}
            onClick={() =>
              onSunChange(selectedSun === opt.value ? null : opt.value)
            }
          />
        ))}

        <span className="text-xs text-sage-400 mx-1">💧</span>
        {WATER_OPTIONS.map((opt) => (
          <FilterChip
            key={opt.value}
            label={opt.label}
            active={selectedWater === opt.value}
            onClick={() =>
              onWaterChange(selectedWater === opt.value ? null : opt.value)
            }
          />
        ))}

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="ml-1 text-xs text-sage-400 hover:text-sage-700 underline underline-offset-2"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
