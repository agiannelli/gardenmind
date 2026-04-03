import { useState, useEffect, useCallback } from "react";
import type { JournalEntry, EntryType } from "@/types";

interface CreateEntryInput {
  gardenId: string;
  bedId?: string;
  type: EntryType;
  title: string;
  notes?: string;
  tags?: string[];
  photos?: string[];
  date?: string;
}

interface UpdateEntryInput {
  type?: EntryType;
  title?: string;
  notes?: string;
  tags?: string[];
  photos?: string[];
  date?: string;
  bedId?: string | null;
}

export function useJournal(gardenId?: string) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url = gardenId
        ? `/api/journals?gardenId=${gardenId}`
        : "/api/journals";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch entries");
      setEntries(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch entries");
    } finally {
      setLoading(false);
    }
  }, [gardenId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const createEntry = useCallback(async (data: CreateEntryInput) => {
    const res = await fetch("/api/journals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create entry");
    }
    const entry: JournalEntry = await res.json();
    setEntries((prev) => [entry, ...prev]);
    return entry;
  }, []);

  const updateEntry = useCallback(async (id: string, data: UpdateEntryInput) => {
    const res = await fetch(`/api/journals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update entry");
    }
    const updated: JournalEntry = await res.json();
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
    return updated;
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    const res = await fetch(`/api/journals/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to delete entry");
    }
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return {
    entries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    refetch: fetchEntries,
  };
}
