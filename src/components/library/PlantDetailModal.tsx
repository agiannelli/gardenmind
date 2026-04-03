"use client";

import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PLANT_MAP } from "@/lib/plants";
import type { Plant } from "@/types";

interface PlantDetailModalProps {
  plant: Plant | null;
  open: boolean;
  onClose: () => void;
}

export function PlantDetailModal({
  plant,
  open,
  onClose,
}: PlantDetailModalProps) {
  if (!plant) return null;

  return (
    <Modal open={open} onClose={onClose} className="max-w-2xl">
      <div className="p-6">
        {/* Header with emoji + names */}
        <div className="flex items-start gap-4 mb-6">
          <span className="text-6xl">{plant.emoji}</span>
          <div className="flex-1">
            <h2 className="text-3xl font-serif text-sage-700">
              {plant.name}
            </h2>
            <p className="text-sage-600 italic">{plant.latinName}</p>
            <Badge variant="default" className="mt-2 capitalize">
              {plant.type}
            </Badge>
          </div>
        </div>

        {/* Care Requirements */}
        <div className="space-y-4 mb-6">
          <h3 className="font-serif text-xl text-sage-700">
            Care Requirements
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-sage-600">Sun Exposure</p>
              <p className="font-medium capitalize">
                {plant.sunNeeds.replace("-", " ")}
              </p>
            </div>
            <div>
              <p className="text-sm text-sage-600">Water Needs</p>
              <p className="font-medium capitalize">{plant.waterNeeds}</p>
            </div>
            <div>
              <p className="text-sm text-sage-600">Spacing</p>
              <p className="font-medium">{plant.spacingIn} inches</p>
            </div>
            <div>
              <p className="text-sm text-sage-600">Days to Harvest</p>
              <p className="font-medium">{plant.daysToHarvest}</p>
            </div>
          </div>
        </div>

        {/* Companion Plants */}
        {plant.companions.length > 0 && (
          <div className="mb-6">
            <h3 className="font-serif text-xl text-sage-700 mb-3">
              Good Companions
            </h3>
            <div className="flex gap-2 flex-wrap">
              {plant.companions.map((companionId) => {
                const companion = PLANT_MAP[companionId];
                return (
                  <Badge key={companionId} variant="success">
                    {companion?.emoji} {companion?.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Plants to Avoid */}
        {plant.avoid.length > 0 && (
          <div className="mb-6">
            <h3 className="font-serif text-xl text-sage-700 mb-3">
              Avoid Planting With
            </h3>
            <div className="flex gap-2 flex-wrap">
              {plant.avoid.map((avoidId) => {
                const avoidPlant = PLANT_MAP[avoidId];
                return (
                  <Badge key={avoidId} variant="danger">
                    {avoidPlant?.emoji} {avoidPlant?.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
