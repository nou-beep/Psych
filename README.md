# Eyla ✦ — Psychologically-Native Bilingual Workspace

Eyla is organised around three portals — **Formation** (academic +
training), **Therapist** (clinical casework), **Client** (assigned
work + appointments) — and is built to feel *psychologically native*
rather than *software with psychology features*. Bilingual (French
default + English) with instant toggle.

---

## Psychologically-native workspace philosophy

Eyla is being progressively reshaped along five axes:

| Anti-pattern | Eyla's answer |
|---|---|
| Giant always-visible forms | `FocusBlock` — progressive disclosure with persistent open state |
| Hard route hops for every action | `SideSheet` — non-routing drawers for worksheets, grids, reports |
| Database-oriented surfaces | Session-based workflows + `TodayPanel` per portal |
| Reports manually assembled from scratch | Contextual generation (from session / grids / transcript / supervision) |
| Losing fragments between contexts | `MemoryRail` — persistent working-memory layer across the session |
| Everything visually equal | Visual priority system: critical / high / normal / low |

### Building blocks (`components/workspace/`)

- **`TodayPanel`** — a small ordered list of next-action items per
  portal. Driven by pure helpers in `lib/clinical/today.ts`
  (`computeFormationToday`, `computeTherapistToday`,
  `computeClientToday`) that read the data each portal already owns
  and surface what matters today, capped at 5–6 items, sorted by
  priority. No fake AI — just observation of the user's state.
- **`MemoryRail`** — the persistent working-memory layer. Pin
  observations, transcript excerpts, hypotheses, quotes, supervision
  ideas, sensory notes, references and generated paragraphs.
  Survives reloads via `lib/clinical/session-memory.ts` (pure store)
  and `SessionMemoryProvider`. Items group by kind, can be
  recoloured, archived, copied. Designed to dock on the right of a
  Session Workspace or render standalone.
- **`FocusBlock`** — collapsible disclosure with optional summary,
  icon, action slot, and three emphasis tiers (low / normal / high).
  Persists open state per stable `id`. Replaces giant 12-section
  forms with a calm scroll of unfolding blocks.
- **`SideSheet`** — non-routing drawer rendered into `document.body`.
  Right or left anchor, Esc + click-outside to close, header /
  footer slots. Use it whenever opening something shouldn't break
  the user's place.

### Today layer

Each portal home now shows a Today card before the rest of the
dashboard. Formation Today surfaces draft reports, tests awaiting
scoring, grids waiting for entries, thesis sections to continue,
supervision-prep nudges. Therapist Today flags cases needing review,
pending assessments, and the day's first check-in. Client Today
surfaces pending assignments, the next session, and a gentle
reflection nudge. Everything is computed from existing data — no
new persistence layer.

### Working memory rail

A psychologist holds a constant stream of observations, hypotheses,
contradictions, quotes and fragments in working memory. The rail
makes that stream a first-class object the UI can pin to:

```ts
import { useSessionMemory } from "@/contexts/SessionMemoryContext";

const memory = useSessionMemory();
memory.pin({
  sessionId: caseId,
  kind: "observation",
  body: "M. évite le contact visuel mais répond aux prénoms familiers.",
  source: { kind: "case", refId: caseId, label: "INT-AP-001 · session 3" },
});
```

Items render in the rail grouped by kind (Observations / Hypotheses /
Patterns / Excerpts / Quotes / Fragments / Sensory / Paragraphs /
Supervision / References) and persist in `localStorage` under
`eyla-session-memory-v1`.

### What is NOT in this pass

The brief covers 19 sections; this PR delivers the foundation
(MemoryRail, Today, FocusBlock, SideSheet). Subsequent passes
extend:

- Full **Session Workspace shell** (left/center/right/bottom slots)
- **Session Timeline** aggregating sessions / observations / reports
  / grids / tests / transcripts / sensory events / interventions
- **Contextual generation** rewrite — every "Generate Report" CTA
  becomes "Generate from grids / session / transcript / worksheet /
  supervision / observations" with explicit source attribution
- **Print overhaul** — editorial margins, intelligent page breaks,
  metadata footers, evaluator signatures
- Migrating each portal's existing forms to `FocusBlock` and each
  worksheet/grid into a `SideSheet`

These follow the same primitives — the next pass is mostly
application, not new architecture.

---

---

## Bilingual architecture (FR / EN)

Eyla ships with a custom i18n layer designed for academic French
quality. No runtime dependency — translation lookup is a pure
function.

### Folder structure

```
lib/i18n/
  index.ts                  · t(), readLocale(), writeLocale(),
                              formatDate / formatNumber / formatRelative
  dictionaries/
    en.ts                   · canonical English dictionary
    fr.ts                   · French dictionary, structurally identical
contexts/LocaleContext.tsx  · React provider, useLocale(), useT()
components/shared/
  LanguageToggle.tsx        · EN/FR pill, persists via LocaleContext
```

### Translation key convention

Namespaced dot-separated keys: `auth.login.title`,
`formation.dashboard.stats.gridsPending`, `thesis.chapters.methodology`.
Vars interpolate via `{name}` syntax — `t("count.tests", { n: 3 })`.

