# Master Plan: หาทะเบียน (Lost License Plate Finder)

## Context
The repo is a fresh Next.js 16 + Tailwind 4 + Supabase scaffold. Dependencies are installed and lint, typecheck and test pass, but no feature code exists yet. The goal is a mobile-first PWA where flood victims **report found plates** and **register lost plates**, and owners get notified when a report matches.

This plan sets the phases and the per-feature plans we will build together. Each feature ends with its own review before the next one starts (CLAUDE.md §9: small steps, UI with mock data first, then wire the backend).

### Decisions made
- **Screens without a design** (report flow, search, detail, add-plate, notifications): Claude designs them from the existing design system. You review each one from a 390×844 screenshot.
- **No auth in MVP.** Users are identified by an anonymous **device ID** (httpOnly cookie). Auth is added after MVP.
- **Supabase: local** with the Supabase CLI (Docker). SQL migrations live in the repo.
- **OCR and SMS come after MVP**, behind the `lib/ocr` and `lib/notify` interfaces. The MVP uses manual plate entry, in-app notifications and Web Push.

### Findings from reading the repo and designs
- There is **no `tailwind.config.ts`**, because Tailwind v4 is config-less. Design tokens go into `app/globals.css` under `@theme`. We update CLAUDE.md §1/§4 to say so.
- `AGENTS.md` says Next 16 has breaking changes, so we read `node_modules/next/dist/docs/` before using routing, server actions, metadata, fonts and the PWA manifest.
- `app/layout.tsx` and `page.tsx` are still the create-next-app template (Geist fonts, `lang="en"`).
- Patterns repeated across the designs become shared components:
  - glass header buttons (bell with a yellow dot, avatar)
  - hero gradient with glow and wave SVG
  - PlateBadge (`md` is 136×70; the map uses a tiny 14px variant, so we add an `xs` size)
  - status badges (tracking / waiting for owner / found)
  - Toggle (50×30 in settings, 48×28 in the Home card)
  - Chip (filters)
  - primary, outline and dashed "add" buttons
  - glass BottomNav
  - bottom sheet
  - card
- Motion classes in the designs: rise with stagger, tap scale, float glow, pulse-dot, shine, map pin drop and pulse.
- Content not covered by CLAUDE.md: the plate card shows vehicle type ("รถเก๋ง"). We add `vehicle_type` as an optional field.

### Privacy without auth (MVP rules)
- Do not show finder contact details at all in the MVP. The owner only sees "มีคนพบป้ายของคุณ", the approximate location and the photo. Masked contact and ownership proof come with auth.
- Every write goes through server actions or route handlers using the service role. RLS is enabled on all tables with anon **read access only to public views**: blurred lat/lng, no device_id.
- Rate-limit reports and searches per device ID and IP (a Postgres counter table).
- Strip EXIF on the server before upload. This needs an image library (see Dependencies).

---

## Phases

### Phase 0: Foundation (no features) · status: steps 1–4 done, step 5 (Supabase) deferred to Phase 5
1. Clean the template: `layout.tsx` gets `lang="th"`, Prompt and IBM Plex Sans Thai via `next/font/google`, and Thai metadata. Remove the starter SVGs.
2. Add design tokens to `app/globals.css` `@theme`: colors, radii, shadows, font families. Add the motion keyframes and utilities, with a `prefers-reduced-motion` guard.
3. Create `locales/th.ts` with a typed copy object.
4. Update CLAUDE.md: note that tokens live in globals.css and describe the device-ID MVP.
5. Supabase local setup: `supabase init`, `.env.example` for local keys, and `lib/supabase/{server,client}.ts`.
- **Check:** lint, typecheck and tests pass, and the page renders the Thai fonts.

### Phase 1: Plate domain logic (test-first, pure TS) · status: done
`lib/plate-utils/`:
- `provinces.ts`: the 77 provinces with code, Thai name and English name.
- `parse.ts`: `normalizePlate(input)` strips spaces, dashes and zero-width characters and converts Thai digits ๐–๙ to 0–9. `parsePlate()` returns `{prefix_digit, letters, number}` or an error, and validates against the regex `^[1-9]?[ก-ฮ]{1,2}[0-9]{1,4}$`. `formatPlate()` produces "1กข 1234".
- `match.ts`: `scoreMatch(lost, found)` returns strong (normalized and province equal) or partial (same normalized value but a different or unknown province, or one character off). Partial matches are only suggestions.
- `geo.ts`: `blurLocation(lat, lng)` snaps to a grid of roughly 200 m, and `distanceKm()`.
- Tests are written first, with Thai edge cases.

### Phase 2: Shared UI components (mock data, no backend) · status: done (gallery at /dev/components)
`components/ui/`: GlassCard, PrimaryButton, OutlineButton, DashedAddButton, IconButton, Toggle, Chip, StatusBadge, BottomNav (uses `usePathname` to show the active tab), HeroHeader, BottomSheet, BellButton.
`components/plate/PlateBadge.tsx` with sizes xs, sm and md.
- A `/dev/components` gallery page (dev only) for visual checks.
- Unit tests for Toggle a11y (`role=switch`), PlateBadge formatting and BottomNav `aria-current`.

