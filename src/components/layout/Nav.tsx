"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/planner",    label: "Planner" },
  { href: "/journal",    label: "Journal" },
  { href: "/calendar",   label: "Calendar" },
  { href: "/ai-advisor", label: "AI Advisor ✦" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="h-14 bg-sage-700 flex items-center gap-0 px-6 shrink-0 border-b border-white/10">
      {/* Brand */}
      <Link
        href="/planner"
        className="font-serif text-xl text-white tracking-tight flex items-center gap-2 mr-8 hover:opacity-90 transition-opacity"
      >
        🌿 GardenMind
      </Link>

      {/* Nav links */}
      <div className="flex gap-1 flex-1">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "px-3.5 py-1.5 rounded-md text-sm transition-all",
              pathname.startsWith(href)
                ? "bg-white/15 text-white"
                : "text-white/60 hover:text-white hover:bg-white/10"
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* User avatar — replaced with real user in auth PR */}
      <div className="w-8 h-8 rounded-full bg-sage-300 flex items-center justify-center text-sage-700 text-xs font-medium cursor-pointer select-none">
        JD
      </div>
    </nav>
  );
}
