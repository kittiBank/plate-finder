import { PrimaryButton } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { PlateSearchIcon, SearchIcon } from "@/components/ui/icons";
import { th } from "@/locales/th";

const t = th.plateDetail.notFound;

export default function PlateNotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5">
      <GlassCard className="flex flex-col items-center gap-2.5 px-5 py-7 text-center animate-rise">
        <span className="flex size-14 items-center justify-center rounded-[18px] bg-info-soft text-info-ink">
          <PlateSearchIcon size={26} />
        </span>
        <h1 className="font-display text-xl font-semibold text-deep">{t.heading}</h1>
        <p className="text-sm leading-normal text-balance text-muted">{t.sub}</p>
        <PrimaryButton href="/search" className="mt-2 w-full">
          <SearchIcon size={20} />
          {t.cta}
        </PrimaryButton>
      </GlassCard>
    </main>
  );
}
