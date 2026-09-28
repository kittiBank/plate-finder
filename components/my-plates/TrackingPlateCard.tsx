import { PlateBadge } from "@/components/plate/PlateBadge";
import { GlassCard } from "@/components/ui/GlassCard";
import { IconButton } from "@/components/ui/IconButton";
import { MoreIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";
import { formatShortDate } from "@/lib/format";
import { formatPlate } from "@/lib/plate-utils/parse";
import type { LostPlate } from "@/lib/types";
import { th } from "@/locales/th";

/** A lost plate nobody has reported yet. */
export function TrackingPlateCard({ plate, className }: { plate: LostPlate; className?: string }) {
  const position = plate.position === "front" ? th.plate.front : th.plate.rear;

  return (
    <GlassCard className={cn("flex items-center gap-3.5 p-3.5", className)}>
      <PlateBadge plate={plate.plate} provinceCode={plate.provinceCode} />
      <div className="flex min-w-0 grow flex-col gap-[5px]">
        <StatusBadge tone="info" pulse>
          {th.status.tracking}
        </StatusBadge>
        <p className="text-[12.5px] leading-[1.45] text-muted">
          {position} · {th.home.lostSince(formatShortDate(plate.lostSince))}
        </p>
      </div>
      <IconButton
        label={th.myPlates.plateOptions(formatPlate(plate.plate))}
        variant="ghost"
        className="-mr-1.5"
      >
        <MoreIcon />
      </IconButton>
    </GlassCard>
  );
}
