"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useBeds } from "@/hooks/useBeds";
import { useGardens } from "@/hooks/useGardens";
import { CreateGardenModal } from "@/components/gardens/CreateGardenModal";

const SIDEBAR_NAV = [
  { href: "/dashboard",  icon: "🏡",  label: "Dashboard" },
  { href: "/planner",    icon: "🗺️",  label: "Planner" },
  { href: "/library",    icon: "📚",  label: "Library" },
  { href: "/journal",    icon: "📖",  label: "Journal" },
  { href: "/calendar",   icon: "📅",  label: "Calendar" },
  { href: "/ai-advisor", icon: "✦",   label: "AI Advisor" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const activeGardenId = params?.id as string | undefined;
  const { beds, loading: bedsLoading } = useBeds();
  const { gardens, loading: gardensLoading, createGarden } = useGardens();
  const [createGardenOpen, setCreateGardenOpen] = useState(false);

  const loading = bedsLoading || gardensLoading;
  const ungroupedBeds = beds.filter((b) => !b.gardenId);

  const handleCreateGarden = async (data: {
    name: string;
    description?: string;
    color: string;
  }) => {
    await createGarden(data);
    setCreateGardenOpen(false);
  };

  return (
    <aside className="w-60 bg-white border-r border-sage-100 flex flex-col shrink-0 overflow-y-auto">
      {/* Navigation */}
      <div className="p-4 flex flex-col gap-1">
        <p className="text-[11px] font-medium text-sage-400 uppercase tracking-widest px-2 py-1">
          Navigation
        </p>
        {SIDEBAR_NAV.map(({ href, icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all",
              pathname.startsWith(href)
                ? "bg-sage-50 text-sage-700 font-medium"
                : "text-sage-600 hover:bg-sage-50 hover:text-sage-700"
            )}
          >
            <span className="text-base leading-none">{icon}</span>
            {label}
          </Link>
        ))}
      </div>

      {/* My Gardens */}
      <div className="px-4 mt-1 pb-2">
        <div className="flex items-center justify-between px-2 py-1">
          <p className="text-[11px] font-medium text-sage-400 uppercase tracking-widest">
            My Gardens
          </p>
          <button
            onClick={() => setCreateGardenOpen(true)}
            className="text-[11px] text-sage-400 hover:text-sage-600 font-medium transition-colors"
            title="Create garden"
          >
            + Create
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-sage-400 px-2 py-1">Loading...</p>
        ) : gardens.length === 0 ? (
          <p className="text-xs text-sage-400 px-2 py-1">No gardens yet.</p>
        ) : (
          <div className="flex flex-col gap-2 mt-1">
            {gardens.map((garden) => {
              const gardenBeds = beds.filter((b) => b.gardenId === garden.id);
              const isActive = activeGardenId === garden.id;
              return (
                <div key={garden.id}>
                  <Link
                    href={`/gardens/${garden.id}`}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors",
                      isActive
                        ? "bg-sage-50 text-sage-700"
                        : "hover:bg-sage-50"
                    )}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: garden.color }}
                    />
                    <p className={cn(
                      "text-[11px] font-medium uppercase tracking-widest truncate",
                      isActive ? "text-sage-700" : "text-sage-500"
                    )}>
                      {garden.name}
                    </p>
                  </Link>

                  {gardenBeds.length === 0 ? (
                    <p className="text-xs text-sage-400 px-2 py-0.5 ml-3">
                      No beds yet
                    </p>
                  ) : (
                    <div className="space-y-0.5">
                      {gardenBeds.map((bed) => {
                        const plantCount = Object.values(bed.cells).filter(
                          (c) => c.isAnchor
                        ).length;
                        return (
                          <button
                            key={bed.id}
                            onClick={() => router.push(`/planner?bed=${bed.id}`)}
                            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-sage-50 transition-colors ml-2"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: bed.color }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-sage-800 truncate">
                                  {bed.name}
                                </p>
                                <p className="text-xs text-sage-500">
                                  {bed.widthFt}×{bed.lengthFt} ft · {plantCount} plant
                                  {plantCount !== 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ungrouped Beds */}
      {!loading && ungroupedBeds.length > 0 && (
        <div className="px-4 mt-1 pb-4">
          <p className="text-[11px] font-medium text-sage-400 uppercase tracking-widest px-2 py-1">
            Ungrouped Beds
          </p>
          <div className="space-y-0.5">
            {ungroupedBeds.map((bed) => {
              const plantCount = Object.values(bed.cells).filter(
                (c) => c.isAnchor
              ).length;
              return (
                <button
                  key={bed.id}
                  onClick={() => router.push(`/planner?bed=${bed.id}`)}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-sage-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: bed.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-sage-800 truncate">
                        {bed.name}
                      </p>
                      <p className="text-xs text-sage-500">
                        {bed.widthFt}×{bed.lengthFt} ft · {plantCount} plant
                        {plantCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-auto p-4 border-t border-sage-100">
        <p className="text-[11px] text-sage-400 leading-relaxed px-1">
          Spring 2026 · Planting window open
        </p>
      </div>

      <CreateGardenModal
        open={createGardenOpen}
        onClose={() => setCreateGardenOpen(false)}
        onSave={handleCreateGarden}
      />
    </aside>
  );
}
