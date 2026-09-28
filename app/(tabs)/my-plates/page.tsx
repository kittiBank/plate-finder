import { FoundPlateCard } from "@/components/my-plates/FoundPlateCard";
import { NotificationSettings } from "@/components/my-plates/NotificationSettings";
import { TrackingPlateCard } from "@/components/my-plates/TrackingPlateCard";
import { BellButton } from "@/components/ui/BellButton";
import { DashedAddButton } from "@/components/ui/Button";
import { HeroBackground } from "@/components/ui/HeroBackground";
import { getMockMyPlates, MOCK_NOTIFY_PREFS, MOCK_UNREAD_NOTIFICATIONS } from "@/lib/mock/data";
import type { MatchedPlate } from "@/lib/types";
import { th } from "@/locales/th";

const t = th.myPlates;

export default function MyPlatesPage() {
  const now = new Date();
  const plates = getMockMyPlates(now);
  const found = plates.filter((p): p is MatchedPlate => p.match !== undefined);
  const tracking = plates.filter((p) => !p.match && p.status === "tracking");
  const trackedCount = plates.filter((p) => p.status !== "recovered").length;

  return (
    <main className="relative mx-auto flex w-full max-w-md flex-col px-5 pt-[18px] pb-[120px]">
      <HeroBackground height={230} variant="compact" />

      <header className="relative flex h-12 items-center justify-between animate-rise">
        <h1 className="font-display text-[26px] font-bold text-white">{t.title}</h1>
        <BellButton unreadCount={MOCK_UNREAD_NOTIFICATIONS} />
      </header>
      <p className="relative mt-1.5 text-sm leading-normal text-white/92 animate-rise stagger-1">
        {t.intro}
      </p>

      {/* Summary */}
      <div className="relative mt-4 flex flex-wrap gap-2 animate-rise stagger-1">
        <span className="flex h-[34px] items-center rounded-full border border-white/35 bg-white/16 px-3 text-[13px] font-medium text-white backdrop-blur-md">
          {t.trackingCount(trackedCount)}
        </span>
        {found.length > 0 && (
          <span className="flex h-[34px] items-center gap-1.5 rounded-full bg-accent px-3 text-[13px] font-semibold text-[#3d2f00]">
            <span className="size-[7px] rounded-full bg-[#3d2f00]" />
            {t.foundCount(found.length)}
          </span>
        )}
      </div>

      <div className="mt-[26px] flex flex-col gap-3">
        {found.map((p) => (
          <FoundPlateCard key={p.id} plate={p} now={now} className="animate-rise stagger-2" />
        ))}
        {tracking.map((p) => (
          <TrackingPlateCard key={p.id} plate={p} className="animate-rise stagger-3" />
        ))}
        <DashedAddButton href="/my-plates/new" className="animate-rise stagger-3">
          {t.addLostPlate}
        </DashedAddButton>
      </div>

      <h2 className="mt-7 mb-2.5 font-display text-lg font-semibold animate-rise stagger-4">
        {t.notificationsTitle}
      </h2>
      <NotificationSettings initial={MOCK_NOTIFY_PREFS} className="animate-rise stagger-4" />
    </main>
  );
}
