import { type MatchablePlate, scoreMatch } from "./match";
import { normalizePlate, type ParsedPlate, parsePlate } from "./parse";
import { PROVINCES } from "./provinces";

export type SearchQuery =
  | { kind: "empty" }
  | { kind: "invalid" }
  /** Only a province was typed. We don't list a whole province (anti-scraping, CLAUDE.md §7). */
  | { kind: "province_only"; provinceCode: string }
  | {
      kind: "plate";
      plate: ParsedPlate;
      provinceCode: string | null;
      /** Province text we couldn't resolve to exactly one province; the search ignores it. */
      unknownProvince: string | null;
    }
  /** Just the plate number ("1234"), for owners who don't remember the letters. */
  | { kind: "number"; number: string; provinceCode: string | null };

const ALIASES: Record<string, string> = { กทม: "10", bkk: "10" };
const MIN_PREFIX = 2;
const NUMBER_RE = /^[0-9]{1,4}$/;

type ResolvedProvince = { code: string; exact: boolean };

/** "กรุงเทพมหานคร"/"กทม" (exact), "กรุงเทพ" (unique prefix). Ambiguous ("นคร") or unknown → null. */
function resolveProvince(text: string): ResolvedProvince | null {
  const q = text.replace(/ฯ/g, "").toLowerCase();
  if (!q || /[0-9]/.test(q)) return null;
  if (ALIASES[q]) return { code: ALIASES[q], exact: true };

  const en = (name: string) => name.replace(/\s/g, "").toLowerCase();
  const exact = PROVINCES.find((p) => p.nameTh === q || en(p.nameEn) === q);
  if (exact) return { code: exact.code, exact: true };

  if (q.length < MIN_PREFIX) return null;
  const starts = PROVINCES.filter((p) => p.nameTh.startsWith(q) || en(p.nameEn).startsWith(q));
  return starts.length === 1 ? { code: starts[0].code, exact: false } : null;
}

/**
 * Reads what people type in the search box: a plate or just its number, with an
 * optional province before or after it, e.g. "1กข 1234 กรุงเทพ", "นนทบุรี 2ขข 4567", "1234 กทม".
 */
export function parseSearchQuery(input: string | undefined): SearchQuery {
  // Drop "จังหวัด" / "จ." before normalizing, since normalizing removes the dot.
  const s = normalizePlate((input ?? "").replace(/จังหวัด|จ\./g, " "));
  if (!s) return { kind: "empty" };

  const whole = parsePlate(s);
  if (whole.ok) return { kind: "plate", plate: whole.plate, provinceCode: null, unknownProvince: null };
  if (NUMBER_RE.test(s)) return { kind: "number", number: s, provinceCode: null };

  // Try every split into plate/number + province text and keep the most convincing one:
  // exact province name > unique prefix > unknown text; a plate beats a bare number on ties.
  let best: { query: SearchQuery; rank: number } | null = null;
  const consider = (query: SearchQuery, rank: number) => {
    if (!best || rank > best.rank) best = { query, rank };
  };

  for (let i = 1; i < s.length; i++) {
    for (const [code, text] of [
      [s.slice(0, i), s.slice(i)],
      [s.slice(i), s.slice(0, i)],
    ]) {
      const province = resolveProvince(text);
      const provinceRank = province ? (province.exact ? 4 : 2) : 0;
      const plate = parsePlate(code);
      if (plate.ok && !/[0-9]/.test(text)) {
        if (province) {
          consider({ kind: "plate", plate: plate.plate, provinceCode: province.code, unknownProvince: null }, provinceRank + 1);
        } else if (text.length > MIN_PREFIX) {
          // A stray char or two ("กขค 12" → "ก" + "ขค12") is a typo, not a province.
          consider({ kind: "plate", plate: plate.plate, provinceCode: null, unknownProvince: text }, 1);
        }
      }
      // A bare number needs a real province next to it; "1234 ปารีส" is too unclear to guess.
      if (NUMBER_RE.test(code) && province) {
        consider({ kind: "number", number: code, provinceCode: province.code }, provinceRank);
      }
    }
  }
  if (best) return (best as { query: SearchQuery }).query;

  const province = resolveProvince(s);
  return province ? { kind: "province_only", provinceCode: province.code } : { kind: "invalid" };
}

