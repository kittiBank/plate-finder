import type { ProvinceValue } from "@/components/form/ProvincePicker";
import type { LatLng } from "@/lib/plate-utils/geo";
import { parsePlate } from "@/lib/plate-utils/parse";
import type { PlatePosition } from "@/lib/types";

// State and step rules for the "report a found plate" flow. Pure so it can be tested without React.

export const STEPS = ["photo", "plate", "position", "location", "review"] as const;
export type StepId = (typeof STEPS)[number];

export type ReportDraft = {
  /** `url` is an object URL for previews; the owner of the draft revokes it when replacing the photo. */
  photo: { file: File; url: string } | null;
  plateText: string;
  province: ProvinceValue;
  position: PlatePosition | null;
  location: LatLng | null;
};

export const EMPTY_DRAFT: ReportDraft = {
  photo: null,
  plateText: "",
  province: undefined,
  position: null,
  location: null,
};

const DONE: Record<Exclude<StepId, "review">, (d: ReportDraft) => boolean> = {
  photo: (d) => d.photo !== null,
  plate: (d) => parsePlate(d.plateText).ok && d.province !== undefined,
  position: (d) => d.position !== null,
  location: (d) => d.location !== null,
};

export function isStepDone(step: Exclude<StepId, "review">, draft: ReportDraft): boolean {
  return DONE[step](draft);
}

/** The furthest step the user may be on: after a reload the photo is gone, so they restart there. */
export function firstIncompleteStep(draft: ReportDraft): StepId {
  return STEPS.find((s) => s !== "review" && !DONE[s](draft)) ?? "review";
}

export function parseStepParam(param: string | null): StepId {
  return STEPS.find((s) => s === param) ?? "photo";
}

export function stepHref(step: StepId): string {
  return step === "photo" ? "/report" : `/report?step=${step}`;
}

const MAX_PHOTO_BYTES = 15 * 1024 * 1024;

export function validatePhoto(file: File): "notImage" | "tooLarge" | null {
  if (!file.type.startsWith("image/")) return "notImage";
  if (file.size > MAX_PHOTO_BYTES) return "tooLarge";
  return null;
}
