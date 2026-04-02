"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const SIDEBAR_NAV = [
  { href: "/planner",    icon: "🗺️",  label: "Planner" },
  { href: "/journal",    icon: "📖",  label: "Journal" },
  { href: "/calendar",   icon: "📅",  label: "Calendar" },
  { href: "/ai-advisor", icon: "✦",   label: "AI Advisor" },
];

export function Sidebar() {
  const pathname = usePathname();

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

      {/* Beds section — wired up properly in the Planner PR */}
      <div className="px-4 mt-2 flex flex-col gap-1">
        <p className="text-[11px] font-medium text-sage-400 uppercase tracking-widest px-2 py-1">
          My Beds
        </p>
        <p className="text-xs text-sage-400 px-2 py-1">
          Beds will appear here once you create them in the Planner.
        </p>
      </div>

      <div className="mt-auto p-4 border-t border-sage-100">
        <p className="text-[11px] text-sage-400 leading-relaxed px-1">
          Spring 2026 · Planting window open
        </p>
      </div>
    </aside>
  );
}
