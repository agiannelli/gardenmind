"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useBeds } from "@/hooks/useBeds";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CreateBedModal } from "@/components/planner/CreateBedModal";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user } = useUser();
  const { beds, loading, createBed } = useBeds();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const router = useRouter();

  const totalPlants = beds.reduce((sum, bed) => {
    return sum + Object.values(bed.cells).filter((c) => c.isAnchor).length;
  }, 0);

  const handleCreateBed = async (bedData: {
    name: string;
    widthFt: number;
    lengthFt: number;
    sunExposure: string;
    gardenType: string;
    color: string;
  }) => {
    try {
      const newBed = await createBed(bedData);
      setCreateModalOpen(false);
      router.push(`/planner?bed=${newBed.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create bed");
    }
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-sage-700 mb-2">
            Welcome back, {user?.name?.split(" ")[0] || "Gardener"} 🌿
          </h1>
          <p className="text-sage-600">
            {beds.length === 0
              ? "Ready to start planning your garden?"
              : `You have ${beds.length} ${
                  beds.length === 1 ? "bed" : "beds"
                } with ${totalPlants} plants growing.`}
          </p>
        </div>

        {/* Quick Stats */}
        {beds.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card>
              <div className="text-2xl font-serif text-sage-700">
                {beds.length}
              </div>
              <div className="text-sm text-sage-600">Garden Beds</div>
            </Card>
            <Card>
              <div className="text-2xl font-serif text-sage-700">
                {totalPlants}
              </div>
              <div className="text-sm text-sage-600">Plants Growing</div>
            </Card>
            <Card>
              <div className="text-2xl font-serif text-sage-700">—</div>
              <div className="text-sm text-sage-600">Coming Soon</div>
            </Card>
          </div>
        )}

        {/* My Beds Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-serif text-sage-700">My Beds</h2>
            <Button
              variant="primary"
              size="md"
              onClick={() => setCreateModalOpen(true)}
            >
              + Create New Bed
            </Button>
          </div>

          {loading ? (
            <p className="text-sage-600">Loading your beds...</p>
          ) : beds.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🌱</div>
                <h3 className="font-serif text-xl text-sage-700 mb-2">
                  No beds yet
                </h3>
                <p className="text-sage-600 mb-6">
                  Create your first garden bed to start planning.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setCreateModalOpen(true)}
                >
                  Create Your First Bed
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {beds.map((bed) => (
                <div
                  key={bed.id}
                  onClick={() => router.push(`/planner?bed=${bed.id}`)}
                  className="cursor-pointer"
                >
                  <Card className="hover:border-sage-400">
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                        style={{ backgroundColor: bed.color }}
                      />
                      <div className="flex-1">
                        <h3 className="font-serif text-lg text-sage-700">
                          {bed.name}
                        </h3>
                        <p className="text-sm text-sage-600">
                          {bed.widthFt}×{bed.lengthFt} ft · {bed.gardenType}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-sage-600">
                      <div>
                        <span className="font-medium">
                          {
                            Object.values(bed.cells).filter((c) => c.isAnchor)
                              .length
                          }
                        </span>{" "}
                        plant
                        {Object.values(bed.cells).filter((c) => c.isAnchor)
                          .length !== 1
                          ? "s"
                          : ""}
                      </div>
                      <div className="capitalize">
                        {bed.sunExposure.replace("-", " ")}
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coming Soon Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-sage-50 border-sage-200">
            <h3 className="font-serif text-lg text-sage-700 mb-2">
              📅 Upcoming Tasks
            </h3>
            <p className="text-sage-600 text-sm">
              Watering schedules, fertilizing reminders, and harvest alerts
              coming soon!
            </p>
          </Card>
          <Card className="bg-sage-50 border-sage-200">
            <h3 className="font-serif text-lg text-sage-700 mb-2">
              🌦️ This Week
            </h3>
            <p className="text-sage-600 text-sm">
              Weather-based recommendations and seasonal planting calendar
              coming soon!
            </p>
          </Card>
        </div>
      </div>

      {/* Create Bed Modal */}
      <CreateBedModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateBed}
      />
    </div>
  );
}
