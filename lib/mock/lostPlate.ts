import { findStrongMatch, type LostPlateValue } from "@/components/my-plates/draft";
import type { FoundReport } from "@/lib/types";
import { getMockFoundReports } from "./data";

// Stand-in for the `createLostPlate` server action (Phase 5), which saves one row per position
// and runs matching server-side. Nothing is persisted here.
export async function createLostPlateMock(
  value: LostPlateValue,
): Promise<{ ids: string[]; match: FoundReport | null }> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  const match = findStrongMatch(
    { normalized: value.plate.normalized, provinceCode: value.provinceCode },
    getMockFoundReports(new Date()),
  );
  return { ids: value.positions.map((p) => `lp-new-${p}`), match };
}
