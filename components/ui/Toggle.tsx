"use client";

import { cn } from "@/lib/cn";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Accessible name; the visible label usually sits next to the toggle. */
  label: string;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
};

/** On/off switch. The track is 50×30 (md) or 48×28 (sm); the hit area is padded to ≥44px. */
export function Toggle({ checked, onChange, label, size = "md", disabled, className }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative flex shrink-0 cursor-pointer items-center rounded-full p-[3px] transition-colors duration-[220ms]",
        "before:absolute before:-inset-2 before:content-['']",
        "disabled:cursor-not-allowed disabled:opacity-50",
        size === "md" ? "h-[30px] w-[50px]" : "h-7 w-12",
        checked ? "bg-cta-mid" : "bg-off",
        className,
      )}
    >
      <span
        className={cn(
          "rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,0.2)] transition-transform duration-[220ms] ease-out-soft",
          size === "md" ? "size-6" : "size-[22px]",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}
