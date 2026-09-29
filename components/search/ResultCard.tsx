import Link from "next/link";
import { PlateBadge } from "@/components/plate/PlateBadge";
import { ChevronRightIcon, ClockIcon, PinIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatTimeAgo } from "@/lib/format";
import { formatPlate } from "@/lib/plate-utils/parse";
import type { SimilarReason } from "@/lib/plate-utils/search";
import type { FoundReport } from "@/lib/types";
import { th } from "@/locales/th";

const t = th.search;

type Props = {
  report: FoundReport;
  /** Set for "similar" results: why this one is only a suggestion. */
  reason?: SimilarReason;
  now: Date;
};

/** One found report in the results. Tapping opens the plate detail. */
export function ResultCard({ report, reason, now }: Props) {
  return (
    <li>
      <Link
        href={`/plates/${report.id}`}
        aria-label={t.viewReport(formatPlate(report.plate))}
        className="tap flex items-center gap-3 rounded-card border border-white bg-white/92 p-3 text-deep shadow-card backdrop-blur-xl"
      >
        <PlateBadge plate={report.plate} provinceCode={report.provinceCode} size="sm" className="shrink-0" />
        <div className="flex min-w-0 grow flex-col gap-1.5">
          {reason ? (
            <StatusBadge tone="info">{t.reason[reason]}</StatusBadge>
          ) : (
            <StatusBadge tone="accent">{th.status.waitingOwner}</StatusBadge>
          )}
          <p className="flex items-center gap-1 text-[13px] leading-snug text-deep">
            <PinIcon size={14} className="shrink-0 text-link" />
            <span className="truncate">{t.foundAt(report.placeName)}</span>
          </p>
          <p className="flex items-center gap-1 text-xs text-muted">
            <ClockIcon size={13} className="shrink-0" />
            {formatTimeAgo(report.foundAt, now)} · {th.plate[report.position]}
          </p>
        </div>
        <ChevronRightIcon size={18} className="shrink-0 text-muted" />
      </Link>
    </li>
  );
}
