"use client";

// Internship case profile — single page with four tabs.
//
// - Overview: identification + clinical context (editable)
// - Tests: plan, administer, score, suggest grids
// - Reports: daily / weekly / final with assembly
// - Supervision: notes with cross-links to tests / grids / reports
//
// All persistence lives in InternshipContext. This file is purely
// presentation + form glue.

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  FileText,
  FlaskConical,
  GraduationCap,
  Layers,
  ListTodo,
  Plus,
  Printer,
  Send,
  Sparkles,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { useToast } from "@/components/ui/Toast";
import { useInternship } from "@/contexts/InternshipContext";
import {
  TEST_DOMAIN_LABELS,
  TEST_STATUS_LABELS,
  INTERNSHIP_REPORT_LABELS,
  type InternshipReport,
  type InternshipTest,
  type TestDomain,
  type TestStatus,
} from "@/lib/internship/types";
import {
  INTERNSHIP_TEST_SHELLS,
  findTestShell,
} from "@/lib/internship/test-shells";
import { suggestGridShellsForTest } from "@/lib/internship/grid-library";
import { SCORABLE_TEMPLATES } from "@/lib/internship/scorable-templates";
import {
  INTERVENTION_CHIPS,
  generateInterventionParagraph,
  generateResponseParagraph,
  type InterventionChip,
} from "@/lib/internship/intervention-chips";
import {
  CONTEXT_OPTIONS,
  ChipSelect,
  MultiChipSelect,
  RESPONSE_QUALITY_OPTIONS,
  SegmentedScore,
  type ResponseQuality,
} from "@/components/ui/structured";
import { ScorableGridSection } from "@/components/internship/ScorableGridSection";
import { StructuredProfileForm } from "@/components/internship/StructuredProfileForm";

interface PageProps {
  params: { id: string };
}

const ALL_DOMAINS = Object.keys(TEST_DOMAIN_LABELS) as TestDomain[];

