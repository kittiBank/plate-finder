"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { PrimaryButton } from "@/components/ui/Button";
import { ArrowRightIcon, LocateIcon, ShieldIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { LatLng } from "@/lib/plate-utils/geo";
import { th } from "@/locales/th";
import type { FlyTarget } from "./LocationPickerMap";
import { StepFooter } from "./StepFooter";

const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#e6edf2]" />,
});

const t = th.report.location;

type Props = {
  /** Where the map starts: the previously picked point, else the user's last known area. */
  start: LatLng;
  nextLabel: string;
  onNext: (location: LatLng) => void;
};

export function LocationStep({ start, nextLabel, onNext }: Props) {
  const [center, setCenter] = useState(start);
  const [dragging, setDragging] = useState(false);
  const [flyTo, setFlyTo] = useState<FlyTarget | null>(null);
  const [locate, setLocate] = useState<"idle" | "busy" | "failed">("idle");

  // Only ask for GPS when the user taps the button, never on page load.
  function locateMe() {
    if (!("geolocation" in navigator)) return setLocate("failed");
    setLocate("busy");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocate("idle");
        setFlyTo((f) => ({ lat: coords.latitude, lng: coords.longitude, seq: (f?.seq ?? 0) + 1 }));
      },
      () => setLocate("failed"),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 px-5 pt-5">
        <div
          role="region"
          aria-label={t.mapLabel}
          className="relative h-[min(52dvh,420px)] min-h-[280px] overflow-hidden rounded-card border-4 border-white bg-[#e6edf2] shadow-card"
        >
          <LocationPickerMap
            initial={start}
            flyTo={flyTo}
            onCenterChange={setCenter}
            onDraggingChange={setDragging}
          />

          {/* Fixed centre pin: the map moves underneath it. */}
          <div aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2 z-[500]">
            <span
              className={cn(
                "absolute -top-[3px] -left-2 h-1.5 w-4 rounded-[50%] bg-deep/35 blur-[1px] transition-transform duration-200",
                dragging && "scale-75",
              )}
            />
            <svg
              width="40"
              height="52"
              viewBox="0 0 40 52"
              className={cn(
                "absolute -top-[52px] -left-5 drop-shadow-[0_6px_10px_rgba(20,60,110,0.35)] transition-transform duration-200 animate-drop",
                dragging && "-translate-y-2",
              )}
            >
              <path d="M20 51C20 51 2 32.5 2 20a18 18 0 0 1 36 0C38 32.5 20 51 20 51z" fill="#1a6fc4" stroke="#fff" strokeWidth="3" />
              <circle cx="20" cy="20" r="6.5" fill="#fff" />
            </svg>
          </div>

          <button
            type="button"
            onClick={locateMe}
            disabled={locate === "busy"}
            className="tap absolute bottom-3 left-3 z-[500] flex h-11 cursor-pointer items-center gap-2 rounded-full border border-white bg-white/90 px-4 text-sm font-semibold text-cta-mid shadow-[0_8px_20px_rgba(44,62,80,0.18)] backdrop-blur-md disabled:opacity-70"
          >
            <LocateIcon size={20} className={cn(locate === "busy" && "animate-blink")} />
            {locate === "busy" ? t.locating : t.useMine}
          </button>
          <span className="absolute right-2 bottom-1 z-[500] text-[10px] text-deep/70">{th.map.osmCredit}</span>
        </div>

        {locate === "failed" && (
          <p role="alert" className="text-[13px] font-medium text-danger">
            {t.locateFailed}
          </p>
        )}

        <p className="flex items-start gap-2.5 rounded-2xl bg-info-soft p-3 text-[13px] leading-normal text-info-ink">
          <ShieldIcon size={18} className="mt-px shrink-0" />
          {t.privacy}
        </p>
      </div>

      <StepFooter>
        <PrimaryButton onClick={() => onNext(center)} disabled={dragging}>
          {nextLabel}
          <ArrowRightIcon size={18} />
        </PrimaryButton>
      </StepFooter>
    </>
  );
}
