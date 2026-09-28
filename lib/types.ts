import type { PlateParts } from "@/lib/plate-utils/parse";
import type { th } from "@/locales/th";

// App-level domain types (CLAUDE.md §6). The Supabase layer maps snake_case rows to these.

export type PlatePosition = "front" | "rear";
export type VehicleType = keyof typeof th.vehicle;

export type LostPlate = {
  id: string;
  plate: PlateParts;
  provinceCode: string;
  position: PlatePosition;
  vehicleType?: VehicleType;
  /** ISO timestamp. */
  lostSince: string;
  status: "tracking" | "matched" | "recovered";
  /** Present once someone reports a strong match. */
  match?: { id: string; foundAt: string; placeName: string };
};

export type MatchedPlate = LostPlate & { match: NonNullable<LostPlate["match"]> };

/** A found report as the public sees it: location already blurred to ~200 m. */
export type FoundReport = {
  id: string;
  plate: PlateParts;
  provinceCode: string | null;
  position: PlatePosition;
  placeName: string;
  lat: number;
  lng: number;
  foundAt: string;
  status: "open" | "matched" | "returned";
};

export type NotifyPrefs = {
  app: boolean;
  sms: boolean;
  email: boolean;
  autoMatch: boolean;
};
