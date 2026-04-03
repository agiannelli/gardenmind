import { useState, useEffect } from "react";
import { Modal, Button, Input } from "@/components/ui";
import { BED_COLORS } from "@/lib/colors";
import type { Bed, Garden, SunExposure, GardenType, BedFacing } from "@/types";

const COMPASS_DIRECTIONS: { value: BedFacing; label: string; row: number; col: number }[] = [
  { value: "northwest", label: "NW", row: 0, col: 0 },
  { value: "north",     label: "N",  row: 0, col: 1 },
  { value: "northeast", label: "NE", row: 0, col: 2 },
  { value: "west",      label: "W",  row: 1, col: 0 },
  { value: "east",      label: "E",  row: 1, col: 2 },
  { value: "southwest", label: "SW", row: 2, col: 0 },
  { value: "south",     label: "S",  row: 2, col: 1 },
  { value: "southeast", label: "SE", row: 2, col: 2 },
];

interface CreateBedModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (bedData: {
    name: string;
    widthFt: number;
    lengthFt: number;
    sunExposure: SunExposure;
    gardenType: GardenType;
    facing: BedFacing;
    color: string;
    gardenId?: string;
  }) => void;
  bed?: Bed;
  gardens?: Garden[];
  defaultGardenId?: string;
}