export default function InternshipCasePage({ params }: PageProps) {
  const { toast } = useToast();
  const {
    cases,
    tests,
    grids,
    reports,
    supervision,
    updateCaseIdentification,
    updateCaseContext,
    updateCaseStructuredProfile,
    seedCaseFromInternshipReport,
    createScorableAdmin,
    planTestFromShell,
    planManualTest,
    advanceTestStatus,
    recordTestScore,
    updateTest,
    createGridFromShell,
    createDailyReport,
    createWeeklyReport,
    createFinalReport,
    assembleWeekly,
    assembleFinal,
    generateFinalReportFromMaterial,
    updateDailySections,
    updateWeeklySections,
    updateFinalSections,
    markReportComplete,
    createSupervisionNote,
    updateSupervisionNote,
    linkSupervision,
  } = useInternship();

  const caseData = cases.find((c) => c.id === params.id);

  // Hooks must run unconditionally — compute even if case is missing.
  const caseTests = useMemo(
    () => tests.filter((t) => t.caseId === params.id),
    [tests, params.id]
  );
  const caseGrids = useMemo(
    () => grids.filter((g) => g.caseId === params.id),
    [grids, params.id]
  );
  const caseReports = useMemo(
    () => reports.filter((r) => r.caseId === params.id),
    [reports, params.id]
  );
  const caseSupervision = useMemo(
    () =>
      supervision
        .filter((s) => s.caseId === params.id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [supervision, params.id]
  );

  if (!caseData) {
    return (
      <div className="max-w-xl mx-auto pt-16 text-center">
        <p
          className="text-lg font-semibold mb-2"
          style={{ color: "var(--psych-text)" }}
        >
          Case not found
        </p>
        <p
          className="text-sm mb-6"
          style={{ color: "var(--psych-muted)" }}
        >
          The case &ldquo;{params.id}&rdquo; does not exist.
        </p>
        <Link href="/internship">
          <Button variant="secondary" size="sm">
            ← Back to Internship Studio
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <Link href="/internship">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft size={14} /> Back to Internship Studio
        </Button>
      </Link>

      <PageHeader
        title={caseData.identification.caseCode}
        subtitle={`${caseData.identification.age ?? "age —"} · ${
          caseData.identification.setting ?? "setting —"
        } · supervisor ${caseData.identification.supervisor ?? "—"}`}
      />

      <Tabs defaultValue="overview">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="evaluation">Évaluation ✦</TabsTrigger>
          <TabsTrigger value="tests">
            Tests {caseTests.length > 0 && `(${caseTests.length})`}
          </TabsTrigger>
          <TabsTrigger value="reports">
            Reports {caseReports.length > 0 && `(${caseReports.length})`}
          </TabsTrigger>
          <TabsTrigger value="supervision">
            Supervision {caseSupervision.length > 0 && `(${caseSupervision.length})`}
          </TabsTrigger>
        </TabsList>

        {/* ═════════════════ OVERVIEW ═════════════════ */}
        <TabsContent value="overview">
          {/* One-shot seed — applies the À Petit Pas institutional
              defaults + structured profile chip seed to this case. */}
          <div
            className="rounded-xl border px-3 py-2.5 mb-4 flex items-center gap-3 flex-wrap"
            style={{
              backgroundColor: "var(--psych-primary-light)",
              borderColor: "var(--psych-primary)",
            }}
          >
            <span
              className="text-xs flex-1"
              style={{ color: "var(--psych-text)" }}
            >
              <strong>Seed from internship report.</strong>{" "}
              Pré-remplit le cas avec le contexte institutionnel (École Rihani / À Petit Pas) et le profil structuré dérivé du rapport.
            </span>
            <Button
              size="sm"
              onClick={() => {
                const c = seedCaseFromInternshipReport(caseData.id);
                if (c) toast("Cas pré-rempli depuis le rapport.", "success");
              }}
            >
              Seed from internship report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard
              title="Identification"
              description="Anonymized — no real names."
            >
              <IdentificationForm
                value={caseData.identification}
                onPatch={(p) =>
                  updateCaseIdentification(caseData.id, p)
                }
              />
            </SectionCard>

            <div>
              <StructuredProfileForm
                value={caseData.context.structuredProfile}
                onChange={(next) =>
                  updateCaseStructuredProfile(caseData.id, next)
                }
                onAdministerGrid={(templateKey) => {
                  // Some suggested keys are placeholders for templates
                  // that aren't built yet. We only create a scorable
                  // admin when the key matches an actual template.
                  const tpl = SCORABLE_TEMPLATES.find(
                    (t) => t.id === templateKey
                  );
                  if (!tpl) {
                    toast(
                      `Grille « ${templateKey} » pas encore disponible.`,
                      "info"
                    );
                    return;
                  }
                  createScorableAdmin({
                    caseId: caseData.id,
                    templateId: tpl.id,
                    context: "Atelier individuel",
                  });
                  toast(`Administration « ${tpl.name} » créée`, "success");
                }}
              />
            </div>
          </div>

          {/* Optional free-text fallback — collapsed by default, kept
              for nuance the chips don't capture. */}
          <details className="mt-3">
            <summary
              className="text-xs cursor-pointer"
              style={{ color: "var(--psych-muted)" }}
            >
              Observations libres (optionnelles)
            </summary>
            <div className="mt-2">
              <ContextForm
                value={caseData.context}
                onPatch={(p) => updateCaseContext(caseData.id, p)}
              />
            </div>
          </details>
        </TabsContent>

        {/* ═════════════════ EVALUATION ═════════════════ */}
        <TabsContent value="evaluation">
          <ScorableGridSection caseId={caseData.id} />
        </TabsContent>

        {/* ═════════════════ TESTS ═════════════════ */}
        <TabsContent value="tests">
          <TestsTab
            caseId={caseData.id}
            tests={caseTests}
            grids={caseGrids}
            planFromShell={(shellId, plannedDate) => {
              const t = planTestFromShell({
                caseId: caseData.id,
                shellId,
                plannedDate,
              });
              if (t) toast(`Planned · ${t.name}`, "success");
              return t;
            }}
            planManual={(input) => {
              const t = planManualTest({
                caseId: caseData.id,
                ...input,
              });
              toast(`Planned · ${t.name}`, "success");
              return t;
            }}
            advance={(id, next) => {
              advanceTestStatus(id, next);
            }}
            update={(id, patch) => updateTest(id, patch)}
            recordScore={(id, rawScore, band, interpretation) => {
              recordTestScore(
                id,
                { rawScore, band },
                interpretation
              );
              toast("Score recorded", "success");
            }}
            attachGridFromShell={(shellId, testId) => {
              const g = createGridFromShell({
                caseId: caseData.id,
                shellId,
                linkedTestId: testId,
              });
              if (g) toast(`Attached · ${g.name}`, "success");
            }}
          />
        </TabsContent>

        {/* ═════════════════ REPORTS ═════════════════ */}
        <TabsContent value="reports">
          <ReportsTab
            caseId={caseData.id}
            reports={caseReports}
            createDaily={() => {
              const date = new Date().toISOString().slice(0, 10);
              const r = createDailyReport(caseData.id, date);
              toast(`Created daily · ${date}`, "success");
              return r;
            }}
            createWeekly={(weekStart, weekEnd) => {
              const r = createWeeklyReport(caseData.id, weekStart, weekEnd);
              toast(`Created weekly · ${weekStart} → ${weekEnd}`, "success");
              return r;
            }}
            createFinal={() => {
              const r = createFinalReport(caseData.id);
              toast("Created final report draft", "success");
              return r;
            }}
            assembleWeekly={(weekStart, weekEnd) => {
              const r = assembleWeekly(caseData.id, weekStart, weekEnd);
              toast("Weekly assembled from dailies", "success");
              return r;
            }}
            assembleFinal={() => {
              const r = assembleFinal(caseData.id);
              toast("Final report assembled", "success");
              return r;
            }}
            generateFinalFromMaterial={() => {
              const result = generateFinalReportFromMaterial(caseData.id);
              if (result) {
                toast(
                  `Rapport final généré — ${result.attribution}`,
                  "success"
                );
              }
              return result?.report ?? null;
            }}
            updateDaily={updateDailySections}
            updateWeekly={updateWeeklySections}
            updateFinal={updateFinalSections}
            markComplete={(id) => {
              markReportComplete(id);
              toast("Report marked complete", "success");
            }}
          />
        </TabsContent>

        {/* ═════════════════ SUPERVISION ═════════════════ */}
        <TabsContent value="supervision">
          <SupervisionTab
            caseId={caseData.id}
            notes={caseSupervision}
            tests={caseTests}
            reports={caseReports}
            create={(date, supervisor) => {
              const n = createSupervisionNote({
                caseId: caseData.id,
                date,
                supervisor,
              });
              toast(`Supervision · ${date}`, "success");
              return n;
            }}
            update={(id, patch) => updateSupervisionNote(id, patch)}
            link={(noteId, kind, targetId) =>
              linkSupervision(noteId, kind, targetId)
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Overview forms
// ─────────────────────────────────────────────────────────────────

function IdentificationForm({
  value,
  onPatch,
}: {
  value: import("@/lib/internship/types").InternshipIdentification;
  onPatch: (
    patch: Partial<import("@/lib/internship/types").InternshipIdentification>
  ) => void;
}) {
  const fields: Array<{
    key: keyof import("@/lib/internship/types").InternshipIdentification;
    label: string;
    rows?: number;
  }> = [
    { key: "caseCode", label: "Case code" },
    { key: "age", label: "Age" },
    { key: "setting", label: "Setting" },
    { key: "internshipPlace", label: "Internship place" },
    { key: "supervisor", label: "Supervisor" },
    { key: "reasonForFollowUp", label: "Reason for follow-up", rows: 3 },
    { key: "presentingConcerns", label: "Presenting concerns", rows: 4 },
    { key: "diagnosticContext", label: "Diagnostic / context", rows: 3 },
  ];
  return (
    <div className="space-y-2">
      {fields.map((f) => (
        <div key={f.key}>
          <label
            className="text-[10px] font-semibold uppercase tracking-wide block mb-0.5"
            style={{ color: "var(--psych-muted)" }}
          >
            {f.label}
          </label>
          {f.rows ? (
            <Textarea
              rows={f.rows}
              value={(value[f.key] as string) ?? ""}
              onChange={(e) => onPatch({ [f.key]: e.target.value })}
            />
          ) : (
            <Input
              value={(value[f.key] as string) ?? ""}
              onChange={(e) => onPatch({ [f.key]: e.target.value })}
            />
          )}
        </div>
      ))}
      <div>
        <label
          className="text-[10px] font-semibold uppercase tracking-wide block mb-0.5"
          style={{ color: "var(--psych-muted)" }}
        >
          Consent
        </label>
        <Select
          value={value.consent}
          onChange={(e) =>
            onPatch({ consent: e.target.value as typeof value.consent })
          }
        >
          <option value="pending">Pending</option>
          <option value="verbal">Verbal</option>
          <option value="written">Written</option>
          <option value="n/a">Not applicable</option>
        </Select>
      </div>
    </div>
  );
}

function ContextForm({
  value,
  onPatch,
}: {
  value: import("@/lib/internship/types").InternshipClinicalContext;
  onPatch: (
    patch: Partial<import("@/lib/internship/types").InternshipClinicalContext>
  ) => void;
}) {
  const fields: Array<{
    key: keyof import("@/lib/internship/types").InternshipClinicalContext;
    label: string;
  }> = [
    { key: "developmentalObservations", label: "Developmental observations" },
    { key: "communicationProfile", label: "Communication profile" },
    { key: "socialInteraction", label: "Social interaction" },
    { key: "emotionalRegulation", label: "Emotional regulation" },
    { key: "sensoryProfile", label: "Sensory profile" },
    { key: "behaviorObservations", label: "Behavior observations" },
    { key: "attentionEngagement", label: "Attention / engagement" },
    { key: "autonomyAdaptive", label: "Autonomy / adaptive functioning" },
    { key: "familySchoolContext", label: "Family / school context" },
  ];
  return (
    <div className="space-y-2">
      {fields.map((f) => (
        <div key={f.key}>
          <label
            className="text-[10px] font-semibold uppercase tracking-wide block mb-0.5"
            style={{ color: "var(--psych-muted)" }}
          >
            {f.label}
          </label>
          <Textarea
            rows={2}
            value={value[f.key] ?? ""}
            onChange={(e) => onPatch({ [f.key]: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Tests tab
// ─────────────────────────────────────────────────────────────────

function TestsTab({
  caseId,
  tests,
  grids,
  planFromShell,
  planManual,
  advance,
  update,
  recordScore,
  attachGridFromShell,
}: {
  caseId: string;
  tests: InternshipTest[];
  grids: Array<{ id: string; name?: string; shellId: string }>;
  planFromShell: (
    shellId: string,
    plannedDate?: string
  ) => InternshipTest | null;
  planManual: (input: {
    name: string;
    domain: TestDomain;
    plannedDate?: string;
    purpose?: string;
    scoringMethod?: string;
  }) => InternshipTest;
  advance: (id: string, next: TestStatus) => void;
  update: (
    id: string,
    patch: Partial<Omit<InternshipTest, "id" | "createdAt" | "caseId">>
  ) => void;
  recordScore: (
    id: string,
    rawScore: string,
    band: string,
    interpretation: string
  ) => void;
  attachGridFromShell: (shellId: string, testId: string) => void;
}) {
  void caseId;
  const [openId, setOpenId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
          Plan a test from a shell, mark it administered, record the score, and
          attach suggested observation grids in one place.
        </p>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={13} /> Plan test
        </Button>
      </div>

      {addOpen && (
        <PlanTestPanel
          onClose={() => setAddOpen(false)}
          onPlanFromShell={(shellId, plannedDate) => {
            planFromShell(shellId, plannedDate);
            setAddOpen(false);
          }}
          onPlanManual={(input) => {
            planManual(input);
            setAddOpen(false);
          }}
        />
      )}

      {tests.length === 0 ? (
        <SectionCard>
          <div className="text-center py-8">
            <FlaskConical
              size={20}
              className="mx-auto mb-2"
              style={{ color: "var(--psych-muted)" }}
            />
            <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
              No tests yet. Plan one to start.
            </p>
          </div>
        </SectionCard>
      ) : (
        <ul className="space-y-2">
          {tests.map((t) => {
            const isOpen = openId === t.id;
            const suggested = suggestGridShellsForTest({ domain: t.domain });
            const attachedGrids = grids.filter((g) =>
              t.gridIds.includes(g.id)
            );
            return (
              <li key={t.id}>
                <div
                  className="rounded-2xl border"
                  style={{
                    backgroundColor: "var(--psych-card)",
                    borderColor: "var(--psych-border)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : t.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  >
                    <span
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      {TEST_DOMAIN_LABELS[t.domain]}
                    </span>
                    <span
                      className="text-sm font-medium flex-1"
                      style={{ color: "var(--psych-text)" }}
                    >
                      {t.name}
                    </span>
                    <StatusPill status={t.status} />
                    <ChevronRight
                      size={13}
                      style={{
                        color: "var(--psych-muted)",
                        transform: isOpen ? "rotate(90deg)" : undefined,
                      }}
                    />
                  </button>

                  {isOpen && (
                    <div
                      className="px-4 pb-4 pt-1 border-t space-y-3"
                      style={{ borderColor: "var(--psych-border)" }}
                    >
                      {/* Test detail */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FieldText
                          label="Planned date"
                          value={t.plannedDate ?? ""}
                          onChange={(v) =>
                            update(t.id, { plannedDate: v || undefined })
                          }
                          type="date"
                        />
                        <FieldText
                          label="Administration date"
                          value={t.administrationDate ?? ""}
                          onChange={(v) =>
                            update(t.id, {
                              administrationDate: v || undefined,
                            })
                          }
                          type="date"
                        />
                      </div>
                      {t.purpose && (
                        <p
                          className="text-xs"
                          style={{ color: "var(--psych-text)" }}
                        >
                          <strong>Purpose:</strong> {t.purpose}
                        </p>
                      )}
                      {findTestShell(t.shellId ?? "")?.licensingNote && (
                        <p
                          className="text-[10px]"
                          style={{ color: "var(--psych-muted)" }}
                        >
                          ⚠ {findTestShell(t.shellId!)!.licensingNote}
                        </p>
                      )}

                      {/* Status transitions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-[10px] uppercase tracking-wider"
                          style={{ color: "var(--psych-muted)" }}
                        >
                          Move to:
                        </span>
                        {(
                          [
                            "administered",
                            "awaiting-scoring",
                            "scored",
                            "reviewed",
                            "in-report",
                          ] as TestStatus[]
                        ).map((s) => (
                          <Button
                            key={s}
                            size="sm"
                            variant={
                              s === t.status ? "secondary" : "outline"
                            }
                            onClick={() => advance(t.id, s)}
                          >
                            {TEST_STATUS_LABELS[s]}
                          </Button>
                        ))}
                      </div>

                      {/* Score block */}
                      <ScoreBlock
                        test={t}
                        onRecord={(raw, band, interp) =>
                          recordScore(t.id, raw, band, interp)
                        }
                      />

                      {/* Suggested grids */}
                      <div>
                        <p
                          className="text-[10px] uppercase tracking-wider mb-1.5"
                          style={{ color: "var(--psych-muted)" }}
                        >
                          Suggested grids for {TEST_DOMAIN_LABELS[t.domain]}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {suggested.map((s) => {
                            const attached = grids.some(
                              (g) =>
                                g.shellId === s.id && t.gridIds.includes(g.id)
                            );
                            return (
                              <Button
                                key={s.id}
                                size="sm"
                                variant={attached ? "secondary" : "outline"}
                                disabled={attached}
                                onClick={() =>
                                  attachGridFromShell(s.id, t.id)
                                }
                              >
                                <Layers size={11} />{" "}
                                {attached ? "Attached" : `Attach · ${s.name}`}
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Attached grids */}
                      {attachedGrids.length > 0 && (
                        <div>
                          <p
                            className="text-[10px] uppercase tracking-wider mb-1"
                            style={{ color: "var(--psych-muted)" }}
                          >
                            Attached grids
                          </p>
                          <ul className="text-xs">
                            {attachedGrids.map((g) => (
                              <li key={g.id} style={{ color: "var(--psych-text)" }}>
                                · {g.name ?? "Grid"}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: TestStatus }) {
  const palette: Record<
    TestStatus,
    { bg: string; fg: string }
  > = {
    planned: { bg: "#FEF3C7", fg: "#92400E" },
    administered: { bg: "#DBEAFE", fg: "#1E40AF" },
    "awaiting-scoring": { bg: "#FED7AA", fg: "#9A3412" },
    scored: { bg: "#D1FAE5", fg: "#065F46" },
    reviewed: { bg: "#E9D5FF", fg: "#5B21B6" },
    "in-report": { bg: "var(--psych-primary-light)", fg: "var(--psych-primary)" },
  };
  const c = palette[status];
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      {TEST_STATUS_LABELS[status]}
    </span>
  );
}

function ScoreBlock({
  test,
  onRecord,
}: {
  test: InternshipTest;
  onRecord: (raw: string, band: string, interp: string) => void;
}) {
  const [raw, setRaw] = useState(test.score?.rawScore ?? "");
  const [band, setBand] = useState(test.score?.band ?? "");
  const [interp, setInterp] = useState(test.interpretationNotes ?? "");
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      <FieldText
        label="Raw score / observation"
        value={raw}
        onChange={setRaw}
      />
      <FieldText
        label="Band / interpretation label"
        value={band}
        onChange={setBand}
      />
      <div>
        <label
          className="text-[10px] font-semibold uppercase tracking-wide block mb-0.5"
          style={{ color: "var(--psych-muted)" }}
        >
          Interpretation notes
        </label>
        <Textarea
          rows={3}
          value={interp}
          onChange={(e) => setInterp(e.target.value)}
        />
      </div>
      <div className="md:col-span-3 flex justify-end">
        <Button size="sm" onClick={() => onRecord(raw, band, interp)}>
          <Send size={12} /> Record score
        </Button>
      </div>
    </div>
  );
}

function FieldText({
  label,
  value,
  onChange,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label
        className="text-[10px] font-semibold uppercase tracking-wide block mb-0.5"
        style={{ color: "var(--psych-muted)" }}
      >
        {label}
      </label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function PlanTestPanel({
  onClose,
  onPlanFromShell,
  onPlanManual,
}: {
  onClose: () => void;
  onPlanFromShell: (shellId: string, plannedDate?: string) => void;
  onPlanManual: (input: {
    name: string;
    domain: TestDomain;
    plannedDate?: string;
    purpose?: string;
    scoringMethod?: string;
  }) => void;
}) {
  const [mode, setMode] = useState<"shell" | "manual">("shell");
  const [shellId, setShellId] = useState(INTERNSHIP_TEST_SHELLS[0]?.id ?? "");
  const [plannedDate, setPlannedDate] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualDomain, setManualDomain] = useState<TestDomain>(
    "developmental"
  );

  return (
    <SectionCard title="Plan a test" description="Pick a shell or start a manual entry.">
      <div className="flex items-center gap-2 mb-3">
        <Button
          size="sm"
          variant={mode === "shell" ? "secondary" : "outline"}
          onClick={() => setMode("shell")}
        >
          From shell
        </Button>
        <Button
          size="sm"
          variant={mode === "manual" ? "secondary" : "outline"}
          onClick={() => setMode("manual")}
        >
          Manual entry
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
      {mode === "shell" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label
              className="text-[10px] uppercase tracking-wide block mb-0.5"
              style={{ color: "var(--psych-muted)" }}
            >
              Test shell
            </label>
            <Select
              value={shellId}
              onChange={(e) => setShellId(e.target.value)}
            >
              {INTERNSHIP_TEST_SHELLS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {TEST_DOMAIN_LABELS[s.domain]}
                </option>
              ))}
            </Select>
            {findTestShell(shellId) && (
              <p
                className="text-[11px] mt-1"
                style={{ color: "var(--psych-muted)" }}
              >
                {findTestShell(shellId)!.description}
              </p>
            )}
          </div>
          <FieldText
            label="Planned date (optional)"
            value={plannedDate}
            onChange={setPlannedDate}
            type="date"
          />
          <div className="md:col-span-3 flex justify-end">
            <Button
              size="sm"
              onClick={() =>
                onPlanFromShell(shellId, plannedDate || undefined)
              }
            >
              <Plus size={12} /> Plan from shell
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FieldText
            label="Test name"
            value={manualName}
            onChange={setManualName}
          />
          <div>
            <label
              className="text-[10px] uppercase tracking-wide block mb-0.5"
              style={{ color: "var(--psych-muted)" }}
            >
              Domain
            </label>
            <Select
              value={manualDomain}
              onChange={(e) =>
                setManualDomain(e.target.value as TestDomain)
              }
            >
              {ALL_DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {TEST_DOMAIN_LABELS[d]}
                </option>
              ))}
            </Select>
          </div>
          <FieldText
            label="Planned date (optional)"
            value={plannedDate}
            onChange={setPlannedDate}
            type="date"
          />
          <div className="md:col-span-3 flex justify-end">
            <Button
              size="sm"
              disabled={!manualName.trim()}
              onClick={() =>
                onPlanManual({
                  name: manualName,
                  domain: manualDomain,
                  plannedDate: plannedDate || undefined,
                })
              }
            >
              <Plus size={12} /> Plan manually
            </Button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────
// Reports tab
// ─────────────────────────────────────────────────────────────────

function ReportsTab({
  caseId,
  reports,
  createDaily,
  createWeekly,
  createFinal,
  assembleWeekly,
  assembleFinal,
  generateFinalFromMaterial,
  updateDaily,
  updateWeekly,
  updateFinal,
  markComplete,
}: {
  caseId: string;
  reports: InternshipReport[];
  createDaily: () => InternshipReport;
  createWeekly: (weekStart: string, weekEnd: string) => InternshipReport;
  createFinal: () => InternshipReport;
  assembleWeekly: (weekStart: string, weekEnd: string) => InternshipReport;
  assembleFinal: () => InternshipReport;
  generateFinalFromMaterial: () => InternshipReport | null;
  updateDaily: (
    id: string,
    patch: Partial<NonNullable<InternshipReport["daily"]>>
  ) => void;
  updateWeekly: (
    id: string,
    patch: Partial<NonNullable<InternshipReport["weekly"]>>
  ) => void;
  updateFinal: (
    id: string,
    patch: Partial<NonNullable<InternshipReport["final"]>>
  ) => void;
  markComplete: (id: string) => void;
}) {
  void caseId;
  const [openId, setOpenId] = useState<string | null>(null);
  const [weekRange, setWeekRange] = useState<{
    start: string;
    end: string;
  }>({
    start: new Date().toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10),
  });

  const sorted = useMemo(
    () =>
      reports
        .slice()
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [reports]
  );

  return (
    <div className="space-y-3">
      <SectionCard title="Create or assemble a report">
        <div className="flex flex-wrap gap-2 mb-3">
          <Button size="sm" onClick={() => createDaily()}>
            <Plus size={12} /> Daily (today)
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => createWeekly(weekRange.start, weekRange.end)}
          >
            <Plus size={12} /> Weekly (empty)
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => assembleWeekly(weekRange.start, weekRange.end)}
          >
            <Layers size={12} /> Assemble weekly from dailies
          </Button>
          <Button size="sm" onClick={() => createFinal()}>
            <Plus size={12} /> Final (empty)
          </Button>
          <Button size="sm" onClick={() => assembleFinal()}>
            <Layers size={12} /> Assemble final draft
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => generateFinalFromMaterial()}
          >
            <Sparkles size={12} /> Generate final from internship material
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 max-w-md">
          <FieldText
            label="Week start"
            value={weekRange.start}
            onChange={(v) => setWeekRange((w) => ({ ...w, start: v }))}
            type="date"
          />
          <FieldText
            label="Week end"
            value={weekRange.end}
            onChange={(v) => setWeekRange((w) => ({ ...w, end: v }))}
            type="date"
          />
        </div>
      </SectionCard>

      {sorted.length === 0 ? (
        <SectionCard>
          <div className="text-center py-8">
            <FileText
              size={20}
              className="mx-auto mb-2"
              style={{ color: "var(--psych-muted)" }}
            />
            <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
              No reports yet. Daily reports feed weekly synthesis; weekly +
              tests + grids + supervision feed the final report draft.
            </p>
          </div>
        </SectionCard>
      ) : (
        <ul className="space-y-2">
          {sorted.map((r) => {
            const isOpen = openId === r.id;
            return (
              <li key={r.id}>
                <div
                  className="rounded-2xl border"
                  style={{
                    backgroundColor: "var(--psych-card)",
                    borderColor: "var(--psych-border)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : r.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  >
                    <span
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      {INTERNSHIP_REPORT_LABELS[r.kind]}
                    </span>
                    <span
                      className="text-sm font-medium flex-1"
                      style={{ color: "var(--psych-text)" }}
                    >
                      {r.title}
                    </span>
                    {r.draft ? (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: "#FEF3C7",
                          color: "#92400E",
                        }}
                      >
                        draft
                      </span>
                    ) : (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                        style={{
                          backgroundColor: "#D1FAE5",
                          color: "#065F46",
                        }}
                      >
                        <CheckCircle2 size={9} /> complete
                      </span>
                    )}
                    <ChevronRight
                      size={13}
                      style={{
                        color: "var(--psych-muted)",
                        transform: isOpen ? "rotate(90deg)" : undefined,
                      }}
                    />
                  </button>
                  {isOpen && (
                    <div
                      className="px-4 pb-4 pt-1 border-t space-y-2"
                      style={{ borderColor: "var(--psych-border)" }}
                    >
                      {r.kind === "daily" && r.daily && (
                        <DailySectionsEditor
                          value={r.daily}
                          onChange={(patch) => updateDaily(r.id, patch)}
                        />
                      )}
                      {r.kind === "weekly" && r.weekly && (
                        <WeeklySectionsEditor
                          value={r.weekly}
                          onChange={(patch) => updateWeekly(r.id, patch)}
                        />
                      )}
                      {r.kind === "final" && r.final && (
                        <FinalSectionsEditor
                          value={r.final}
                          onChange={(patch) => updateFinal(r.id, patch)}
                        />
                      )}
                      <div className="flex justify-end gap-1.5">
                        <Link
                          href={`/internship/report-print/${r.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="outline">
                            <Printer size={12} /> Print
                          </Button>
                        </Link>
                        {r.draft && (
                          <Button
                            size="sm"
                            onClick={() => markComplete(r.id)}
                          >
                            <CheckCircle2 size={12} /> Mark complete
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function DailySectionsEditor({
  value,
  onChange,
}: {
  value: NonNullable<InternshipReport["daily"]>;
  onChange: (patch: Partial<NonNullable<InternshipReport["daily"]>>) => void;
}) {
  // Free-text sections — kept as textareas for now since each
  // describes a unique observation. The structured fields below
  // (context, intervention chips, response quality) are click-driven.
  const textFields: Array<{
    key: keyof typeof value;
    label: string;
  }> = [
    { key: "objectives", label: "Objectives" },
    { key: "observations", label: "Observations" },
    { key: "communication", label: "Communication" },
    { key: "socialInteraction", label: "Social interaction" },
    { key: "behavior", label: "Behaviour" },
    { key: "emotionalRegulation", label: "Emotional regulation" },
    { key: "sensoryNotes", label: "Sensory notes" },
    { key: "reflection", label: "Reflection" },
    { key: "nextSteps", label: "Next steps" },
  ];

  const chips: InterventionChip[] = value.interventionChips ?? [];

  // Auto-generate the intervention paragraph + response paragraph
  // from chip selections. The user can edit the strings after.
  function syncFromChips(nextChips: InterventionChip[]) {
    onChange({
      interventionChips: nextChips,
      interventionUsed: generateInterventionParagraph(nextChips),
      response: generateResponseParagraph(value.responseQuality, nextChips),
    });
  }

  function syncFromQuality(next: ResponseQuality | undefined) {
    onChange({
      responseQuality: next,
      response: generateResponseParagraph(next, chips),
    });
  }

  // Chip rows grouped — the form reads more cleanly when each
  // intervention category is its own subheading.
  const interventionGroups: Array<{
    label: string;
    items: typeof INTERVENTION_CHIPS;
  }> = [
    {
      label: "Communication / instruction",
      items: INTERVENTION_CHIPS.filter((c) => c.group === "communication"),
    },
    {
      label: "Soutien direct",
      items: INTERVENTION_CHIPS.filter((c) => c.group === "soutien"),
    },
    {
      label: "Sensoriel / moteur",
      items: INTERVENTION_CHIPS.filter((c) => c.group === "sensoriel-moteur"),
    },
    {
      label: "Social",
      items: INTERVENTION_CHIPS.filter((c) => c.group === "social"),
    },
  ];

  return (
    <div className="space-y-3">
      {/* Date + context chip on one row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <FieldText
          label="Date"
          type="date"
          value={value.date}
          onChange={(v) => onChange({ date: v })}
        />
        <div className="md:col-span-2">
          <ChipSelect
            label="Contexte / séance"
            options={CONTEXT_OPTIONS}
            value={value.contextChip}
            onChange={(v) =>
              onChange({
                contextChip: v,
                contextSession:
                  v && !value.contextSession
                    ? CONTEXT_OPTIONS.find((o) => o.value === v)?.label
                    : value.contextSession,
              })
            }
          />
        </div>
      </div>

      {/* Free-text observation fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {textFields.map((f) => (
          <div key={f.key} className="md:col-span-2">
            <label
              className="text-[10px] uppercase tracking-wide block mb-0.5"
              style={{ color: "var(--psych-muted)" }}
            >
              {f.label}
            </label>
            <Textarea
              rows={2}
              value={(value[f.key] as string) ?? ""}
              onChange={(e) => onChange({ [f.key]: e.target.value })}
            />
          </div>
        ))}
      </div>

      {/* Intervention chips — click-driven */}
      <div
        className="rounded-xl border p-3"
        style={{
          backgroundColor: "var(--psych-bg)",
          borderColor: "var(--psych-border)",
        }}
      >
        <p
          className="text-[10px] uppercase tracking-wider mb-2 font-semibold"
          style={{ color: "var(--psych-text)" }}
        >
          Intervention used — sélectionner les chips
        </p>
        <div className="space-y-2">
          {interventionGroups.map((g) => (
            <MultiChipSelect
              key={g.label}
              label={g.label}
              options={g.items.map((c) => ({
                value: c.value,
                label: c.label,
                hint: c.phrase,
              }))}
              value={chips.filter((c) =>
                g.items.some((x) => x.value === c)
              )}
              onChange={(next) => {
                // Merge the picks from this group with the chips
                // belonging to the other groups.
                const otherGroups = chips.filter(
                  (c) => !g.items.some((x) => x.value === c)
                );
                syncFromChips([...otherGroups, ...next]);
              }}
            />
          ))}
        </div>
        {value.interventionUsed && (
          <div
            className="mt-3 rounded-md p-2 text-xs"
            style={{
              backgroundColor: "var(--psych-card)",
              border: "1px solid var(--psych-border)",
              color: "var(--psych-text)",
            }}
          >
            <span
              className="text-[10px] uppercase tracking-wider block mb-1"
              style={{ color: "var(--psych-muted)" }}
            >
              Paragraphe généré
            </span>
            {value.interventionUsed}
          </div>
        )}
      </div>

      {/* Response — segmented control + auto-generated text */}
      <div
        className="rounded-xl border p-3"
        style={{
          backgroundColor: "var(--psych-bg)",
          borderColor: "var(--psych-border)",
        }}
      >
        <SegmentedScore<ResponseQuality>
          label="Réponse de l'enfant"
          options={RESPONSE_QUALITY_OPTIONS.map((o, i) => ({
            value: o.value,
            label: o.label,
            tone:
              i === 0
                ? "alarm"
                : i === 1
                ? "warning"
                : i === 2
                ? "warm"
                : "calm",
          }))}
          value={value.responseQuality}
          onChange={syncFromQuality}
        />
        {value.response && (
          <div
            className="mt-3 rounded-md p-2 text-xs"
            style={{
              backgroundColor: "var(--psych-card)",
              border: "1px solid var(--psych-border)",
              color: "var(--psych-text)",
            }}
          >
            <span
              className="text-[10px] uppercase tracking-wider block mb-1"
              style={{ color: "var(--psych-muted)" }}
            >
              Paragraphe généré
            </span>
            {value.response}
          </div>
        )}
      </div>
    </div>
  );
}

function WeeklySectionsEditor({
  value,
  onChange,
}: {
  value: NonNullable<InternshipReport["weekly"]>;
  onChange: (patch: Partial<NonNullable<InternshipReport["weekly"]>>) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      <FieldText
        label="Week start"
        type="date"
        value={value.weekStart}
        onChange={(v) => onChange({ weekStart: v })}
      />
      <FieldText
        label="Week end"
        type="date"
        value={value.weekEnd}
        onChange={(v) => onChange({ weekEnd: v })}
      />
      <FieldText
        label="Sessions completed"
        value={String(value.sessionsCompleted ?? "")}
        onChange={(v) =>
          onChange({
            sessionsCompleted: v ? Number(v) : undefined,
          })
        }
      />
      <div />
      {(
        [
          ["progressObserved", "Progress observed"],
          ["difficulties", "Difficulties"],
          ["repeatedPatterns", "Repeated patterns"],
          ["testsAdministered", "Tests administered"],
          ["gridsCompleted", "Grids completed"],
          ["supervisionQuestions", "Supervision questions"],
          ["nextWeekObjectives", "Next week objectives"],
        ] as Array<[keyof typeof value, string]>
      ).map(([k, l]) => (
        <div key={String(k)} className="md:col-span-2">
          <label
            className="text-[10px] uppercase tracking-wide block mb-0.5"
            style={{ color: "var(--psych-muted)" }}
          >
            {l}
          </label>
          <Textarea
            rows={3}
            value={(value[k] as string) ?? ""}
            onChange={(e) => onChange({ [k]: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}

function FinalSectionsEditor({
  value,
  onChange,
}: {
  value: NonNullable<InternshipReport["final"]>;
  onChange: (patch: Partial<NonNullable<InternshipReport["final"]>>) => void;
}) {
  const fields: Array<{ key: keyof typeof value; label: string }> = [
    { key: "coverPage", label: "Cover page" },
    { key: "internshipContext", label: "Internship context" },
    { key: "casePresentation", label: "Case presentation" },
    { key: "observationMethodology", label: "Observation methodology" },
    { key: "testsAdministered", label: "Tests administered" },
    { key: "evaluationGrids", label: "Evaluation grids" },
    { key: "clinicalObservations", label: "Clinical observations" },
    { key: "interventionReflection", label: "Intervention / reflection" },
    { key: "progressEvolution", label: "Progress / evolution" },
    { key: "supervisionReflections", label: "Supervision reflections" },
    { key: "limits", label: "Limits" },
    { key: "recommendations", label: "Recommendations" },
    { key: "conclusion", label: "Conclusion" },
    { key: "appendices", label: "Appendices" },
  ];
  return (
    <div className="space-y-2">
      {fields.map((f) => (
        <div key={String(f.key)}>
          <label
            className="text-[10px] uppercase tracking-wide block mb-0.5"
            style={{ color: "var(--psych-muted)" }}
          >
            {f.label}
          </label>
          <Textarea
            rows={3}
            value={value[f.key] ?? ""}
            onChange={(e) => onChange({ [f.key]: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Supervision tab
// ─────────────────────────────────────────────────────────────────

function SupervisionTab({
  caseId,
  notes,
  tests,
  reports,
  create,
  update,
  link,
}: {
  caseId: string;
  notes: import("@/lib/internship/types").InternshipSupervisionNote[];
  tests: InternshipTest[];
  reports: InternshipReport[];
  create: (
    date: string,
    supervisor?: string
  ) => import("@/lib/internship/types").InternshipSupervisionNote;
  update: (
    id: string,
    patch: Partial<
      Omit<
        import("@/lib/internship/types").InternshipSupervisionNote,
        "id" | "createdAt" | "caseId"
      >
    >
  ) => void;
  link: (noteId: string, kind: "test" | "grid" | "report", targetId: string) => void;
}) {
  void caseId;
  const [openId, setOpenId] = useState<string | null>(null);
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [supervisor, setSupervisor] = useState("");

  return (
    <div className="space-y-3">
      <SectionCard title="New supervision note">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
          <FieldText label="Date" type="date" value={date} onChange={setDate} />
          <FieldText
            label="Supervisor"
            value={supervisor}
            onChange={setSupervisor}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() =>
                create(date, supervisor.trim() || undefined)
              }
            >
              <Plus size={12} /> Create
            </Button>
          </div>
        </div>
      </SectionCard>

      {notes.length === 0 ? (
        <SectionCard>
          <div className="text-center py-8">
            <GraduationCap
              size={20}
              className="mx-auto mb-2"
              style={{ color: "var(--psych-muted)" }}
            />
            <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
              No supervision notes yet.
            </p>
          </div>
        </SectionCard>
      ) : (
        <ul className="space-y-2">
          {notes.map((n) => {
            const isOpen = openId === n.id;
            return (
              <li key={n.id}>
                <div
                  className="rounded-2xl border"
                  style={{
                    backgroundColor: "var(--psych-card)",
                    borderColor: "var(--psych-border)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : n.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  >
                    <span
                      className="font-mono text-[11px]"
                      style={{ color: "var(--psych-primary)" }}
                    >
                      {n.date}
                    </span>
                    <span
                      className="text-sm flex-1"
                      style={{ color: "var(--psych-text)" }}
                    >
                      {n.supervisor ?? "Supervision"}
                    </span>
                    <span
                      className="text-[10px]"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      {n.linkedTestIds.length +
                        n.linkedGridIds.length +
                        n.linkedReportIds.length}{" "}
                      links
                    </span>
                    <ChevronRight
                      size={13}
                      style={{
                        color: "var(--psych-muted)",
                        transform: isOpen ? "rotate(90deg)" : undefined,
                      }}
                    />
                  </button>
                  {isOpen && (
                    <div
                      className="px-4 pb-4 pt-1 border-t space-y-2"
                      style={{ borderColor: "var(--psych-border)" }}
                    >
                      {(
                        [
                          ["casesDiscussed", "Cases discussed"],
                          ["testsDiscussed", "Tests discussed"],
                          ["gridsReviewed", "Grids reviewed"],
                          ["clinicalQuestions", "Clinical questions"],
                          ["feedbackReceived", "Feedback received"],
                          ["correctionsRequested", "Corrections requested"],
                          ["actionPlan", "Action plan"],
                          ["followUp", "Follow-up"],
                        ] as Array<
                          [keyof typeof n, string]
                        >
                      ).map(([k, l]) => (
                        <div key={String(k)}>
                          <label
                            className="text-[10px] uppercase tracking-wide block mb-0.5"
                            style={{ color: "var(--psych-muted)" }}
                          >
                            {l}
                          </label>
                          <Textarea
                            rows={2}
                            value={(n[k] as string) ?? ""}
                            onChange={(e) =>
                              update(n.id, { [k]: e.target.value })
                            }
                          />
                        </div>
                      ))}

                      {/* Cross-link controls */}
                      <div>
                        <p
                          className="text-[10px] uppercase tracking-wider mb-1"
                          style={{ color: "var(--psych-muted)" }}
                        >
                          Linked tests
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {tests.map((t) => {
                            const linked = n.linkedTestIds.includes(t.id);
                            return (
                              <Button
                                key={t.id}
                                size="sm"
                                variant={linked ? "secondary" : "outline"}
                                onClick={() => link(n.id, "test", t.id)}
                                disabled={linked}
                              >
                                <ListTodo size={10} />
                                {t.name}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <p
                          className="text-[10px] uppercase tracking-wider mb-1"
                          style={{ color: "var(--psych-muted)" }}
                        >
                          Linked reports
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {reports.map((r) => {
                            const linked = n.linkedReportIds.includes(r.id);
                            return (
                              <Button
                                key={r.id}
                                size="sm"
                                variant={linked ? "secondary" : "outline"}
                                onClick={() => link(n.id, "report", r.id)}
                                disabled={linked}
                              >
                                <FileText size={10} />
                                {r.title}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

