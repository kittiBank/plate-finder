"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PlateBadge } from "@/components/plate/PlateBadge";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { OutlineButton, PrimaryButton } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { IconButton } from "@/components/ui/IconButton";
import { FilterIcon, LayersIcon, LocateIcon, NavigateIcon, PinIcon, SearchIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDistance, formatTimeAgo, isSameBangkokDay } from "@/lib/format";
import { distanceKm, type LatLng } from "@/lib/plate-utils/geo";
import { formatPlate, normalizePlate } from "@/lib/plate-utils/parse";
import type { FoundReport } from "@/lib/types";
import { th } from "@/locales/th";
import type { FlyTarget } from "./LeafletMap";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#e6edf2]" />,
});

const t = th.map;
const NEARBY_KM = 5;
const SHEET_HEIGHT = 336;
const TOP_OVERLAY = 160;

type Filter = "all" | "today" | "nearby";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: t.filterAll },
  { id: "today", label: t.filterToday },
  { id: "nearby", label: t.filterNearby },
];

type Props = {
  reports: FoundReport[];
  /** ISO time the page was rendered; keeps server and client relative times identical. */
  now: string;
  initialLocation: LatLng;
  floodArea: LatLng[];
};

export function MapScreen({ reports, now, initialLocation, floodArea }: Props) {
  const nowDate = useMemo(() => new Date(now), [now]);
  const [filter, setFilter] = useState<Filter>("all");
  const [showFlood, setShowFlood] = useState(true);
  const [query, setQuery] = useState("");
  const [userLocation, setUserLocation] = useState(initialLocation);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flyTo, setFlyTo] = useState<FlyTarget>({ ...initialLocation, seq: 0 });

  const visible = useMemo(() => {
    const q = normalizePlate(query);
    return reports.filter((r) => {
      if (q && !normalizePlate(formatPlate(r.plate)).includes(q)) return false;
      if (filter === "today") return isSameBangkokDay(r.foundAt, nowDate);
      if (filter === "nearby") return distanceKm(userLocation, r) <= NEARBY_KM;
      return true;
    });
  }, [reports, query, filter, nowDate, userLocation]);

  // Default to the nearest visible report so the sheet always has something to show.
  const selected =
    visible.find((r) => r.id === selectedId) ??
    visible.toSorted((a, b) => distanceKm(userLocation, a) - distanceKm(userLocation, b))[0];

  const fly = (target: LatLng, zoom?: number) =>
    setFlyTo((prev) => ({ ...target, zoom, seq: prev.seq + 1 }));

  const select = (id: string) => {
    setSelectedId(id);
    const r = reports.find((x) => x.id === id);
    if (r) fly(r);
  };

  const locateMe = () => {
    const done = (loc: LatLng) => {
      setUserLocation(loc);
      fly(loc, 15);
    };
    if (!navigator.geolocation) return done(userLocation);
    navigator.geolocation.getCurrentPosition(
      (pos) => done({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => done(userLocation),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#e6edf2]">
      <LeafletMap
        reports={visible}
        selectedId={selected?.id ?? null}
        onSelect={select}
        userLocation={userLocation}
        floodArea={showFlood ? floodArea : null}
        flyTo={flyTo}
        insets={{ top: TOP_OVERLAY, bottom: SHEET_HEIGHT }}
      />

      {/* Top: search + filters */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-[linear-gradient(180deg,rgba(230,237,242,0.95)_0%,rgba(230,237,242,0.6)_60%,rgba(230,237,242,0)_100%)]"
        style={{ height: TOP_OVERLAY }}
      />
      <div className="absolute inset-x-4 top-[18px] z-10 mx-auto flex max-w-md flex-col gap-3">
        <div className="flex items-center gap-2.5 animate-rise">
          <label className="flex h-[52px] grow items-center gap-2.5 rounded-[18px] border border-white bg-white/85 px-4 shadow-card backdrop-blur-lg">
            <SearchIcon size={20} className="shrink-0 text-link" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
              className="min-w-0 grow bg-transparent text-base text-deep outline-none placeholder:text-[#5d6d7e]"
            />
          </label>
          <IconButton label={t.filters} variant="cta" size={52}>
            <FilterIcon size={22} />
          </IconButton>
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] animate-rise stagger-1">
          {FILTERS.map((f) => (
            <Chip key={f.id} selected={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </Chip>
          ))}
          <Chip selected={showFlood} onClick={() => setShowFlood((s) => !s)}>
            <span className="size-2.5 rounded-[3px] border border-dashed border-current bg-aqua/40" />
            {t.floodArea}
          </Chip>
        </div>
      </div>

      {/* Map controls + OSM credit, just above the sheet */}
      <div
        className="absolute right-4 z-10 flex flex-col gap-2.5 animate-rise stagger-2"
        style={{ bottom: SHEET_HEIGHT + 8 }}
      >
        <IconButton label={t.layers} size={48}>
          <LayersIcon size={22} />
        </IconButton>
        <IconButton label={t.locateMe} size={48} className="text-cta-mid" onClick={locateMe}>
          <LocateIcon size={22} />
        </IconButton>
      </div>
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute left-4 z-10 rounded-md bg-white/75 px-1.5 py-0.5 text-[10px] text-muted backdrop-blur-sm"
        style={{ bottom: SHEET_HEIGHT + 8 }}
      >
        {t.osmCredit}
      </a>

      {/* Bottom sheet */}
      <BottomSheet
        aria-label={t.foundNearby(visible.length)}
        className="absolute inset-x-0 bottom-0 z-10 mx-auto max-w-md animate-sheet"
        style={{ height: SHEET_HEIGHT }}
      >
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <h1 className="font-display text-lg font-semibold">{t.foundNearby(visible.length)}</h1>
            <p className="text-[13px] text-muted">{t.radiusUpdated}</p>
          </div>
          <Link href="/search" className="py-2 text-sm font-semibold">
            {t.viewList}
          </Link>
        </div>

        {selected ? (
          <SelectedReport report={selected} userLocation={userLocation} now={nowDate} />
        ) : (
          <p className="rounded-[22px] bg-white p-5 text-center text-sm text-muted">{t.noResults}</p>
        )}
      </BottomSheet>
    </main>
  );
}

function SelectedReport({ report, userLocation, now }: { report: FoundReport; userLocation: LatLng; now: Date }) {
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${report.lat},${report.lng}`;
  return (
    <article className="flex flex-col gap-3 rounded-[22px] bg-white p-3 shadow-[0_8px_22px_rgba(44,62,80,0.08)]">
      <div className="flex items-center gap-3">
        <PlateBadge plate={report.plate} provinceCode={report.provinceCode} />
        <div className="flex min-w-0 grow flex-col gap-1">
          <StatusBadge tone="accent">
            {th.status.waitingOwner}
          </StatusBadge>
          <p className="truncate text-[15px] font-semibold">{report.placeName}</p>
          <p className="flex items-center gap-1 text-[12.5px] text-muted">
            <PinIcon size={14} className="shrink-0" />
            {formatDistance(distanceKm(userLocation, report))} · {formatTimeAgo(report.foundAt, now)}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <PrimaryButton size="md" href={`/plates/${report.id}`}>
          {t.viewDetail}
        </PrimaryButton>
        <OutlineButton size="md" href={directions} target="_blank" rel="noopener noreferrer">
          <NavigateIcon size={18} />
          {t.navigate}
        </OutlineButton>
      </div>
    </article>
  );
}
