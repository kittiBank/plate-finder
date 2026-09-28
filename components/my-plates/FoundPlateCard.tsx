import { PlateBadge } from "@/components/plate/PlateBadge";
import { PrimaryButton } from "@/components/ui/Button";
import { ArrowRightIcon, CheckIcon, ClockIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { formatTimeAgo } from "@/lib/format";
import type { MatchedPlate } from "@/lib/types";
import { th } from "@/locales/th";

type Props = {
  plate: MatchedPlate;
  now: Date;
  className?: string;
};

/** Yellow-bordered card for a lost plate that someone has reported finding. */
export function FoundPlateCard({ plate, now, className }: Props) {
  const details = [
    plate.position === "front" ? th.plate.front : th.plate.rear,
    plate.vehicleType && th.vehicle[plate.vehicleType],
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className={cn(
        "overflow-hidden rounded-[26px] border-2 border-accent bg-white shadow-[0_14px_32px_rgba(241,196,15,0.25),0_6px_18px_rgba(44,62,80,0.08)]",
        className,
      )}
    >
      <div className="relative flex items-center gap-2 overflow-hidden bg-[linear-gradient(90deg,#fdf2c7,#fef8e0)] px-3.5 py-2.5 font-display text-sm font-semibold text-accent-ink">
        <CheckIcon size={18} className="text-[#8a6a00]" />
        {th.myPlates.foundBanner}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-20 bg-[linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,0.8),rgba(255,255,255,0))] animate-shine"
        />
      </div>
      <div className="flex flex-col gap-3.5 p-3.5">
        <div className="flex items-center gap-3.5">
          <PlateBadge plate={plate.plate} provinceCode={plate.provinceCode} />
          <div className="flex min-w-0 grow flex-col gap-1">
            <p className="text-[12.5px] font-semibold text-muted">{details}</p>
            <p className="text-[15px] leading-[1.35] font-semibold">
              {th.myPlates.foundAt(plate.match.placeName)}
            </p>
            <p className="flex items-center gap-1 text-[12.5px] text-muted">
              <ClockIcon size={14} />
              {formatTimeAgo(plate.match.foundAt, now)}
            </p>
          </div>
        </div>
        <PrimaryButton href={`/matches/${plate.match.id}`}>
          {th.myPlates.viewMatch}
          <ArrowRightIcon size={18} />
        </PrimaryButton>
      </div>
    </article>
  );
}
