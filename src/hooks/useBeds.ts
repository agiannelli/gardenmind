import { useState, useEffect, useCallback } from "react";
import type { Bed } from "@/types";

interface CreateBedInput {
  name: string;
  widthFt: number;
  lengthFt: number;
  sunExposure: string;
  color: string;
}

interface UpdateBedInput {
  name?: string;
  widthFt?: number;
  lengthFt?: number;
  sunExposure?: string;
  color?: string;
}

export function useBeds() {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBeds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/beds");

      if (!response.ok) {
        throw new Error("Failed to fetch beds");
      }

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

  const createBed = useCallback(
    async (data: CreateBedInput) => {
      try {
        const response = await fetch("/api/beds", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create bed");
        }

        const newBed = await response.json();
        setBeds((prev) => [newBed, ...prev]);
        return newBed;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const updateBed = useCallback(
    async (id: string, data: UpdateBedInput) => {
      try {
        const response = await fetch(`/api/beds/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update bed");
        }

        const updatedBed = await response.json();
        setBeds((prev) =>
          prev.map((bed) => (bed.id === id ? updatedBed : bed))
        );
        return updatedBed;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const deleteBed = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/beds/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete bed");
      }

      setBeds((prev) => prev.filter((bed) => bed.id !== id));
    } catch (err) {
      throw err;
    }
  }, []);

  const plantInCell = useCallback(
    async (bedId: string, row: number, col: number, plantId: string) => {
      try {
        const response = await fetch(`/api/beds/${bedId}/plant`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ row, col, plantId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to plant");
        }

        const updatedBed = await response.json();
        setBeds((prev) =>
          prev.map((bed) => (bed.id === bedId ? updatedBed : bed))
        );
        return updatedBed;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const removeFromCell = useCallback(
    async (bedId: string, row: number, col: number) => {
      try {
        const response = await fetch(`/api/beds/${bedId}/plant`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ row, col }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to remove plant");
        }

        const updatedBed = await response.json();
        setBeds((prev) =>
          prev.map((bed) => (bed.id === bedId ? updatedBed : bed))
        );
        return updatedBed;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  return {
    beds,
    loading,
    error,
    createBed,
    updateBed,
    deleteBed,
    plantInCell,
    removeFromCell,
    refetch: fetchBeds,
  };
}
