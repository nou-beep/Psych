# Psych ✦ — Clinical Psychology Workspace

A vibrant, whimsical, and professional workspace for psychology students, interns, therapists, researchers, and supervisors.

---

## What is Psych?

Psych is a **Next.js web application** built for clinical psychology work. It helps you manage:

- Clinical cases, internship cases, child follow-ups, and adult cases
- Autism internship tracking
- Supervision notes and reflections
- Research participant summaries and qualitative memos
- Assessments and scoring grids
- Printable clinical grids (8 templates)
- Reports: daily, weekly, monthly, one-page, two-page, assessment grid, and final long report structure

Psych is designed to be beautiful and calming — soft pink gradients, rounded cards, sparkle accents — while staying professional enough for university internship submissions and supervisor review.

---

## Running Locally

### Prerequisites

You need [Node.js](https://nodejs.org/) (version 18 or above) installed on your computer.

### Steps

```bash
# 1. Navigate to the project folder
cd psych

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for production

```bash
npm run build
npm run start
```

---

## Testing

Tests are written with [Vitest](https://vitest.dev/) and
[React Testing Library](https://testing-library.com/), running in a `jsdom`
environment.

```bash
# Run the full test suite once
npm run test

# Re-run tests on file changes
npm run test:watch

# Type-check the modules covered by tests (lib/, contexts/, test/)
npm run typecheck
```

Test files live under `test/` and mirror the source layout — e.g.
`lib/store.ts` is tested by `test/lib/store.test.ts`, and
`contexts/AppContext.tsx` case reducers by
`test/contexts/AppContext.cases.test.tsx`.

`test/setup.ts` clears `localStorage` between tests so each spec starts
from a known baseline. Vitest is configured in `vitest.config.ts` with
the `@/*` path alias mirrored from `tsconfig.json`.

### Typecheck scope

`npm run typecheck` uses a dedicated `tsconfig.typecheck.json` that
covers the modules we have under test (`lib/`, `contexts/`, `test/`).
The broader app code is still type-checked at editor time via
`tsconfig.json`, but isn't part of the CI gate yet (the repo has
pre-existing `tsc` and ESLint errors that `next build` already
ignores via `next.config.mjs`). Expand the include list as more
modules are cleaned up and covered.

### CI

`.github/workflows/ci.yml` runs `lint`, `typecheck`, and `test` on push
and pull request to `master`. `lint` is currently non-blocking until
the pre-existing lint errors are cleaned up.

---

## Dual-portal architecture

Psych is split into two distinct ecosystems that share the same local
data layer but feel intentionally different.

```
                       /  (entry gateway)
                       │
              ┌────────┴────────┐
              ▼                 ▼
   /login/therapist     /login/client
              │                 │
              ▼                 ▼
   /therapist + /cases,  /client + /client/*
   /clinical, /reports,
   /thesis, /supervision …
```

- **Gateway** at `/` — full-screen split-entry. The app NEVER auto-opens
  the therapist dashboard; the user always chooses a portal.
- **Therapist portal** — workspace, cases, clinical tools, reports,
  research. Lives at `/therapist` (dashboard) plus all the existing
  routes (`/cases`, `/clinical/*`, `/reports/*`, …). Higher information
  density, advanced tools, supervision and research surfaces.
- **Client portal** — quieter companion for between-session work.
  Therapist-guided, lower cognitive load, simpler navigation.
- **Mock auth** — `/login/therapist` and `/login/client` accept any
  credentials. The session lives in `localStorage` under
  `psych-session-v1`. `RequireAuth` (a client-side guard wrapping the
  app) bounces unauthenticated users to the right login screen.
  `lib/auth.ts` exports `homePathFor`, `loginPathFor`, `isPublicRoute`,
  `portalForRoute`.

### Client portal philosophy

The portal is now a **clinically grounded therapeutic companion**, not a
fantasy healing world. Decorative emotional mechanics are de-emphasised
in favour of:

- Structured reflections (post-session, things forgot to say, emotional
  reactions, questions for next session)
- Daily symptom check-ins across six domains (anxiety, mood, sleep,
  emotional regulation, dissociation, stress) plus homework completion
- Therapist-assigned workbooks, assessments, and resources
- Psychoeducation viewer with reading-level variants
- Grounding / stabilization tools

The simplified client navigation has nine items only: **Home, Workbooks,
Reflections, Assessments, Progress, Resources, Grounding, Therapist
notes, Settings**. Legacy client routes (cards, journeys, comfort,
audio, safe-people, the "I can't explain it" canvas) still exist for
users who want them but are no longer in the primary nav.

### Therapist ↔ client workflow

The therapist case detail has a **Client portal ✦** tab where the
clinician assigns:

- Workbooks → appear on the client's home and `/client/workbooks`
- Assessments → appear on `/client/assessments`
- Therapeutic cards / paths → appear on `/client/notes` and `/client/resources`
- Supportive notes → surface on the client home as "From your therapist"

Assignments use a shared `localStorage` key — no real backend yet. The
shape models a future real-time sync.

### Appearance + terminology in Settings

Theme controls have moved out of the top header into **Settings →
Appearance** for a more professional feel. Settings also now hosts a
**Client terminology** toggle (Client / Patient / Participant) for
clinicians who use different language for the people they work with.

---

## Clinical-scientific toolkit

A new clinical hub at `/clinical` brings together evidence-informed
clinical workflows. All scoring and structured data lives in pure-logic
libraries (`lib/clinical/*`) with unit tests. The hub is also linked
from the sidebar as **Clinical tools ✦**.

| Route | Module |
|---|---|
| `/clinical` | Hub linking every tool below |
| `/assessments/library` | Standardised assessment engine — PHQ-9, GAD-7, DASS-21 fully scoreable; BDI-II, STAI-Y2, CDS-29, DES-II, PCL-5, AQ-50, RAADS-R as placeholder shells. Live preview with severity bands, missing-item detection, item-9 risk flags, longitudinal table |
| `/clinical/interview` | 5 structured interview templates (general intake, follow-up, anxiety-focused, dissociation-focused, neurodevelopmental). Comparable across sessions |
| `/clinical/mse` | Mental Status Examination — 16 domains with descriptor chips, free-text observations, formal report narrative builder, cross-session comparison |
| `/clinical/longitudinal` | Symptom evolution charts with intervention / session overlays and period-vs-period comparison (improved / stable / worsened) |
| `/clinical/hypothesis` | Structured clinical reasoning — evidence for/against, status (exploring / supported / unsupported / needs further assessment / discussed in supervision), confidence, differentials. Explicitly **not** diagnosis automation |
| `/clinical/interventions` | Evidence-informed intervention library across CBT, ACT, DBT, exposure, grounding, trauma stabilization, sensory regulation, and more. Indications, contraindications, evidence-level labels, linked workbooks |
| `/clinical/disorders` | DSM-5-TR / ICD-11 navigation layer. **No copyrighted criterion text** — placeholder code fields, associated features, differentials, specifiers, cultural considerations, and links to assessments / interventions / workbooks in this app |
| `/clinical/psychoeducation` | Soft handouts across 4 reading levels (clinician, adolescent-friendly, parent guidance, minimalist academic) |
| `/clinical/phrases` | Trilingual (EN/FR/AR) phrase library with category filters and copy-to-clipboard |
| `/clinical/search` | Cross-domain search across cases, sessions, check-ins, weekly/monthly reviews, assessments, interventions, workbooks, terminology, transcripts, reflections, supervision, hypotheses, MSE entries, thesis notes, and disorders |

### Pure-logic libraries

- `lib/clinical/assessments.ts` — instrument definitions, scoring (with severity bands, subscale handling, missing-item detection, risk-item flags), administration shape, longitudinal helpers
- `lib/clinical/longitudinal.ts` — score-series builders, period summaries, period comparison, intervention/session overlay markers, cross-domain symptom series
- `lib/clinical/mse.ts` — 16-domain MSE shape, descriptor chips, report-narrative builder, cross-session diff
- `lib/clinical/hypothesis.ts` — hypothesis CRUD, evidence add/remove, status transitions, evidence-balance descriptor
- `lib/clinical/interventions-library.ts` — modality-organised catalogue with searches and filters
- `lib/clinical/disorders.ts` — DSM/ICD navigation layer with linked-material references
- `lib/clinical/psychoeducation.ts` — handout catalogue across 4 reading levels
- `lib/clinical/interview.ts` — 5 interview templates + cross-template diff helpers
- `lib/clinical/clinical-search.ts` — cross-domain search engine with ranking, snippet generation, kind-grouping
- `lib/clinical/thematic.ts` — codes / themes / excerpts shape and frequency analysis for qualitative work
- `lib/clinical/phrases.ts` — trilingual phrase catalogue with category and language helpers

### Test coverage

The clinical layer adds 82 new unit tests covering:
- PHQ-9 / GAD-7 / DASS-21 scoring (severity bands, subscale handling, missing-item detection, risk flags)
- Longitudinal series construction, period comparison, overlay marker building
- MSE narrative generation and cross-session diffing
- Hypothesis evidence operations and status transitions
- Intervention library filters
- Disorder reference (including a regression-guard test against accidental DSM verbatim copy)
- Psychoeducation variants
- Interview templates and cross-template diffs
- Clinical search ranking, kind filtering, grouping, snippet building
- Thematic codes / themes / excerpts / frequency / quote extraction
- Trilingual phrase library helpers

288 tests total, all passing.

---

## Two portals

Psych now ships as **two parallel experiences** that share the same data
layer but feel completely different:

- **Therapist / Clinician workspace** — at `/` and all existing routes.
  Structured, documentation-focused.
- **Client portal** — at `/client/*`. Emotionally safe, soft, immersive.
  Its own ambient layout (no sidebar/header), its own themes, its own
  navigation.

A split-entry welcome page at `/welcome` lets users pick on first visit.
The preference is stored in `localStorage`; either portal can switch from
its own settings page. `components/shared/ChromeGate` swaps layout chrome
based on the current route — no rewrite required to the therapist UI.

### Client portal highlights

| Feature | Where |
|---|---|
| Emotional Weather (13 states, suggestion-aware) | `lib/client/emotional-weather.ts` + home + weather chips everywhere |
| Soft, multi-mode check-ins (expressive / minimal / silent / low-energy) | `/client/checkin` |
| "I can't explain it" visual canvas | `/client/express` |
| Therapeutic card decks (10 decks, draw / shuffle / favourite) | `/client/cards`, `lib/client/therapy-cards.ts` |
| Grounding space (breathing visual + rotating prompts) | `/client/grounding` |
| Interactive workbooks (slider, body map, thought cards, free write, before/after) | `/client/workbooks`, `lib/client/workbooks.ts` |
| Guided therapy journeys (8 paths) | `/client/journeys`, `lib/client/journeys.ts` |
| Comfort objects (quotes, reminders, memories, colors) | `/client/comfort` |
| Safe people | `/client/safe-people` |
| Voice reflections | `/client/audio` |
| Crisis Mode overlay (large buttons, no animation, simplified UI) | floating "I'm overwhelmed" button anywhere in the portal |
| Aftercare overlay (soft landing after journeys / workbooks / check-ins) | auto-shows after intense flows |
| Low-energy mode (simpler UI, no motion, larger touches) | `/client/settings` |
| 6 ambient themes (Rose Calm, Moonlight, Ocean Quiet, Lavender Rest, Golden Hour, Cloud Room) | `/client/settings` |
| Therapy memory (gentle observations from saved activity) | `lib/client/memory.ts` |
| Therapist → Client assignments | Case detail "Client portal ✦" tab → `/client` "From your therapist" section |

### Therapist ↔ Client connection

The therapist case page has a **Client portal ✦** tab where the clinician
can assign a workbook, journey, therapeutic card, or supportive note to
the client. Assignments are stored in `localStorage` under
`psych-client-assignments-v1` so the client portal sees them immediately
on the next visit. No real backend; this models the shape of a future
sync layer.

### Client portal architecture

- `contexts/ClientPortalContext.tsx` — owns weather, theme, low-energy
  mode, crisis/aftercare flags, check-ins, comfort objects, safe people,
  expression canvases, journey progress, favourite cards, voice notes.
  Persists every collection to `localStorage`.
- `components/client/ClientShell.tsx` — the layout wrapper every
  `/client/*` page uses. Renders ambient orbs, bottom nav pill, floating
  crisis button, and the Aftercare/Crisis overlays.
- `lib/client/*.ts` — pure data and logic libraries (weather, cards,
  journeys, workbooks, memory, assignments, portal preference). All
  covered by unit tests.

---

## V2 Modules

The second major upgrade adds several modules that extend the existing
architecture. Each one is built around a pure-logic library in `lib/`
plus a thin UI layer — every library has dedicated tests.

### Smart Report Builder ✦
`/reports/builder` — pick a case, a date range, and the sections you want.
Psych assembles a draft from your saved data with **source indicators**
on every section (so you can see which check-ins, reviews, or
formulations the content was pulled from). Drafts are editable,
reorderable, duplicatable, savable, and printable. Logic lives in
`lib/report-assembly.ts`.

### Session Planner → Session Note flow
From the planner, the **To Note** button converts a plan into an
editable session note draft at `/planner/notes/[id]`. Planned goals
become checkboxes, planned interventions seed the interventions list,
and supervisor instructions / risk reminders carry over as flags.
Logic lives in `lib/session-convert.ts`; the draft list is at
`/planner/notes`.

### Clinical Formulation snapshots
The Formulation page now has a **Snapshot** button on every canvas that
saves a point-in-time copy. Snapshots are listed inline and can be
diffed to see how a formulation evolves. Logic lives in
`lib/formulation-snapshots.ts`.

### Terminology dictionary additions
Adds the **Grounding** term so the dictionary now covers all 11
starter terms requested (anxiety, depression, depersonalization,
derealization, dissociation, emotional regulation, avoidance,
rumination, trauma, attachment, grounding) — each in English, French,
and Arabic.

### Thesis scoring & stats utilities
`lib/scoring.ts` adds **PHQ-9 and GAD-7 scoring with severity bands**,
**descriptive statistics** (mean/median/SD/min/max/range), **pairwise
Pearson correlation matrices**, **frequency tables**, **CSV parse and
emit**, and **data-quality checks** (duplicate IDs, missing fields,
impossible values). The existing Thesis Studio page continues to use
its own helpers; the new library is ready to wire into a dedicated
stats view.

### Case Timeline V2
The case detail page has a new **Timeline** tab that pulls events from
check-ins, weekly/monthly reviews, session plans, sessions,
assessments, supervision, reflections, interventions, transcripts,
audio notes, goals, reports, and ethics events. Events are grouped by
month, filterable by type and search query, and milestone events
(achieved goals, monthly reviews, high-effectiveness interventions)
are visually highlighted. Logic lives in `lib/case-timeline.ts`.

### Backup & Export
`/backup` — export your full local dataset or a single case as JSON,
import a backup with preview-before-apply validation, or reset
everything with a typed confirmation phrase. Logic lives in
`lib/backup.ts` (`buildFullBackup`, `buildSingleCaseBackup`,
`validateBackup`, `previewBackup`, `isResetConfirmed`). Imports merge
into existing data by upserting on `id`.

### PWA / offline mode
`public/manifest.json` declares Psych as an installable PWA (soft-pink
theme, standalone display, app icons). A minimal service worker
(`public/sw.js`) registers in production only and falls back to
`/offline` when a route is unreachable. The Settings page has an
**Install Psych** card that explains how to add to home screen.

### Accessibility & Sensory Safe Mode
The Settings page exposes a full accessibility panel: reduced motion,
muted colors, larger text, high/soft contrast, low stimulation, no
sparkles, simplified layout, visible focus outlines. **Sensory Safe
Mode** is a single-toggle preset that turns several of these on at
once. Preferences persist in `localStorage`. Logic and class-name
derivation live in `lib/accessibility.ts`; CSS in `app/globals.css`
under the `.a11y-*` selectors.

---

## Deploying to Vercel

1. Push this folder to a GitHub repository named **Psych**
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **New Project** → Import your GitHub repository
4. Vercel will auto-detect Next.js — no configuration needed
5. Click **Deploy**

Your app will be live at `https://psych-[your-username].vercel.app`.

---

## Project Structure

```
psych/
├── app/                    # All pages (Next.js App Router)
│   ├── page.tsx            # Dashboard
│   ├── cases/              # Cases list + case details
│   ├── checkins/           # Daily, weekly, monthly forms
│   ├── assessments/        # Assessment cards
│   ├── grids/              # 8 printable grid templates
│   ├── reports/            # 7 report types + hub
│   ├── supervision/        # Supervision notes
│   ├── research/           # Research workspace
│   └── settings/           # Theme + preferences
│
├── components/
│   ├── layout/             # Sidebar, Header, MobileNav
│   ├── shared/             # Reusable app components
│   ├── ui/                 # Base UI components (Button, Card, etc.)
│   ├── checkins/           # Check-in forms
│   ├── assessments/        # Assessment card
│   ├── grids/              # Printable grid template
│   └── reports/            # PrintableLayout, ReportHeader, ReportSection
│
├── lib/
│   ├── mock-data.ts        # All demo data (replace with Supabase later)
│   ├── themes.ts           # 7 theme definitions
│   └── utils.ts            # cn() utility
│
└── README.md
```

---

## Main Features

| Feature | Description |
|---|---|
| 🎨 7 Themes | Rose Clinic, Sage Mind, Midnight Study, Ocean Notes, Sunset Desk, Soft Lavender, Classic Minimal |
| 📁 Cases | 5 case types, filters, case detail tabs |
| ✅ Check-ins | Daily / Weekly / Monthly forms |
| 🧠 Assessments | 6 assessment cards with status tracking |
| 🖨️ Grids | 8 printable A4 clinical grids |
| 📄 Reports | 7 report types, all print-ready |
| 👥 Supervision | Notes, reflections, ethical concerns |
| 🔬 Research | Qualitative participants, themes, memos |
| ⚙️ Settings | Theme, user info, language, report style |
| 📱 Responsive | Sidebar on desktop, bottom nav on mobile |

---

## Themes

Switch themes from any page using the color swatches in the top-right header.

| Theme | Colors | Best for |
|---|---|---|
| Rose Clinic | Pink, cream, berry | Default — warm and feminine |
| Sage Mind | Sage, ivory, moss | Calm focus |
| Midnight Study | Dark, lavender, charcoal | Night work |
| Ocean Notes | Blue, cyan, slate | Clear and refreshing |
| Sunset Desk | Peach, coral, warm cream | Energetic |
| Soft Lavender | Lavender, white, mauve | Dreamy |
| Classic Minimal | White, gray, black | Professional |

---

## Print System

Every grid and report has a **Print** button. When printed:

- Sidebar, header, and buttons are hidden
- Output is formatted for **A4 paper**
- Clean black/white academic styling (no gradients)
- Signature sections at the bottom of each document

---

## Future Features

- 🔐 **Authentication** — User accounts with Supabase Auth
- 🗄️ **Database** — Save all data to Supabase PostgreSQL
- 📤 **PDF Export** — Export reports as PDF files directly
- 🤖 **AI-assisted report generation** — Use Claude API to draft reports from check-in data
- 🌐 **Multi-language** — Full French and Arabic report generation
- 📊 **Charts** — Visual progress charts from session data
- 📎 **File attachments** — Upload PDFs and documents per case

---

## Important Note

All data in this version is **fictional and anonymized**. Case codes (CASE-001, INT-AP-001, etc.) are demo data only. Psych does not store, transmit, or process real patient information in this version.

Psych is a **clinical support tool** — it does not provide diagnoses, replace clinical supervision, or substitute for professional mental health care.

---

## Built with

- [Next.js 14](https://nextjs.org/) — App Router
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) — Icons
- [next-themes](https://github.com/pacocoursey/next-themes) — Theme management

---

*Made with ✦ for psychology students and interns everywhere.*
