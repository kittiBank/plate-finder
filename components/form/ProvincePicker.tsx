"use client";

import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { IconButton } from "@/components/ui/IconButton";
import { CheckIcon, ChevronDownIcon, CloseIcon, SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { getProvince, searchProvinces } from "@/lib/plate-utils/provinces";
import { th } from "@/locales/th";

/** A province code, `null` for "unknown province" (finders only), or `undefined` when not picked yet. */
export type ProvinceValue = string | null | undefined;

type Props = {
  value: ProvinceValue;
  onChange: (value: string | null) => void;
  /** Offer "ไม่ทราบจังหวัด" — for finders whose plate is damaged. Owners must pick a province. */
  allowUnknown?: boolean;
  className?: string;
};

const t = th.form;

/** Province field: opens a searchable bottom-sheet list. No free text (CLAUDE.md §5). */
export function ProvincePicker({ value, onChange, allowUnknown = false, className }: Props) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const display =
    value === undefined ? t.provincePlaceholder : value === null ? t.provinceUnknown : getProvince(value)?.nameTh;

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span id={`${id}-label`} className="text-sm font-semibold text-deep">
        {t.provinceLabel}
      </span>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => setOpen(true)}
        className={cn(
          "tap flex h-[58px] cursor-pointer items-center justify-between gap-2 rounded-button border-2 border-line bg-white px-4 text-left",
          "shadow-[0_6px_16px_rgba(44,62,80,0.06)] outline-none focus-visible:border-aqua",
        )}
      >
        <span
          id={`${id}-value`}
          className={cn("truncate text-base", value === undefined ? "text-[#8a97a3]" : "font-semibold text-deep")}
        >
          {display}
        </span>
        <ChevronDownIcon size={20} className="shrink-0 text-link" />
      </button>

      {open && (
        <ProvinceSheet
          value={value}
          allowUnknown={allowUnknown}
          onPick={(v) => {
            onChange(v);
            close();
          }}
          onClose={close}
        />
      )}
    </div>
  );
}

function ProvinceSheet({
  value,
  allowUnknown,
  onPick,
  onClose,
}: {
  value: ProvinceValue;
  allowUnknown: boolean;
  onPick: (value: string | null) => void;
  onClose: () => void;
}) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const results = searchProvinces(query);
  const showUnknown = allowUnknown && !query.trim();

  // Native modal dialog: focus trap, Escape and inert page for free. Search is focused after
  // showModal() because React's autoFocus runs while the dialog is still hidden.
  useEffect(() => {
    dialogRef.current?.showModal();
    searchRef.current?.focus();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`${id}-title`}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // backdrop tap
      }}
      className={cn(
        "fixed inset-x-0 top-auto bottom-0 m-0 mx-auto h-[82dvh] max-h-none w-full max-w-md border-0 bg-transparent p-0 text-deep",
        "backdrop:bg-deep/45 animate-sheet",
      )}
    >
      <BottomSheet solid className="h-full pb-[max(16px,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between pl-1">
          <h2 id={`${id}-title`} className="font-display text-lg font-semibold">
            {t.provinceLabel}
          </h2>
          <IconButton label={t.close} variant="ghost" onClick={onClose}>
            <CloseIcon size={22} />
          </IconButton>
        </div>

        <label className="flex h-12 shrink-0 items-center gap-2.5 rounded-[14px] bg-bg px-3.5">
          <SearchIcon size={20} className="shrink-0 text-link" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.provinceSearch}
            aria-label={t.provinceSearch}
            autoComplete="off"
            enterKeyHint="search"
            className="min-w-0 grow bg-transparent text-base text-deep outline-none placeholder:text-[#5d6d7e]"
          />
        </label>

        <ul
          role="listbox"
          aria-label={t.provinceLabel}
          className="-mx-1 flex min-h-0 grow flex-col gap-0.5 overflow-y-auto overscroll-contain px-1 pb-2"
        >
          {showUnknown && (
            <li role="presentation" className="mb-1.5 border-b border-line pb-1.5">
              <Option selected={value === null} onClick={() => onPick(null)}>
                <span className="flex flex-col">
                  <span>{t.provinceUnknown}</span>
                  <span className="text-xs font-normal text-muted">{t.provinceUnknownSub}</span>
                </span>
              </Option>
            </li>
          )}
          {results.map((p) => (
            <li key={p.code} role="presentation">
              <Option selected={value === p.code} onClick={() => onPick(p.code)}>
                {p.nameTh}
              </Option>
            </li>
          ))}
          {results.length === 0 && (
            <li role="presentation" className="py-8 text-center text-sm text-muted">
              {t.provinceNoResults(query.trim())}
            </li>
          )}
        </ul>
      </BottomSheet>
    </dialog>
  );
}

function Option({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        "flex min-h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-base",
        selected ? "bg-info-soft font-semibold text-info-ink" : "text-deep hover:bg-bg focus-visible:bg-bg",
      )}
    >
      {children}
      {selected && <CheckIcon size={20} className="shrink-0" />}
    </button>
  );
}
