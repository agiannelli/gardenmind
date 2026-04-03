"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useBeds } from "@/hooks/useBeds";

const SIDEBAR_NAV = [
  { href: "/planner",    icon: "🗺️",  label: "Planner" },
  { href: "/library",    icon: "📚",  label: "Library" },
  { href: "/journal",    icon: "📖",  label: "Journal" },
  { href: "/calendar",   icon: "📅",  label: "Calendar" },
  { href: "/ai-advisor", icon: "✦",   label: "AI Advisor" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { beds, loading } = useBeds();

  const handleBedClick = (bedId: string) => {
    // Navigate to planner page when a bed is clicked
    router.push(`/planner?bed=${bedId}`);
  };

  return (
    <aside className="w-60 bg-white border-r border-sage-100 flex flex-col shrink-0 overflow-y-auto">
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

      {/* Beds section */}
      <div className="px-4 mt-2 flex flex-col gap-1">
        <p className="text-[11px] font-medium text-sage-400 uppercase tracking-widest px-2 py-1">
          My Beds
        </p>
        {loading ? (
          <p className="text-xs text-sage-400 px-2 py-1">Loading beds...</p>
        ) : beds.length === 0 ? (
          <p className="text-xs text-sage-400 px-2 py-1">
            No beds yet. Create one in the Planner!
          </p>
        ) : (
          <div className="space-y-1">
            {beds.map((bed) => {
              const plantCount = Object.values(bed.cells).filter(
                (cell) => cell.isAnchor
              ).length;

              return (
                <button
                  key={bed.id}
                  onClick={() => handleBedClick(bed.id)}
                  className="w-full text-left px-2 py-2 rounded-lg hover:bg-sage-50 transition-colors"
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
                      <p className="text-xs text-sage-600">
                        {bed.widthFt}×{bed.lengthFt} ft • {plantCount} plant
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

      <div className="mt-auto p-4 border-t border-sage-100">
        <p className="text-[11px] text-sage-400 leading-relaxed px-1">
          Spring 2026 · Planting window open
        </p>
      </div>
    </aside>
  );
}
