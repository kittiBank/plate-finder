"use client";

import { useId, useState } from "react";
import { PlateBadge } from "@/components/plate/PlateBadge";
import { cn } from "@/lib/cn";
import { parsePlate } from "@/lib/plate-utils/parse";
import { th } from "@/locales/th";

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** Shown on the live preview; `null`/undefined leaves the province line off. */
  provinceCode?: string | null;
  autoFocus?: boolean;
  className?: string;
};

/**
 * Free-text plate field with live parsing (CLAUDE.md §5). Valid input renders a PlateBadge preview;
 * invalid input is only flagged after blur so people aren't scolded mid-typing.
 */
export function PlateInput({ value, onChange, provinceCode, autoFocus, className }: Props) {
  const id = useId();
  const [touched, setTouched] = useState(false);
  const result = parsePlate(value);
  const invalid = touched && !result.ok && result.error === "invalid_format";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-deep">
        {th.form.plateLabel}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={th.form.platePlaceholder}
        autoFocus={autoFocus}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="next"
        maxLength={16}
        aria-invalid={invalid || undefined}
        aria-describedby={`${id}-msg`}
        className={cn(
          "h-[58px] rounded-button border-2 bg-white px-4 font-display text-[22px] font-semibold tracking-[0.5px] text-deep outline-none",
          "shadow-[0_6px_16px_rgba(44,62,80,0.06)] transition-colors placeholder:font-normal placeholder:text-[#8a97a3]",
          invalid ? "border-danger" : "border-line focus:border-aqua",
        )}
      />
      <p id={`${id}-msg`} className={cn("text-[13px]", invalid ? "font-medium text-danger" : "text-muted")}>
        {invalid ? th.form.plateInvalid : th.form.plateHint}
      </p>

      {/* Live preview; the ghost keeps the layout from jumping while typing. */}
      <div className="flex h-[78px] items-center justify-center">
        {result.ok ? (
          <PlateBadge plate={result.plate} provinceCode={provinceCode ?? null} className="animate-rise" />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-[70px] w-[136px] items-center justify-center rounded-plate border-2 border-dashed border-off font-display text-2xl font-bold text-off"
          >
            1กข 1234
          </span>
        )}
      </div>
    </div>
  );
}
