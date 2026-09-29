import { formatPlate } from "@/lib/plate-utils/parse";
import { getProvince } from "@/lib/plate-utils/provinces";
import type { FoundReport } from "@/lib/types";

// Mock "photo" of a found plate: an SVG of the plate lying in mud, so the detail screen has
// something realistic to show. Replaced by a signed Storage URL in Phase 5.

const MUD = [
  ["#8a7a5c", "#4d4332"],
  ["#7c7d68", "#3f4234"],
  ["#93826a", "#54463a"],
];

export function mockPlatePhotoUrl(report: FoundReport): string {
  const seed = [...report.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const [light, dark] = MUD[seed % MUD.length];
  const tilt = (seed % 11) - 5;
  const province = report.provinceCode ? (getProvince(report.provinceCode)?.nameTh ?? "") : "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs><radialGradient id="g" cx="30%" cy="30%" r="90%"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></radialGradient></defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <ellipse cx="610" cy="470" rx="170" ry="60" fill="#3a3226" opacity=".35"/>
  <g transform="rotate(${tilt} 400 300)">
    <rect x="175" y="185" width="450" height="230" rx="18" fill="#000" opacity=".3" transform="translate(10 18)"/>
    <rect x="175" y="185" width="450" height="230" rx="18" fill="#f4f1ea" stroke="#1b1b1b" stroke-width="8"/>
    <text x="400" y="315" text-anchor="middle" font-family="Tahoma, sans-serif" font-weight="700" font-size="88" textLength="390" lengthAdjust="spacingAndGlyphs" fill="#111">${formatPlate(report.plate)}</text>
    <text x="400" y="380" text-anchor="middle" font-family="Tahoma, sans-serif" font-size="40" fill="#111">${province}</text>
    <path d="M190 400 q60 -30 130 -5 t140 -10" stroke="#6b5a40" stroke-width="14" fill="none" opacity=".45" stroke-linecap="round"/>
  </g>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