export function CreateBedModal({
  open,
  onClose,
  onSave,
  bed,
  gardens = [],
  defaultGardenId,
}: CreateBedModalProps) {
  const [name, setName] = useState("");
  const [widthFt, setWidthFt] = useState(4);
  const [lengthFt, setLengthFt] = useState(8);
  const [sunExposure, setSunExposure] = useState<SunExposure>("full-sun");
  const [gardenType, setGardenType] = useState<GardenType>("square-foot");
  const [facing, setFacing] = useState<BedFacing>("south");
  const [color, setColor] = useState<string>(BED_COLORS[0].hex);
  const [gardenId, setGardenId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with bed data when editing
  useEffect(() => {
    if (bed) {
      setName(bed.name);
      setWidthFt(bed.widthFt);
      setLengthFt(bed.lengthFt);
      setSunExposure(bed.sunExposure);
      setGardenType(bed.gardenType);
      setFacing(bed.facing);
      setColor(bed.color);
      setGardenId(bed.gardenId || "");
    } else {
      // Reset form when creating new bed
      setName("");
      setWidthFt(4);
      setLengthFt(8);
      setSunExposure("full-sun");
      setGardenType("square-foot");
      setFacing("south");
      setColor(BED_COLORS[0].hex);
      setGardenId(defaultGardenId || "");
    }
    setErrors({});
  }, [bed, open, defaultGardenId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.length > 50) {
      newErrors.name = "Name must be 50 characters or less";
    }

    if (widthFt < 1 || widthFt > 20) {
      newErrors.widthFt = "Width must be between 1 and 20 feet";
    }

    if (lengthFt < 1 || lengthFt > 20) {
      newErrors.lengthFt = "Length must be between 1 and 20 feet";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    onSave({
      name: name.trim(),
      widthFt,
      lengthFt,
      sunExposure,
      gardenType,
      facing,
      color,
      gardenId: gardenId || undefined,
    });
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="p-6">
        <h2 className="text-2xl font-serif text-sage-700 mb-6">
          {bed ? "Edit Bed" : "Create New Bed"}
        </h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-sage-700 mb-1"
            >
              Bed Name
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Backyard Veggie Patch"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Garden assignment */}
          {gardens.length > 0 && (
            <div>
              <label
                htmlFor="gardenId"
                className="block text-sm font-medium text-sage-700 mb-1"
              >
                Garden{" "}
                <span className="text-sage-400 font-normal">(optional)</span>
              </label>
              <select
                id="gardenId"
                value={gardenId}
                onChange={(e) => setGardenId(e.target.value)}
                className="w-full px-3 py-2 border border-sage-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm"
              >
                <option value="">No garden (ungrouped)</option>
                {gardens.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="widthFt"
                className="block text-sm font-medium text-sage-700 mb-1"
              >
                Width (feet)
              </label>
              <Input
                id="widthFt"
                type="number"
                min={1}
                max={20}
                value={widthFt}
                onChange={(e) => setWidthFt(parseInt(e.target.value, 10))}
                className={errors.widthFt ? "border-red-500" : ""}
              />
              {errors.widthFt && (
                <p className="text-red-500 text-sm mt-1">{errors.widthFt}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="lengthFt"
                className="block text-sm font-medium text-sage-700 mb-1"
              >
                Length (feet)
              </label>
              <Input
                id="lengthFt"
                type="number"
                min={1}
                max={20}
                value={lengthFt}
                onChange={(e) => setLengthFt(parseInt(e.target.value, 10))}
                className={errors.lengthFt ? "border-red-500" : ""}
              />
              {errors.lengthFt && (
                <p className="text-red-500 text-sm mt-1">{errors.lengthFt}</p>
              )}
            </div>
          </div>

          {/* Sun Exposure */}
          <div>
            <label
              htmlFor="sunExposure"
              className="block text-sm font-medium text-sage-700 mb-1"
            >
              Sun Exposure
            </label>
            <select
              id="sunExposure"
              value={sunExposure}
              onChange={(e) => setSunExposure(e.target.value as SunExposure)}
              className="w-full px-3 py-2 border border-sage-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-400"
            >
              <option value="full-sun">Full Sun (6+ hours)</option>
              <option value="partial-sun">Partial Sun (3-6 hours)</option>
              <option value="full-shade">Full Shade (&lt;3 hours)</option>
            </select>
          </div>

          {/* Facing Direction */}
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1">
              Bed Facing Direction
            </label>
            <p className="text-xs text-sage-500 mb-2">
              Which direction does the front of this bed face? Used for sun and planting recommendations.
            </p>
            <div className="inline-grid grid-cols-3 gap-1">
              {Array.from({ length: 3 }, (_, row) =>
                Array.from({ length: 3 }, (_, col) => {
                  if (row === 1 && col === 1) {
                    return (
                      <div
                        key="center"
                        className="w-10 h-10 flex items-center justify-center text-sage-300 text-lg"
                      >
                        ✦
                      </div>
                    );
                  }
                  const dir = COMPASS_DIRECTIONS.find(
                    (d) => d.row === row && d.col === col
                  );
                  if (!dir) return null;
                  const isSelected = facing === dir.value;
                  return (
                    <button
                      key={dir.value}
                      type="button"
                      onClick={() => setFacing(dir.value)}
                      className={`w-10 h-10 rounded-md text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-sage-600 text-white"
                          : "bg-sage-50 text-sage-600 hover:bg-sage-100 border border-sage-200"
                      }`}
                      title={dir.value.charAt(0).toUpperCase() + dir.value.slice(1)}
                    >
                      {dir.label}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Garden Type */}
          <div>
            <label
              htmlFor="gardenType"
              className="block text-sm font-medium text-sage-700 mb-1"
            >
              Plant Spacing
            </label>
            <select
              id="gardenType"
              value={gardenType}
              onChange={(e) => setGardenType(e.target.value as GardenType)}
              className="w-full px-3 py-2 border border-sage-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-400"
            >
              <option value="traditional">Traditional (wider spacing)</option>
              <option value="square-foot">Square Foot Gardening (intensive)</option>
              <option value="intensive">Ultra-Intensive (chaos garden)</option>
            </select>
            <p className="text-xs text-sage-600 mt-1">
              {gardenType === "traditional" && "Traditional row spacing - plants need more room"}
              {gardenType === "square-foot" && "SFG standards - 1 tomato per square foot"}
              {gardenType === "intensive" && "Maximum density - tight spacing for experienced gardeners"}
            </p>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">
              Bed Color
            </label>
            <div className="grid grid-cols-6 gap-2">
              {BED_COLORS.map((bedColor) => (
                <button
                  key={bedColor.hex}
                  type="button"
                  onClick={() => setColor(bedColor.hex)}
                  className={`w-12 h-12 rounded-md border-2 transition-all ${
                    color === bedColor.hex
                      ? "border-sage-700 scale-110"
                      : "border-transparent hover:border-sage-300"
                  }`}
                  style={{ backgroundColor: bedColor.hex }}
                  title={bedColor.name}
                  aria-label={`Select ${bedColor.name} color`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={handleClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="primary">
            {bed ? "Save Changes" : "Create Bed"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
