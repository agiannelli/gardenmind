"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Garden } from "@/types";

interface CreateGardenInput {
  name: string;
  description?: string;
  color?: string;
}

interface UpdateGardenInput {
  name?: string;
  description?: string;
  color?: string;
}

interface GardensContextValue {
  gardens: Garden[];
  loading: boolean;
  error: string | null;
  createGarden: (data: CreateGardenInput) => Promise<Garden>;
  updateGarden: (id: string, data: UpdateGardenInput) => Promise<Garden>;
  deleteGarden: (id: string) => Promise<void>;
  inviteMember: (gardenId: string, email: string, role: "editor" | "viewer") => Promise<{ member: Garden["members"][0]; inviteToken: string }>;
  removeMember: (gardenId: string, memberId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const GardensContext = createContext<GardensContextValue | null>(null);

export function GardensProvider({ children }: { children: ReactNode }) {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGardens = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/gardens");
      if (!res.ok) throw new Error("Failed to fetch gardens");
      const data = await res.json();
      setGardens(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch gardens");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGardens();
  }, [fetchGardens]);

  const createGarden = useCallback(async (data: CreateGardenInput) => {
    const res = await fetch("/api/gardens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create garden");
    }
    const garden: Garden = await res.json();
    setGardens((prev) => [garden, ...prev]);
    return garden;
  }, []);

  const updateGarden = useCallback(async (id: string, data: UpdateGardenInput) => {
    const res = await fetch(`/api/gardens/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update garden");
    }
    const updated: Garden = await res.json();
    setGardens((prev) => prev.map((g) => (g.id === id ? updated : g)));
    return updated;
  }, []);

  const deleteGarden = useCallback(async (id: string) => {
    const res = await fetch(`/api/gardens/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to delete garden");
    }
    setGardens((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const inviteMember = useCallback(
    async (gardenId: string, email: string, role: "editor" | "viewer") => {
      const res = await fetch(`/api/gardens/${gardenId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to invite member");
      }
      const data = await res.json();
      await fetchGardens();
      return data as { member: Garden["members"][0]; inviteToken: string };
    },
    [fetchGardens]
  );

  const removeMember = useCallback(async (gardenId: string, memberId: string) => {
    const res = await fetch(`/api/gardens/${gardenId}/members/${memberId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to remove member");
    }
    setGardens((prev) =>
      prev.map((g) =>
        g.id === gardenId
          ? { ...g, members: g.members.filter((m) => m.id !== memberId) }
          : g
      )
    );
  }, []);

  return (
    <GardensContext.Provider
      value={{
        gardens,
        loading,
        error,
        createGarden,
        updateGarden,
        deleteGarden,
        inviteMember,
        removeMember,
        refetch: fetchGardens,
      }}
    >
      {children}
    </GardensContext.Provider>
  );
}

export function useGardensContext() {
  const ctx = useContext(GardensContext);
  if (!ctx) throw new Error("useGardens must be used within GardensProvider");
  return ctx;
}
