import { type MatchablePlate, scoreMatch, shouldAutoNotify } from "@/lib/plate-utils/match";
import { formatPlate, normalizePlate, type ParsedPlate, parsePlate } from "@/lib/plate-utils/parse";
import { getProvince } from "@/lib/plate-utils/provinces";
import type { FoundReport, PlatePosition, VehicleType } from "@/lib/types";

// State and rules for the "add a lost plate" form. Pure so it can be tested without React.

/** Owners can lose both plates at once; "both" is saved as two tracked entries. */
export type LostPosition = PlatePosition | "both";

export type LostPlateDraft = {
  plateText: string;
  /** Owners always know their province, so there is no "unknown" (null) here. */
  province: string | undefined;
  position: LostPosition | null;
  vehicleType: VehicleType | null;
  /** YYYY-MM-DD, from <input type="date">. */
  lostSince: string;
};

export type LostPlateValue = {
  plate: ParsedPlate;
  provinceCode: string;
  positions: PlatePosition[];
  vehicleType: VehicleType | null;
  lostSince: string;
};

export type DraftField = "plate" | "province" | "position" | "lostSince";

const bangkokDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" });

/** Today's date in Bangkok as YYYY-MM-DD (the `max` of the date input). */
export function bangkokToday(now: Date = new Date()): string {
  return bangkokDay.format(now);
}

/** Prefill from `?plate=&province=` (search / plate-detail CTAs). Unparseable values are dropped. */
export function initialDraft(params: { plate?: string; province?: string }, today: string): LostPlateDraft {
  const parsed = params.plate ? parsePlate(params.plate) : null;
  return {
    plateText: parsed?.ok ? formatPlate(parsed.plate) : "",
    province: params.province && getProvince(params.province) ? params.province : undefined,
    position: null,
    vehicleType: null,
    lostSince: today,
  };
}

function isRealDate(ymd: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false;
  const d = new Date(`${ymd}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(ymd);
}

export function validateDraft(
  draft: LostPlateDraft,
  today: string,
): { ok: true; value: LostPlateValue } | { ok: false; errors: DraftField[] } {
  const parsed = parsePlate(draft.plateText);
  const errors: DraftField[] = [];
  if (!parsed.ok) errors.push("plate");
  if (!draft.province) errors.push("province");
  if (!draft.position) errors.push("position");
  // YYYY-MM-DD strings compare correctly as text.
  if (!isRealDate(draft.lostSince) || draft.lostSince > today) errors.push("lostSince");

  if (!parsed.ok || !draft.province || !draft.position || errors.length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      plate: parsed.plate,
      provinceCode: draft.province,
      positions: draft.position === "both" ? ["front", "rear"] : [draft.position],
      vehicleType: draft.vehicleType,
      lostSince: draft.lostSince,
    },
  };
}

/** The newest still-open found report that strongly matches (the one we would notify about). */
export function findStrongMatch(lost: MatchablePlate, reports: FoundReport[]): FoundReport | null {
  const matches = reports.filter((r) => {
    if (r.status === "returned") return false;
    const found = { normalized: normalizePlate(formatPlate(r.plate)), provinceCode: r.provinceCode };
    return shouldAutoNotify(scoreMatch(lost, found));
  });
  return matches.toSorted((a, b) => b.foundAt.localeCompare(a.foundAt))[0] ?? null;
}