### Phase 3: Designed screens with mock data · status: done (clusters: own grid clustering, no new dependency)
Each screen: build it, take a Playwright screenshot at 390×844, compare it with the matching `/design` file and fix differences.
1. **Home** `app/(tabs)/page.tsx`: hero, search (submits to `/search?q=`), 2 big actions, the My Plates preview card and the notify toggle.
2. **My Plates** `app/(tabs)/my-plates/page.tsx`: summary chips, found card (yellow), tracking card, add-plate, notification settings (4 toggles).
3. **Map** `app/(tabs)/map/page.tsx`: react-leaflet with OSM tiles, loaded client-only with `dynamic(ssr:false)`. Includes cluster pins, the selected-plate pin, the you-are-here marker, filter chips, the bottom sheet and map controls. The design's clusters may need a marker-cluster plugin; we ask before adding it and can do simple grid clustering ourselves instead.
- A shared `(tabs)/layout.tsx` holds the BottomNav.

### Phase 4: New screens designed by Claude (mock data) · status: form pieces, 4.1 report flow, 4.2 search done; next: 4.3 plate detail
Each screen gets a screenshot for your review before we continue.
1. **Report flow** `/report` (done: 5-step stepper photo → plate → position → location → review with `?step=` history, mock submit): steps are photo (camera/file input), then confirm plate (a plate input plus a province picker with search), then position front/rear, then location (map pin plus "use my location"), then submit and a success screen.
2. **Search results** `/search` (done: `lib/plate-utils/search.ts` parses "plate + province" in either order or a number alone ("1234" → every plate with that number, plus near numbers such as 1284/1324), exact vs. similar sections, a no-results CTA to `/my-plates/new?plate=&province=`, and province-only queries get a hint instead of a list): normalized query with strong and partial results.
3. **Plate detail** `/plates/[id]`: a found report with photo, approximate map and status.
4. **Add lost plate** `/my-plates/new`: plate input, province, position, lost-since date.
5. **Match detail** `/matches/[id]`: the owner view. The MVP shows no contact details, only an "ติดต่อผู้พบ (เร็วๆ นี้)" placeholder.
6. **Notifications** sheet or page, opened from the bell.
- Shared form pieces (built first): `PlateInput` (live parse and validation) and `ProvincePicker` (a searchable list in a native `<dialog>` sheet, no free text; `allowUnknown` for finders).
- Decisions: the report photo is **required**; the report flow is a **stepper** (one question per screen).

### Phase 5: Backend (Supabase local)
1. Migrations in `supabase/migrations/`: `devices` (a stand-in for profiles in the MVP: id plus notification prefs), `lost_plates`, `found_reports`, `matches`, `notifications`, `push_subscriptions` and `rate_limits`. Add enums, indexes on `(normalized, province_code)`, RLS on everything, and a public view `found_reports_public` with blurred coordinates.
2. A Storage bucket `found-photos` that is private, served through signed URLs.
3. Device-ID middleware/proxy (check the Next 16 docs for its name) that sets the cookie.
4. Server actions: `createFoundReport`, `createLostPlate`, `updateLostPlate`, `searchPlates`, `listMyPlates`, `updateNotifyPrefs`, `listMapReports(bbox, filters)`.
5. Matching: when a found report or lost plate is inserted, run `scoreMatch` server-side and insert `matches`. For a strong match, also insert `notifications` and send a push.
6. EXIF stripping and resizing in the upload action.
7. Rate limiting in the actions.
8. Seed script with demo data.
- Integration tests against local Supabase for matching and RLS (anon cannot read `device_id` or exact lat/lng).

### Phase 6: PWA + notifications
- `app/manifest.ts`, icons and a service worker for push (Next 16 docs have a PWA guide).
- Web Push via VAPID in `lib/notify/` behind a `Notifier` interface: implement `WebPushNotifier` and `InAppNotifier`, leaving SMS as a stub.
- The bell dot is driven by unread `notifications`.

### Phase 7: Hardening and MVP release
- Playwright e2e for the full journey: add a lost plate on device A, report the found plate on device B, device A gets a notification and sees the match.
- Accessibility pass (contrast, 44px targets, 360px width, reduced motion).
- Loading, empty and error states in Thai.
- Deploy target decision (Vercel plus Supabase cloud).

### Post-MVP (separate plans later)
Auth (a phone OTP or anonymous-upgrade decision, linking device data to the account), ownership proof upload, masked contact and in-app chat, exact pin for the verified owner, OCR provider in `lib/ocr`, SMS provider in `lib/notify`, email digest, and the "auto-match from photo" toggle wired to OCR.

---

## Dependencies to approve when we reach them (CLAUDE.md §9.4)
| Phase | Package | Why |
|---|---|---|
| 0 | `supabase` (dev, CLI) | local DB and migrations |
| 5 | `sharp` | EXIF strip and resize. It is currently blocked in `pnpm-workspace.yaml` `allowBuilds`, so the setting needs to change |
| 5 | `zod` (optional) | validating server action input |
| 6 | `web-push` | sending VAPID push |
| 3 | `react-leaflet-cluster` (optional) | map clusters |

## Critical files
- `app/globals.css` (tokens), `app/layout.tsx`, `app/(tabs)/layout.tsx`
- `lib/plate-utils/{provinces,parse,match,geo}.ts` and their tests
- `components/ui/*`, `components/plate/PlateBadge.tsx`
- `locales/th.ts`
- `supabase/migrations/*.sql`, `lib/supabase/*`, `lib/notify/*`, `lib/ocr/*` (interface only)

## Verification (every step)
- `pnpm lint && pnpm typecheck && pnpm test`
- UI steps: a Playwright screenshot at 390×844 (and 360 wide) compared with `/design` or reviewed by you
- Backend steps: integration tests against `supabase start`, plus RLS checks as anon
- End of MVP: the two-device e2e journey passes

## How we work together
We take one numbered step at a time. Claude implements it, runs the checks and shows a screenshot or test output. You review, and we commit before moving on. **The first step after approval is Phase 0.**
