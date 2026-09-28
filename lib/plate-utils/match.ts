export type MatchablePlate = {
  normalized: string;
  /** `null` when the finder could not read the province. */
  provinceCode: string | null;
};

export type MatchResult =
  | { kind: "strong"; score: 1 }
  | { kind: "partial"; score: number }
  | { kind: "none"; score: 0 };

/** Plates shorter than this are too ambiguous to fuzzy-match (e.g. "กข1" vs "กข2"). */
const MIN_FUZZY_LENGTH = 4;

const SCORE_OTHER_PROVINCE = 0.7;
const SCORE_ONE_CHAR_OFF = 0.5;

/**
 * Strong = same plate and province (auto-notify).
 * Partial = suggestion only: same plate with a different/unknown province,
 * or one character off in the same (or unknown) province.
 */
export function scoreMatch(lost: MatchablePlate, found: MatchablePlate): MatchResult {
  const sameProvince =
    lost.provinceCode !== null && lost.provinceCode === found.provinceCode;
  const provinceCompatible =
    sameProvince || lost.provinceCode === null || found.provinceCode === null;

  if (lost.normalized === found.normalized) {
    return sameProvince
      ? { kind: "strong", score: 1 }
      : { kind: "partial", score: SCORE_OTHER_PROVINCE };
  }

  if (
    provinceCompatible &&
    Math.min(lost.normalized.length, found.normalized.length) >= MIN_FUZZY_LENGTH &&
    isOneEditApart(lost.normalized, found.normalized)
  ) {
    return { kind: "partial", score: SCORE_ONE_CHAR_OFF };
  }

  return { kind: "none", score: 0 };
}

/** Only strong matches notify the owner; partial matches are shown as suggestions. */
export function shouldAutoNotify(result: MatchResult): boolean {
  return result.kind === "strong";
}

/** True when exactly one substitution, insertion or deletion turns `a` into `b`. */
function isOneEditApart(a: string, b: string): boolean {
  if (a === b || Math.abs(a.length - b.length) > 1) return false;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];

  let i = 0;
  while (i < short.length && short[i] === long[i]) i++;
  // Skip the differing char in `long`, and in `short` too if lengths are equal.
  const rest = short.length === long.length ? i + 1 : i;
  return short.slice(rest) === long.slice(i + 1);
}
