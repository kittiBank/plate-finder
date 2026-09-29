import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PlateBadge } from "@/components/plate/PlateBadge";
import { ApproxLocation } from "@/components/plate-detail/ApproxLocation";
import { BackButton } from "@/components/plate-detail/BackButton";
import { PhotoViewer } from "@/components/plate-detail/PhotoViewer";
import { StepFooter } from "@/components/report/StepFooter";
import { PrimaryButton } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { CheckIcon, ClockIcon, MapIcon, PinIcon, ShieldIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatShortDate, formatTimeAgo } from "@/lib/format";
import { getMockFoundReport } from "@/lib/mock/data";
import { mockPlatePhotoUrl } from "@/lib/mock/photo";
import { formatPlate, normalizePlate } from "@/lib/plate-utils/parse";
import { getProvince } from "@/lib/plate-utils/provinces";
import type { FoundReport } from "@/lib/types";
import { th } from "@/locales/th";

const t = th.plateDetail;

const STATUS: Record<FoundReport["status"], { label: string; tone: "accent" | "info" }> = {
  open: { label: th.status.waitingOwner, tone: "accent" },
  matched: { label: th.status.verifyingOwner, tone: "info" },
  returned: { label: th.status.returned, tone: "info" },
};

export async function generateMetadata({ params }: PageProps<"/plates/[id]">): Promise<Metadata> {
  const report = getMockFoundReport((await params).id, new Date());
  const title = report ? `${formatPlate(report.plate)} · ${t.title}` : t.notFound.heading;
  return { title: `${title} · ${th.app.name}` };
}

export default async function PlateDetailPage({ params }: PageProps<"/plates/[id]">) {
  const { id } = await params;
  // Mock data until the public `found_reports_public` view is wired up (Phase 5).
  const now = new Date();
  const report = getMockFoundReport(id, now);
  if (!report) notFound();

  const plateText = formatPlate(report.plate);
  const status = STATUS[report.status];
  const province = report.provinceCode ? getProvince(report.provinceCode)?.nameTh : th.form.provinceUnknown;
  const claimHref = `/my-plates/new?${new URLSearchParams({
    plate: normalizePlate(plateText),
    ...(report.provinceCode && { province: report.provinceCode }),
  })}`;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <header className="relative overflow-hidden rounded-b-hero bg-hero px-5 pt-[18px] pb-7 text-white">
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-20 size-[230px] rounded-full bg-[radial-gradient(circle,rgba(126,214,255,0.5),rgba(126,214,255,0)_70%)] animate-float"
        />
        <div className="relative flex h-11 items-center gap-3 animate-rise">
          <BackButton label={t.back} fallbackHref="/search" />
          <h1 className="font-display text-lg font-semibold">{t.title}</h1>
        </div>
        <div className="relative mt-5 flex flex-col items-center gap-3 animate-rise stagger-1">
          <div className="rounded-[16px] border border-white/35 bg-white/16 p-2.5 shadow-[0_12px_30px_rgba(20,40,70,0.25)] backdrop-blur-md">
            <PlateBadge plate={report.plate} provinceCode={report.provinceCode} size="md" />
          </div>
          {/* Wrapped: StatusBadge aligns itself to the start of its flex parent. */}
          <div>
            <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-5 pt-5">
        <GlassCard className="flex flex-col gap-3 p-3.5 animate-rise stagger-2">
          <h2 className="px-1 font-display text-base font-semibold text-deep">{t.photo}</h2>
          <PhotoViewer src={mockPlatePhotoUrl(report)} alt={t.photoAlt(plateText)} />
        </GlassCard>

        <GlassCard className="flex flex-col gap-1 p-4 animate-rise stagger-3">
          <h2 className="font-display text-base font-semibold text-deep">{t.details}</h2>
          <dl className="flex flex-col">
            <Row icon={<PinIcon size={18} />} term={t.foundNear} value={report.placeName} />
            <Row
              icon={<ClockIcon size={18} />}
              term={t.foundWhen}
              value={`${formatTimeAgo(report.foundAt, now)} · ${formatShortDate(report.foundAt)}`}
            />
            <Row icon={<CheckIcon size={18} />} term={t.position} value={th.plate[report.position]} />
            <Row icon={<MapIcon size={18} />} term={t.province} value={province ?? ""} />
          </dl>
        </GlassCard>

        <GlassCard className="flex flex-col gap-3 p-3.5 animate-rise stagger-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-display text-base font-semibold text-deep">{t.location}</h2>
            <Link href="/map" className="flex min-h-11 items-center gap-1 text-sm font-semibold text-link">
              <MapIcon size={16} />
              {t.viewOnMap}
            </Link>
          </div>
          <ApproxLocation center={{ lat: report.lat, lng: report.lng }} placeName={report.placeName} />
          <p className="flex items-start gap-1.5 px-1 text-[13px] leading-normal text-muted">
            <ShieldIcon size={16} className="mt-0.5 shrink-0 text-link" />
            {t.locationNote}
          </p>
        </GlassCard>
      </div>

      <StepFooter>
        {report.status === "returned" ? (
          <p className="text-center text-sm text-muted">{t.returnedNote}</p>
        ) : (
          <>
            <PrimaryButton href={claimHref}>{t.isMine}</PrimaryButton>
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
              <ShieldIcon size={14} className="shrink-0" />
              {t.contactHidden}
            </p>
          </>
        )}
      </StepFooter>
    </main>
  );
}

function Row({ icon, term, value }: { icon: ReactNode; term: string; value: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-line py-2.5 last:border-b-0">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-info-soft text-info-ink">
        {icon}
      </span>
      <dt className="text-sm text-muted">{term}</dt>
      <dd className="ml-auto text-right text-sm font-semibold text-deep">{value}</dd>
    </div>
  );
}