### Usage pattern

```tsx
"use client";
import { useT } from "@/contexts/LocaleContext";

export function Greeting() {
  const t = useT();
  return <h1>{t("formation.dashboard.hero.greetingMorning")}</h1>;
}
```

For sidebar / nav entries, both `label` (English fallback) and an
optional `labelKey` are stored — components prefer the key when
present, so a single config drives both locales:

```ts
{ href: "/formation/thesis", label: "Overview",
  labelKey: "sidebar.items.thesisOverview", icon: GraduationCap }
```

### Locale-aware formatting

`useLocale()` exposes `formatDate`, `formatNumber`, `formatRelative`
backed by `Intl.*` — French gets *juin 2026* / *1 234,5*, English
gets *June 2026* / *1,234.5*.

### Persistence + hydration

Active locale lives at `eyla-locale-v1` in localStorage. The
`LocaleProvider` boots with the SSR-safe default (`fr`), reads the
persisted choice in a `useEffect`, and syncs `<html lang>` so screen
readers and the browser pick up the right language. Switching the
toggle rerenders every subscribed component without a page reload.

### Academic French quality

French translations use the canonical academic register:

| EN | FR |
|---|---|
| Thesis | Mémoire (the PFE is a Master's-level work) |
| Literature Review | Revue de littérature |
| Methodology | Méthodologie |
| Findings / Results | Résultats |
| Supervisor | Encadrant |
| References | Références bibliographiques |
| Client (portal) | Patient |
| Therapist | Thérapeute |
| Sign out | Se déconnecter |

A test (`test/lib/i18n.test.ts`) asserts that FR and EN expose
**exactly the same set of keys**, that no FR entry is empty, and
that critical phrases are not accidentally identical to their
English version. 998 tests pass at the time of writing.

### Adding a new locale

1. Add the code to `LOCALES` in `lib/i18n/index.ts`.
2. Drop a `dictionaries/<code>.ts` file mirroring the EN structure.
3. Add the locale tag in `LOCALE_TAG` for `Intl.*` formatting.
4. Add the code to `EXPOSED_LOCALES` once translations are ready.

`LanguageToggle` reads from `EXPOSED_LOCALES` automatically, so
scaffolded locales (currently Arabic) stay available
programmatically without surfacing in the toggle until ready.

### Arabic scaffold

The Arabic locale (`ar`, tag `ar-MA`) is scaffolded but not
exposed. The dictionary at `lib/i18n/dictionaries/ar.ts` re-exports
`FR_DICT` as-is, so an Arabic user falls through to French strings
rather than English — matching the Maghreb bilingual context. The
`t()` fallback chain is **active → fr (if active is ar) → en → key**.

### Terminology dictionary (FR)

Eyla follows a single canonical French terminology throughout —
no `client`/`patient` / `report`/`rapport` mixing within a screen.

| English | French |
|---|---|
| Formation Portal | Espace Formation |
| Therapist Portal | Espace Thérapeute |
| Client Portal | Espace Client |
| Case | Dossier |
| Internship Case | Dossier de stage |
| Assessment | Évaluation |
| Grid | Grille |
| Worksheet | Fiche de travail |
| Report | Rapport |
| Transcript | Transcription |
| Open Work | Travail en cours |
| Settings | Paramètres |
| Print | Imprimer |
| Export | Exporter |
| Thesis | Mémoire |
| Literature Review | Revue de littérature |
| Methodology | Méthodologie |
| Supervisor | Encadrant |
| References | Références bibliographiques |
| Sign out | Se déconnecter |

A test (`test/lib/i18n-consolidation.test.ts`) pins these terms so
future changes don't accidentally regress to "Compte rendu" or
"Patient".

---

## What is Eyla?

Eyla (formerly "Psych") is a **Next.js web application** that serves
three distinct audiences without mixing their workflows:

- **Formation Portal** — Thesis, internship, supervised practice,
  research, reports, tests, grids, academic exports. The trainee
  workspace.
- **Therapist Portal** — Cases, structured interviews, MSE,
  formulations, longitudinal tracking, reports, supervision —
  documentation and clinical reasoning for professional casework.
- **Client Portal** — Assigned worksheets, assessments, appointments,
  reflections, calendar, progress. A quieter companion for the work
  between sessions.

Each portal has its own login screen, dashboard, sidebar, and visual
density. Shared engines (ScoreSet, Worksheet, Reports, Calendar,
Print, Structured input) live under both — no duplicated logic, only
portal-level presentation.

---

## Three-portal architecture

### Entry gateway → `/`

The entry gateway shows three cards (Formation · Therapist · Client).
Each routes to its own mock-auth login screen at `/login/formation`,
`/login/therapist`, `/login/client`. Any credentials sign you in; the
session stores `{ portal, email, signedInAt }` in localStorage.

### Portal-aware sidebar

`components/layout/sidebar-nav.ts` exposes three nav configs —
`FORMATION_NAV`, `THERAPIST_NAV`, `CLIENT_NAV` — and a `navForPortal`
selector. The sidebar component (`components/layout/Sidebar.tsx`)
detects the current portal from the route prefix via
`portalForRoute()` in `lib/auth.ts` and renders the right config.
The active-portal badge in the sidebar header (`Formation`,
`Therapist`, or `Client`) confirms which workspace you're in.

**Route → portal mapping** (`portalForRoute` in `lib/auth.ts`):

| Prefix | Portal |
|---|---|
| `/`, `/welcome`, `/login/*` | public (no portal) |
| `/client`, `/client/*` | client |
| `/formation/*` (canonical) — also legacy `/thesis`, `/internship`, `/research`, `/transcripts`, `/supervision`, `/grids`, `/material` (all redirected) | formation |
| everything else (`/cases`, `/assessments`, `/reports`, `/clinical`, `/checkins`, `/goals`, …) | therapist |

**Canonical Formation route tree:**

```
/formation                              · dashboard
/formation/calendar                     · shared calendar surface
/formation/open-work                    · shared open-loops surface
/formation/settings                     · internship-settings entry

/formation/thesis                       · thesis overview
/formation/thesis/writer                · thesis writer
/formation/thesis/dashboard             · thesis dashboard
/formation/thesis/stats                 · dataset + analytics
/formation/thesis/literature            · literature bank
/formation/thesis/articles              · articles
/formation/thesis/apa                   · APA tools
/formation/thesis/quotes                · quote bank
/formation/thesis/audio-sync            · audio sync
/formation/thesis/exports               · exports
/formation/thesis/import                · import

/formation/internship                   · internship studio
/formation/internship/cases             · cases list
/formation/internship/cases/[id]        · case workspace
/formation/internship/tests-grids       · grid templates + print
/formation/internship/reports           · reports list
/formation/internship/supervision       · supervision notes
/formation/internship/grid-print/[adminId]
/formation/internship/report-print/[reportId]

/formation/materials/worksheets         · shared worksheets surface
/formation/materials/transcripts        · transcripts
/formation/materials/resources          · resources
```

Legacy paths (`/thesis`, `/internship`, `/research`, `/supervision`,
`/grids`, `/transcripts`, `/material` plus their subroutes) are
permanent redirects defined in `next.config.mjs` — bookmarks and
existing internal links continue to land on the right page.

### Formation Portal — `/formation`

Dashboard surfaces thesis progress (participants, missing data,
report sections, notes, variables), internship caseload (active
cases, pending grids, tests awaiting score, reports to finalize),
and a recent-supervision-notes feed. Quick actions launch Thesis
Studio, Thesis Writer, Internship Studio, Tests & Grids,
Supervision, and Literature.

Sidebar groups: **Home** · **Thesis** · **Internship** ·
**Materials** · **System**. The clinical workspace
(`/cases`, `/assessments`, `/reports`, `/clinical`) is intentionally
absent — those live in the Therapist Portal.

### Therapist Portal — `/therapist`

Sidebar groups: **Home** · **Clinical** · **Materials** · **Admin**.
Thesis, Internship, Research, Grids, Supervision are no longer in
the therapist sidebar — they moved to Formation. The therapist
dashboard now focuses on cases, check-ins, goals, assessments and
session/calendar widgets.

### Client Portal — `/client`

Sidebar (bottom-nav pill on mobile) is the simpler structured set:
Home · Calendar · Assigned · Assessments · Worksheets · Resources ·
Notes · Progress · Settings. Removed from always-visible nav: Body
map, Threads, Reflections, Grounding — they remain accessible via
Home and deep links, just no longer crowding the pill.

**New routes:**
- `/client/calendar` — therapist-assigned material + upcoming
  sessions for the next 30 days, grouped by day. Reads from the
  shared calendar engine, filtered to client-relevant categories
  (`session`, `intake`, `assessment-due`, `workbook-review`,
  `worksheet-due`, `follow-up`).
- `/client/assigned` — focused list of pending therapist
  assignments with `Mark done` action and a completed-items section.

### Shared engines (one source, every portal)

- **ScoreSet engine** — `lib/internship/score-set.ts` +
  `score-set-schemas.ts` + adapters. Used by Formation (internship
  grids, tests) and reachable from Therapist (Assessments) and
  Client (delivered assessments). See "Universal ScoreSet engine"
  below.
- **Worksheet engine** — `lib/clinical/worksheets-library.ts`.
  Authored once, surfaced in Therapist Worksheets and Client
  Workbooks.
- **Calendar engine** — `lib/clinical/calendar.ts`. Single event
  store; each portal filters by category for its surface.
- **Reports engine** — `lib/internship/final-report-builder.ts` +
  `lib/report-assembly.ts`. Shared by formation final reports and
  therapist clinical reports.
- **Print system** — `@media print` CSS + immersive route
  recognition in `ChromeGate`. Same A4 print pipeline serves grid
  prints, report prints, and any future printable surface.
- **Structured input primitives** — `components/ui/structured/*`.
  ChipSelect / SegmentedScore / RatingScale work identically across
  the three portals.

---

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

### Click-based capability evaluation engine

The studio's **Évaluation** tab on each case opens a scorable
grid surface — click A / EC / NA / N/O on each item and Eyla
writes the French clinical paragraphs automatically. Implemented
in three files:

- `lib/internship/scorable-grids.ts` — `ScorableGridTemplate`,
  `ScorableGridAdministration`, `CapabilityScore`, plus the pure
  helpers (`scoreItem`, `clearItemScore`, `domainBreakdown`,
  `gridBreakdown`, `suggestNextGridKeys`).
- `lib/internship/scorable-templates.ts` — ships the first
  template, **Grille clinique d'évaluation des capacités** (14
  items across 3 domains: Attention et disponibilité · Mémoire et
  évocation · Perception visuelle et discrimination). Each item
  carries the optional EC/NA and A summary phrases the text
  generator uses.
