"use client";

import "leaflet/dist/leaflet.css";
import { Circle, MapContainer, TileLayer } from "react-leaflet";
import type { LatLng } from "@/lib/plate-utils/geo";

const ZOOM = 15;
/** Matches the ~200 m blur grid in lib/plate-utils/geo.ts. */
const RADIUS_M = 200;

/** Static map: a soft circle over the blurred point, never an exact pin (CLAUDE.md §7). */
export default function ApproxLocationMap({ center }: { center: LatLng }) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={ZOOM}
      zoomControl={false}
      attributionControl={false}
      dragging={false}
      touchZoom={false}
      doubleClickZoom={false}
      scrollWheelZoom={false}
      boxZoom={false}
      keyboard={false}
      className="absolute inset-0 isolate size-full"
    >
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
      <Circle
        center={[center.lat, center.lng]}
        radius={RADIUS_M}
        interactive={false}
        pathOptions={{ color: "#2471a3", weight: 2, dashArray: "6 6", fillColor: "#3498db", fillOpacity: 0.2 }}
      />
    </MapContainer>
  );
}
