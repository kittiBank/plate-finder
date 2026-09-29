import { PlateBadge } from "@/components/plate/PlateBadge";
import { ReportHeader } from "@/components/report/ReportHeader";
import { StepFooter } from "@/components/report/StepFooter";
import { OutlineButton, PrimaryButton } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { BellIcon, CheckIcon, PinIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatTimeAgo } from "@/lib/format";
import type { FoundReport } from "@/lib/types";
import { th } from "@/locales/th";
import type { LostPlateValue } from "./draft";

const t = th.addPlate.done;

type Props = { value: LostPlateValue; match: FoundReport | null };

/** After saving: either "tracking now" or, when a finder already reported it, the match up front. */
export function AddLostPlateSuccess({ value, match }: Props) {
  const both = value.positions.length > 1;
  const positions = both ? t.trackingBoth : th.plate[value.positions[0]];

  return (
    <>
      <ReportHeader
        title={th.addPlate.title}
        heading={match ? t.matchHeading : t.heading}
        sub={match ? t.matchSub : t.sub}
        icon={
          <span className="relative mb-3 flex size-16 items-center justify-center">
            <span aria-hidden="true" className="absolute inset-0 rounded-full bg-white/40 animate-pulse-ring" />
            <span className="relative flex size-16 items-center justify-center rounded-full bg-white text-cta-mid shadow-[0_10px_24px_rgba(20,40,70,0.3)]">
              {match ? <BellIcon size={32} strokeWidth={2.2} /> : <CheckIcon size={34} strokeWidth={2.6} />}
            </span>
          </span>
        }
      />

      <div className="flex flex-col gap-3 px-5 pt-5 animate-rise stagger-2">
        <GlassCard className="flex items-center gap-3.5 p-4">
          <PlateBadge plate={value.plate} provinceCode={value.provinceCode} />
          <div className="flex min-w-0 flex-col gap-1">
            {match ? (
              <StatusBadge tone="accent">{th.status.found}</StatusBadge>
            ) : (
              <StatusBadge tone="info" pulse>
                {th.status.tracking}
              </StatusBadge>
            )}
            <p className="text-[13px] leading-[1.45] text-muted">{positions}</p>
          </div>
        </GlassCard>

        {match && (
          <p className="flex items-center gap-1.5 px-1 text-sm text-deep">
            <PinIcon size={16} className="shrink-0 text-link" />
            {t.matchFoundAt(match.placeName, formatTimeAgo(match.foundAt))}
          </p>
        )}
      </div>

      <StepFooter>
        {match ? (
          <>
            <PrimaryButton href={`/plates/${match.id}`}>{t.viewMatch}</PrimaryButton>
            <OutlineButton href="/my-plates">{t.myPlates}</OutlineButton>
          </>
        ) : (
          <>
            <PrimaryButton href="/my-plates">{t.myPlates}</PrimaryButton>
            <OutlineButton href="/">{t.home}</OutlineButton>
          </>
        )}
      </StepFooter>
    </>
  );
}
