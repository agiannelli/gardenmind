"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Bed } from "@/types";

interface CreateBedInput {
  name: string;
  widthFt: number;
  lengthFt: number;
  sunExposure: string;
  facing: string;
  color: string;
  gardenId?: string;
}

interface UpdateBedInput {
  name?: string;
  widthFt?: number;
  lengthFt?: number;
  sunExposure?: string;
  facing?: string;
  color?: string;
  gardenId?: string;
}

interface BedsContextValue {
  beds: Bed[];
  loading: boolean;
  error: string | null;
  createBed: (data: CreateBedInput) => Promise<Bed>;
  updateBed: (id: string, data: UpdateBedInput) => Promise<Bed>;
  deleteBed: (id: string) => Promise<void>;
  plantInCell: (bedId: string, row: number, col: number, plantId: string) => Promise<Bed>;
  removeFromCell: (bedId: string, row: number, col: number) => Promise<Bed>;
  refetch: () => Promise<void>;
}

const BedsContext = createContext<BedsContextValue | null>(null);

export function BedsProvider({ children }: { children: ReactNode }) {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBeds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/beds");
      if (!response.ok) throw new Error("Failed to fetch beds");
      const data = await response.json();
      setBeds(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch beds");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBeds();
  }, [fetchBeds]);

  const createBed = useCallback(async (data: CreateBedInput) => {
    const response = await fetch("/api/beds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to create bed");
    }
    const newBed: Bed = await response.json();
    setBeds((prev) => [newBed, ...prev]);
    return newBed;
  }, []);

  const updateBed = useCallback(async (id: string, data: UpdateBedInput) => {
    const response = await fetch(`/api/beds/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to update bed");
    }
    const updatedBed: Bed = await response.json();
    setBeds((prev) => prev.map((bed) => (bed.id === id ? updatedBed : bed)));
    return updatedBed;
  }, []);

  const deleteBed = useCallback(async (id: string) => {
    const response = await fetch(`/api/beds/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to delete bed");
    }
    setBeds((prev) => prev.filter((bed) => bed.id !== id));
  }, []);

  const plantInCell = useCallback(
    async (bedId: string, row: number, col: number, plantId: string) => {
      const response = await fetch(`/api/beds/${bedId}/plant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ row, col, plantId }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to plant");
      }
      const updatedBed: Bed = await response.json();
      setBeds((prev) => prev.map((bed) => (bed.id === bedId ? updatedBed : bed)));
      return updatedBed;
    },
    []
  );

  const removeFromCell = useCallback(
    async (bedId: string, row: number, col: number) => {
      const response = await fetch(`/api/beds/${bedId}/plant`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ row, col }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to remove plant");
      }
      const updatedBed: Bed = await response.json();
      setBeds((prev) => prev.map((bed) => (bed.id === bedId ? updatedBed : bed)));
      return updatedBed;
    },
    []
  );

  return (
    <BedsContext.Provider
      value={{
        beds,
        loading,
        error,
        createBed,
        updateBed,
        deleteBed,
        plantInCell,
        removeFromCell,
        refetch: fetchBeds,
      }}
    >
      {children}
    </BedsContext.Provider>
  );
}

export function useBedsContext() {
  const ctx = useContext(BedsContext);
  if (!ctx) throw new Error("useBeds must be used within BedsProvider");
  return ctx;
}
