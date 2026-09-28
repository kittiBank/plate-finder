import { describe, expect, it } from "vitest";
import { formatDistance, formatShortDate, formatTimeAgo, isSameBangkokDay } from "./format";

const NOW = new Date("2026-09-29T12:00:00+07:00");
const minutesAgo = (m: number) => new Date(NOW.getTime() - m * 60_000).toISOString();

describe("formatTimeAgo", () => {
  it.each([
    [0, "เมื่อสักครู่"],
    [0.5, "เมื่อสักครู่"],
    [5, "5 นาทีที่แล้ว"],
    [59, "59 นาทีที่แล้ว"],
    [60, "1 ชม.ที่แล้ว"],
    [180, "3 ชม.ที่แล้ว"],
    [60 * 24, "1 วันที่แล้ว"],
    [60 * 24 * 3 + 5, "3 วันที่แล้ว"],
  ])("%s minutes ago → %s", (m, expected) => {
    expect(formatTimeAgo(minutesAgo(m), NOW)).toBe(expected);
  });

  it("treats future times as just now", () => {
    expect(formatTimeAgo(minutesAgo(-10), NOW)).toBe("เมื่อสักครู่");
  });
});

describe("formatShortDate", () => {
  it("uses Thai short month names", () => {
    expect(formatShortDate("2026-09-26T08:00:00+07:00")).toBe("26 ก.ย.");
  });

  it("uses Bangkok time, not UTC", () => {
    // 20:00 UTC on 25 Sep is 03:00 on 26 Sep in Bangkok.
    expect(formatShortDate("2026-09-25T20:00:00Z")).toBe("26 ก.ย.");
  });
});

describe("isSameBangkokDay", () => {
  it("compares calendar days in Bangkok time", () => {
    const now = new Date("2026-09-29T08:00:00+07:00");
    expect(isSameBangkokDay("2026-09-29T00:10:00+07:00", now)).toBe(true);
    // 23:30 on 28 Sep in Bangkok, although it is already 29 Sep in some zones.
    expect(isSameBangkokDay("2026-09-28T23:30:00+07:00", now)).toBe(false);
    // 18:00 UTC on 28 Sep is 01:00 on 29 Sep in Bangkok.
    expect(isSameBangkokDay("2026-09-28T18:00:00Z", now)).toBe(true);
  });
});

describe("formatDistance", () => {
  it("shows metres under 1 km, rounded to 50 m", () => {
    expect(formatDistance(0.43)).toBe("450 ม.");
    expect(formatDistance(0.01)).toBe("50 ม.");
  });

  it("shows km with one decimal from 1 km", () => {
    expect(formatDistance(1.23)).toBe("1.2 กม.");
    expect(formatDistance(12)).toBe("12 กม.");
  });
});
