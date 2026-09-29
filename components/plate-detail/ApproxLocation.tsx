"use client";

import dynamic from "next/dynamic";
import type { LatLng } from "@/lib/plate-utils/geo";
import { th } from "@/locales/th";

// Leaflet touches `window`, so the map only loads in the browser.
const ApproxLocationMap = dynamic(() => import("./ApproxLocationMap"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#e6edf2]" />,
});

export function ApproxLocation({ center, placeName }: { center: LatLng; placeName: string }) {
  return (
    <div
      role="img"
      aria-label={th.plateDetail.mapLabel(placeName)}
      className="relative h-[180px] overflow-hidden rounded-[18px] bg-[#e6edf2]"
    >
      <ApproxLocationMap center={center} />
      <span className="absolute right-2 bottom-1.5 z-[400] rounded bg-white/80 px-1 text-[10px] text-muted">
        {th.map.osmCredit}
      </span>
    </div>
  );
}
