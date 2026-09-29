"use client";

import { PlateInput } from "@/components/form/PlateInput";
import { ProvincePicker } from "@/components/form/ProvincePicker";
import { PrimaryButton } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { ReportDraft } from "./draft";
import { StepFooter } from "./StepFooter";

type Props = {
  draft: ReportDraft;
  onChange: (patch: Partial<Pick<ReportDraft, "plateText" | "province">>) => void;
  canContinue: boolean;
  nextLabel: string;
  onNext: () => void;
};

export function PlateStep({ draft, onChange, canContinue, nextLabel, onNext }: Props) {
  return (
    // A form so the keyboard's "next"/enter key continues too.
    <form
      className="flex grow flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        if (canContinue) onNext();
      }}
    >
      <div className="px-5 pt-5">
        <GlassCard className="flex flex-col gap-4 p-4">
          <PlateInput
            value={draft.plateText}
            onChange={(plateText) => onChange({ plateText })}
            provinceCode={draft.province}
          />
          <ProvincePicker value={draft.province} onChange={(province) => onChange({ province })} allowUnknown />
        </GlassCard>
      </div>

      <StepFooter>
        <PrimaryButton type="submit" disabled={!canContinue}>
          {nextLabel}
          <ArrowRightIcon size={18} />
        </PrimaryButton>
      </StepFooter>
    </form>
  );
}