const MIN_NEAR_NUMBER = 3;

/**
 * True when two plate numbers differ by one digit changed, added, removed or two
 * neighbours swapped (1234 ~ 1284, 1324, 234). Numbers under 3 digits are never "near".
 */
export function isNearNumber(a: string, b: string): boolean {
  if (a === b || Math.min(a.length, b.length) < MIN_NEAR_NUMBER || Math.abs(a.length - b.length) > 1) {
    return false;
  }
  let i = 0;
  while (a[i] === b[i]) i++;
  if (a.length === b.length) {
    const swapped = a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2);
    return swapped || a.slice(i + 1) === b.slice(i + 1);
  }
  const [short, long] = a.length < b.length ? [a, b] : [b, a];
  return short.slice(i) === long.slice(i + 1);
}

export type Searchable = MatchablePlate & { id: string; number: string; foundAt: string };

export type SimilarReason = "other_province" | "unknown_province" | "one_char_off" | "near_number";

export type SearchResults<T extends Searchable> = {
  /** What the user asked for: same plate (or number), in the same province when one was given. */
  exact: { item: T }[];
  /** Suggestions only, like partial matches (CLAUDE.md §6). */
  similar: { item: T; reason: SimilarReason; score: number }[];
};

const SCORE_SAME_NUMBER_OTHER_PROVINCE = 0.7;
const SCORE_NEAR_NUMBER = 0.5;

const newestFirst = (a: { item: Searchable }, b: { item: Searchable }) =>
  b.item.foundAt.localeCompare(a.item.foundAt);

function sorted<T extends Searchable>(results: SearchResults<T>): SearchResults<T> {
  results.exact.sort(newestFirst);
  results.similar.sort((a, b) => b.score - a.score || newestFirst(a, b));
  return results;
}

/** The same number in a different province: say whether it differs or the finder couldn't read it. */
const provinceReason = (item: Searchable): SimilarReason =>
  item.provinceCode === null ? "unknown_province" : "other_province";

export function searchPlates<T extends Searchable>(query: MatchablePlate, items: T[]): SearchResults<T> {
  const results: SearchResults<T> = { exact: [], similar: [] };

  for (const item of items) {
    const samePlate = item.normalized === query.normalized;
    // Without a province in the query, any report of the same plate is what the user asked for.
    if (samePlate && (query.provinceCode === null || query.provinceCode === item.provinceCode)) {
      results.exact.push({ item });
      continue;
    }
    const result = scoreMatch(query, item);
    if (result.kind === "none") continue;
    results.similar.push({ item, reason: samePlate ? provinceReason(item) : "one_char_off", score: result.score });
  }
  return sorted(results);
}

/** Number-only search: every plate with that number, plus plates whose number is one slip away. */
export function searchByNumber<T extends Searchable>(
  query: { number: string; provinceCode: string | null },
  items: T[],
): SearchResults<T> {
  const results: SearchResults<T> = { exact: [], similar: [] };

  for (const item of items) {
    const provinceMatches = query.provinceCode === null || query.provinceCode === item.provinceCode;
    const provinceCompatible = provinceMatches || item.provinceCode === null;

    if (item.number === query.number) {
      if (provinceMatches) results.exact.push({ item });
      else results.similar.push({ item, reason: provinceReason(item), score: SCORE_SAME_NUMBER_OTHER_PROVINCE });
    } else if (provinceCompatible && isNearNumber(query.number, item.number)) {
      results.similar.push({ item, reason: "near_number", score: SCORE_NEAR_NUMBER });
    }
  }
  return sorted(results);
}