- `lib/internship/scorable-text.ts` — `generateDomainSummary`,
  `generateGridSummary`, `renderSummaryAsText`, and the report
  assembly helpers `buildDailyFromGrid` /
  `buildGridSummaryReportBody`.

#### Domain status thresholds

Each item contributes to a domain score: **A** counts 1.0, **EC**
counts 0.5, **NA** counts 0, **N/O** is excluded from the
denominator. Domain status:

| Acquisition % | Observability | Status |
|---|---|---|
| — | < 50% | Non suffisamment observable |
| ≥ 75% | ≥ 50% | Majoritairement acquis |
| 40 – 74% | ≥ 50% | En cours d'acquisition |
| < 40% | ≥ 50% | À renforcer |

#### Suggested next grids

When a domain reads "à renforcer" or "en cours", the engine
surfaces follow-up grid keys defined on the template. The
suggestion logic for the first template:

| Domain status | Suggested next grids |
|---|---|
| Attention et disponibilité — weak | Attention soutenue · Engagement dans la tâche · Tolérance à l'attente · Distractibilité |
| Mémoire et évocation — weak | Mémoire visuelle courte durée · Reconnaissance et rappel |
| Perception et discrimination — weak | Discrimination visuelle · Appariement image/objet · Tri couleur/forme/taille |
| Whole grid mostly acquis | Tâches structurées avancées · Généralisation · Autonomie dans la tâche |

