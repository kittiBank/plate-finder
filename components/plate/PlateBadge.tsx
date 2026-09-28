import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { formatPlate, type PlateParts } from "@/lib/plate-utils/parse";
import { getProvince } from "@/lib/plate-utils/provinces";
import { th } from "@/locales/th";

export type PlateBadgeSize = "xs" | "sm" | "md";

type Props = {
  plate: PlateParts;
  provinceCode: string | null;
  size?: PlateBadgeSize;
  className?: string;
};

// sm/md follow CLAUDE.md §5. xs is the compact label used inside map pins.
const SIZES: Record<
  PlateBadgeSize,
  { frame?: CSSProperties; number: number; province: number }
> = {
  xs: { number: 14, province: 7.5 },
  sm: { frame: { width: 108, height: 56, padding: 3 }, number: 19, province: 9.5 },
  md: { frame: { width: 136, height: 70, padding: 4 }, number: 24, province: 11 },
};

/** Thai licence plate: white plate, 2px dark inner border, number on top, province below. */
export function PlateBadge({ plate, provinceCode, size = "md", className }: Props) {
  const text = formatPlate(plate);
  const province = provinceCode ? getProvince(provinceCode)?.nameTh : undefined;
  const label = [th.plate.label, text, province].filter(Boolean).join(" ");
  const s = SIZES[size];

  const face = (
    <span
      className={cn(
        "flex flex-col items-center justify-center border-plate-ink bg-white font-display text-[#111]",
        size === "xs" ? "rounded-md border-[1.5px] px-2 py-[3px]" : "h-full rounded-md border-2",
      )}
    >
      <span
        className="font-bold leading-[1.05] tracking-[0.5px] whitespace-nowrap"
        style={{ fontSize: s.number }}
      >
        {text}
      </span>
      {province && (
        <span className="font-medium leading-[1.2] whitespace-nowrap" style={{ fontSize: s.province }}>
          {province}
        </span>
      )}
    </span>
  );

  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        "inline-block shrink-0",
        s.frame && "box-border rounded-plate bg-white shadow-plate",
        className,
      )}
      style={s.frame}
    >
      {face}
    </span>
  );
}
