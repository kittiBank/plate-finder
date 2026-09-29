import type { ReactNode } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { th } from "@/locales/th";

type Props = {
  /** Small title next to the back button; defaults to the report flow title. */
  title?: string;
  heading: string;
  sub: string;
  /** 1-based; omit to hide the progress bar (success screen). */
  progress?: { step: number; total: number };
  /** `href` leaves the flow; `onClick` goes back one step. Omit for no back button. */
  back?: { href: string; label: string } | { onClick: () => void; label: string };
  /** Shown above the heading (e.g. the success check). */
  icon?: ReactNode;
};

/** Compact hero for full-screen flows: back button, step progress and the step's question. */
export function ReportHeader({ title = th.report.title, heading, sub, progress, back, icon }: Props) {
  return (
    <header className="relative overflow-hidden rounded-b-hero bg-hero px-5 pt-[18px] pb-7 text-white">
      <div
        aria-hidden="true"
        className="absolute -top-20 -right-20 size-[230px] rounded-full bg-[radial-gradient(circle,rgba(126,214,255,0.5),rgba(126,214,255,0)_70%)] animate-float"
      />

      <div className="relative flex h-11 items-center gap-3">
        {back &&
          ("href" in back ? (
            <IconButton href={back.href} label={back.label} variant="glass-dark">
              <ArrowLeftIcon size={22} />
            </IconButton>
          ) : (
            <IconButton onClick={back.onClick} label={back.label} variant="glass-dark">
              <ArrowLeftIcon size={22} />
            </IconButton>
          ))}
        <span className="font-display text-base font-semibold">{title}</span>
      </div>

      {progress && (
        <div className="relative mt-4 flex flex-col gap-2">
          <div
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={progress.total}
            aria-valuenow={progress.step}
            aria-valuetext={th.report.stepOf(progress.step, progress.total)}
            className="flex gap-1.5"
          >
            {Array.from({ length: progress.total }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 grow rounded-full transition-colors duration-300",
                  i < progress.step ? "bg-white" : "bg-white/28",
                )}
              />
            ))}
          </div>
          <span className="text-[13px] text-white/88">{th.report.stepOf(progress.step, progress.total)}</span>
        </div>
      )}

      {/* Keyed so each step's question rises in. */}
      <div key={heading} className="relative mt-3 flex flex-col gap-1 animate-rise">
        {icon}
        <h1 className="font-display text-[26px] leading-tight font-bold">{heading}</h1>
        <p className="text-sm leading-normal text-white/90">{sub}</p>
      </div>
    </header>
  );
}
