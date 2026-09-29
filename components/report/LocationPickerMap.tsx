"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { LatLng } from "@/lib/plate-utils/geo";

const ZOOM = 17;

export type FlyTarget = LatLng & { seq: number };

type Props = {
  initial: LatLng;
  /** Changing `seq` flies the map to this point. */
  flyTo: FlyTarget | null;
  onCenterChange: (center: LatLng) => void;
  onDraggingChange: (dragging: boolean) => void;
};

/** Plain OSM map for picking a point: the caller overlays a fixed centre pin and reads the centre. */
export default function LocationPickerMap({ initial, ...props }: Props) {
  return (
    <MapContainer
      center={[initial.lat, initial.lng]}
      zoom={ZOOM}
      zoomControl={false}
      attributionControl={false}
      className="absolute inset-0 isolate size-full"
    >
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
      <CenterTracker {...props} />
    </MapContainer>
  );
}

function CenterTracker({ flyTo, onCenterChange, onDraggingChange }: Omit<Props, "initial">) {
  const map = useMap();
  useMapEvents({
    movestart: () => onDraggingChange(true),
    moveend: () => {
      onDraggingChange(false);
      const c = map.getCenter();
      onCenterChange({ lat: c.lat, lng: c.lng });
    },
  });

  useEffect(() => {
    if (flyTo) map.flyTo([flyTo.lat, flyTo.lng], ZOOM, { duration: 0.6 });
  }, [flyTo, map]);

  return null;
}
