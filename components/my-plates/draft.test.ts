import { describe, expect, it } from "vitest";
import type { FoundReport } from "@/lib/types";
import { bangkokToday, findStrongMatch, initialDraft, type LostPlateDraft, validateDraft } from "./draft";

const TODAY = "2026-09-29";
const valid: LostPlateDraft = {
  plateText: "1กข 1234",
  province: "10",
  position: "front",
  vehicleType: null,
  lostSince: "2026-09-26",
};

describe("bangkokToday", () => {
  it("uses the Bangkok calendar day, not UTC", () => {
    // 20:00 UTC on the 28th is already 03:00 on the 29th in Bangkok.
    expect(bangkokToday(new Date("2026-09-28T20:00:00Z"))).toBe("2026-09-29");
  });
});

describe("initialDraft", () => {
  it("starts empty with today as the lost date", () => {
    expect(initialDraft({}, TODAY)).toEqual({
      plateText: "",
      province: undefined,
      position: null,
      vehicleType: null,
      lostSince: TODAY,
    });
  });

  it("prefills a valid plate (formatted) and province from the URL", () => {
    const d = initialDraft({ plate: "1กข1234", province: "10" }, TODAY);
    expect(d.plateText).toBe("1กข 1234");
    expect(d.province).toBe("10");
  });

  it("ignores junk params instead of trusting them", () => {
    const d = initialDraft({ plate: "<script>", province: "999" }, TODAY);
    expect(d.plateText).toBe("");
    expect(d.province).toBeUndefined();
  });
});

describe("validateDraft", () => {
  it("returns the clean value for a valid draft", () => {
    const r = validateDraft(valid, TODAY);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.plate.normalized).toBe("1กข1234");
    expect(r.value.provinceCode).toBe("10");
    expect(r.value.positions).toEqual(["front"]);
    expect(r.value.lostSince).toBe("2026-09-26");
  });

  it("expands 'both' into a front and a rear entry", () => {
    const r = validateDraft({ ...valid, position: "both" }, TODAY);
    expect(r.ok && r.value.positions).toEqual(["front", "rear"]);
  });

  it("flags each missing or bad field", () => {
    const r = validateDraft(
      { plateText: "abc", province: undefined, position: null, vehicleType: null, lostSince: "" },
      TODAY,
    );
    expect(r).toEqual({ ok: false, errors: ["plate", "province", "position", "lostSince"] });
  });

  it("rejects a lost date in the future or not a real date", () => {
    expect(validateDraft({ ...valid, lostSince: "2026-09-30" }, TODAY)).toEqual({ ok: false, errors: ["lostSince"] });
    expect(validateDraft({ ...valid, lostSince: "2026-02-30" }, TODAY)).toEqual({ ok: false, errors: ["lostSince"] });
    expect(validateDraft({ ...valid, lostSince: TODAY }, TODAY).ok).toBe(true);
  });
});

describe("findStrongMatch", () => {
  const report = (id: string, number: string, provinceCode: string | null, foundAt: string): FoundReport => ({
    id,
    plate: { prefixDigit: "1", letters: "กข", number },
    provinceCode,
    position: "rear",
    placeName: "ที่ไหนสักแห่ง",
    lat: 13.8,
    lng: 100.6,
    foundAt,
    status: "open",
  });

  it("returns the newest open report with the same plate and province, whatever the position", () => {
    const reports = [
      report("old", "1234", "10", "2026-09-20T00:00:00Z"),
      report("new", "1234", "10", "2026-09-28T00:00:00Z"),
      report("other-prov", "1234", "13", "2026-09-29T00:00:00Z"),
      report("near", "1284", "10", "2026-09-29T00:00:00Z"),
    ];
    expect(findStrongMatch({ normalized: "1กข1234", provinceCode: "10" }, reports)?.id).toBe("new");
  });

  it("skips reports that were already returned, and returns null when nothing matches", () => {
    const returned = { ...report("r", "1234", "10", "2026-09-28T00:00:00Z"), status: "returned" as const };
    expect(findStrongMatch({ normalized: "1กข1234", provinceCode: "10" }, [returned])).toBeNull();
  });
});
