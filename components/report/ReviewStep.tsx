"use client";

import type { ReactNode } from "react";
import { PlateBadge } from "@/components/plate/PlateBadge";
import { PrimaryButton } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { PinIcon } from "@/components/ui/icons";
import { parsePlate } from "@/lib/plate-utils/parse";
import { th } from "@/locales/th";
import type { ReportDraft, StepId } from "./draft";
import { StepFooter } from "./StepFooter";

const t = th.report.review;

type Props = {
  draft: ReportDraft;
  submitting: boolean;
  onEdit: (step: StepId) => void;
  onSubmit: () => void;
};

export function ReviewStep({ draft, submitting, onEdit, onSubmit }: Props) {
  const parsed = parsePlate(draft.plateText);
  if (!parsed.ok || !draft.photo || !draft.position) return null; // guarded by the flow

  return (
    <>
      <div className="px-5 pt-5">
        <GlassCard className="flex flex-col p-4">
          <Row title={t.photo} onEdit={() => onEdit("photo")}>
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob: preview */}
            <img
              src={draft.photo.url}
              alt={th.report.photo.previewAlt}
              className="aspect-[16/10] w-full rounded-[18px] object-cover"
            />
          </Row>
          <Divider />
          <Row title={t.plate} onEdit={() => onEdit("plate")}>
            <div className="flex items-center gap-3.5">
              <PlateBadge plate={parsed.plate} provinceCode={draft.province ?? null} />
              {draft.province === null && (
                <span className="min-w-0 text-sm text-muted">{th.form.provinceUnknown}</span>
              )}
            </div>
          </Row>
          <Divider />
          <Row title={t.position} onEdit={() => onEdit("position")}>
            <p className="text-sm font-semibold text-deep">{th.plate[draft.position]}</p>
          </Row>
          <Divider />
          <Row title={t.location} onEdit={() => onEdit("location")}>
            <p className="flex items-center gap-2.5 text-sm text-deep">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-info-soft text-info-ink">
                <PinIcon size={18} />
              </span>
              {t.locationValue}
            </p>
          </Row>
        </GlassCard>
      </div>

      <StepFooter>
        <PrimaryButton onClick={onSubmit} disabled={submitting} aria-busy={submitting}>
          {submitting ? t.submitting : t.submit}
        </PrimaryButton>
      </StepFooter>
    </>
  );
}

function Row({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[15px] font-semibold text-deep">{title}</h2>
        <button
          type="button"
          onClick={onEdit}
          aria-label={t.editLabel(title)}
          className="-mr-2 min-h-11 cursor-pointer px-2 text-sm font-semibold text-link"
        >
          {t.edit}
        </button>
      </div>
      {children}
    </section>
  );
}

function Divider() {
  return <div className="my-3 h-px bg-line" />;
}
