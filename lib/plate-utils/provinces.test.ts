import { describe, expect, it } from "vitest";
import { PROVINCES, getProvince, searchProvinces } from "./provinces";

describe("PROVINCES", () => {
  it("has all 77 provinces", () => {
    expect(PROVINCES).toHaveLength(77);
  });

  it("has unique codes and names", () => {
    expect(new Set(PROVINCES.map((p) => p.code)).size).toBe(77);
    expect(new Set(PROVINCES.map((p) => p.nameTh)).size).toBe(77);
    expect(new Set(PROVINCES.map((p) => p.nameEn)).size).toBe(77);
  });

  it("uses 2-digit ISO 3166-2:TH codes", () => {
    for (const p of PROVINCES) expect(p.code).toMatch(/^[1-9][0-9]$/);
  });
});

describe("getProvince", () => {
  it("finds a province by code", () => {
    expect(getProvince("10")?.nameTh).toBe("กรุงเทพมหานคร");
    expect(getProvince("12")?.nameTh).toBe("นนทบุรี");
  });

  it("returns undefined for an unknown code", () => {
    expect(getProvince("99")).toBeUndefined();
  });
});

describe("searchProvinces", () => {
  it("matches Thai substrings", () => {
    const names = searchProvinces("นคร").map((p) => p.nameTh);
    expect(names).toContain("นครราชสีมา");
    expect(names).toContain("กรุงเทพมหานคร");
  });

  it("matches English case-insensitively", () => {
    expect(searchProvinces("bangkok").map((p) => p.code)).toEqual(["10"]);
  });

  it("ranks names that start with the query first", () => {
    expect(searchProvinces("นคร")[0].nameTh.startsWith("นคร")).toBe(true);
  });

  it("returns every province for an empty query", () => {
    expect(searchProvinces("  ")).toHaveLength(77);
  });
});