The follow-up templates themselves are deferred — the suggestion
surface shows the friendly label even when no template exists
yet, so the clinician knows what to administer next.

#### Auto-generated text

Per-item phrases fire into the summary based on score. Examples
from the first template:

- `attention-prenom` scored EC / NA →  *"L'orientation à l'appel
  du prénom reste fragile et doit être travaillée dans différents
  contextes."*
- `attention-distracteurs` scored EC / NA →  *"La résistance aux
  distracteurs environnementaux demeure limitée, ce qui peut
  impacter la disponibilité attentionnelle."*
- `perception-tri` scored A →  *"Les capacités de discrimination
  visuelle sont mobilisables, notamment dans les tâches de tri
  selon des critères simples."*

#### One-click report generation

From a scored administration, two buttons assemble:

- **Daily report** — uses `buildDailyFromGrid` to populate the
  `DailyReportSections` shape (context, objectives, observations,
  reflection, next steps) from the grid's summary text. The
  daily appears in the Reports tab as a draft the user can edit.
- **Grid summary report** — a "grid-summary" simple report with
  a free-text body containing the headline, per-domain status +
  paragraph, strengths, difficulties, recommendations, suggested
  next grids.

#### Printable A4 view

`/internship/grid-print/[adminId]` renders the paper-style grid
without app chrome: title block, identification panel, one table
per domain with A / EC/NA / item / domain columns, observations
section, signature lines, licensing footer. Print CSS strips the
on-screen toolbar so the page goes straight to PDF or printer.
The case page's evaluation tab links to it in a new tab.

### Default evaluator profile

The Internship Studio defaults the evaluator everywhere to
**Nouhaila Mrini · Psychologue / Thérapeute stagiaire**. The
constant lives in `lib/internship/evaluator.ts` and can be
overridden via `saveEvaluator(...)` (localStorage). All
administration forms, the seed administration, and the printable
A4 view read from `loadEvaluator()`.

### Grid template library

The click-based engine ships **12 templates** out of the brief's
24:

| # | Template | Domains |
|---|---|---|
| 1 | Grille clinique d'évaluation des capacités | Attention · Mémoire · Perception |
| 2 | Attention et disponibilité | Attention soutenue · Engagement · Tolérance |
| 3 | Communication expressive | Demandes/refus · Désignation · Combinaisons |
| 4 | Communication réceptive | Consignes · Désignation/reconnaissance |
| 5 | Interaction sociale | Approche/réponse · Tour de rôle |
| 6 | Attention conjointe | Réponse · Initiation |
| 7 | Régulation émotionnelle | Repérage · Co-régulation · Tolérance |
| 8 | Traitement sensoriel | Hyperréactivité · Hypo + recherche |
| 9 | Autonomie et adaptation | Autonomie de base · Routines |
| 10 | Imitation motrice | Simple · Séquentielle / symbolique |
| 11 | Jeu fonctionnel et symbolique | Fonctionnel · Symbolique |
| 12 | Transitions et flexibilité | Transitions · Flexibilité |

