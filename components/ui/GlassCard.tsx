import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Light glass card on the grey page background. */
export function GlassCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-white bg-white/92 shadow-card backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}
