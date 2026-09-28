import { describe, expect, it } from "vitest";
import { formatPlate, normalizePlate, parsePlate } from "./parse";

describe("normalizePlate", () => {
  it("removes spaces, dashes and dots", () => {
    expect(normalizePlate(" 1กข 1234 ")).toBe("1กข1234");
    expect(normalizePlate("กข-1234")).toBe("กข1234");
    expect(normalizePlate("กข.1234")).toBe("กข1234");
  });

  it("removes zero-width characters", () => {
    expect(normalizePlate("กข​12‍34﻿")).toBe("กข1234");
  });

  it("converts Thai digits to Arabic digits", () => {
    expect(normalizePlate("๑กข ๑๒๓๔")).toBe("1กข1234");
  });
});

describe("parsePlate", () => {
  it("parses a plate with a leading digit", () => {
    expect(parsePlate("1กข 1234")).toEqual({
      ok: true,
      plate: { prefixDigit: "1", letters: "กข", number: "1234", normalized: "1กข1234" },
    });
  });

  it("parses a plate without a leading digit", () => {
    expect(parsePlate("กข 1234")).toEqual({
      ok: true,
      plate: { prefixDigit: null, letters: "กข", number: "1234", normalized: "กข1234" },
    });
  });

  it("accepts one letter and a short number", () => {
    expect(parsePlate("ก 1")).toMatchObject({ ok: true, plate: { letters: "ก", number: "1" } });
  });

  it("accepts Thai digits", () => {
    expect(parsePlate("๔กก ๙๙๙๙")).toMatchObject({ ok: true, plate: { normalized: "4กก9999" } });
  });

  it("reports empty input", () => {
    expect(parsePlate("   ")).toEqual({ ok: false, error: "empty" });
  });

  it.each([
    ["0กข1234", "leading zero digit"],
    ["กขค1234", "three letters"],
    ["กข12345", "five digits"],
    ["กข", "no number"],
    ["1234", "no letters"],
    ["AB1234", "latin letters"],
    ["กิ1234", "Thai vowel mark"],
    ["12กข1234", "two leading digits"],
  ])("rejects %s (%s)", (input) => {
    expect(parsePlate(input)).toEqual({ ok: false, error: "invalid_format" });
  });
});

describe("formatPlate", () => {
  it("puts a space between letters and number", () => {
    expect(formatPlate({ prefixDigit: "1", letters: "กข", number: "1234" })).toBe("1กข 1234");
    expect(formatPlate({ prefixDigit: null, letters: "กข", number: "1234" })).toBe("กข 1234");
  });
});