Every template uses the same A / EC / NA / N/O scoring with
auto-fired French clinical phrases per item. The remaining 12
templates from the brief are deferred to a follow-up PR — adding
them is pure data work; the engine + UI handle any number of
templates.

### Anonymized seed (INT-AP-001)

`lib/internship/seed.ts` now ships an anonymized seed case under
`INT-AP-001` with:

- An autism / developmental follow-up context (placeholder age,
  association setting, evaluator = Nouhaila Mrini)
- 4 planned/in-flight tests
- 2 daily reports + 1 weekly synthesis
- 1 supervision note
- **A pre-filled scored administration** of the Grille clinique
  d'évaluation des capacités with 14 items scored — so the
  Évaluation tab renders something real on first load.

No real names or identifiable personal information.

### Connected workflow

The scoring surface now exposes four connection buttons on a
scored administration:

- **Daily report** — populates `DailyReportSections` from the
  grid summary, creates a new draft daily.
- **Grid summary** — creates a `grid-summary` simple report with
  the full clinical text.
- **Add to weekly** — appends the grid summary into the most
  recent weekly draft's `gridsCompleted` field (or toasts to
  prompt the user to create a weekly first).
- **Add to supervision** — appends the grid summary into the
  most recent supervision note's `gridsReviewed` field.

Underlying helpers in `InternshipContext`:
`addScorableAdminToWeekly` / `addScorableAdminToSupervision`.

### Template picker UI

Replaced the dropdown-only template selector with a **2-column
card grid** showing each template's name + description, with the
active selection highlighted. Scales cleanly to the 12 templates
shipped and beyond.

### Sidebar — five-group structure

Per the brief, the sidebar is reduced to five top-level groups
with no duplicate or low-value entries:

| Group | Items |
|---|---|
| **Home** | Dashboard · Calendar · Inbox · Open Loops |
| **Clinical Work** | Cases · Internship Studio · Assessments · Reports · Clinical Tools |
| **Research** | Thesis Studio · Research · Transcripts · Literature |
| **Materials** | Worksheets · Resources · Dictionary |
| **System** | Ethics · Backup · Settings |

The page files for the demoted routes (workbook, phrases, audio,
quick-notes, planner, interventions, formulation, reflect,
checkins, goals, prep, loops, material, thinking, …) stay alive
so deep links keep working; the sidebar just doesn't surface
them as top-level entries anymore. Use Reports / Clinical Tools
/ Thesis Studio as the canonical entry points.

### Structured case profile (click-driven, no writing)

The Overview tab on every internship case now drives the clinical
context through chips and segmented controls rather than free-text
fields. Six clinical domains, each a chip-row card:

| Domain | Fields |
|---|---|
| **Communication** | Niveau verbal · Compréhension · Expression (multi) · Demandes · Réponse au prénom · Contact visuel |
| **Interaction sociale** | Initiation · Réponse à l'adulte · Pairs · Attention conjointe · Tour de rôle |
| **Sensoriel** | Auditif · Visuel · Tactile · Vestibulaire · Proprioceptif · Oral (chacun : hypo / hyper / recherche / évitement / pas de difficulté) |
| **Comportement** | Comportements (multi) · Déclencheurs (multi) · Intensité · Fréquence · Hypothèse de fonction |
| **Attention / engagement** | Position assise · Engagement · Distractibilité · Tolérance attente · Réponse aux consignes |
| **Autonomie / adaptation** | Toilettes · Repas · Habillage · Routines · Conscience des dangers |

Each domain has a collapsed "Ajouter une note si besoin" affordance
— writing only happens when chips can't capture a nuance.

Implementation: `lib/internship/structured-profile.ts` (typed
enums + French labels + coverage helper) +
`lib/internship/structured-profile-text.ts` (auto-summary +
suggestion engine) + `components/internship/StructuredProfileForm.tsx`
(chip-driven form). The structured profile lives on
`InternshipClinicalContext.structuredProfile`, with the free-text
fields preserved as a collapsed fallback for backward
compatibility.

### "Generate profile summary"

One button on the Overview tab produces:

- A French headline describing priority domains.
- One paragraph per domain (rendered from the chip selections).
- Strengths + difficulties + priority domains.
- Suggested next grids — each a one-click button that creates a
  scorable-grid administration on the case directly.

Weakness scoring per domain drives both the priority list and
the suggestion engine. Rules are pure functions; everything can
be tested in isolation.

### Content policy disclaimer

The Internship Studio dashboard now carries an explicit clinical
content policy banner: official copyrighted tests (CARS-2,
M-CHAT-R/F, Vineland, etc.) require their published manuals and
authorized materials. Eyla provides observation grids,
structured shells, and manual scoring support — proprietary
items are never reproduced.

### Institutional defaults + "Seed from internship report"

