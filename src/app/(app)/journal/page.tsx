"use client";

import { useState, useMemo } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useJournal } from "@/hooks/useJournal";
import { useGardens } from "@/hooks/useGardens";
import { useBeds } from "@/hooks/useBeds";
import { Button } from "@/components/ui/Button";
import { EntryCard } from "@/components/journal/EntryCard";
import { EntryDetailModal } from "@/components/journal/EntryDetailModal";
import { CreateEntryModal } from "@/components/journal/CreateEntryModal";
import { ENTRY_TYPE_CONFIG } from "@/components/journal/EntryTypeConfig";
import type { JournalEntry, EntryType } from "@/types";

export default function JournalPage() {
  const { user } = useUser();
  const { entries, loading, createEntry, updateEntry, deleteEntry } = useJournal();
  const { gardens } = useGardens();
  const { beds } = useBeds();

  const [createOpen, setCreateOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<JournalEntry | null>(null);
  const [detailEntry, setDetailEntry] = useState<JournalEntry | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<EntryType | null>(null);
  const [filterGarden, setFilterGarden] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (filterType && e.type !== filterType) return false;
      if (filterGarden && e.gardenId !== filterGarden) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!e.title.toLowerCase().includes(q) && !e.notes.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [entries, filterType, filterGarden, searchQuery]);

  const gardenMap = Object.fromEntries(gardens.map((g) => [g.id, g.name]));
  const bedMap = Object.fromEntries(beds.map((b) => [b.id, b.name]));

  const handleCreateSave = async (data: Parameters<typeof createEntry>[0]) => {
    await createEntry(data);
    setCreateOpen(false);
  };

  const handleEditSave = async (data: Parameters<typeof updateEntry>[1]) => {
    if (!editEntry) return;
    await updateEntry(editEntry.id, data);
    setEditEntry(null);
    setDetailEntry(null);
  };

  const hasFilters = filterType || filterGarden || searchQuery;

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-serif text-sage-700 mb-1">Journal</h1>
            <p className="text-sage-600 text-sm">
              {loading ? "Loading…" : `${entries.length} entr${entries.length !== 1 ? "ies" : "y"}`}
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
            + New Entry
          </Button>
        </div>

        {/* Filter bar */}
        <div className="mb-6 space-y-2">
          {/* Search */}
          <div className="flex items-center gap-2 bg-white border border-sage-200 rounded-lg px-3 py-2 focus-within:border-sage-400 transition-colors">
            <svg className="w-4 h-4 text-sage-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries…"
              className="flex-1 text-sm bg-transparent outline-none text-sage-800 placeholder:text-sage-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-sage-400 hover:text-sage-600 text-lg leading-none">×</button>
            )}
          </div>

          {/* Type + Garden chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-sage-400 mr-1">Type:</span>
            {(Object.entries(ENTRY_TYPE_CONFIG) as [EntryType, typeof ENTRY_TYPE_CONFIG[EntryType]][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setFilterType(filterType === key ? null : key)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  filterType === key
                    ? "bg-sage-600 text-white"
                    : "bg-white border border-sage-200 text-sage-600 hover:border-sage-400"
                }`}
              >
                {cfg.icon} {cfg.label}
              </button>
            ))}

            {gardens.length > 1 && (
              <>
                <span className="text-xs text-sage-400 mx-1">Garden:</span>
                {gardens.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setFilterGarden(filterGarden === g.id ? null : g.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      filterGarden === g.id
                        ? "bg-sage-600 text-white"
                        : "bg-white border border-sage-200 text-sage-600 hover:border-sage-400"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: g.color }}
                    />
                    {g.name}
                  </button>
                ))}
              </>
            )}

            {hasFilters && (
              <button
                onClick={() => { setFilterType(null); setFilterGarden(null); setSearchQuery(""); }}
                className="ml-1 text-xs text-sage-400 hover:text-sage-700 underline underline-offset-2"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Entry list */}
        {loading ? (
          <p className="text-sage-500 text-center py-12">Loading entries…</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📖</div>
            <h3 className="font-serif text-xl text-sage-700 mb-2">
              {hasFilters ? "No entries match your filters" : "No entries yet"}
            </h3>
            <p className="text-sage-500 text-sm mb-6">
              {hasFilters
                ? "Try clearing the filters to see all entries."
                : "Start recording observations, harvests, and more."}
            </p>
            {!hasFilters && (
              <Button variant="primary" onClick={() => setCreateOpen(true)}>
                Add First Entry
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                gardenName={gardenMap[entry.gardenId]}
                bedName={entry.bedId ? bedMap[entry.bedId] : undefined}
                onClick={() => setDetailEntry(entry)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      <CreateEntryModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreateSave}
        gardens={gardens}
        beds={beds}
      />

      {/* Edit modal */}
      {editEntry && (
        <CreateEntryModal
          open={!!editEntry}
          onClose={() => setEditEntry(null)}
          onSave={handleEditSave}
          gardens={gardens}
          beds={beds}
          entry={editEntry}
        />
      )}

      {/* Detail modal */}
      {detailEntry && (
        <EntryDetailModal
          entry={detailEntry}
          open={!!detailEntry}
          gardenName={gardenMap[detailEntry.gardenId]}
          bedName={detailEntry.bedId ? bedMap[detailEntry.bedId] : undefined}
          onClose={() => setDetailEntry(null)}
          onEdit={() => { setEditEntry(detailEntry); setDetailEntry(null); }}
          onDelete={deleteEntry}
          isAuthor={detailEntry.userId === user?.sub}
        />
      )}
    </div>
  );
}
