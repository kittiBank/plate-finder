import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Glass sheet pinned to the bottom of the screen (Map). Presentational for now; dragging comes later. */
export function BottomSheet({ className, children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-t-[30px] border-t border-white bg-white/86 px-4 pt-2.5",
        "shadow-[0_-12px_34px_rgba(44,62,80,0.14)] backdrop-blur-[22px] backdrop-saturate-150",
        className,
      )}
      {...props}
    >
      <div aria-hidden="true" className="h-[5px] w-10 self-center rounded-full bg-off" />
      {children}
    </section>
  );
}
