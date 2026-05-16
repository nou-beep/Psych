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