`lib/internship/institutions.ts` ships a `DEFAULT_INSTITUTION`
constant anchoring on the user's actual internship context:
**Association À Petit Pas / École Rihani**, Master en Psychologie
Clinique et Psychothérapie at **Université Ibn Tofail**, with the
academic supervisor + master responsible names from the user's
own report. Overridable via `saveInstitution()` (localStorage)
for future internship sites.

The Overview tab on each case now exposes a **Seed from
internship report** button that, in one click, applies:

- The institutional defaults to identification (setting,
  internship place, supervisor).
- A pre-built `SEED_STRUCTURED_PROFILE` carrying chip selections
  across all seven domains (communication, social, sensory,
  behaviour, attention, autonomy, **motor / visuospatial**).

The seeded admin (`SEED_INTERNSHIP_SCORABLE`) is also evaluator =
Nouhaila Mrini, so the workspace renders coherent context on
first load.

### Motor / visuospatial — 7th profile domain

Added to the structured profile after the report flagged
visuospatial fragilities and graphomotor work as a priority:

- Pencil grip · Geste graphique · Repérage gauche / droite ·
  Organisation visuospatiale · Travail graphomoteur · Motricité
  fine.

When weak, the suggestion engine surfaces `grille-graphomotricite`,
`grille-organisation-visuospatiale`, `grille-motricite-fine` —
labels render in the suggestion UI even before the templates
themselves ship.

### TSA-aware integrative headline

When the chip selections carry the TSA markers (partial verbal
language + sensory atypicalities + visuospatial concerns), the
summary headline switches from the generic "priority domains"
line to an integrative paragraph that names the clinical picture
in original French wording. Falls back to the generic line
otherwise.

### Final report template scaffolding

`lib/internship/report-template.ts` ships the standard French
master's internship report section structure
(Remerciements · Liste des figures · Liste des abréviations ·
Introduction · Présentation du lieu de stage · Cadre théorique ·
Méthodologie · Missions réalisées · Étude de cas clinique
(Présentation · Symptômes · Hypothèse · Démarche · Intervention ·
Évolution) · Conclusion et perspectives · Bibliographie · Annexes).
`defaultFinalReportInitial()` pre-seeds the cover page with the
intern's identity + institutional context.

### Structured input primitive library

`components/ui/structured/` ships six reusable primitives + a
typed dictionary of standard clinical option lists. Use them
anywhere a workflow would otherwise default to a blank textarea:

| Primitive | What it replaces |
|---|---|
| `ChipSelect` | A dropdown for a small set of mutually exclusive options |
| `MultiChipSelect` | Free-text "tag this with…" inputs |
| `SegmentedScore` | Numeric severity selects on ordered scales |
| `RatingScale` | 1–N numeric scales with anchor labels |
| `OptionalNoteCollapse` | Always-visible "additional notes" textareas |
| `GeneratedTextBlock` | Generated paragraphs + source attribution + edit / regenerate / insert |

Standard option dictionaries (`options.ts`): `FREQUENCY_OPTIONS`,
`INTENSITY_OPTIONS`, `SUPPORT_LEVEL_OPTIONS`, `ACQUISITION_OPTIONS`,
`CLINICAL_CONFIDENCE_OPTIONS`, `CONTEXT_OPTIONS`,
`RESPONSE_QUALITY_OPTIONS` — French labels, typed enums,
`labelOf()` helper for display.

### Intervention chips on the Internship daily editor

`lib/internship/intervention-chips.ts` ships **22 intervention
chips** across four groups (communication / soutien / sensoriel-
moteur / social). Each chip carries an inline phrase fragment used
by the rule-based text generator.

The `DailySectionsEditor` in the case Reports tab now exposes:

- A `CONTEXT_OPTIONS` chip row for the session context
- A grouped `MultiChipSelect` of the 22 intervention chips
- A `SegmentedScore` for response quality (Absente → Généralisée),
  colour-toned alarm → calm
- Auto-generated French paragraphs for `interventionUsed` and
  `response` driven by the chip selections, regenerated on every
  click

Both generated strings remain editable in the underlying text
fields.

### Internship Settings page

`/settings/internship` exposes the professional defaults
(`DEFAULT_EVALUATOR` + `DEFAULT_INSTITUTION`) as editable fields
backed by `saveEvaluator()` / `saveInstitution()`. Changes flow
into every grid administration, daily / weekly / final report,
supervision note, and printable view.

The Internship Studio dashboard surfaces a **Préférences** link
in its header action.

### Final internship report auto-builder

`lib/internship/final-report-builder.ts` ships a one-click
generator that fills every `FinalReportSections` slot from the
case's source material: identification + structured profile +
scorable grid administrations + tests + supervision notes +
weekly / daily reports. The output is editable; clicking the
button again regenerates from the current state of the sources.

| Section | Derived from |
|---|---|
| Cover page | Defaults + case identification |
| Internship context | `DEFAULT_INSTITUTION` (setting + population + team) |
| Case presentation | Identification + reason for follow-up + diagnostic context |
| Observation methodology | Institution focus + counts of grids / tests / dailies collected |
| Clinical observations | Structured profile (per-domain) + latest grid headline |
| Tests administered | Per test: name, domain, status, score, interpretation |
| Evaluation grids | Per grid: template name, date, headline + per-domain acquisition % |
| Intervention reflection | Aggregated intervention chips across daily reports |
| Progress evolution | Weekly reports, sorted chronologically |
| Supervision reflections | Supervision notes (date + supervisor + feedback) |
| Limits | Stable paragraph framing the stage's scope |
| Recommendations | Priority domains from the structured profile → per-domain advice |
| Conclusion | TSA-aware profile headline + grid count + team line |

