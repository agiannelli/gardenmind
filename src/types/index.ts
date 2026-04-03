// ─── Gardens ──────────────────────────────────────────────────────────────────

export type MemberRole = "editor" | "viewer";
export type MemberStatus = "pending" | "accepted";

export interface GardenMember {
  id: string;
  gardenId: string;
  email: string;
  userId: string | null;
  role: MemberRole;
  inviteToken: string | null;
  status: MemberStatus;
  createdAt: string;
}

export interface Garden {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string;
  members: GardenMember[];
  beds: Bed[];
  createdAt: string;
  updatedAt: string;
}

// ─── Garden & Beds ────────────────────────────────────────────────────────────

export type SunExposure = "full-sun" | "partial-sun" | "full-shade";

export type GardenType = "traditional" | "square-foot" | "intensive";

export interface CellData {
  plantId: string;
  isAnchor: boolean;
  anchorCell?: string; // For overflow cells, points to anchor (e.g., "0_0")
}

export interface Bed {
  id: string;
  userId: string;
  gardenId: string | null;
  name: string;
  widthFt: number;
  lengthFt: number;
  sunExposure: SunExposure;
  gardenType: GardenType;
  color: string;
  /** key: "row_col", value: CellData */
  cells: Record<string, CellData>;
  createdAt: string;
  updatedAt: string;
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

export type EntryType = "observation" | "pest" | "harvest" | "watering";

export interface JournalEntry {
  id: string;
  userId: string;
  gardenId: string;
  bedId: string | null;
  type: EntryType;
  title: string;
  notes: string;
  tags: string[];
  photos: string[];    // Vercel Blob URLs
  date: string;        // ISO datetime string
  createdAt: string;
  updatedAt: string;
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
