"use client";

import { type ChangeEvent, type ReactNode, useState } from "react";
import { PrimaryButton } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowRightIcon, CameraIcon, CheckIcon, ImageIcon, ShieldIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { th } from "@/locales/th";
import { type ReportDraft, validatePhoto } from "./draft";
import { StepFooter } from "./StepFooter";

const t = th.report.photo;

type Props = {
  photo: ReportDraft["photo"];
  onPhoto: (file: File) => void;
  onNext: () => void;
};

export function PhotoStep({ photo, onPhoto, onNext }: Props) {
  const [error, setError] = useState<"notImage" | "tooLarge" | null>(null);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again
    if (!file) return;
    const problem = validatePhoto(file);
    setError(problem);
    if (!problem) onPhoto(file);
  }

  return (
    <>
      <div className="flex flex-col gap-3 px-5 pt-5">
        {photo ? (
          <div className="flex flex-col gap-3 animate-rise">
            {/* Object URL from the user's own file; next/image can't optimise blob: URLs. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={t.previewAlt}
              className="aspect-[4/3] w-full rounded-card border-4 border-white object-cover shadow-card"
            />
            <FilePick onChange={handleFile} variant="outline" icon={<CameraIcon size={20} />}>
              {t.retake}
            </FilePick>
          </div>
        ) : (
          <>
            <FilePick onChange={handleFile} capture variant="hero">
              <span className="flex size-16 items-center justify-center rounded-[20px] bg-cta text-white shadow-cta">
                <CameraIcon size={30} />
              </span>
              <span className="flex flex-col items-center gap-0.5">
                <span className="font-display text-lg font-bold text-deep">{t.take}</span>
                <span className="text-[13px] text-muted">{t.takeSub}</span>
              </span>
            </FilePick>
            <FilePick onChange={handleFile} variant="outline" icon={<ImageIcon size={20} />}>
              {t.choose}
            </FilePick>
          </>
        )}

        {error && (
          <p role="alert" className="text-center text-[13px] font-medium text-danger">
            {t[error]}
          </p>
        )}

        <GlassCard className="flex flex-col gap-2.5 p-4">
          <Tip icon={<CheckIcon size={16} />}>{t.tipClear}</Tip>
          <Tip icon={<UserOffIcon />}>{t.tipPrivacy}</Tip>
          <Tip icon={<ShieldIcon size={16} />}>{t.tipExif}</Tip>
        </GlassCard>
      </div>

      <StepFooter>
        <PrimaryButton onClick={onNext} disabled={!photo}>
          {th.report.next}
          <ArrowRightIcon size={18} />
        </PrimaryButton>
      </StepFooter>
    </>
  );
}

/** A label styled as a button, wrapping a visually hidden file input (so it opens the picker natively). */
function FilePick({
  onChange,
  capture,
  variant,
  icon,
  children,
}: {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  capture?: boolean;
  variant: "hero" | "outline";
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label
      className={cn(
        "tap flex cursor-pointer items-center justify-center gap-2 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-aqua/50",
        variant === "hero"
          ? "h-[210px] flex-col gap-3.5 rounded-card border-2 border-dashed border-[#8fc3e8] bg-white/70"
          : "h-[50px] rounded-button border-2 border-aqua bg-white font-display text-[15.5px] font-semibold text-cta-mid",
      )}
    >
      {icon}
      {children}
      <input
        type="file"
        accept="image/*"
        capture={capture ? "environment" : undefined}
        onChange={onChange}
        className="sr-only"
      />
    </label>
  );
}

function Tip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 text-[13.5px] text-deep">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-[9px] bg-info-soft text-info-ink">
        {icon}
      </span>
      {children}
    </p>
  );
}

function UserOffIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.5 20.5c.8-3.6 4-5.5 7.5-5.5s6.7 1.9 7.5 5.5M3 3l18 18" />
    </svg>
  );
}