The Reports tab on `/internship/cases/[id]` exposes the
**"Generate final from internship material"** button right after
the existing assembly buttons. A toast displays the
attribution line — *Généré à partir de : profil structuré · N
grilles · M tests · K supervisions · J séances · I synthèses* —
so the user knows what the draft is built on.

### Print views for daily / weekly / final reports

New route `/internship/report-print/[reportId]` renders any
internship report as a print-friendly A4 document. Cover meta
strip (case code, evaluator, encadrement, status), per-kind
section rendering with the structured chips (context, response
quality) translated to French labels, signature lines. Print CSS
strips the on-screen toolbar.

Every report row in the case Reports tab gains a **Print**
button next to "Mark complete".

### Eleven more grid templates close every dangling suggestion key (26 total)

The structured profile + scored-grid suggestion engines reference
follow-up keys when a domain reads weak. Eleven of those keys
used to render as label-only chips with no real template behind
them; this batch closes the gap. Clicking a suggested chip now
opens a real scorable grid every time.

| Key | Template |
|---|---|
| `grille-engagement-tache` | Engagement dans la tâche |
| `grille-tolerance-attente` | Tolérance à l'attente |
| `grille-distractibilite` | Distractibilité |
| `grille-memoire-visuelle-courte` | Mémoire visuelle courte durée |
| `grille-reconnaissance-rappel` | Reconnaissance et rappel |
| `grille-discrimination-visuelle` | Discrimination visuelle |
| `grille-appariement-image-objet` | Appariement image / objet |
| `grille-tri-couleur-forme-taille` | Tri couleur / forme / taille |
| `grille-taches-structurees-avancees` | Tâches structurées avancées |
| `grille-generalisation` | Généralisation |
| `grille-autonomie-tache` | Autonomie dans la tâche |

Library now ships 26 scorable templates (was 15). Each new
template covers 2–4 domains with 4–9 items; items carry the
optional `aPhrase` / `ecOrNaPhrase` strings the auto-text
generator uses so the summary panel produces real French
clinical paragraphs on every score change.

### Three motor-domain grid templates (PR #14)

| Template | Closes |
|---|---|
| Grille de graphomotricité | `grille-graphomotricite` motor-domain suggestion key |
| Grille d'organisation visuospatiale | `grille-organisation-visuospatiale` motor-domain suggestion key |
| Grille de motricité fine | `grille-motricite-fine` motor-domain suggestion key |

Closes the three motor-domain suggestion-engine gaps from PR #12.
The structured profile's suggestion engine now points to
templates that actually exist when the motor domain reads weak.

### Universal ScoreSet engine

`lib/internship/score-set.ts` ships a generic scoring architecture
that supersedes the A/EC/NA/N-O-specific `ScorableGrid` system.
The engine is schema-driven: a `ScoreSchema<TValue>` describes the
valid values, their display labels, and a `weightOf` function that
returns each value's contribution (0–1 or `null` for "not
observed"). `domainBreakdown` and `scoreSetBreakdown` work
identically across every schema.

**Seven built-in schemas** (`lib/internship/score-set-schemas.ts`):

| Schema | Values | Weights |
|---|---|---|
| `acquisition` | A · EC · NA · N/O | 1 / 0.5 / 0 / null |
| `binary-yn` | Oui · Non · N/O | 1 / 0 / null |
| `likert-1-4` | 1–4 (atypicité) | 1 → 0; lower is better |
| `likert-1-5` | 1–5 (qualité) | 0 → 1; higher is better |
| `frequency` | Jamais → Très souvent · N/O | 0 → 1 · null |
| `support-level` | Sans aide → Guidance totale · N/O | 1 → 0 · null |
| `severity` | Faible → Très élevée · N/O | 1 → 0 · null; higher is worse |

**Backward compatibility** — `lib/internship/score-set-adapters.ts`
exposes pure conversions: `scorableGridToScoreSet()` re-views any
of the 26 existing templates as a `ScoreSetDefinition` on the
acquisition schema. `scorableAdminToScoreSetAdmin()` does the same
for administration records. The reverse `scoreSetAdminToScorable()`
roundtrips when the schema is acquisition (returns `null`
otherwise). No data migration needed — the 26 legacy templates
keep working through their existing UI; the new engine can read
them.

**Two new ScoreSet templates** demonstrate non-acquisition schemas:

- **Rating clinique d'engagement** — Likert 1–5 (1 = absent, 5 =
  généralisé). Domains: arrivée / engagement / clôture.
- **Journal des déclencheurs (sévérité)** — Severity scale
  (faible → très élevée), with the right semantics for trigger
  tracking (high severity drives follow-up suggestions).

