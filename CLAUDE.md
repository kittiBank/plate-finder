# CLAUDE.md — หาทะเบียน (Lost License Plate Finder)

Mobile-first web app (PWA) for Thai flood victims to **report found license plates** and **find their own lost plates**. Owners register a lost plate and get notified the moment someone reports a match.

> Stack below is the recommended default. If you change it, update this file first.

---

## 1. Tech stack

- **Framework:** Next.js (App Router) + TypeScript (strict)
- **Styling:** Tailwind CSS v4. Design tokens live in `app/globals.css` under `@theme` (there is no `tailwind.config.ts`; see §4). No other CSS frameworks.
- **Backend:** Supabase (Postgres, Auth, Storage for photos, Row Level Security)
- **Map:** Leaflet + react-leaflet (tiles: OpenStreetMap; can swap to Longdo Map later)
- **OCR (plate reading):** server-side only, behind `lib/ocr/` interface so the provider can be swapped
- **Notifications:** Web Push (PWA) + SMS provider behind `lib/notify/` interface
- **Testing:** Vitest + Testing Library (unit), Playwright (e2e + screenshots)
- **Package manager:** pnpm

## 2. Commands

```bash
pnpm dev          # start dev server (http://localhost:3000)
pnpm build        # production build
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest
pnpm test:e2e     # playwright
```

Before saying a task is done: run `pnpm lint && pnpm typecheck && pnpm test` and fix all errors.

## 3. Project structure

```
app/
  (tabs)/page.tsx            # Home  — /design/Main.dc.html
  (tabs)/map/page.tsx        # Map   — /design/Map.dc.html
  (tabs)/my-plates/page.tsx  # My Plates — /design/MyPlates.dc.html
  report/                    # "พบป้ายทะเบียนรถ" flow: photo → confirm plate → location → submit
  search/                    # search results
  plates/[id]/               # plate detail
  matches/[id]/              # match detail + contact finder
components/
  ui/                        # GlassCard, PrimaryButton, OutlineButton, Toggle, Chip, BottomNav, IconButton
  plate/PlateBadge.tsx       # Thai plate renderer (see §5)
lib/ (supabase, ocr, notify, plate-utils)
locales/th.ts                # ALL user-facing Thai copy
design/                      # exported .dc.html + screenshots — the visual source of truth
```

## 4. Design system (match /design exactly)

**Always open the matching file in `/design` before building or changing a screen.**

### Colors
| Token | Value | Use |
|---|---|---|
| `aqua` | `#3498db` | hero gradient start, borders on outline buttons |
| `ocean` | `#2573a7` | hero gradient middle |
| `deep` | `#2c3e50` | hero gradient end, main text, active chip bg |
| `cta-from / cta-mid / cta-to` | `#2d9cdb` / `#1a6fc4` / `#134f99` | primary buttons (150deg gradient) |
| `link` | `#2471a3` | links, active nav item |
| `accent` | `#f1c40f` | **sparingly**: "found" states, notification dot |
| `accent-soft` / `accent-ink` | `#fdf2c7` / `#5c4600` | "found / waiting for owner" badges |
| `info-soft` / `info-ink` | `#e3f2fc` / `#1a5f94` | "tracking" badges, icon tiles |
| `bg` | `#ecf0f1` | page background |
| `surface` | `#ffffff` | cards |
| `muted` | `#566573` | secondary text (min for AA on white) |
| `line` | `#e5eaee` | dividers |
| `off` | `#c3ccd3` | toggle off track |

- Hero: `linear-gradient(160deg, #3498db 0%, #2573a7 42%, #2c3e50 100%)`, bottom radius 36px.
- Do **not** use the yellow accent for large surfaces (was tried and rejected as too loud).

### Typography
- Display/headings/plate numbers: **Prompt** (500/600/700)
- Body: **IBM Plex Sans Thai** (400/500/600)
- Sizes: h1 26–28, h2 18, body 14–16, meta 12–13. Inputs ≥16px (prevents iOS zoom).

