import { useState, useEffect } from "react";
import { Modal, Button, Input } from "@/components/ui";
import type { Garden } from "@/types";

const GARDEN_COLORS = [
  "#84A98C", // sage
  "#6B8F71", // forest
  "#A8C5A0", // mint
  "#C4956A", // terracotta
  "#8B7355", // earth
  "#7B9EA8", // slate blue
  "#B5838D", // dusty rose
  "#9E8A78", // warm taupe
];

interface CreateGardenModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description?: string; color: string }) => void;
  garden?: Garden;
}

export function CreateGardenModal({
  open,
  onClose,
  onSave,
  garden,
}: CreateGardenModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(GARDEN_COLORS[0]);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (garden) {
      setName(garden.name);
      setDescription(garden.description || "");
      setColor(garden.color);
    } else {
      setName("");
      setDescription("");
      setColor(GARDEN_COLORS[0]);
    }
    setNameError("");
  }, [garden, open]);

  const handleSave = () => {
    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }
    if (name.length > 50) {
      setNameError("Name must be 50 characters or less");
      return;
    }
    onSave({ name: name.trim(), description: description.trim() || undefined, color });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-serif text-sage-700 mb-6">
          {garden ? "Edit Garden" : "Create New Garden"}
        </h2>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="garden-name"
              className="block text-sm font-medium text-sage-700 mb-1"
            >
              Garden Name
            </label>
            <Input
              id="garden-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              placeholder="e.g., Spring 2026, Front Yard"
              className={nameError ? "border-red-500" : ""}
            />
            {nameError && (
              <p className="text-red-500 text-sm mt-1">{nameError}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="garden-description"
              className="block text-sm font-medium text-sage-700 mb-1"
            >
              Description{" "}
              <span className="text-sage-400 font-normal">(optional)</span>
            </label>
            <Input
              id="garden-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Back raised beds, mostly vegetables"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {GARDEN_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c
                      ? "border-sage-700 scale-110"
                      : "border-transparent hover:border-sage-300"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {garden ? "Save Changes" : "Create Garden"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