**Status mapping** — the engine produces a schema-agnostic
`ScoreSetDomainStatus`: `top` / `mid` / `low` /
`not-observable`. Thresholds: ≥ 75% → top, 40–74% → mid, < 40%
→ low, < 50% observability → not-observable. The same status
drives the same follow-up suggestion logic across every schema.

### ScoreSet UI surface

`components/internship/ScoreSetSection.tsx` exposes the new
engine inside the case Évaluation tab, sitting next to the
existing `ScorableGridSection`. It is fully schema-driven —
`SchemaButtonGroup` renders one button per `schema.values`
entry, picking colour from the value's `tone`
(`calm` · `neutral` · `warm` · `warning` · `alarm`), so the
exact same component scores acquisition grids, frequency
journals, Likert ratings and severity logs without any
hard-coded buttons. Persistence flows through
`InternshipContext`:
`scoreSetAdmins`, `createScoreSetAdmin`, `scoreScoreSetItem`,
`clearScoreSetItem`, `patchScoreSetAdmin`, `removeScoreSetAdmin`
— all writing to `psych-internship-score-set-admins-v1`.

The two non-acquisition templates seeded by PR #16
(`SCORE_SET_RATING_ENGAGEMENT` Likert 1–5,
`SCORE_SET_TRIGGER_LOG` severity) are now reachable through the
UI — pick one, click values, get the per-domain breakdown and
follow-up suggestions for free. The 26 legacy templates keep
their existing UI; nothing is migrated yet, both paths read the
same underlying scoring math through the adapters.

### Click-based test shells (deferred)

The brief asked for click-based scoring for 7 official test
shells (CARS-2 ratings, M-CHAT-R/F Y/N, Sensory quadrants,
Adaptive support levels, Communication / Social / ABC). With
the ScoreSet UI surface in place the remaining work is purely
template authoring — each official shell becomes a
`ScoreSetDefinition` on the appropriate built-in schema and
renders through `ScoreSetSection` with no UI changes. Honestly
deferred to the next PR.

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

The sidebar is **portal-aware**. Its nav config is selected by
`portalForRoute(pathname)` from `lib/auth.ts`, which maps the current
route prefix to `"formation" | "therapist" | "client" | null` and
picks the right `NavGroup[]` from `components/layout/sidebar-nav.ts`.
The visible portal is also surfaced as a small badge in the sidebar
header so you always see which workspace you're in.

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

## Three-portal architecture — extended

Eyla splits into three distinct ecosystems sharing the same local
data layer but with intentionally different chrome and density.

```
                          /  (entry gateway · 3 cards)
                          │
            ┌─────────────┼─────────────┐
            ▼             ▼             ▼
   /login/formation /login/therapist /login/client
            │             │             │
            ▼             ▼             ▼
   /formation      /therapist      /client
   + /thesis/*     + /cases/*      + /client/*
   + /internship/* + /assessments  (own bottom-nav
   + /research/*   + /reports         pill chrome)
   + /supervision  + /clinical
   + /grids
```

- **Gateway** at `/` — full-screen three-card entry. Never auto-opens
  any dashboard; the user always chooses a portal.
- **Formation portal** — academic & training workspace. Sidebar
  groups Thesis · Internship · Materials · System. Dashboard at
  `/formation` surfaces both thesis and internship progress.
- **Therapist portal** — professional clinical casework. Sidebar
  groups Clinical · Materials · Admin. Thesis/internship intentionally
  removed.
- **Client portal** — assigned-work companion. Bottom-nav pill with
  9 items, lower density, no wellness-app drift.
- **Mock auth** — `/login/formation`, `/login/therapist`,
  `/login/client` all accept any credentials. Session lives in
  `localStorage` under `psych-session-v1` with the chosen `portal`.
  `lib/auth.ts` exports `homePathFor`, `loginPathFor`,
  `isPublicRoute`, `portalForRoute`.

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

The client navigation has nine items only — **Home · Calendar ·
Assigned · Assessments · Worksheets · Resources · Notes · Progress ·
Settings** — driven by `NAV_ITEMS` in `components/client/ClientShell.tsx`.
Legacy client routes (cards, journeys, comfort, audio, safe-people,
body map, threads, reflections, grounding, the "I can't explain it"
canvas) still exist for users who want them, but are no longer in
the always-visible nav.

The new `/client/calendar` route reads from the shared calendar
engine, filters to client-relevant categories, groups events by day
across a 30-day horizon, and surfaces therapist-assigned material at
the bottom. `/client/assigned` is a dedicated focus surface for
pending vs. completed assignments with a `Mark done` action.

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

## Client portal — extended detail

Eyla's client portal is one of three (alongside Formation and
Therapist). It lives at `/client/*` with its own immersive layout
(no global sidebar — it owns its bottom-nav pill chrome) and a
calmer visual palette.

A three-card entry gateway at `/` lets users pick a portal on first
visit. The preference is stored in `localStorage`; either portal can
switch from its own settings page. `components/shared/ChromeGate`
swaps layout chrome based on the current route — no rewrite required
to the therapist UI.

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
