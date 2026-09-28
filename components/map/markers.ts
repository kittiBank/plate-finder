import L from "leaflet";
import { formatPlate } from "@/lib/plate-utils/parse";
import { getProvince } from "@/lib/plate-utils/provinces";
import type { FoundReport } from "@/lib/types";

// Leaflet marker icons as HTML (Leaflet can't render React). Styles mirror /design/Map.dc.html.
// Each icon is a 0×0 anchor; the inner element positions itself relative to the map point.

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

const icon = (html: string) =>
  L.divIcon({ html, className: "map-pin", iconSize: [0, 0], iconAnchor: [0, 0] });

const PLATE_SVG =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a6fc4" stroke-width="2" stroke-linecap="round" class="rotate-45"><rect x="3" y="7" width="18" height="11" rx="2"/><path d="M7 12.5h7"/></svg>';

/** Round count bubble for several reports. */
export function clusterIcon(count: number) {
  const size = count >= 10 ? 44 : 40;
  return icon(
    `<div class="absolute -translate-x-1/2 -translate-y-1/2">
      <div class="flex items-center justify-center rounded-full border-[3px] border-white/90 bg-[rgba(36,113,163,0.85)] font-display font-bold text-white shadow-[0_6px_16px_rgba(20,60,110,0.3)] animate-drop" style="width:${size}px;height:${size}px;font-size:${count >= 10 ? 16 : 15}px">${count}</div>
    </div>`,
  );
}

/** White teardrop pin for a single report. */
export function plateIcon() {
  return icon(
    // Tip of the rotated teardrop sits ~44px below its top edge.
    `<div class="absolute -translate-x-1/2 animate-drop" style="top:-44px">
      <div class="flex size-9 -rotate-45 items-center justify-center rounded-[50%_50%_50%_4px] bg-white shadow-[0_6px_14px_rgba(20,60,110,0.25)]">${PLATE_SVG}</div>
    </div>`,
  );
}

/** The selected report: a small plate inside a blue frame, with a pulsing halo. */
export function selectedIcon(report: FoundReport) {
  const plate = escapeHtml(formatPlate(report.plate));
  const province = report.provinceCode ? getProvince(report.provinceCode)?.nameTh : undefined;
  return icon(
    `<div class="absolute size-[60px] -translate-1/2 rounded-full bg-[rgba(26,111,196,0.35)] animate-pulse-ring"></div>
    <div class="absolute -translate-x-1/2 -translate-y-full">
      <div class="flex flex-col items-center animate-drop">
        <div class="rounded-xl bg-cta p-[5px] shadow-[0_10px_24px_rgba(19,79,153,0.45)]">
          <div class="flex flex-col items-center rounded-md border-[1.5px] border-plate-ink bg-white px-2 py-[3px] font-display text-[#111]">
            <span class="whitespace-nowrap text-sm leading-[1.05] font-bold">${plate}</span>
            ${province ? `<span class="whitespace-nowrap text-[7.5px] leading-[1.2] font-medium">${escapeHtml(province)}</span>` : ""}
          </div>
        </div>
        <div class="-mt-px size-0 border-x-8 border-t-[9px] border-x-transparent border-t-cta-to"></div>
      </div>
    </div>`,
  );
}

/** Blue dot with a pulsing ring for the user's position. */
export function userIcon() {
  return icon(
    `<div class="absolute size-14 -translate-1/2 rounded-full bg-[rgba(52,152,219,0.35)] animate-pulse-ring [animation-delay:-1s]"></div>
    <div class="absolute size-[18px] -translate-1/2 rounded-full border-[3px] border-white bg-aqua shadow-[0_2px_8px_rgba(20,60,110,0.4)]"></div>`,
  );
}
