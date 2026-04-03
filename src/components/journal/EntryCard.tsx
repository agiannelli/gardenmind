"use client";

import type { JournalEntry } from "@/types";
import { ENTRY_TYPE_CONFIG } from "./EntryTypeConfig";

interface EntryCardProps {
  entry: JournalEntry;
  gardenName?: string;
  bedName?: string;
  onClick: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function EntryCard({ entry, gardenName, bedName, onClick }: EntryCardProps) {
  const config = ENTRY_TYPE_CONFIG[entry.type];

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-sage-200 rounded-lg p-4 hover:border-sage-400 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Photo thumbnail or type icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden bg-sage-50 flex items-center justify-center">
          {entry.photos.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={entry.photos[0]}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl">{config.icon}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-serif text-base text-sage-800 truncate leading-snug">
              {entry.title}
            </h3>
            <span className="text-xs text-sage-400 shrink-0 mt-0.5">
              {formatDate(entry.date)}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${config.color}`}
            >
              {config.icon} {config.label}
            </span>
            {gardenName && (
              <span className="text-xs text-sage-500 truncate">
                {gardenName}
                {bedName ? ` › ${bedName}` : ""}
              </span>
            )}
          </div>

          {entry.notes && (
            <p className="text-sm text-sage-600 line-clamp-2">{entry.notes}</p>
          )}

          {entry.photos.length > 1 && (
            <p className="text-xs text-sage-400 mt-1">
              +{entry.photos.length - 1} more photo{entry.photos.length - 1 !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
