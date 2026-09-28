import { describe, expect, it } from "vitest";
import { blurLocation, distanceKm } from "./geo";

// ถ.ลาดพร้าว, Bangkok
const LAT = 13.8166;
const LNG = 100.5933;

describe("distanceKm", () => {
  it("is 0 for the same point", () => {
    expect(distanceKm({ lat: LAT, lng: LNG }, { lat: LAT, lng: LNG })).toBe(0);
  });

  it("matches a known distance (Bangkok to Nonthaburi city hall, ~12 km)", () => {
    const d = distanceKm({ lat: 13.7563, lng: 100.5018 }, { lat: 13.8621, lng: 100.5144 });
    expect(d).toBeGreaterThan(11);
    expect(d).toBeLessThan(13);
  });
});

describe("blurLocation", () => {
  it("moves the point by at most ~150 m (half the cell diagonal)", () => {
    const blurred = blurLocation(LAT, LNG);
    expect(distanceKm({ lat: LAT, lng: LNG }, blurred)).toBeLessThan(0.15);
  });

  it("is deterministic, so repeated reads cannot be averaged", () => {
    expect(blurLocation(LAT, LNG)).toEqual(blurLocation(LAT, LNG));
  });

  it("maps nearby points in the same cell to the same location", () => {
    expect(blurLocation(LAT, LNG)).toEqual(blurLocation(LAT + 0.00001, LNG + 0.00001));
  });

  it("does not return the exact input", () => {
    const blurred = blurLocation(LAT, LNG);
    expect(blurred.lat === LAT && blurred.lng === LNG).toBe(false);
  });
});
