import Form from "next/form";
import Link from "next/link";
import type { ReactNode } from "react";
import { PlateBadge } from "@/components/plate/PlateBadge";
import { NotifyToggle } from "@/components/home/NotifyToggle";
import { BellButton } from "@/components/ui/BellButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { HeroBackground } from "@/components/ui/HeroBackground";
import { IconButton } from "@/components/ui/IconButton";
import { ProfileButton } from "@/components/ui/ProfileButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  BellIcon,
  CameraIcon,
  LogoIcon,
  PlateSearchIcon,
  PlusIcon,
  ScanIcon,
  SearchIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { formatShortDate } from "@/lib/format";
import { getMockMyPlates, MOCK_NOTIFY_PREFS, MOCK_UNREAD_NOTIFICATIONS } from "@/lib/mock/data";
import { th } from "@/locales/th";

const t = th.home;

export default function Home() {
  // Home previews the most recently lost plate.
  const [plate] = getMockMyPlates(new Date()).toSorted((a, b) =>
    b.lostSince.localeCompare(a.lostSince),
  );

  return (
    <main className="relative mx-auto flex w-full max-w-md flex-col px-5 pt-[18px] pb-[120px]">
      <HeroBackground height={378} />

      {/* Header */}
      <header className="relative flex h-12 items-center justify-between animate-rise">
        <div className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-[13px] border border-white/35 bg-white/18 text-white shadow-[0_6px_18px_rgba(20,40,70,0.18)] backdrop-blur-md">
            <LogoIcon />
          </span>
          <span className="font-display text-[19px] font-bold tracking-[0.2px] text-white">
            {th.app.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <BellButton unreadCount={MOCK_UNREAD_NOTIFICATIONS} />
          <ProfileButton />
        </div>
      </header>

      {/* Welcome */}
      <div className="relative mt-[26px] flex flex-col gap-1 animate-rise stagger-1">
        <p className="text-[15px] text-white/92">{t.welcome}</p>
        <h1 className="font-display text-[28px] leading-tight font-bold text-white">{t.heading}</h1>
        <p className="text-sm leading-normal text-white/90">{th.app.description}</p>
      </div>

      {/* Search */}
      <div className="relative mt-5 rounded-[22px] border border-white/40 bg-white/22 p-1.5 shadow-[0_12px_30px_rgba(20,40,70,0.25)] backdrop-blur-lg animate-rise stagger-2">
        <div className="flex h-14 items-center gap-2.5 rounded-[17px] bg-white/96 pr-1.5 pl-4">
          <Form action="/search" role="search" className="flex min-w-0 grow items-center gap-2.5">
            <SearchIcon size={22} className="shrink-0 text-link" />
            <input
              name="q"
              type="search"
              enterKeyHint="search"
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
              className="min-w-0 grow bg-transparent text-base text-deep outline-none placeholder:text-[#5d6d7e]"
            />
          </Form>
          <IconButton
            href="/report"
            label={t.scanPlate}
            variant="plain"
            className="rounded-[13px] bg-[linear-gradient(135deg,#3498db,#2c3e50)] text-white"
          >
            <ScanIcon size={22} />
          </IconButton>
        </div>
      </div>

      {/* Big actions */}
      <div className="relative mt-[30px] grid grid-cols-2 gap-3 animate-rise stagger-3">
        <ActionCard
          href="/report"
          title={t.reportFound}
          sub={t.reportFoundSub}
          icon={<CameraIcon size={26} />}
          primary
        />
        <ActionCard
          href="/search"
          title={t.search}
          sub={t.searchSub}
          icon={<PlateSearchIcon size={26} />}
        />
      </div>

      {/* My plates */}
      <div className="mt-[26px] flex items-center justify-between animate-rise stagger-4">
        <h2 className="font-display text-lg font-semibold">{t.myPlates}</h2>
        <Link href="/my-plates/new" className="flex items-center gap-1 py-2.5 text-sm font-semibold">
          <PlusIcon size={16} />
          {t.addPlate}
        </Link>
      </div>

      <GlassCard className="mt-2 flex flex-col gap-3 p-3.5 animate-rise stagger-5">
        {plate ? (
          <Link href="/my-plates" className="tap flex items-center gap-3.5 text-deep">
            <PlateBadge plate={plate.plate} provinceCode={plate.provinceCode} />
            <div className="flex min-w-0 grow flex-col gap-[5px]">
              {plate.match ? (
                <StatusBadge tone="accent">{th.status.found}</StatusBadge>
              ) : (
                <StatusBadge tone="info" pulse>
                  {th.status.tracking}
                </StatusBadge>
              )}
              <p className="text-[13px] leading-[1.45] text-muted">
                {plate.match
                  ? th.myPlates.foundAt(plate.match.placeName)
                  : `${t.noFinderYet} · ${t.lostSince(formatShortDate(plate.lostSince))}`}
              </p>
            </div>
          </Link>
        ) : (
          <p className="text-sm text-muted">{t.emptyPlates}</p>
        )}
        <div className="h-px bg-line" />
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cta text-white">
            <BellIcon size={18} strokeWidth={2} />
          </span>
          <div className="flex min-w-0 grow flex-col">
            <span className="text-sm font-semibold">{t.notifyTitle}</span>
            <span className="text-xs text-muted">{t.notifySub}</span>
          </div>
          <NotifyToggle initial={MOCK_NOTIFY_PREFS.app} label={t.notifyTitle} />
        </div>
      </GlassCard>
    </main>
  );
}

function ActionCard({
  href,
  title,
  sub,
  icon,
  primary,
}: {
  href: string;
  title: string;
  sub: string;
  icon: ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "tap flex h-[156px] flex-col justify-between rounded-[26px] p-4",
        primary
          ? "border border-white/50 bg-[radial-gradient(120%_90%_at_0%_0%,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0)_45%),linear-gradient(150deg,#2d9cdb_0%,#1a6fc4_50%,#134f99_100%)] text-white shadow-[0_16px_34px_rgba(26,111,196,0.45),0_0_0_4px_rgba(45,156,219,0.18),inset_0_1px_0_rgba(255,255,255,0.6)]"
          : "border-2 border-aqua bg-white text-deep shadow-[0_14px_30px_rgba(44,62,80,0.12)]",
      )}
    >
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-2xl",
          primary
            ? "border border-white/50 bg-white/22"
            : "bg-[linear-gradient(135deg,#e3f2fc,#cfe7f8)] text-link",
        )}
      >
        {icon}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="font-display text-lg leading-tight font-bold">{title}</span>
        <span className={cn("text-[13px]", primary ? "text-white/92" : "text-[#4f6072]")}>
          {sub}
        </span>
      </span>
    </Link>
  );
}
