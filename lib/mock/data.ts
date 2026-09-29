import { blurLocation, type LatLng } from "@/lib/plate-utils/geo";
import type { FoundReport, LostPlate, NotifyPrefs } from "@/lib/types";

// Mock data for building screens before the backend exists (Phase 3–4). Removed in Phase 5.

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const ago = (now: Date, ms: number) => new Date(now.getTime() - ms).toISOString();

/** Around ลาดพร้าว, Bangkok — the area shown in /design/Map.dc.html. */
export const MOCK_USER_LOCATION: LatLng = { lat: 13.8035, lng: 100.5935 };

export const MOCK_UNREAD_NOTIFICATIONS = 1;

export const MOCK_NOTIFY_PREFS: NotifyPrefs = {
  app: true,
  sms: true,
  email: false,
  autoMatch: true,
};

export function getMockMyPlates(now: Date): LostPlate[] {
  return [
    {
      id: "lp-2",
      plate: { prefixDigit: "2", letters: "ขข", number: "4567" },
      provinceCode: "12",
      position: "rear",
      vehicleType: "sedan",
      lostSince: "2026-09-24T09:00:00+07:00",
      status: "matched",
      match: { id: "m-1", foundAt: ago(now, 3 * HOUR), placeName: "ถ.รัตนาธิเบศร์" },
    },
    {
      id: "lp-1",
      plate: { prefixDigit: "4", letters: "กก", number: "9999" },
      provinceCode: "10",
      position: "front",
      lostSince: "2026-09-26T07:30:00+07:00",
      status: "tracking",
    },
  ];
}

const PLACES = [
  "ซ.ลาดพร้าว 71",
  "ถ.วิภาวดีรังสิต",
  "ซ.โชคชัย 4",
  "ถ.ประดิษฐ์มนูธรรม",
  "ซ.ลาดพร้าว 101",
  "ถ.รัชดาภิเษก",
  "ซ.นาคนิวาส",
  "ถ.สุทธิสาร",
  "ซ.ภาวนา",
];
const LETTERS = ["กข", "ขค", "ฆก", "งจ", "ชฎ", "ฐฒ", "กก", "นม", "ผพ", "ศส", "อฮ", "บล"];
const PROVINCES = ["10", "10", "10", "12", "13", "11", null];

/** Deterministic pseudo-random numbers so the mock map looks the same on every load. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return s / 4_294_967_296;
  };
}

export function getMockFoundReports(now: Date): FoundReport[] {
  const rand = seeded(42);
  const reports: FoundReport[] = [
    // The selected plate in the design.
    {
      id: "fr-1",
      plate: { prefixDigit: "1", letters: "กข", number: "1234" },
      provinceCode: "10",
      position: "front",
      placeName: "ซ.ลาดพร้าว 71",
      ...blurLocation(13.8012, 100.6012),
      foundAt: ago(now, 2 * HOUR),
      status: "open",
    },
  ];

  for (let i = 2; i <= 18; i++) {
    const hasPrefix = rand() < 0.6;
    reports.push({
      id: `fr-${i}`,
      plate: {
        prefixDigit: hasPrefix ? String(1 + Math.floor(rand() * 9)) : null,
        letters: LETTERS[Math.floor(rand() * LETTERS.length)],
        number: String(1 + Math.floor(rand() * 9998)),
      },
      provinceCode: PROVINCES[Math.floor(rand() * PROVINCES.length)],
      position: rand() < 0.5 ? "front" : "rear",
      placeName: PLACES[Math.floor(rand() * PLACES.length)],
      ...blurLocation(13.79 + rand() * 0.03, 100.575 + rand() * 0.035),
      foundAt: ago(now, rand() * 3 * DAY),
      status: "open",
    });
  }

  // Near-misses of fr-1 so /search?q=1กข1234 shows "similar" suggestions.
  reports.push(
    {
      id: "fr-19",
      plate: { prefixDigit: "1", letters: "กข", number: "1234" },
      provinceCode: "13",
      position: "rear",
      placeName: "ถ.วิภาวดีรังสิต",
      ...blurLocation(13.8081, 100.5612),
      foundAt: ago(now, 26 * HOUR),
      status: "open",
    },
    {
      id: "fr-20",
      plate: { prefixDigit: "1", letters: "กข", number: "1284" },
      provinceCode: "10",
      position: "front",
      placeName: "ซ.โชคชัย 4",
      ...blurLocation(13.7968, 100.5901),
      foundAt: ago(now, 5 * HOUR),
      status: "open",
    },
    // Same number, other letters / swapped digits, for number-only search (/search?q=1234).
    {
      id: "fr-21",
      plate: { prefixDigit: null, letters: "ขค", number: "1234" },
      provinceCode: "12",
      position: "front",
      placeName: "ถ.ประดิษฐ์มนูธรรม",
      ...blurLocation(13.7991, 100.6078),
      foundAt: ago(now, 9 * HOUR),
      status: "open",
    },
    {
      id: "fr-22",
      plate: { prefixDigit: "3", letters: "ฆก", number: "1324" },
      provinceCode: "10",
      position: "rear",
      placeName: "ซ.ลาดพร้าว 101",
      ...blurLocation(13.7902, 100.6103),
      foundAt: ago(now, 30 * HOUR),
      status: "open",
    },
  );
  return reports;
}

/** Rough flood outline along คลองลาดพร้าว, for the "พื้นที่น้ำท่วม" layer. */
export const MOCK_FLOOD_AREA: LatLng[] = [
  { lat: 13.812, lng: 100.575 },
  { lat: 13.815, lng: 100.592 },
  { lat: 13.806, lng: 100.608 },
  { lat: 13.794, lng: 100.614 },
  { lat: 13.788, lng: 100.598 },
  { lat: 13.792, lng: 100.58 },
];
