// ─── Garden & Beds ────────────────────────────────────────────────────────────

export type SunExposure = "full-sun" | "partial-sun" | "full-shade";

export interface Bed {
  id: string;
  name: string;
  widthFt: number;
  lengthFt: number;
  sunExposure: SunExposure;
  color: string;
  /** key: "row_col", value: plant id */
  cells: Record<string, string>;
  createdAt: string;
}

// ─── Plants ───────────────────────────────────────────────────────────────────

export interface Plant {
  id: string;
  name: string;
  emoji: string;
  latinName: string;
  sunNeeds: SunExposure;
  waterNeeds: "low" | "moderate" | "regular" | "high";
  spacingIn: number;
  daysToHarvest: string;
  companions: string[];
  avoid: string[];
  type: "vegetable" | "herb" | "flower" | "fruit";
}

// ─── Journal ──────────────────────────────────────────────────────────────────

export type EntryType =
  | "observation"
  | "growth"
  | "pest"
  | "harvest"
  | "watering"
  | "fertilizing"
  | "note"
  | "weather";

export interface JournalEntry {
  id: string;
  type: EntryType;
  title: string;
  bedId: string;
  date: string;        // ISO date string YYYY-MM-DD
  plantIds: string[];
  notes: string;
  tags: string[];
  createdAt: string;
}

// ─── User / Auth ──────────────────────────────────────────────────────────────

export interface UserProfile {
  sub: string;         // Auth0 subject
  name: string;
  email: string;
  picture?: string;
  /** US hardiness zone, e.g. "7b" */
  hardinessZone?: string;
  location?: string;
}
