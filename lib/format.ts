import { th } from "@/locales/th";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const shortDate = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  timeZone: "Asia/Bangkok",
});

/** "เมื่อสักครู่", "5 นาทีที่แล้ว", "3 ชม.ที่แล้ว", "2 วันที่แล้ว". */
export function formatTimeAgo(iso: string, now: Date = new Date()): string {
  const diff = now.getTime() - new Date(iso).getTime();
  if (diff < MINUTE) return th.time.justNow;
  if (diff < HOUR) return th.time.minutesAgo(Math.floor(diff / MINUTE));
  if (diff < DAY) return th.time.hoursAgo(Math.floor(diff / HOUR));
  return th.time.daysAgo(Math.floor(diff / DAY));
}

/** "26 ก.ย." in Bangkok time. */
export function formatShortDate(iso: string): string {
  return shortDate.format(new Date(iso));
}

const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" });

/** True when both instants fall on the same calendar day in Bangkok. */
export function isSameBangkokDay(iso: string, now: Date = new Date()): boolean {
  return dayKey.format(new Date(iso)) === dayKey.format(now);
}

/** "450 ม." under 1 km (nearest 50 m, at least 50 m), otherwise "1.2 กม.". */
export function formatDistance(km: number): string {
  if (km < 1) return th.distance.meters(Math.max(50, Math.round((km * 1000) / 50) * 50));
  return th.distance.km(Number(km.toFixed(1)));
}
