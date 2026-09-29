"use client";

import { type PositionOption, PositionPicker } from "@/components/form/PositionPicker";
import { PrimaryButton } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { PlatePosition } from "@/lib/types";
import { th } from "@/locales/th";
import { StepFooter } from "./StepFooter";

const OPTIONS: PositionOption<PlatePosition>[] = [
  { value: "front", label: th.plate.front, sub: th.report.position.frontSub, ends: ["front"] },
  { value: "rear", label: th.plate.rear, sub: th.report.position.rearSub, ends: ["rear"] },
];

type Props = {
  position: PlatePosition | null;
  onChange: (position: PlatePosition) => void;
  nextLabel: string;
  onNext: () => void;
};

export function PositionStep({ position, onChange, nextLabel, onNext }: Props) {
  return (
    <>
      <PositionPicker
        legend={th.report.position.heading}
        legendHidden
        options={OPTIONS}
        value={position}
        onChange={onChange}
        className="px-5 pt-5"
      />

      <StepFooter>
        <PrimaryButton onClick={onNext} disabled={!position}>
          {nextLabel}
          <ArrowRightIcon size={18} />
        </PrimaryButton>
      </StepFooter>
    </>
  );
}
