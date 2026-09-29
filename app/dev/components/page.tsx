import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PlateBadge } from "@/components/plate/PlateBadge";
import { BellButton } from "@/components/ui/BellButton";
import { BottomNav } from "@/components/ui/BottomNav";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { DashedAddButton, OutlineButton, PrimaryButton } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { HeroBackground } from "@/components/ui/HeroBackground";
import { IconButton } from "@/components/ui/IconButton";
import { ProfileButton } from "@/components/ui/ProfileButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  ArrowRightIcon,
  FilterIcon,
  LayersIcon,
  LocateIcon,
  MoreIcon,
  NavigateIcon,
} from "@/components/ui/icons";
import { th } from "@/locales/th";
import { ChipDemo, PlateFormDemo, ToggleDemo } from "./Demos";

// Dev-only component gallery for visual checks (CLAUDE.md §9.2). Not part of the app.
export default function ComponentsGallery() {
  if (process.env.NODE_ENV === "production") notFound();

  const plate = { prefixDigit: "1", letters: "กข", number: "1234" };

  return (
    <main className="relative mx-auto flex w-full max-w-[390px] flex-col gap-6 px-5 pt-5 pb-32">
      <HeroBackground height={96} variant="compact" />

      <div className="relative flex items-center justify-between">
        <h1 className="font-display text-[26px] font-bold text-white">Components</h1>
        <div className="flex gap-2">
          <BellButton unreadCount={1} />
          <BellButton />
          <ProfileButton />
        </div>
      </div>

      <Section title="PlateBadge md / sm / xs">
        <div className="flex flex-wrap items-center gap-3">
          <PlateBadge plate={plate} provinceCode="10" />
          <PlateBadge plate={{ prefixDigit: "2", letters: "ขข", number: "4567" }} provinceCode="12" size="sm" />
          <PlateBadge plate={plate} provinceCode="10" size="xs" />
          <PlateBadge plate={{ prefixDigit: null, letters: "ก", number: "7" }} provinceCode={null} size="sm" />
        </div>
      </Section>

      <Section title="StatusBadge">
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="info" pulse>{th.status.tracking}</StatusBadge>
          <StatusBadge tone="accent">{th.status.waitingOwner}</StatusBadge>
          <StatusBadge tone="accent">{th.status.found}</StatusBadge>
        </div>
      </Section>

      <Section title="Buttons">
        <PrimaryButton href="#">
          ดูรายละเอียดและติดต่อผู้พบ
          <ArrowRightIcon size={18} />
        </PrimaryButton>
        <div className="grid grid-cols-2 gap-2.5">
          <PrimaryButton size="md">ดูรายละเอียด</PrimaryButton>
          <OutlineButton size="md">
            <NavigateIcon size={18} />
            นำทาง
          </OutlineButton>
        </div>
        <DashedAddButton href="#">{th.myPlates.addLostPlate}</DashedAddButton>
        <PrimaryButton disabled>Disabled</PrimaryButton>
      </Section>

      <Section title="IconButton">
        <div className="flex gap-2.5">
          <IconButton label="ชั้นแผนที่" size={48}>
            <LayersIcon size={22} />
          </IconButton>
          <IconButton label="ไปยังตำแหน่งของฉัน" size={48} className="text-cta-mid">
            <LocateIcon size={22} />
          </IconButton>
          <IconButton label="ตัวกรอง" variant="cta" size={52}>
            <FilterIcon size={22} />
          </IconButton>
          <IconButton label="ตัวเลือก" variant="ghost">
            <MoreIcon />
          </IconButton>
        </div>
      </Section>

      <Section title="Toggle">
        <ToggleDemo />
      </Section>

      <Section title="Chip">
        <ChipDemo />
      </Section>

      <Section title="PlateInput + ProvincePicker">
        <PlateFormDemo />
      </Section>

      <Section title="GlassCard">
        <GlassCard className="flex items-center gap-3.5 p-3.5">
          <PlateBadge plate={{ prefixDigit: "4", letters: "กก", number: "9999" }} provinceCode="10" />
          <div className="flex min-w-0 flex-col gap-1">
            <StatusBadge tone="info" pulse>{th.status.tracking}</StatusBadge>
            <p className="text-[12.5px] text-muted">ป้ายหน้า · หายตั้งแต่ 26 ก.ย.</p>
          </div>
        </GlassCard>
      </Section>

      <Section title="BottomSheet">
        <div className="overflow-hidden rounded-3xl bg-[#e6edf2] pt-10">
          <BottomSheet className="pb-4">
            <h2 className="font-display text-lg font-semibold">พบ 18 ป้ายใกล้คุณ</h2>
            <p className="text-[13px] text-muted">ในรัศมี 5 กม. · อัปเดตเมื่อสักครู่</p>
          </BottomSheet>
        </div>
      </Section>

      <BottomNav />
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="relative flex flex-col gap-3">
      <h2 className="font-display text-sm font-semibold text-muted">{title}</h2>
      {children}
    </section>
  );
}
