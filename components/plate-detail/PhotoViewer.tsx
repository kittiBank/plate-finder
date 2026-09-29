"use client";

import { useRef } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { CloseIcon, ExpandIcon } from "@/components/ui/icons";
import { th } from "@/locales/th";

const t = th.plateDetail;

type Props = { src: string; alt: string };

/** Photo thumbnail that opens full screen in a native modal <dialog> (focus trap + Escape for free). */
export function PhotoViewer({ src, alt }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label={t.openPhoto}
        className="tap relative block w-full cursor-zoom-in overflow-hidden rounded-[18px] bg-line"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- mock data URL now, signed Storage URL later */}
        <img src={src} alt={alt} className="aspect-[4/3] w-full object-cover" />
        <span className="absolute right-2.5 bottom-2.5 flex size-11 items-center justify-center rounded-[14px] border border-white/35 bg-deep/45 text-white backdrop-blur-md">
          <ExpandIcon size={20} />
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label={alt}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogRef.current?.close(); // backdrop tap
        }}
        className="m-auto max-h-none max-w-none bg-transparent p-4 backdrop:bg-black/85"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
        <img src={src} alt={alt} className="max-h-[80dvh] w-full max-w-[min(100vw-32px,720px)] rounded-2xl object-contain" />
        <form method="dialog" className="mt-4 flex justify-center">
          <IconButton type="submit" label={t.closePhoto} variant="glass-dark" size={52}>
            <CloseIcon size={24} />
          </IconButton>
        </form>
      </dialog>
    </>
  );
}
