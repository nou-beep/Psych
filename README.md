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

## Consolidated systems

Eyla's workspace is built around four primary surfaces. Earlier
iterations split overlapping concepts across many pages; the
refinement pass below collapses them into a smaller, sharper set.

### Material System (`/material`, `lib/workspace/material.ts`)

A single read-only lens that aggregates everything fragment-like
in the workspace into one filterable browse view:

- **Quotes** (`/research/quotes`)
- **Inbox captures** (`/inbox`)
- **Tracked loops** (`/loops`)
- **Thinking-mode thoughts** (`/thinking`)
- **Literature excerpts** (`/research/literature`)

Each store keeps its own canonical shape; the Material page calls
adapter functions (`fragmentFromQuote`, `fragmentFromCapture`, …)
that normalise everything into a unified `MaterialFragment`. Tags,
themes, kinds, status, and pinned flags drive shared filtering
and sorting. The Material lens is additive — mutations still
happen on each source page.

### Interactive Cognitive Workspace (`/clinical/thought-web`)

Single graph-canvas surface for thoughts, emotions, beliefs,
defenses, distortions, body sensations, behaviors, memories, and
roles. Built on `lib/psy/nodes.ts` + `lib/psy/links.ts`. Recurring
psychological threads appear as a side panel inside the canvas
(powered by `lib/psy/threads.ts`); contradictions render as dashed
"contradicts" links. `/clinical/threads` exists as a focused
read-only summary with a banner pointing back to the canvas.

### Somatic Experience System (`/clinical/body-map`)

The body-map is now the unified bodily-experience surface. Each
clinician annotation picks a somatic kind — *sensation*, *sensory
load*, *dissociation*, *numbness*, *tension*, *fatigue* — which is
stored as a `somatic:<kind>` tag on the underlying body-sensation
node. The heatmap, region drill-in, and recurring-thread analysis
all pick up these entries for free.

### Assessment engine (`lib/assessments/`)

One config-driven engine handles every assessment: scoring,
interpretation bands, longitudinal comparison, manual entry, and
report insertion. New scales are added by dropping a config — not
by writing a bespoke UI per instrument.

### Workspace memory (`lib/workspace/memory.ts`)

Persistent recent-items list, scoped resume positions, and a
lightweight UI-flags bag. `useRecordVisit()` is wired into the
high-traffic pages (cases, thesis writer, articles, thinking) so
the dashboard `RecentTrails` rail can offer "continue where you
left off" without ceremony.

### Microcopy (`lib/workspace/microcopy.ts`)

