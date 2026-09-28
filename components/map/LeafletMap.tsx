"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polygon, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { clusterByGrid } from "@/lib/map/cluster";
import type { LatLng } from "@/lib/plate-utils/geo";
import { formatPlate } from "@/lib/plate-utils/parse";
import type { FoundReport } from "@/lib/types";
import { th } from "@/locales/th";
import { clusterIcon, plateIcon, selectedIcon, userIcon } from "./markers";

const INITIAL_ZOOM = 14;
const CLUSTER_CELL_PX = 80;
const PLATE_ICON = plateIcon();
const USER_ICON = userIcon();

export type FlyTarget = LatLng & { zoom?: number; seq: number };

type Props = {
  reports: FoundReport[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  userLocation: LatLng;
  floodArea: LatLng[] | null;
  /** Changing `seq` flies the map to this point; seq 0 jumps there without animation. */
  flyTo: FlyTarget;
  /** Height in px hidden under overlays at the top/bottom, so points are centred in the visible part. */
  insets: { top: number; bottom: number };
};

export default function LeafletMap(props: Props) {
  const { userLocation, floodArea } = props;

  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={INITIAL_ZOOM}
      zoomControl={false}
      attributionControl={false}
      className="absolute inset-0 isolate size-full"
    >
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
      {floodArea && (
        <Polygon
          positions={floodArea.map((p) => [p.lat, p.lng])}
          pathOptions={{
            color: "#2471a3",
            opacity: 0.5,
            weight: 1.5,
            dashArray: "5 5",
            fillColor: "#3498db",
            fillOpacity: 0.16,
          }}
        />
      )}
      <Marker
        position={[userLocation.lat, userLocation.lng]}
        icon={USER_ICON}
        title={th.map.youAreHere}
        keyboard={false}
        zIndexOffset={-100}
      />
      <ReportMarkers {...props} />
    </MapContainer>
  );
}

function ReportMarkers({ reports, selectedId, onSelect, flyTo, insets }: Props) {
  const map = useMap();
  const [view, setView] = useState(0); // bumps on zoom/move so clusters are recomputed
  useMapEvents({ zoomend: () => setView((v) => v + 1), moveend: () => setView((v) => v + 1) });

  // Centre a point within the part of the map not covered by overlays.
  useEffect(() => {
    const zoom = flyTo.zoom ?? map.getZoom();
    const shift = (insets.bottom - insets.top) / 2;
    const center = map.unproject(map.project([flyTo.lat, flyTo.lng], zoom).add([0, shift]), zoom);
    if (flyTo.seq === 0) map.setView(center, zoom, { animate: false });
    else map.flyTo(center, zoom, { duration: 0.6 });
  }, [flyTo, map, insets.top, insets.bottom]);

  const selected = reports.find((r) => r.id === selectedId);
  const clusters = useMemo(() => {
    void view;
    const zoom = map.getZoom();
    return clusterByGrid(
      reports.filter((r) => r.id !== selectedId),
      (r) => map.project([r.lat, r.lng], zoom),
      CLUSTER_CELL_PX,
    );
  }, [reports, selectedId, map, view]);

  return (
    <>
      {clusters.map((c) => {
        if (c.items.length === 1) {
          const [r] = c.items;
          return (
            <Marker
              key={r.id}
              position={[r.lat, r.lng]}
              icon={PLATE_ICON}
              title={formatPlate(r.plate)}
              alt={formatPlate(r.plate)}
              eventHandlers={{ click: () => onSelect(r.id) }}
            />
          );
        }
        const bounds = L.latLngBounds(c.items.map((r) => [r.lat, r.lng]));
        return (
          <Marker
            key={c.items.map((r) => r.id).join()}
            position={map.unproject([c.x, c.y], map.getZoom())}
            icon={clusterIcon(c.items.length)}
            title={th.map.clusterLabel(c.items.length)}
            eventHandlers={{
              click: () =>
                map.flyToBounds(bounds, {
                  paddingTopLeft: [40, insets.top + 20],
                  paddingBottomRight: [40, insets.bottom + 20],
                  maxZoom: 17,
                  duration: 0.6,
                }),
            }}
          />
        );
      })}
      {selected && (
        <Marker
          position={[selected.lat, selected.lng]}
          icon={selectedIcon(selected)}
          title={formatPlate(selected.plate)}
          zIndexOffset={1000}
        />
      )}
    </>
  );
}
