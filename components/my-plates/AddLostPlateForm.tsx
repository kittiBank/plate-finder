"use client";

import { useId, useState } from "react";
import { PlateInput } from "@/components/form/PlateInput";
import { type PositionOption, PositionPicker } from "@/components/form/PositionPicker";
import { ProvincePicker } from "@/components/form/ProvincePicker";
import { ReportHeader } from "@/components/report/ReportHeader";
import { StepFooter } from "@/components/report/StepFooter";
import { PrimaryButton } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { GlassCard } from "@/components/ui/GlassCard";
import { BellIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { createLostPlateMock } from "@/lib/mock/lostPlate";
import type { FoundReport, VehicleType } from "@/lib/types";
import { th } from "@/locales/th";
import { AddLostPlateSuccess } from "./AddLostPlateSuccess";
import { type LostPlateDraft, type LostPlateValue, type LostPosition, validateDraft } from "./draft";

const t = th.addPlate;

const POSITIONS: PositionOption<LostPosition>[] = [
  { value: "front", label: th.plate.front, ends: ["front"] },
  { value: "rear", label: th.plate.rear, ends: ["rear"] },
  { value: "both", label: t.both, ends: ["front", "rear"] },
];

const VEHICLES = Object.entries(th.vehicle) as [VehicleType, string][];

type Props = { initial: LostPlateDraft; today: string };

export function AddLostPlateForm({ initial, today }: Props) {
  const dateId = useId();
  const [draft, setDraft] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState<{ value: LostPlateValue; match: FoundReport | null } | null>(null);

  const result = validateDraft(draft, today);
  const update = (patch: Partial<LostPlateDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const dateInvalid = draft.lostSince > today;

  async function submit() {
    if (!result.ok || submitting) return;
    setSubmitting(true);
    const { match } = await createLostPlateMock(result.value);
    setSaved({ value: result.value, match });
    window.scrollTo(0, 0);
  }

  if (saved) return <AddLostPlateSuccess value={saved.value} match={saved.match} />;

  return (
    <>
      <ReportHeader title={t.title} heading={t.heading} sub={t.sub} back={{ href: "/my-plates", label: t.back }} />

      <form
        className="flex grow flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="flex flex-col gap-6 px-5 pt-5">
          <GlassCard className="flex flex-col gap-4 p-4 animate-rise stagger-1">
            <PlateInput
              value={draft.plateText}
              onChange={(plateText) => update({ plateText })}
              provinceCode={draft.province}
            />
            <ProvincePicker value={draft.province} onChange={(province) => update({ province: province ?? undefined })} />
          </GlassCard>

          <PositionPicker
            legend={t.position}
            layout="grid"
            options={POSITIONS}
            value={draft.position}
            onChange={(position) => update({ position })}
            className="animate-rise stagger-2"
          />

          <fieldset className="flex flex-col gap-2 animate-rise stagger-3">
            <legend className="mb-2 text-sm font-semibold text-deep">
              {t.vehicle} <span className="font-normal text-muted">({t.optional})</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {VEHICLES.map(([value, label]) => (
                <Chip
                  key={value}
                  selected={draft.vehicleType === value}
                  onClick={() => update({ vehicleType: draft.vehicleType === value ? null : value })}
                >
                  {label}
                </Chip>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-2 animate-rise stagger-4">
            <label htmlFor={dateId} className="text-sm font-semibold text-deep">
              {t.lostSince}
            </label>
            <input
              id={dateId}
              type="date"
              value={draft.lostSince}
              max={today}
              required
              onChange={(e) => update({ lostSince: e.target.value })}
              aria-invalid={dateInvalid || undefined}
              aria-describedby={dateInvalid ? `${dateId}-msg` : undefined}
              className={cn(
                "h-[58px] w-full rounded-button border-2 bg-white px-4 text-base font-semibold text-deep outline-none",
                "shadow-[0_6px_16px_rgba(44,62,80,0.06)] transition-colors",
                dateInvalid ? "border-danger" : "border-line focus:border-aqua",
              )}
            />
            {dateInvalid && (
              <p id={`${dateId}-msg`} className="text-[13px] font-medium text-danger">
                {t.lostSinceFuture}
              </p>
            )}
          </div>
        </div>

        <StepFooter>
          <p aria-live="polite" className="text-center text-[13px] leading-normal text-muted">
            {result.ok ? t.notifyNote : `${t.missing} ${result.errors.map((f) => t.fields[f]).join(", ")}`}
          </p>
          <PrimaryButton type="submit" disabled={!result.ok || submitting}>
            <BellIcon size={20} />
            {submitting ? t.submitting : t.submit}
          </PrimaryButton>
        </StepFooter>
      </form>
    </>
  );
}
