import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed"> & {
  selected?: boolean;
};

/** Filter chip. 36px tall, with the hit area padded to 44px. */
export function Chip({ selected = false, className, children, ...props }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "tap relative flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[13.5px]",
        "before:absolute before:inset-x-0 before:-inset-y-1 before:content-['']",
        selected
          ? "bg-deep font-semibold text-white"
          : "border border-white bg-white/80 font-medium text-deep shadow-[0_4px_12px_rgba(44,62,80,0.08)] backdrop-blur-md",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
