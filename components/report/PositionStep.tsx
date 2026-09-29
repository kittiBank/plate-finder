"use client";

import { PrimaryButton } from "@/components/ui/Button";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { PlatePosition } from "@/lib/types";
import { th } from "@/locales/th";
import { StepFooter } from "./StepFooter";

const OPTIONS: { value: PlatePosition; label: string; sub: string }[] = [
  { value: "front", label: th.plate.front, sub: th.report.position.frontSub },
  { value: "rear", label: th.plate.rear, sub: th.report.position.rearSub },
];

type Props = {
  position: PlatePosition | null;
  onChange: (position: PlatePosition) => void;
  nextLabel: string;
  onNext: () => void;
};

/** Native radios styled as big cards: arrow keys work and nothing advances on its own. */
export function PositionStep({ position, onChange, nextLabel, onNext }: Props) {
  return (
    <>
      <fieldset className="flex flex-col gap-3 px-5 pt-5">
        <legend className="sr-only">{th.report.position.heading}</legend>
        {OPTIONS.map((o) => {
          const selected = position === o.value;
          return (
            <label
              key={o.value}
              className={cn(
                "tap relative flex cursor-pointer items-center gap-4 rounded-card border-2 bg-white p-4 shadow-card",
                "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-aqua/50",
                selected ? "border-aqua" : "border-white",
              )}
            >
              <input
                type="radio"
                name="position"
                value={o.value}
                checked={selected}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              <span
                className={cn(
                  "flex h-[72px] w-[104px] shrink-0 items-center justify-center rounded-2xl transition-colors",
                  selected ? "bg-info-soft text-cta-mid" : "bg-bg text-muted",
                )}
              >
                <CarIllustration end={o.value} />
              </span>
              <span className="flex min-w-0 grow flex-col gap-0.5">
                <span className="font-display text-lg font-bold text-deep">{o.label}</span>
                <span className="text-[13px] text-muted">{o.sub}</span>
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  selected ? "border-cta-mid bg-cta-mid text-white" : "border-off text-transparent",
                )}
              >
                <CheckIcon size={16} strokeWidth={3} />
              </span>
            </label>
          );
        })}
      </fieldset>

      <StepFooter>
        <PrimaryButton onClick={onNext} disabled={!position}>
          {nextLabel}
          <ArrowRightIcon size={18} />
        </PrimaryButton>
      </StepFooter>
    </>
  );
}

/** Side view of a car facing right, with the plate at the chosen end highlighted. */
function CarIllustration({ end }: { end: PlatePosition }) {
  return (
    <svg width="84" height="46" viewBox="0 0 84 46" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 33H5.5A1.5 1.5 0 0 1 4 31.5V24c0-1.8 1.2-3.3 3-3.7L18 18l9-8.5c1-.9 2.3-1.5 3.7-1.5h17.6c1.6 0 3 .7 4 1.9L60 18l14.5 2.6c2 .4 3.5 2.1 3.5 4.2v6.7a1.5 1.5 0 0 1-1.5 1.5H74" />
      <path d="M26 33h32" />
      <path d="M21 18h38M39 8v10" opacity={0.55} />
      <circle cx="17" cy="33" r="5.5" />
      <circle cx="65" cy="33" r="5.5" />
      <rect
        x={end === "front" ? 76 : 1}
        y="23"
        width="7"
        height="7"
        rx="1.5"
        className="fill-cta-mid stroke-cta-mid"
      />
    </svg>
  );
}
