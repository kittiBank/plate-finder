import { describe, expect, it } from "vitest";
import { isNearNumber, parseSearchQuery, searchByNumber, searchPlates, type Searchable } from "./search";

const numberOf = (normalized: string) => normalized.replace(/^.*?([0-9]+)$/, "$1");

describe("parseSearchQuery", () => {
  it("returns empty for blank input", () => {
    expect(parseSearchQuery("")).toEqual({ kind: "empty" });
    expect(parseSearchQuery("   ")).toEqual({ kind: "empty" });
    expect(parseSearchQuery(undefined)).toEqual({ kind: "empty" });
  });

  it("parses a plate without a province", () => {
    const q = parseSearchQuery("1กข 1234");
    expect(q).toMatchObject({ kind: "plate", provinceCode: null, unknownProvince: null });
    expect(q.kind === "plate" && q.plate.normalized).toBe("1กข1234");
  });

  it("normalizes Thai digits and dashes", () => {
    const q = parseSearchQuery("๑กข-๑๒๓๔");
    expect(q.kind === "plate" && q.plate.normalized).toBe("1กข1234");
  });

  it("reads a trailing province (full name, short name, alias, จ. prefix)", () => {
    for (const text of [
      "1กข 1234 กรุงเทพมหานคร",
      "1กข 1234 กรุงเทพ",
      "1กข1234 กทม",
      "1กข 1234 จังหวัดกรุงเทพมหานคร",
    ]) {
      expect(parseSearchQuery(text), text).toMatchObject({ kind: "plate", provinceCode: "10" });
    }
    expect(parseSearchQuery("กข 123 จ.นนทบุรี")).toMatchObject({ kind: "plate", provinceCode: "12" });
  });

  it("reads a leading province", () => {
    const q = parseSearchQuery("นนทบุรี 2ขข 4567");
    expect(q).toMatchObject({ kind: "plate", provinceCode: "12" });
    expect(q.kind === "plate" && q.plate.normalized).toBe("2ขข4567");
  });

  it("reads an English province name", () => {
    expect(parseSearchQuery("1กข 1234 Bangkok")).toMatchObject({ kind: "plate", provinceCode: "10" });
  });

  it("keeps the plate but flags an ambiguous or unknown province", () => {
    // "นคร" starts several provinces, so we don't guess.
    expect(parseSearchQuery("1กข 1234 นคร")).toMatchObject({
      kind: "plate",
      provinceCode: null,
      unknownProvince: "นคร",
    });
    expect(parseSearchQuery("1กข 1234 ปารีส")).toMatchObject({ provinceCode: null, unknownProvince: "ปารีส" });
  });

  it("treats a province on its own as province_only (no listing, to stop scraping)", () => {
    expect(parseSearchQuery("กรุงเทพ")).toEqual({ kind: "province_only", provinceCode: "10" });
    expect(parseSearchQuery("จังหวัดนนทบุรี")).toEqual({ kind: "province_only", provinceCode: "12" });
  });

  it("reads a number on its own, with an optional province", () => {
    expect(parseSearchQuery("1234")).toEqual({ kind: "number", number: "1234", provinceCode: null });
    expect(parseSearchQuery("๑๒๓๔")).toEqual({ kind: "number", number: "1234", provinceCode: null });
    expect(parseSearchQuery("1234 กรุงเทพ")).toEqual({ kind: "number", number: "1234", provinceCode: "10" });
    expect(parseSearchQuery("นนทบุรี 99")).toEqual({ kind: "number", number: "99", provinceCode: "12" });
  });

  it("prefers the reading whose province name matches exactly", () => {
    // Not plate "ด1234" + province prefix "ตรา".
    expect(parseSearchQuery("ตราด 1234")).toEqual({ kind: "number", number: "1234", provinceCode: "23" });
    expect(parseSearchQuery("ตราด กข1234")).toMatchObject({ kind: "plate", provinceCode: "23" });
  });

  it("returns invalid for text that is neither a plate nor a province", () => {
    expect(parseSearchQuery("hello")).toEqual({ kind: "invalid" });
    expect(parseSearchQuery("12345")).toEqual({ kind: "invalid" });
    expect(parseSearchQuery("กขค 12")).toEqual({ kind: "invalid" });
    // A number with unknown text: we can't tell what was meant.
    expect(parseSearchQuery("1234 ปารีส")).toEqual({ kind: "invalid" });
  });
});

