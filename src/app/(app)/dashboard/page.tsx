"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useBeds } from "@/hooks/useBeds";
import { useGardens } from "@/hooks/useGardens";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CreateBedModal } from "@/components/planner/CreateBedModal";
import { CreateGardenModal } from "@/components/gardens/CreateGardenModal";
import { GardenMembersModal } from "@/components/gardens/GardenMembersModal";
import { AssignBedModal } from "@/components/gardens/AssignBedModal";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Garden } from "@/types";

export default function DashboardPage() {
  const { user } = useUser();
  const { beds, loading: bedsLoading, createBed, updateBed } = useBeds();
  const {
    gardens,
    loading: gardensLoading,
    createGarden,
    updateGarden,
    deleteGarden,
    inviteMember,
    removeMember,
  } = useGardens();
  const router = useRouter();

  const [createBedModalOpen, setCreateBedModalOpen] = useState(false);
  const [createGardenModalOpen, setCreateGardenModalOpen] = useState(false);
  const [editGarden, setEditGarden] = useState<Garden | null>(null);
  const [membersGarden, setMembersGarden] = useState<Garden | null>(null);
  const [selectedGardenId, setSelectedGardenId] = useState<string | null>(null);
  const [assignGarden, setAssignGarden] = useState<Garden | null>(null);

  const loading = bedsLoading || gardensLoading;

  // Beds not assigned to any garden
  const ungroupedBeds = beds.filter((b) => !b.gardenId);

  const totalPlants = beds.reduce(
    (sum, bed) =>
      sum + Object.values(bed.cells).filter((c) => c.isAnchor).length,
    0
  );

  const handleCreateBed = async (bedData: {
    name: string;
    widthFt: number;
    lengthFt: number;
    sunExposure: string;
    gardenType: string;
    color: string;
  }) => {
    try {
      const newBed = await createBed({
        ...bedData,
        gardenId: selectedGardenId || undefined,
      });
      setCreateBedModalOpen(false);
      setSelectedGardenId(null);
      router.push(`/planner?bed=${newBed.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create bed");
    }
  };

  const handleCreateGarden = async (data: {
    name: string;
    description?: string;
    color: string;
  }) => {
    try {
      await createGarden(data);
      setCreateGardenModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create garden");
    }
  };

  const handleUpdateGarden = async (data: {
    name: string;
    description?: string;
    color: string;
  }) => {
    if (!editGarden) return;
    try {
      await updateGarden(editGarden.id, data);
      setEditGarden(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update garden");
    }
  };

  const handleDeleteGarden = async (gardenId: string, gardenName: string) => {
    if (
      !confirm(
        `Delete "${gardenName}"? Beds inside will not be deleted — they'll become ungrouped.`
      )
    )
      return;
    try {
      await deleteGarden(gardenId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete garden");
    }
  };

  const handleAssignBed = async (bedId: string) => {
    if (!assignGarden) return;
    await updateBed(bedId, { gardenId: assignGarden.id });
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
            {loading
              ? "Loading your garden..."
              : gardens.length === 0 && beds.length === 0
              ? "Ready to start planning your garden?"
              : `${gardens.length} garden${gardens.length !== 1 ? "s" : ""}, ${beds.length} bed${beds.length !== 1 ? "s" : ""}, ${totalPlants} plant${totalPlants !== 1 ? "s" : ""} growing.`}
          </p>
        </div>

        {/* Quick Stats */}
        {!loading && (gardens.length > 0 || beds.length > 0) && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card>
              <div className="text-2xl font-serif text-sage-700">
                {gardens.length}
              </div>
              <div className="text-sm text-sage-600">Gardens</div>
            </Card>
            <Card>
              <div className="text-2xl font-serif text-sage-700">
                {beds.length}
              </div>
              <div className="text-sm text-sage-600">Beds</div>
            </Card>
            <Card>
              <div className="text-2xl font-serif text-sage-700">
                {totalPlants}
              </div>
              <div className="text-sm text-sage-600">Plants Growing</div>
            </Card>
          </div>
        )}

        {/* Gardens Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-serif text-sage-700">My Gardens</h2>
            <Button
              variant="primary"
              size="md"
              onClick={() => setCreateGardenModalOpen(true)}
            >
              + New Garden
            </Button>
          </div>

          {loading ? (
            <p className="text-sage-600">Loading...</p>
          ) : gardens.length === 0 ? (
            <Card>
              <div className="text-center py-10">
                <div className="text-5xl mb-4">🌱</div>
                <h3 className="font-serif text-xl text-sage-700 mb-2">
                  No gardens yet
                </h3>
                <p className="text-sage-600 mb-6 text-sm max-w-sm mx-auto">
                  Create a garden to group your beds — try &ldquo;Spring
                  2026&rdquo; or &ldquo;Front Yard&rdquo;.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setCreateGardenModalOpen(true)}
                >
                  Create Your First Garden
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gardens.map((garden) => {
                const gardenBeds = beds.filter(
                  (b) => b.gardenId === garden.id
                );
                const gardenPlants = gardenBeds.reduce(
                  (sum, b) =>
                    sum +
                    Object.values(b.cells).filter((c) => c.isAnchor).length,
                  0
                );
                const isOwner = garden.userId === user?.sub;
                const memberCount = garden.members.filter(
                  (m) => m.status === "accepted"
                ).length;

                return (
                  <Card
                    key={garden.id}
                    onClick={() => router.push(`/gardens/${garden.id}`)}
                    className="group hover:border-sage-400 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: garden.color }}
                        />
                        <div className="min-w-0">
                          <h3 className="font-serif text-lg text-sage-700 truncate">
                            {garden.name}
                          </h3>
                          {garden.description && (
                            <p className="text-xs text-sage-500 truncate">
                              {garden.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Garden actions (visible on hover) */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setMembersGarden(garden); }}
                          className="text-xs text-sage-500 hover:text-sage-700 px-1.5 py-1 rounded hover:bg-sage-100"
                          title="Manage team"
                        >
                          👥
                        </button>
                        {isOwner && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditGarden(garden); }}
                              className="text-xs text-sage-500 hover:text-sage-700 px-1.5 py-1 rounded hover:bg-sage-100"
                              title="Edit garden"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteGarden(garden.id, garden.name); }}
                              className="text-xs text-sage-500 hover:text-red-500 px-1.5 py-1 rounded hover:bg-red-50"
                              title="Delete garden"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-sage-600 mb-3">
                      <span>
                        {gardenBeds.length} bed
                        {gardenBeds.length !== 1 ? "s" : ""} · {gardenPlants}{" "}
                        plant{gardenPlants !== 1 ? "s" : ""}
                      </span>
                      {memberCount > 0 && (
                        <span className="text-xs bg-sage-100 text-sage-600 px-2 py-0.5 rounded-full">
                          {memberCount + 1} members
                        </span>
                      )}
                    </div>

                    {/* Beds within garden */}
                    {gardenBeds.length > 0 ? (
                      <div className="space-y-1.5">
                        {gardenBeds.slice(0, 3).map((bed) => (
                          <button
                            key={bed.id}
                            onClick={(e) => { e.stopPropagation(); router.push(`/planner?bed=${bed.id}`); }}
                            className="w-full flex items-center gap-2 text-left px-2 py-1.5 rounded-md hover:bg-sage-50 transition-colors"
                          >
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: bed.color }}
                            />
                            <span className="text-sm text-sage-700 truncate">
                              {bed.name}
                            </span>
                            <span className="text-xs text-sage-400 ml-auto shrink-0">
                              {bed.widthFt}×{bed.lengthFt}ft
                            </span>
                          </button>
                        ))}
                        {gardenBeds.length > 3 && (
                          <p className="text-xs text-sage-400 px-2">
                            +{gardenBeds.length - 3} more beds
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-sage-400">No beds yet.</p>
                    )}

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGardenId(garden.id);
                          setCreateBedModalOpen(true);
                        }}
                        className="flex-1 text-xs text-sage-500 hover:text-sage-700 border border-dashed border-sage-200 hover:border-sage-400 rounded-md py-1.5 transition-colors"
                      >
                        + New Bed
                      </button>
                      {ungroupedBeds.length > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setAssignGarden(garden); }}
                          className="flex-1 text-xs text-sage-500 hover:text-sage-700 border border-dashed border-sage-200 hover:border-sage-400 rounded-md py-1.5 transition-colors"
                        >
                          + Assign Existing
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Ungrouped Beds */}
        {ungroupedBeds.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-serif text-sage-700">
                Ungrouped Beds
              </h2>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setSelectedGardenId(null);
                  setCreateBedModalOpen(true);
                }}
              >
                + Add Bed
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ungroupedBeds.map((bed) => (
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
          </div>
        )}

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

      {/* Modals */}
      <CreateBedModal
        open={createBedModalOpen}
        onClose={() => {
          setCreateBedModalOpen(false);
          setSelectedGardenId(null);
        }}
        onSave={handleCreateBed}
        gardens={gardens}
        defaultGardenId={selectedGardenId || undefined}
      />

      <CreateGardenModal
        open={createGardenModalOpen}
        onClose={() => setCreateGardenModalOpen(false)}
        onSave={handleCreateGarden}
      />

      {editGarden && (
        <CreateGardenModal
          open={!!editGarden}
          onClose={() => setEditGarden(null)}
          onSave={handleUpdateGarden}
          garden={editGarden}
        />
      )}

      {membersGarden && user?.sub && (
        <GardenMembersModal
          open={!!membersGarden}
          onClose={() => setMembersGarden(null)}
          garden={membersGarden}
          currentUserId={user.sub}
          onInvite={inviteMember}
          onRemoveMember={removeMember}
        />
      )}

      {assignGarden && (
        <AssignBedModal
          open={!!assignGarden}
          onClose={() => setAssignGarden(null)}
          gardenName={assignGarden.name}
          ungroupedBeds={ungroupedBeds}
          onAssign={handleAssignBed}
        />
      )}
    </div>
  );
}
