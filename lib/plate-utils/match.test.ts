import { describe, expect, it } from "vitest";
import { scoreMatch, shouldAutoNotify } from "./match";

const plate = (normalized: string, provinceCode: string | null = "10") => ({
  normalized,
  provinceCode,
});

describe("scoreMatch", () => {
  it("is strong when plate and province are equal", () => {
    const result = scoreMatch(plate("1กข1234"), plate("1กข1234"));
    expect(result).toEqual({ kind: "strong", score: 1 });
    expect(shouldAutoNotify(result)).toBe(true);
  });

  it("is partial when the province differs", () => {
    const result = scoreMatch(plate("1กข1234", "10"), plate("1กข1234", "12"));
    expect(result.kind).toBe("partial");
    expect(shouldAutoNotify(result)).toBe(false);
  });

  it("is partial when the found province is unknown", () => {
    expect(scoreMatch(plate("1กข1234"), plate("1กข1234", null)).kind).toBe("partial");
  });

  it("is partial when one character is different, missing or extra", () => {
    expect(scoreMatch(plate("1กข1234"), plate("1กข1235")).kind).toBe("partial");
    expect(scoreMatch(plate("1กข1234"), plate("กข1234")).kind).toBe("partial");
    expect(scoreMatch(plate("กข1234"), plate("กขฃ1234")).kind).toBe("partial");
  });

  it("ranks an exact plate in another province above a one-character miss", () => {
    const otherProvince = scoreMatch(plate("1กข1234", "10"), plate("1กข1234", "12"));
    const oneOff = scoreMatch(plate("1กข1234"), plate("1กข1235"));
    expect(otherProvince.score).toBeGreaterThan(oneOff.score);
  });

  it("does not fuzzy-match a one-character miss in a different province", () => {
    expect(scoreMatch(plate("1กข1234", "10"), plate("1กข1235", "12")).kind).toBe("none");
  });

  it("does not fuzzy-match very short plates", () => {
    expect(scoreMatch(plate("กข1"), plate("กข2")).kind).toBe("none");
  });

  it("is none when two or more characters differ", () => {
    const result = scoreMatch(plate("1กข1234"), plate("1กข9934"));
    expect(result).toEqual({ kind: "none", score: 0 });
    expect(shouldAutoNotify(result)).toBe(false);
  });
});
