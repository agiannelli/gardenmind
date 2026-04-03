import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Plant } from "@/types";

interface PlantCardProps {
  plant: Plant;
  onClick: () => void;
}

export function PlantCard({ plant, onClick }: PlantCardProps) {
  return (
    <Card onClick={onClick} className="hover:border-sage-400">
      {/* Emoji + Name */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-4xl">{plant.emoji}</span>
        <div className="flex-1">
          <h3 className="font-serif text-lg text-sage-700">{plant.name}</h3>
          <p className="text-xs text-sage-500 italic">{plant.latinName}</p>
        </div>
      </div>

      {/* Type Badge */}
      <Badge variant="default" className="mb-3 capitalize">
        {plant.type}
      </Badge>

      {/* Quick Info Grid */}
      <div className="space-y-1 text-sm text-sage-600">
        <div>☀️ {plant.sunNeeds.replace("-", " ")}</div>
        <div>💧 {plant.waterNeeds} water</div>
        <div>📏 {plant.spacingIn}&quot; spacing</div>
        <div>⏱️ {plant.daysToHarvest} days</div>
      </div>
    </Card>
  );
}
