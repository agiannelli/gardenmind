"use client";

import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useBeds } from "@/hooks/useBeds";
import { useGardens } from "@/hooks/useGardens";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CreateBedModal } from "@/components/planner/CreateBedModal";
import { CreateGardenModal } from "@/components/gardens/CreateGardenModal";
import { GardenMembersModal } from "@/components/gardens/GardenMembersModal";
import { AssignBedModal } from "@/components/gardens/AssignBedModal";
import type { Garden } from "@/types";

export default function GardenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = useUser();
  const router = useRouter();
  const { beds, loading: bedsLoading, createBed, updateBed } = useBeds();
  const {
    gardens,
    loading: gardensLoading,
    updateGarden,
    deleteGarden,
    inviteMember,
    removeMember,
  } = useGardens();

  const [gardenId, setGardenId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [createBedOpen, setCreateBedOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  useEffect(() => {
    params.then(({ id }) => setGardenId(id));
  }, [params]);

  const garden: Garden | undefined = gardens.find((g) => g.id === gardenId);
  const loading = bedsLoading || gardensLoading || !gardenId;

  const gardenBeds = beds.filter((b) => b.gardenId === gardenId);
  const ungroupedBeds = beds.filter((b) => !b.gardenId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sage-600">Loading...</p>
      </div>
    );
  }

  if (!garden) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-sage-600 mb-4">Garden not found.</p>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = garden.userId === user?.sub;
  const memberCount = garden.members.filter(
    (m) => m.status === "accepted"
  ).length;
  const totalPlants = gardenBeds.reduce(
    (sum, b) =>
      sum + Object.values(b.cells).filter((c) => c.isAnchor).length,
    0
  );

  const handleCreateBed = async (bedData: {
    name: string;
    widthFt: number;
    lengthFt: number;
    sunExposure: string;
    gardenType: string;
    color: string;
    gardenId?: string;
  }) => {
    const newBed = await createBed({ ...bedData, gardenId: garden.id });
    setCreateBedOpen(false);
    router.push(`/planner?bed=${newBed.id}`);
  };

  const handleAssignBed = async (bedId: string) => {
    await updateBed(bedId, { gardenId: garden.id });
  };

  const handleEditSave = async (data: {
    name: string;
    description?: string;
    color: string;
  }) => {
    await updateGarden(garden.id, data);
    setEditOpen(false);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Delete "${garden.name}"? Beds inside will not be deleted — they'll become ungrouped.`
      )
    )
      return;
    await deleteGarden(garden.id);
    router.push("/dashboard");
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Back */}
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-sage-500 hover:text-sage-700 mb-6 flex items-center gap-1 transition-colors"
        >
          ← Dashboard
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-full flex-shrink-0"
              style={{ backgroundColor: garden.color }}
            />
            <div>
              <h1 className="text-4xl font-serif text-sage-700">
                {garden.name}
              </h1>
              {garden.description && (
                <p className="text-sage-600 mt-0.5">{garden.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMembersOpen(true)}
            >
              👥 Team{memberCount > 0 ? ` (${memberCount + 1})` : ""}
            </Button>
            {isOwner && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditOpen(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-500 hover:border-red-300"
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <div className="text-2xl font-serif text-sage-700">
              {gardenBeds.length}
            </div>
            <div className="text-sm text-sage-600">Beds</div>
          </Card>
          <Card>
            <div className="text-2xl font-serif text-sage-700">
              {totalPlants}
            </div>
            <div className="text-sm text-sage-600">Plants Growing</div>
          </Card>
          <Card>
            <div className="text-2xl font-serif text-sage-700">
              {memberCount + 1}
            </div>
            <div className="text-sm text-sage-600">
              {memberCount + 1 === 1 ? "Member" : "Members"}
            </div>
          </Card>
        </div>

        {/* Beds */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-serif text-sage-700">Beds</h2>
            <div className="flex gap-2">
              {ungroupedBeds.length > 0 && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setAssignOpen(true)}
                >
                  Assign Existing
                </Button>
              )}
              <Button
                variant="primary"
                size="md"
                onClick={() => setCreateBedOpen(true)}
              >
                + New Bed
              </Button>
            </div>
          </div>

          {gardenBeds.length === 0 ? (
            <Card>
              <div className="text-center py-10">
                <div className="text-4xl mb-3">🌱</div>
                <p className="text-sage-600 mb-5">No beds in this garden yet.</p>
                <div className="flex gap-3 justify-center">
                  {ungroupedBeds.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setAssignOpen(true)}
                    >
                      Assign Existing Bed
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    onClick={() => setCreateBedOpen(true)}
                  >
                    Create First Bed
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gardenBeds.map((bed) => {
                const plantCount = Object.values(bed.cells).filter(
                  (c) => c.isAnchor
                ).length;
                return (
                  <div
                    key={bed.id}
                    onClick={() => router.push(`/planner?bed=${bed.id}`)}
                    className="cursor-pointer"
                  >
                    <Card className="hover:border-sage-400 transition-colors">
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
                          <span className="font-medium">{plantCount}</span>{" "}
                          plant{plantCount !== 1 ? "s" : ""}
                        </div>
                        <div className="capitalize">
                          {bed.sunExposure.replace("-", " ")}
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateBedModal
        open={createBedOpen}
        onClose={() => setCreateBedOpen(false)}
        onSave={handleCreateBed}
        gardens={gardens}
        defaultGardenId={garden.id}
      />

      {editOpen && (
        <CreateGardenModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSave={handleEditSave}
          garden={garden}
        />
      )}

      {membersOpen && user?.sub && (
        <GardenMembersModal
          open={membersOpen}
          onClose={() => setMembersOpen(false)}
          garden={garden}
          currentUserId={user.sub}
          onInvite={inviteMember}
          onRemoveMember={removeMember}
        />
      )}

      {assignOpen && (
        <AssignBedModal
          open={assignOpen}
          onClose={() => setAssignOpen(false)}
          gardenName={garden.name}
          ungroupedBeds={ungroupedBeds}
          onAssign={handleAssignBed}
        />
      )}
    </div>
  );
}