describe("isNearNumber", () => {
  it("accepts one substitution, insertion, deletion or adjacent swap", () => {
    expect(isNearNumber("1234", "1284")).toBe(true);
    expect(isNearNumber("1234", "1324")).toBe(true);
    expect(isNearNumber("1234", "234")).toBe(true);
    expect(isNearNumber("123", "1234")).toBe(true);
  });

  it("rejects equal, far or too-short numbers", () => {
    expect(isNearNumber("1234", "1234")).toBe(false);
    expect(isNearNumber("1234", "4321")).toBe(false);
    expect(isNearNumber("1234", "1432")).toBe(false);
    // Short numbers are near almost everything, so no suggestions for them.
    expect(isNearNumber("12", "13")).toBe(false);
    expect(isNearNumber("12", "123")).toBe(false);
  });
});

describe("searchPlates", () => {
  const item = (id: string, normalized: string, provinceCode: string | null, foundAt: string) => ({
    id,
    normalized,
    number: numberOf(normalized),
    provinceCode,
    foundAt,
  });
  const reports: Searchable[] = [
    item("exact-bkk-old", "1กข1234", "10", "2026-09-20T00:00:00Z"),
    item("exact-bkk-new", "1กข1234", "10", "2026-09-28T00:00:00Z"),
    item("exact-other-prov", "1กข1234", "13", "2026-09-27T00:00:00Z"),
    item("exact-no-prov", "1กข1234", null, "2026-09-26T00:00:00Z"),
    item("one-off", "1กข1284", "10", "2026-09-28T00:00:00Z"),
    item("unrelated", "9ฮฮ9999", "10", "2026-09-28T00:00:00Z"),
  ];
  const ids = (xs: { item: { id: string } }[]) => xs.map((x) => x.item.id);

  it("with a province: exact = same plate + province, newest first; others are suggestions", () => {
    const r = searchPlates({ normalized: "1กข1234", provinceCode: "10" }, reports);
    expect(ids(r.exact)).toEqual(["exact-bkk-new", "exact-bkk-old"]);
    // Same plate/other or unknown province (0.7) before one char off (0.5).
    expect(ids(r.similar)).toEqual(["exact-other-prov", "exact-no-prov", "one-off"]);
    expect(r.similar.map((x) => x.reason)).toEqual(["other_province", "unknown_province", "one_char_off"]);
  });

  it("without a province: every same-plate report is exact", () => {
    const r = searchPlates({ normalized: "1กข1234", provinceCode: null }, reports);
    expect(ids(r.exact)).toEqual(["exact-bkk-new", "exact-other-prov", "exact-no-prov", "exact-bkk-old"]);
    expect(ids(r.similar)).toEqual(["one-off"]);
  });

  it("returns nothing for an unrelated plate", () => {
    const r = searchPlates({ normalized: "5ศส55", provinceCode: null }, reports);
    expect(r).toEqual({ exact: [], similar: [] });
  });
});

describe("searchByNumber", () => {
  const item = (id: string, normalized: string, provinceCode: string | null, foundAt = "2026-09-28T00:00:00Z") => ({
    id,
    normalized,
    number: numberOf(normalized),
    provinceCode,
    foundAt,
  });
  const reports: Searchable[] = [
    item("a-bkk", "1กข1234", "10", "2026-09-28T00:00:00Z"),
    item("b-non", "ขค1234", "12", "2026-09-27T00:00:00Z"),
    item("c-none", "ฆ1234", null, "2026-09-26T00:00:00Z"),
    item("swap", "3ฆก1324", "10", "2026-09-25T00:00:00Z"),
    item("sub", "กก1284", "13", "2026-09-24T00:00:00Z"),
    item("far", "กก4321", "10"),
    item("short", "1กข234", "10", "2026-09-23T00:00:00Z"),
  ];
  const ids = (xs: { item: { id: string } }[]) => xs.map((x) => x.item.id);

  it("without a province: any plate with that number is exact; near numbers are suggestions", () => {
    const r = searchByNumber({ number: "1234", provinceCode: null }, reports);
    expect(ids(r.exact)).toEqual(["a-bkk", "b-non", "c-none"]);
    expect(ids(r.similar)).toEqual(["swap", "sub", "short"]);
    expect(r.similar.every((x) => x.reason === "near_number")).toBe(true);
  });

  it("with a province: same number elsewhere comes first among suggestions", () => {
    const r = searchByNumber({ number: "1234", provinceCode: "10" }, reports);
    expect(ids(r.exact)).toEqual(["a-bkk"]);
    expect(r.similar.map((x) => [x.item.id, x.reason])).toEqual([
      ["b-non", "other_province"],
      ["c-none", "unknown_province"],
      ["swap", "near_number"],
      ["short", "near_number"],
    ]);
  });
});