### Shape, depth, glass
- Radius: plates 8–10, buttons 14–16, cards 20–26, bottom nav 24, chips full.
- Card shadow: `0 10px 26px rgba(44,62,80,0.10)`; primary button: `0 10px 22px rgba(26,111,196,0.32)`.
- Glass on dark hero: `bg-white/16 border-white/35 backdrop-blur-md`.
- Glass on light: `bg-white/72..92 border-white backdrop-blur-xl`.

### Motion
- Enter: fade + rise 14px, `0.55s cubic-bezier(.2,.8,.2,1)`, stagger 60ms.
- Press: `scale(.96)`. Toggles 220ms.
- Respect `prefers-reduced-motion` (disable non-essential animation).

### Layout & UX rules
- Mobile-first, design width 390px; the page must work from 360px wide with no horizontal scroll.
- Floating glass bottom nav, 3 tabs: หน้าแรก / แผนที่ / ป้ายของฉัน. Notifications are the bell in the header, not a tab.
- Primary actions sit in the thumb zone (middle-to-bottom of screen).
- Touch targets ≥ 44×44px. Text contrast ≥ 4.5:1.
- Icons: simple stroke SVGs (1.8–2px), no emoji.

## 5. Thai license plate rules

- Format: optional leading digit + 1–2 Thai consonants + 1–4 digits + province.
  Regex (normalized, no spaces): `^[1-9]?[ก-ฮ]{1,2}[0-9]{1,4}$`
- Store as structured fields: `prefix_digit`, `letters`, `number`, `province_code`, plus `normalized` for search.
- Province: pick from the 77-province list in `lib/plate-utils/provinces.ts`; never free text.
- Position: `front | rear` (ป้ายหน้า / ป้ายหลัง).
- `PlateBadge`: white background, 2px `#1b1b1b` inner border, number in Prompt 700, province on a smaller line.
  Sizes: `sm` 108×56 (19px / 9.5px), `md` 136×70 (24px / 11px). Readability is the top priority.

## 6. Data model (Supabase)

- `profiles` (id, display_name, phone, notify_app, notify_sms, notify_email, auto_match)
- `lost_plates` (id, owner_id, plate fields, position, lost_since, status: `tracking | matched | recovered`)
- `found_reports` (id, finder_id, plate fields, position, photo_path, lat, lng, found_at, ocr_confidence, status: `open | matched | returned`)
- `matches` (id, lost_plate_id, found_report_id, score, status: `pending | verified | closed`)
- `notifications` (id, user_id, type, payload, read_at)

Matching: exact on `normalized` + `province_code` = strong match. Partial matches are only suggestions and are never auto-notified.

### MVP (no auth yet)
- Users are identified by an anonymous device ID (httpOnly cookie). `profiles` is replaced by `devices` until auth lands.
- No finder contact details are shown at all in the MVP; masked contact + ownership proof come with auth.
- All writes go through server actions / route handlers; anon may read only public views (blurred location, no device ID).
- OCR and SMS are post-MVP; MVP uses manual plate entry + in-app/Web Push notifications.

## 7. Privacy & safety (PDPA) — must follow

- Never expose a finder's phone/email to the public. Contact happens only after a verified match, through in-app chat or masked contact.
- An owner must prove ownership (e.g. upload a registration-book photo) before seeing the finder's contact details.
- Show only an approximate location publicly (~200m blur); give the exact pin only to the verified owner.
- Strip EXIF data from uploaded photos. Enforce RLS on every table.
- Rate-limit found reports and searches to stop plate-number scraping.

## 8. Copy

- All UI text is Thai and lives in `locales/th.ts`; don't hard-code strings in components.
- Tone: short, friendly, reassuring (users may be stressed after a flood).

## 9. How to work in this repo

0. The master plan (phases, per-feature steps, progress) is `docs/PLAN.md`. Read it before starting work and update its status when a step is done.
1. Work in small steps. For anything non-trivial, write a short plan first and wait for approval.
2. Build shared UI components before screens; build screens with mock data before wiring the backend.
3. After UI work, take a Playwright screenshot at 390×844 and compare it with `/design`; fix visible differences.
4. Don't add new dependencies without asking.
5. Keep secrets in `.env.local` (never commit). Put an up-to-date `.env.example` in the repo.
6. Write a test for plate parsing/normalization and matching logic before changing them.

@AGENTS.md
