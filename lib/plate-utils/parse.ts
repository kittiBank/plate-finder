/** Thai plate: optional leading digit + 1–2 Thai consonants + 1–4 digits (CLAUDE.md §5). */
const PLATE_RE = /^([1-9]?)([ก-ฮ]{1,2})([0-9]{1,4})$/;

const THAI_DIGIT_ZERO = 0x0e50; // ๐

export type PlateParts = {
  prefixDigit: string | null;
  letters: string;
  number: string;
};

export type ParsedPlate = PlateParts & {
  /** Search key, e.g. "1กข1234". Stored as `normalized`. */
  normalized: string;
};

export type ParseResult =
  | { ok: true; plate: ParsedPlate }
  | { ok: false; error: "empty" | "invalid_format" };

export function normalizePlate(input: string): string {
  return input
    .normalize("NFC")
    .replace(/[\s\-.​-‍﻿]/g, "")
    .replace(/[๐-๙]/g, (d) => String(d.charCodeAt(0) - THAI_DIGIT_ZERO));
}

export function parsePlate(input: string): ParseResult {
  const normalized = normalizePlate(input);
  if (!normalized) return { ok: false, error: "empty" };

  const m = PLATE_RE.exec(normalized);
  if (!m) return { ok: false, error: "invalid_format" };

  const [, prefixDigit, letters, number] = m;
  return {
    ok: true,
    plate: { prefixDigit: prefixDigit || null, letters, number, normalized },
  };
}

/** Display form, e.g. "1กข 1234". */
export function formatPlate({ prefixDigit, letters, number }: PlateParts): string {
  return `${prefixDigit ?? ""}${letters} ${number}`;
}
