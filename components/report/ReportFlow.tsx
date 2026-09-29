"use client";

import { useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import type { LatLng } from "@/lib/plate-utils/geo";
import { parsePlate } from "@/lib/plate-utils/parse";
import { submitFoundReportMock } from "@/lib/mock/report";
import { th } from "@/locales/th";
import {
  EMPTY_DRAFT,
  firstIncompleteStep,
  isStepDone,
  parseStepParam,
  type ReportDraft,
  STEPS,
  type StepId,
  stepHref,
} from "./draft";
import { LocationStep } from "./LocationStep";
import { PhotoStep } from "./PhotoStep";
import { PlateStep } from "./PlateStep";
import { PositionStep } from "./PositionStep";
import { ReportHeader } from "./ReportHeader";
import { ReportSuccess } from "./ReportSuccess";
import { ReviewStep } from "./ReviewStep";

const t = th.report;

const HEADINGS: Record<StepId, { heading: string; sub: string }> = {
  photo: t.photo,
  plate: t.plate,
  position: t.position,
  location: t.location,
  review: t.review,
};

/**
 * "พบป้ายทะเบียนรถ" stepper. The step lives in `?step=` (pushState) so the phone's Back button walks
 * back through steps; the draft lives in memory, so a step is only shown once earlier ones are filled.
 */
export function ReportFlow({ initialLocation }: { initialLocation: LatLng }) {
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState<ReportDraft>(EMPTY_DRAFT);
  const [status, setStatus] = useState<"editing" | "submitting" | "done">("editing");
  /** Set when "แก้ไข" is tapped on review: finishing that step returns to review. */
  const [editingFrom, setEditingFrom] = useState<StepId | null>(null);

  const requested = parseStepParam(searchParams.get("step"));
  const furthest = firstIncompleteStep(draft);
  const step = STEPS.indexOf(requested) <= STEPS.indexOf(furthest) ? requested : furthest;
  const index = STEPS.indexOf(step);
  const returnsToReview = editingFrom === step;

  // Leaving the step being edited (Back, or returning to review) ends the edit.
  const [prevStep, setPrevStep] = useState(step);
  if (step !== prevStep) {
    setPrevStep(step);
    if (editingFrom && editingFrom !== step) setEditingFrom(null);
  }

  // The draft is always empty on first render (e.g. after a reload), so any ?step= is stale:
  // reset the URL so Back/forward history matches what is on screen.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("step")) {
      window.history.replaceState(null, "", stepHref("photo"));
    }
  }, []);

  function update(patch: Partial<ReportDraft>) {
    setDraft((d) => ({ ...d, ...patch }));
  }

  function next() {
    if (returnsToReview) {
      window.history.back();
    } else {
      window.history.pushState(null, "", stepHref(STEPS[index + 1]));
    }
  }

  function setPhoto(file: File) {
    // Revoked only when replaced: a cleanup effect would also fire on Strict Mode's test unmount.
    if (draft.photo) URL.revokeObjectURL(draft.photo.url);
    update({ photo: { file, url: URL.createObjectURL(file) } });
  }

  async function submit() {
    setStatus("submitting");
    await submitFoundReportMock();
    setStatus("done");
  }

  function reportAnother() {
    if (draft.photo) URL.revokeObjectURL(draft.photo.url);
    setDraft(EMPTY_DRAFT);
    setEditingFrom(null);
    setStatus("editing");
    window.history.replaceState(null, "", stepHref("photo"));
    window.scrollTo(0, 0);
  }

  const parsed = parsePlate(draft.plateText);
  if (status === "done" && parsed.ok && draft.position) {
    return (
      <Shell>
        <ReportSuccess
          plate={parsed.plate}
          provinceCode={draft.province ?? null}
          position={draft.position}
          onReportAnother={reportAnother}
        />
      </Shell>
    );
  }

  const nextLabel = returnsToReview ? t.review.heading : t.next;

  return (
    <Shell>
      <ReportHeader
        {...HEADINGS[step]}
        progress={{ step: index + 1, total: STEPS.length }}
        back={
          index === 0
            ? { href: "/", label: t.exit }
            : { onClick: () => window.history.back(), label: t.back }
        }
      />
      {/* Keyed so each step mounts fresh and rises in. */}
      <div key={step} className="flex grow flex-col animate-rise stagger-1">
        {step === "photo" && <PhotoStep photo={draft.photo} onPhoto={setPhoto} onNext={next} />}
        {step === "plate" && (
          <PlateStep
            draft={draft}
            onChange={update}
            canContinue={isStepDone("plate", draft)}
            nextLabel={nextLabel}
            onNext={next}
          />
        )}
        {step === "position" && (
          <PositionStep
            position={draft.position}
            onChange={(position) => update({ position })}
            nextLabel={nextLabel}
            onNext={next}
          />
        )}
        {step === "location" && (
          <LocationStep
            start={draft.location ?? initialLocation}
            nextLabel={nextLabel}
            onNext={(location) => {
              update({ location });
              next();
            }}
          />
        )}
        {step === "review" && (
          <ReviewStep
            draft={draft}
            submitting={status === "submitting"}
            onEdit={(s) => {
              setEditingFrom(s);
              window.history.pushState(null, "", stepHref(s));
            }}
            onSubmit={submit}
          />
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col">{children}</main>;
}
