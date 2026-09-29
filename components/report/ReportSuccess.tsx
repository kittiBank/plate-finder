import { PlateBadge } from "@/components/plate/PlateBadge";
import { OutlineButton, PrimaryButton } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { CameraIcon, CheckIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { PlateParts } from "@/lib/plate-utils/parse";
import { getProvince } from "@/lib/plate-utils/provinces";
import type { PlatePosition } from "@/lib/types";
import { th } from "@/locales/th";
import { ReportHeader } from "./ReportHeader";
import { StepFooter } from "./StepFooter";

const t = th.report.done;

type Props = {
  plate: PlateParts;
  provinceCode: string | null;
  position: PlatePosition;
  onReportAnother: () => void;
};

export function ReportSuccess({ plate, provinceCode, position, onReportAnother }: Props) {
  const province = provinceCode ? getProvince(provinceCode)?.nameTh : th.form.provinceUnknown;

  return (
    <>
      <ReportHeader
        heading={t.heading}
        sub={t.sub}
        icon={
          <span className="relative mb-3 flex size-16 items-center justify-center">
            <span aria-hidden="true" className="absolute inset-0 rounded-full bg-white/40 animate-pulse-ring" />
            <span className="relative flex size-16 items-center justify-center rounded-full bg-white text-cta-mid shadow-[0_10px_24px_rgba(20,40,70,0.3)]">
              <CheckIcon size={34} strokeWidth={2.6} />
            </span>
          </span>
        }
      />

      <div className="px-5 pt-5 animate-rise stagger-2">
        <GlassCard className="flex items-center gap-3.5 p-4">
          <PlateBadge plate={plate} provinceCode={provinceCode} />
          <div className="flex min-w-0 flex-col gap-1">
            <StatusBadge tone="accent">{th.status.waitingOwner}</StatusBadge>
            <p className="text-[13px] leading-[1.45] text-muted">
              {th.plate[position]} · {province}
            </p>
          </div>
        </GlassCard>
      </div>

      <StepFooter>
        <PrimaryButton onClick={onReportAnother}>
          <CameraIcon size={20} />
          {t.reportAnother}
        </PrimaryButton>
        <OutlineButton href="/">{t.home}</OutlineButton>
      </StepFooter>
    </>
  );
}
