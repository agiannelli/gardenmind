import { Button } from "@/components/ui";

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🌿</div>
        <h2 className="text-2xl font-serif text-sage-700 mb-2">
          Create your first garden bed
        </h2>
        <p className="text-sage-600 mb-6 max-w-md">
          Start planning your garden by creating a raised bed. Add dimensions,
          choose sun exposure, and begin planting!
        </p>
        <Button onClick={onCreateClick} variant="primary">
          Create Bed
        </Button>
      </div>
    </div>
  );
}
