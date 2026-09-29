import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = HTMLAttributes<HTMLElement> & {
  /** Opaque white instead of glass — for modal sheets whose content must not show the page through. */
  solid?: boolean;
};

/** Sheet pinned to the bottom of the screen (Map, pickers). Presentational; dragging comes later. */
export function BottomSheet({ solid = false, className, children, ...props }: Props) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-t-[30px] border-t border-white px-4 pt-2.5",
        "shadow-[0_-12px_34px_rgba(44,62,80,0.14)]",
        solid ? "bg-white" : "bg-white/86 backdrop-blur-[22px] backdrop-saturate-150",
        className,
      )}
      {...props}
    >
      <div aria-hidden="true" className="h-[5px] w-10 self-center rounded-full bg-off" />
      {children}
    </section>
  );
}
