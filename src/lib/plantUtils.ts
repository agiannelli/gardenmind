import { PLANTS, PLANT_MAP } from "./plants";
import type { Plant } from "@/types";

export function searchPlants(query: string): Plant[] {
  const lowercaseQuery = query.toLowerCase();
  return PLANTS.filter(
    (plant) =>
      plant.name.toLowerCase().includes(lowercaseQuery) ||
      plant.latinName.toLowerCase().includes(lowercaseQuery)
  );
}

export function filterPlants(
  plants: Plant[],
  filters: {
    type?: string | null;
    sunNeeds?: string | null;
    waterNeeds?: string | null;
  }
): Plant[] {
  return plants.filter((plant) => {
    if (filters.type && plant.type !== filters.type) return false;
    if (filters.sunNeeds && plant.sunNeeds !== filters.sunNeeds) return false;
    if (filters.waterNeeds && plant.waterNeeds !== filters.waterNeeds)
      return false;
    return true;
  });
}

export function getPlantsByType(type: string): Plant[] {
  return PLANTS.filter((plant) => plant.type === type);
}

export function getCompanionPlants(plantId: string): Plant[] {
  const plant = PLANT_MAP[plantId];
  if (!plant) return [];
  return plant.companions.map((id) => PLANT_MAP[id]).filter(Boolean);
}
