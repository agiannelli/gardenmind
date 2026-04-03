"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { href: "/dashboard",  label: "Dashboard" },
  { href: "/planner",    label: "Planner" },
  { href: "/journal",    label: "Journal" },
  { href: "/calendar",   label: "Calendar" },
  { href: "/ai-advisor", label: "AI Advisor ✦" },
];

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export function Nav() {
  const pathname = usePathname();
  const { user, isLoading } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

  return (
    <nav className="h-14 bg-sage-700 flex items-center gap-0 px-6 shrink-0 border-b border-white/10">
      {/* Brand */}
      <Link
        href="/dashboard"
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

      {/* User avatar with dropdown */}
      <div className="relative" ref={dropdownRef}>
        {isLoading ? (
          // Loading skeleton
          <div className="w-8 h-8 rounded-full bg-sage-600 animate-pulse" />
        ) : user ? (
          <>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-8 h-8 rounded-full bg-sage-300 flex items-center justify-center text-sage-700 text-xs font-medium cursor-pointer select-none hover:bg-sage-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              {user.picture ? (
                <Image
                  src={user.picture}
                  alt={user.name || "User"}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                getInitials(user.name || "User")
              )}
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-sage-100 z-50 overflow-hidden">
                <div className="p-3 border-b border-sage-100">
                  <div className="font-medium text-sm text-sage-700">
                    {user.name}
                  </div>
                  <div className="text-xs text-sage-500 mt-0.5">
                    {user.email}
                  </div>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => {
                      window.location.href = "/api/auth/logout";
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-sage-700 hover:bg-sage-50 rounded-md transition-colors"
                  >
                    Log out
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          // Fallback (shouldn't happen on protected routes)
          <div className="w-8 h-8 rounded-full bg-sage-300 flex items-center justify-center text-sage-700 text-xs font-medium">
            ?
          </div>
        )}
      </div>
    </nav>
  );
}
