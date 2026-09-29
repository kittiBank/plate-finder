import type { ReactNode } from "react";

/** Actions pinned to the bottom of a flow screen (thumb zone), fading into the page behind. */
export function StepFooter({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 mt-auto flex flex-col gap-2.5 bg-[linear-gradient(to_top,var(--color-bg)_70%,transparent)] px-5 pt-6 pb-[max(20px,env(safe-area-inset-bottom))]">
      {children}
    </div>
  );
}