Centralised psychologically-aware UI language. Confirmation
verbs, empty-state lines, status labels, and the
`replaceProductivityJargon()` helper all live in one file. Drift
words ("insights", "task complete", "wellness journey",
"productivity streak") are normalised into clinical language
("patterns", "marked as resolved", "clinical work", "work
rhythm").

### Sidebar groups

Five groups, in order: **Workspace**, **Clinical**, **Tools**,
**Research**, **System**. Each app pillar lives in exactly one
group; consolidated surfaces sit at the top of their group.

---

## Internship Studio

A dedicated workspace for supervised clinical internship work — the
second real reason Eyla exists (alongside the Thesis Studio for the
master's research). Lives at `/internship`, with case detail at
`/internship/cases/[id]`. State is held in `InternshipContext` and
persisted across six localStorage blobs (cases / tests / grids /
reports / supervision / files).

### Test administration workflow

`lib/internship/test-shells.ts` ships 12 generic test shells covering
autism / developmental work: CARS-2, M-CHAT-R/F, Vineland, ABLLS-R,
VB-MAPP, Sensory Profile, plus six observation checklists / grids.
Every shell is a **structured skeleton only** — name, domain, age
range, scoring method, description. No copyrighted items. Each
shell carries a licensing reminder.

Each test moves through a status flow with enforced transitions:

```
planned → administered → awaiting-scoring → scored → reviewed → in-report
```

Recording a score auto-advances the test to `scored` if it is
behind. The status flow is enforced by `canTransition()` in
`lib/internship/tests.ts` (illegal jumps are silent no-ops).

### Evaluation grid suggestion

`lib/internship/grid-library.ts` ships 24 grid shells and the
domain → grid suggestion map the brief flagged as the studio's
central differentiator:

| Test domain | Suggested grids |
|---|---|
| Communication | Communication Grid · Expressive/Receptive · Social Communication |
| Social interaction | Social Interaction · Joint Attention · Peer Interaction |
| Sensory | Sensory Profile · Sensory Trigger Log · Regulation Strategy |
| Behavior | ABC Behavior · Frequency/Intensity Tracker · Trigger/Response |
| Emotional regulation | Emotional Regulation · Meltdown/Shutdown · Coping Strategy |
| Adaptive functioning | Autonomy · Daily Living Skills · Routine Participation |

In the Tests tab of a case, picking a test surfaces an "Attach
suggested grid" row driven by `suggestGridShellsForTest()` — one
click creates an empty `InternshipGrid` linked to the test.

### Report workflow

Seven report kinds defined in `lib/internship/reports.ts`:

- **Daily observation** — 13 sections (context, objectives,
  observations, communication, social interaction, behaviour,
  emotional regulation, sensory notes, intervention used,
  response, reflection, next steps).
- **Weekly synthesis** — 9 sections, with `sourceDailyIds` tracking
  which dailies fed the synthesis.
- **Monthly synthesis** — same shape as weekly, longer window.
- **Final internship report** — 14 sections (cover, context, case,
  methodology, tests, grids, observations, intervention,
  progress, supervision, limits, recommendations, conclusion,
  appendices).
- Test administration / evaluation grid summary / supervision
  summary — simpler one-body reports.

Two assembly helpers turn the chain into pre-filled drafts the user
edits rather than blank canvases:

- `assembleWeeklyFromDailies()` — given a week window, gathers all
  daily reports inside it and produces a weekly draft with
  per-area concatenated text ("Day 1 · 2026-03-11 …").
- `assembleFinalDraft()` — given a case, gathers all weekly
  reports + tests + grids + supervision notes and produces a
  final-report draft with the right sections pre-filled.

### Supervision workflow

`InternshipSupervisionNote` carries the usual fields (date,
supervisor, cases discussed, tests discussed, grids reviewed,
clinical questions, feedback received, corrections requested,
action plan, follow-up) plus three cross-link arrays:
`linkedTestIds`, `linkedGridIds`, `linkedReportIds`. The case page's
Supervision tab lets you click any test or report in the case and
attach the supervision note to it. Backlinks render on the test /
report side.

### Files

`InternshipFile` is metadata only — names, kind, tags, link target.
PDFs / binaries stay on the user's disk; we just store the
reference. The model is in place; the UI tab is deferred to a
follow-up.

### Seed data

One anonymized seed case (`CHILD-AUT-2026-01`) ships in
`lib/internship/seed.ts`: a 6-year-old followed in an association
setting. Four tests at different status points (Vineland planned,
Sensory Profile administered, Communication checklist scored, ABC
behaviour awaiting scoring), two daily reports, one weekly
synthesis, one supervision note. All identifiers are fictional and
deterministic. The seed loads on first run and is dismissable.

### Navigation cleanup shipped with this pass

- `/audio` standalone route removed from sidebar — audio
  functionality lives consolidated under Transcripts +
  `/research/audio-sync`. The page file is preserved so existing
  audio note data isn't lost.
- Sidebar restructured into five groups: **Home** · **Clinical
  Work** · **Research** · **Materials** · **Admin**. Internship
  Studio sits at the top of Clinical Work, beside Cases.
- Phrase library moved from Clinical into Materials (it's reference
  content, not a clinical surface).

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

## Living workspace — Case Desktop, modes, cross-app cohesion

This pass focused on **depth + cohesion** rather than new tabs. Every
system below surfaces or consumes data from systems already in place.

### Case Desktop (Desktop ✦ tab on each case)

Rearrangeable, named-preset workspace per case. 7 built-in presets
(Session Prep, Assessment Review, Timeline Focus, Research View,
Thesis Coding, Report Writing, Supervision Review). Add / remove / pin
/ resize (`sm` / `md` / `lg`) / reorder panels freely. Layouts persist
per case under `psych-desk-layouts-v1`. 18 panel kinds covering every
existing module. Pure logic in `lib/desk/layouts.ts`.

### Workspace modes (header dropdown)

Flip between **Default / Session / Writing / Research / Review /
Supervision**. Each mode is a small set of CSS classes the chrome
honors (collapsed sidebar in Writing, denser layout in Research,
quieter chrome in Session). Each mode advertises a `suggestedPresetId`
so the Case Desktop knows what to open. Persists under
`psych-workspace-mode-v1`. Logic in `lib/desk/modes.ts`.

### Desk objects (data layer)

`lib/desk/objects.ts` — model for pinned quotes, sticky reminders,
open notebooks, active reports, transcript fragments, "read later"
articles, supervision reminders, unfinished formulations, highlighted
excerpts. Each has 2D position, z-index, colour, optional case
scoping, and a `linkRef` to a real artefact. Free-drag canvas UI is a
follow-up.

### Quote / excerpt bank (`/research/quotes`)

Central shared store transcripts, thesis, reports, and case desktops
read from. Quote carries body, speaker, source
(`transcript`/`session`/`literature`/`manual`), reference, themes,
emotional tags, colour, `favourite`, `reportSafe`. Filter by case /
theme / favourites; `quotesByAnyTheme` powers "what quotes support
theme X?". `fromTranscriptSnippet` promotes a highlighted transcript
excerpt into a quote. Logic in `lib/research/quote-bank.ts`.

### Thesis Writer (`/thesis/writer`)

Proper academic writing environment, 8 chapters
(introduction → appendices). Outline sidebar with per-section word
counts, draft badges, unresolved-marker counts. Editor surface uses a
paper-card aesthetic with serif typography and a margin notes column.

- **Autosave** (debounced 400ms) to `psych-thesis-document-v1`.
- **Unresolved markers** — `[needs citation]`, `[tk]`, `[todo]`,
  `[fact-check]`, `[unresolved]` are counted per section and surfaced
  in the outline.
- **Draft snapshots** — freeze a deep copy of the document with a
  label; restore or delete from the side panel.

Logic in `lib/research/thesis-writer.ts`.

### Open Loops (`/open-loops`)

Cross-app tracker of unresolved work. Aggregates from every existing
module — unfinished report drafts, partially-filled formulations,
supervision notes with action plans but missing topics, transcripts
with uncoded excerpts, hypotheses still `exploring`, recurring
threads, quick notes tagged `revisit`/`follow-up`/`open`. Each loop
has a 1–5 weight; the board sorts heaviest first then longest open.

The same `OpenLoopsBoard` component can be embedded on a case detail
filtered by case id. Logic in `lib/research/open-loops.ts`.

### Literature desk (data layer)

`lib/research/literature.ts` — reading-list shape (status, summary,
themes, in-paper excerpts, `pinnedReading`, linked thesis chapters).
UI surface is a follow-up.

### Cohesion model

A transcript excerpt → becomes a Quote bank entry → can be referenced
by a thesis chapter (`linkedQuoteIds` on chapter sections) → which
may raise `[needs citation]` markers visible in the outline → and is
summarised in Open Loops if left unresolved → and shows up in the
Case Desktop's "Quote fragments" panel. All five surfaces read from
the same data, persisted under the same keys.

### Tests

This pass adds 66 new unit tests across `desk-layouts` (10),
`desk-modes` (5), `desk-objects` (6), `research-quote-bank` (15),
`research-open-loops` (11), `research-thesis-writer` (12),
`research-literature` (7).

---

## Interactive psychological architecture

A unified graph data model makes every psychological "thing" addressable
from both portals. The therapist and the client work with the **same
data**, viewed and edited from different perspectives.

### The unified model

- `lib/psy/nodes.ts` — every body sensation, thought, emotion,
  situation, memory, behavior, person, defense, distortion, role,
  thread, conflict, and reference (session / intervention / assessment)
  is a typed `PsyNode` with `caseId`, `label`, `notes`, `tags`,
  optional `intensity`, optional `meta` (e.g. body region, canvas
  position), and dual-portal authorship metadata.
- `lib/psy/links.ts` — typed `PsyLink` between two nodes. Link types:
  `causes`, `follows`, `related-to`, `contradicts`, `recurs-with`,
  `defends-against`, `expresses`. Each carries a 1–5 strength used for
  line thickness on the canvas.
- `contexts/PsyGraphContext` — single store for both portals,
  persisted in `localStorage`. Deleting a node prunes orphan links.

This means the body map, thought web, threads explorer, and session
recap all read from the **same** case-level network — no duplicated
state.

### Body map system

- `lib/psy/body-regions.ts` — 19-region anatomical taxonomy with SVG
  coordinates and curated common sensations per region.
- `components/psy/BodyMap.tsx` — SVG silhouette, clickable regions,
  intensity heatmap (fill opacity), per-region count badges.
- `/client/body` — client entry surface.
- `/clinical/body-map` — therapist heatmap viewer with per-region
  drilldown, author chips (client vs clinician), and a clinician-only
  annotation field.

### Thought web

- `components/psy/ThoughtWeb.tsx` — draggable SVG node graph with
  pointer-event interactions, ghost-line preview while linking,
  arrowhead markers for `causes`, dashed strokes for `contradicts`.
- `/clinical/thought-web` — therapist editor. Add nodes of any kind,
  drag to reposition (positions persist in `node.meta.x/y`), click to
  start a typed link, click a link to delete it.

### Threads explorer

- `lib/psy/threads.ts` — pure tag-frequency analysis with recurrence
  thresholds, kind breakdown, last-seen date, common-thread catalogue.
- `/clinical/threads` — therapist view with kind-breakdown bars.
- `/client/threads` — gentle client view of recurring themes.

### Session recap visuals

- `lib/psy/session-recap.ts` — pure derivation from session data +
  session-day nodes. Detects emotional tone (heavy / open / mixed /
  neutral), splits into a full therapist view and a simplified
  client-facing subset.
- `components/psy/SessionRecapVisual.tsx` — renders either view.
  Mounted on the case detail **Clinical snapshot ✦** tab (therapist)
  and on the client portal home (client).

### Other systems addressable today

The unified model means defenses, distortions, relational roles,
internal conflicts (`linkType: "contradicts"`), memory networks, and
attachment diagrams are **already creatable** via the thought web —
they're just node kinds + link types. Dedicated standalone surfaces
for each are scoped as follow-up UI work; the data layer is in place
and tested.

### Tests

The psychological architecture adds 40 new unit tests across
`psy-nodes` (11), `psy-links` (6), `psy-threads` (6), and
`psy-session-recap` (6).

---

## Navigation & sidebar architecture

### Sidebar (desktop)

The sidebar is `position: fixed` at `h-screen` (full viewport height —
not `min-h-screen`, which used to let it grow off-screen and clip the
bottom). Inside, navigation lives in a flex-1 host with `min-h: 0` so
its child `<nav>` can actually scroll:

```
<aside h-screen fixed overflow-hidden flex flex-col>
  ↑ logo
  ↑ quick search
  <div sidebar-scroll-host flex-1 min-h-0>    ← takes remaining height
    <nav sidebar-scroll h-full overflow-y-auto>
      …collapsible groups…
    </nav>
  </div>
  ↓ footer (session + sign out + switch portal)
</aside>
```

This means small-laptop and iPad-landscape viewports never require
zoom-out to reach the System group at the bottom.

- **Subtle scrollbar** (`.sidebar-scroll`) — thin track using the theme
  border colour, hidden until hover on WebKit.
- **Scroll cues** (`.sidebar-scroll-host`) — top / bottom gradient
  fades signal that more nav is available offscreen.
- **Collapsible groups** persisted under `psych-sidebar-groups-v1`; each
  group has a caret that rotates via `.sidebar-group-caret`.
- The main content area scrolls **separately** from the sidebar (`ml-60`
  pushes the content off the fixed sidebar's width).

### Mobile / tablet

Below `lg` (1024px) the sidebar hides and the `MobileNav` bar appears
at the bottom. iPad portrait gets the bottom nav; iPad landscape (≥1024
px) gets the full sidebar.

### Dashboard infrastructure

The therapist dashboard surfaces three new infrastructure widgets so
the calendar / pinned / recent work are reachable in one glance:

| Widget | What it shows |
|---|---|
| `CalendarDashboardWidgets` | Four cards driven by `/calendar` data: Today's sessions · Upcoming deadlines · This week's load · Overdue (or upcoming supervision if nothing's overdue). Each row links into the case and the calendar itself. Defensive against malformed local data. |
| `QuickAccessRail` | Pinned cases · recent cases · recent reports · recent assessments · recent transcripts. One column per category, items truncated and lined up. |
| `WorkingOn` | (Existing) Drafts in flight across every module. |

### Calendar event modal

Clicking a calendar event for a linked case now surfaces a **case
snapshot panel** inside the modal — code, type, last-session date and
topic, next-session focus, and any active risk note — plus a one-click
"Open case" link. Built on `buildLastSessionSummary` so prep happens
without leaving the calendar.

---

## Visual identity & workflow intelligence

Psych is designed to read as a working psychologist's environment, not a
SaaS dashboard. The visual language combines clinical structure with a
subtle hand-marked annotation feel:

- **Annotation classes** in `app/globals.css` — `.annot-underline`,
  `.annot-highlight`, `.annot-circle`, `.annot-margin-note`,
  `.annot-tag`, `.annot-pin`, `.annot-strikethrough`. Intended for
  transcripts, formulations, case notes, supervision.
- **Sticky-note + paper-card variants** — `.sticky-note` (with
  `[data-rotate="1..4"]` for slight tilt and `.sticky-pin`), `.paper-card`
  (with `data-state="draft"` dashed border), `.stacked-papers` for
  layered drafts.
- **Section colour tokens** via `data-section` on a wrapper element —
  `assessments`, `reports`, `thesis`, `supervision`, `risk`, `research`,
  `interventions`, `calendar`, `client`. Each exposes
  `--section-accent`, `--section-tint`, `--section-line`. Pages
  identify themselves to the rest of the styling via this attribute.
- **`alive-hover`** — a single hover class that gives every card a
  small lift + accent-coloured border, without animation noise.

### New workflow surfaces

| Route | What it is |
|---|---|
| `/calendar` | Clinical calendar with day / week / month views, recurring sessions (weekly / bi-weekly / monthly with optional end date), 9 colour-coded categories (session, supervision, assessment-due, report-due, follow-up, workbook-review, intake, research, other), overdue widget, and load metrics (today / this week / pending tasks / overdue). |
| `/quick-notes` | Clinician thinking space. Sticky-note style cards with 5 colours, pin / unpin, tag chips, case linking, full-text search. Pinned notes float to the top of the board. |
| `Case detail → Clinical snapshot ✦` tab | New per-case panel combining: **Last session at a glance**, **Therapy phase** (with full transition history and "days in current phase" indicator), **Therapy needs profile** (12 categories — emotional validation, structure, grounding, psychoeducation, emotional regulation, behavioral activation, relational safety, cognitive restructuring, executive functioning, sensory accommodations, routine support, distress tolerance — with priority, current-focus flag, progress, linked interventions/workbooks), and **Session objectives** (pre-session prep that carries unresolved themes forward across sessions). |
| `Dashboard → Currently working on` widget | Surfaces work-in-progress across modules — unfinished report drafts, formulation drafts (partially filled), supervision notes with action plans but missing topics, uncoded transcript excerpts, incomplete assessments (any missing items), session-note drafts with unchecked goals, draft interviews. Ranked most-recently-touched first. |
| Sidebar | Groups are now **collapsible**, persisted in `localStorage`, with a subtle caret. Adds **Calendar** and **Quick notes** to the Workspace group. Independent vertical scroll. |

### Pure-logic libraries (with tests; +47 new this pass)

- `lib/clinical/calendar.ts` — event model, weekly/biweekly/monthly recurrence expansion clamped by `recurrenceUntil`, day/week/month boundaries, overdue detection, dashboard load metrics
- `lib/clinical/therapy-needs.ts` — 12-category needs catalogue with curated intervention/workbook/psychoeducation suggestions per category
- `lib/clinical/case-phase.ts` — 7-phase model (intake → assessment → stabilization → active treatment → maintenance → discharge prep → follow-up) with transition history and days-in-phase
- `lib/clinical/session-objectives.ts` — pre-session prep shape with `carryForward()` that brings follow-up, unresolved themes, and supervision reminders into the next session
- `lib/clinical/quick-notes.ts` — sticky-note CRUD, pin ordering, full-text search, case scoping
- `lib/clinical/last-session.ts` — pure derivation of "last session at a glance" from sessions + plans + check-ins
- `lib/clinical/workspace.ts` — cross-module work-in-progress aggregator

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
