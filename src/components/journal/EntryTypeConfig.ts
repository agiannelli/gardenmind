import type { EntryType } from "@/types";

export const ENTRY_TYPE_CONFIG: Record<
  EntryType,
  { label: string; icon: string; color: string }
> = {
  observation: {
    label: "Observation",
    icon: "🔍",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  pest: {
    label: "Pest & Disease",
    icon: "🐛",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  harvest: {
    label: "Harvest",
    icon: "🧺",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  watering: {
    label: "Watering & Feeding",
    icon: "💧",
    color: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
};
