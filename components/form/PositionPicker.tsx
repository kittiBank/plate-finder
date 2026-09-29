"use client";

import { useId } from "react";
import { CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { PlatePosition } from "@/lib/types";

export type PositionOption<T extends string> = {
  value: T;
  label: string;
  sub?: string;
  /** Which end of the car to highlight. */
  ends: PlatePosition[];
};

type Props<T extends string> = {
  legend: string;
  /** Hide the legend visually when a heading above already says it. */
  legendHidden?: boolean;
  options: PositionOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** `list`: big full-width cards (report step). `grid`: compact columns (forms). */
  layout?: "list" | "grid";
  className?: string;
};

/** Native radios styled as cards: arrow keys work and nothing advances on its own. */
export function PositionPicker<T extends string>({
  legend,
  legendHidden = false,
  options,
  value,
  onChange,
  layout = "list",
  className,
}: Props<T>) {
  const name = useId();
  const grid = layout === "grid";
  return (
    <fieldset className={cn(grid ? "grid grid-cols-3 gap-2" : "flex flex-col gap-3", className)}>
      <legend className={cn(legendHidden ? "sr-only" : "mb-2 text-sm font-semibold text-deep")}>{legend}</legend>
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <label
            key={o.value}
            className={cn(
              "tap relative flex cursor-pointer rounded-card border-2 bg-white shadow-card",
              "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-aqua/50",
              grid ? "flex-col items-center gap-1.5 rounded-[18px] px-1.5 pt-3 pb-2.5 text-center" : "items-center gap-4 p-4",
              selected ? "border-aqua" : grid ? "border-line" : "border-white",
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={selected}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            <span
              className={cn(
                "flex shrink-0 items-center justify-center rounded-2xl transition-colors",
                grid ? "h-12 w-full" : "h-[72px] w-[104px]",
                selected ? "bg-info-soft text-cta-mid" : "bg-bg text-muted",
              )}
            >
              <CarIllustration ends={o.ends} width={grid ? 64 : 84} />
            </span>
            <span className={cn("flex min-w-0 flex-col gap-0.5", !grid && "grow")}>
              <span className={cn("font-display font-bold text-deep", grid ? "text-[15px]" : "text-lg")}>
                {o.label}
              </span>
              {o.sub && <span className="text-[13px] text-muted">{o.sub}</span>}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                grid ? "absolute top-1.5 right-1.5 size-5" : "size-7",
                selected ? "border-cta-mid bg-cta-mid text-white" : "border-off bg-white text-transparent",
              )}
            >
              <CheckIcon size={grid ? 12 : 16} strokeWidth={3} />
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

/** Side view of a car facing right, with the plate(s) at the chosen end(s) highlighted. */
function CarIllustration({ ends, width }: { ends: PlatePosition[]; width: number }) {
  return (
    <svg width={width} height={(width * 46) / 84} viewBox="0 0 84 46" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 33H5.5A1.5 1.5 0 0 1 4 31.5V24c0-1.8 1.2-3.3 3-3.7L18 18l9-8.5c1-.9 2.3-1.5 3.7-1.5h17.6c1.6 0 3 .7 4 1.9L60 18l14.5 2.6c2 .4 3.5 2.1 3.5 4.2v6.7a1.5 1.5 0 0 1-1.5 1.5H74" />
      <path d="M26 33h32" />
      <path d="M21 18h38M39 8v10" opacity={0.55} />
      <circle cx="17" cy="33" r="5.5" />
      <circle cx="65" cy="33" r="5.5" />
      {ends.map((end) => (
        <rect
          key={end}
          x={end === "front" ? 76 : 1}
          y="23"
          width="7"
          height="7"
          rx="1.5"
          className="fill-cta-mid stroke-cta-mid"
        />
      ))}
    </svg>
  );
}
