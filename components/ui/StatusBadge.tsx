import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  /** info = tracking (blue); accent = found / waiting for owner (yellow). */
  tone: "info" | "accent";
  /** Blinking dot for live states such as "กำลังติดตาม". */
  pulse?: boolean;
  children: ReactNode;
  className?: string;
};

export function StatusBadge({ tone, pulse, children, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 self-start rounded-[9px] px-[9px] py-[3px] text-xs font-semibold",
        tone === "info" ? "bg-info-soft text-info-ink" : "bg-accent-soft text-accent-ink",
        className,
      )}
    >
      {pulse && <span className="size-[7px] rounded-full bg-cta-mid animate-blink" />}
      {children}
    </span>
  );
}
