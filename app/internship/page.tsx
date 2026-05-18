"use client";

// Internship Studio — dashboard.
//
// Lists active internship cases, surfaces tests by status, upcoming
// supervision deadlines, recent reports, and a quick test/grid
// reference. Pulls from InternshipContext.

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Briefcase,
  FileText,
  FlaskConical,
  GraduationCap,
  Layers,
  Plus,
  Users,
} from "lucide-react";


import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useInternship } from "@/contexts/InternshipContext";
import { TEST_STATUS_LABELS } from "@/lib/internship/types";
import { activeCases } from "@/lib/internship/case";
import { testsBreakdown } from "@/lib/internship/tests";

export default function InternshipStudioPage() {
  const { toast } = useToast();
  const {
    cases,
    tests,
    reports,
    supervision,
    createCase,
  } = useInternship();

  const [newCaseOpen, setNewCaseOpen] = useState(false);

  const open = useMemo(() => activeCases(cases), [cases]);
  const breakdown = useMemo(() => testsBreakdown(tests), [tests]);

  const recentReports = useMemo(
    () =>
      reports
        .slice()
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 5),
    [reports]
  );

  const upcomingSupervision = useMemo(
    () =>
      supervision
        .slice()
        .filter((s) => s.followUp || s.date >= new Date().toISOString().slice(0, 10))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5),
    [supervision]
  );

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-6">
      <PageHeader
        title="Internship Studio"
        subtitle="Espace dédié au travail clinique de stage — cas suivis, tests à administrer, grilles d'observation, rapports, supervision."
        action={
          <Button size="sm" onClick={() => setNewCaseOpen(true)}>
            <Plus size={13} /> New internship case
          </Button>
        }
      />

      {/* Content policy disclaimer — clarifies what Eyla provides
          vs what the clinician must obtain through official channels. */}
      <div
        className="rounded-xl border px-4 py-2.5 text-[11px] leading-relaxed"
        style={{
          backgroundColor: "var(--psych-bg)",
          borderColor: "var(--psych-border)",
          color: "var(--psych-muted)",
        }}
      >
        <strong style={{ color: "var(--psych-text)" }}>
          Sur les contenus :
        </strong>{" "}
        les tests cliniques officiels (CARS-2, M-CHAT-R/F, Vineland, etc.)
        nécessitent les manuels et matériels autorisés correspondants.
        Eyla fournit des grilles d&rsquo;observation cliniciennes, des coquilles
        structurées, et un support de cotation manuelle ; les items
        propriétaires ne sont pas reproduits.
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard
          label="Active cases"
          value={String(open.length)}
          icon={<Users size={16} />}
        />
        <StatCard
          label="Tests planned"
          value={String(breakdown.byStatus.planned)}
          icon={<FlaskConical size={16} />}
          color="#3B82F6"
        />
        <StatCard
          label="Awaiting scoring"
          value={String(
            breakdown.byStatus["awaiting-scoring"] +
              breakdown.byStatus.administered
          )}
          icon={<Layers size={16} />}
          color="#F59E0B"
        />
        <StatCard
          label="Reports drafted"
          value={String(reports.filter((r) => !r.draft).length)}
          icon={<FileText size={16} />}
          color="#10B981"
        />
        <StatCard
          label="Supervision notes"
          value={String(supervision.length)}
          icon={<GraduationCap size={16} />}
          color="#8B5CF6"
        />
      </div>

      {/* Active cases */}
      <SectionCard
        title="Active internship cases"
        description="Open the case to access tests, reports, supervision, and files."
        action={
          <Button size="sm" variant="ghost" onClick={() => setNewCaseOpen(true)}>
            <Plus size={12} /> Add
          </Button>
        }
      >
        {open.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase
              size={22}
              className="mx-auto mb-2"
              style={{ color: "var(--psych-muted)" }}
            />
            <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
              No active internship cases yet.
            </p>
            <Button size="sm" className="mt-3" onClick={() => setNewCaseOpen(true)}>
              <Plus size={13} /> Create first case
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {open.map((c) => {
              const tForCase = tests.filter((t) => t.caseId === c.id);
              const rForCase = reports.filter((r) => r.caseId === c.id);
              return (
                <Link
                  key={c.id}
                  href={`/internship/cases/${c.id}`}
                  className="block"
                >
                  <div
                    className="rounded-2xl border p-4 transition-all hover:scale-[1.01] cursor-pointer h-full"
                    style={{
                      backgroundColor: "var(--psych-card)",
                      borderColor: "var(--psych-border)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p
                          className="font-mono text-sm font-semibold"
                          style={{ color: "var(--psych-primary)" }}
                        >
                          {c.identification.caseCode}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--psych-muted)" }}
                        >
                          {c.identification.age || "age unspecified"}
                          {c.identification.setting
                            ? ` · ${c.identification.setting}`
                            : ""}
                        </p>
                      </div>
                      {c.identification.supervisor && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full border"
                          style={{
                            borderColor: "var(--psych-border)",
                            color: "var(--psych-muted)",
                          }}
                        >
                          Sup. {c.identification.supervisor}
                        </span>
                      )}
                    </div>
                    {c.identification.presentingConcerns && (
                      <p
                        className="text-xs"
                        style={{ color: "var(--psych-text)" }}
                      >
                        {c.identification.presentingConcerns.length > 180
                          ? c.identification.presentingConcerns.slice(0, 180) +
                            "…"
                          : c.identification.presentingConcerns}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-[11px]" style={{ color: "var(--psych-muted)" }}>
                      <span>
                        <FlaskConical size={10} style={{ display: "inline" }} />{" "}
                        {tForCase.length} tests
                      </span>
                      <span>
                        <FileText size={10} style={{ display: "inline" }} />{" "}
                        {rForCase.length} reports
                      </span>
                      <span>
                        started {c.startDate}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tests by status */}
        <SectionCard
          title="Tests by status"
          description="Where every test currently sits in the administration flow."
        >
          <ul className="space-y-1.5">
            {(Object.keys(TEST_STATUS_LABELS) as Array<
              keyof typeof TEST_STATUS_LABELS
            >).map((status) => (
              <li
                key={status}
                className="flex items-center justify-between text-xs py-1"
              >
                <span style={{ color: "var(--psych-text)" }}>
                  {TEST_STATUS_LABELS[status]}
                </span>
                <span
                  className="font-mono px-2 py-0.5 rounded-md"
                  style={{
                    backgroundColor:
                      breakdown.byStatus[status] > 0
                        ? "var(--psych-primary-light)"
                        : "var(--psych-bg)",
                    color:
                      breakdown.byStatus[status] > 0
                        ? "var(--psych-primary)"
                        : "var(--psych-muted)",
                  }}
                >
                  {breakdown.byStatus[status]}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Recent reports */}
        <SectionCard
          title="Recent reports"
          description="Daily, weekly, monthly, and final reports across the studio."
        >
          {recentReports.length === 0 ? (
            <p
              className="text-xs text-center py-4"
              style={{ color: "var(--psych-muted)" }}
            >
              No reports yet.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {recentReports.map((r) => {
                const c = cases.find((x) => x.id === r.caseId);
                return (
                  <li key={r.id}>
                    <Link
                      href={
                        c
                          ? `/internship/cases/${c.id}?tab=reports`
                          : "/internship"
                      }
                      className="block px-2 py-1.5 rounded-md text-xs hover:bg-[var(--psych-primary-light)]"
                      style={{ color: "var(--psych-text)" }}
                    >
                      <span
                        className="text-[10px] uppercase tracking-wider mr-2"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        {r.kind}
                      </span>
                      {r.title}
                      {!r.draft && (
                        <span
                          className="ml-2 text-[10px]"
                          style={{ color: "#10B981" }}
                        >
                          · complete
                        </span>
                      )}
                      {c && (
                        <span
                          className="ml-2 font-mono text-[10px]"
                          style={{ color: "var(--psych-primary)" }}
                        >
                          {c.identification.caseCode}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Upcoming supervision */}
      {upcomingSupervision.length > 0 && (
        <SectionCard
          title="Supervision · upcoming and recent"
          description="Notes with follow-up scheduled or recent feedback."
        >
          <ul className="space-y-1.5">
            {upcomingSupervision.map((s) => {
              const c = cases.find((x) => x.id === s.caseId);
              return (
                <li
                  key={s.id}
                  className="text-xs flex items-start gap-3 py-1"
                >
                  <span
                    className="font-mono text-[10px] flex-shrink-0 mt-0.5"
                    style={{ color: "var(--psych-primary)" }}
                  >
                    {s.date}
                  </span>
                  <div className="flex-1">
                    <p style={{ color: "var(--psych-text)" }}>
                      {c?.identification.caseCode ?? "case"}
                      {s.supervisor ? ` · ${s.supervisor}` : ""}
                    </p>
                    {s.followUp && (
                      <p
                        className="text-[10px]"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        follow-up · {s.followUp}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      )}

      {newCaseOpen && (
        <NewCaseModal
          onClose={() => setNewCaseOpen(false)}
          onCreate={(input) => {
            const c = createCase(input);
            setNewCaseOpen(false);
            toast(`Created case ${c.identification.caseCode}`, "success");
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// New case modal — minimal up-front fields. Everything else is
// editable on the case page.
// ─────────────────────────────────────────────────────────────────

function NewCaseModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: {
    caseCode: string;
    age?: string;
    setting?: string;
    supervisor?: string;
    presentingConcerns?: string;
    consent: "verbal" | "written" | "pending" | "n/a";
  }) => void;
}) {
  const [caseCode, setCaseCode] = useState("");
  const [age, setAge] = useState("");
  const [setting, setSetting] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [concerns, setConcerns] = useState("");
  const [consent, setConsent] = useState<
    "verbal" | "written" | "pending" | "n/a"
  >("pending");

  return (
    <Modal open onClose={onClose} title="New internship case">
      <ModalBody>
        <div className="space-y-3">
          <div>
            <label
              className="text-xs font-semibold mb-1 block"
              style={{ color: "var(--psych-text)" }}
            >
              Case code (anonymized)
            </label>
            <Input
              value={caseCode}
              onChange={(e) => setCaseCode(e.target.value)}
              placeholder="e.g. CHILD-AUT-2026-01"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                className="text-xs font-semibold mb-1 block"
                style={{ color: "var(--psych-text)" }}
              >
                Age
              </label>
              <Input
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="6 years"
              />
            </div>
            <div>
              <label
                className="text-xs font-semibold mb-1 block"
                style={{ color: "var(--psych-text)" }}
              >
                Setting
              </label>
              <Input
                value={setting}
                onChange={(e) => setSetting(e.target.value)}
                placeholder="association · medico-social"
              />
            </div>
          </div>
          <div>
            <label
              className="text-xs font-semibold mb-1 block"
              style={{ color: "var(--psych-text)" }}
            >
              Supervisor
            </label>
            <Input
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              placeholder="Dr. ..."
            />
          </div>
          <div>
            <label
              className="text-xs font-semibold mb-1 block"
              style={{ color: "var(--psych-text)" }}
            >
              Presenting concerns
            </label>
            <Input
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              placeholder="brief — full context is editable on the case page"
            />
          </div>
          <div>
            <label
              className="text-xs font-semibold mb-1 block"
              style={{ color: "var(--psych-text)" }}
            >
              Consent
            </label>
            <Select
              value={consent}
              onChange={(e) =>
                setConsent(
                  e.target.value as "verbal" | "written" | "pending" | "n/a"
                )
              }
            >
              <option value="pending">Pending</option>
              <option value="verbal">Verbal</option>
              <option value="written">Written</option>
              <option value="n/a">Not applicable</option>
            </Select>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (!caseCode.trim()) return;
            onCreate({
              caseCode: caseCode.trim(),
              age: age.trim() || undefined,
              setting: setting.trim() || undefined,
              supervisor: supervisor.trim() || undefined,
              presentingConcerns: concerns.trim() || undefined,
              consent,
            });
          }}
        >
          Create case
        </Button>
      </ModalFooter>
    </Modal>
  );
}

