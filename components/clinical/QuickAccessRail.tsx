"use client";
// Quick Access rail — pinned cases + recent cases + recent reports +
// recent assessments + recent transcripts. Reduces navigation friction
// without inventing a new global "favourites" store.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FolderOpen,
  FileText,
  ClipboardList,
  ScrollText,
  Pin,
  ArrowRight,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { loadFromStorage } from "@/lib/store";
import {
  ASSESSMENT_ADMINISTRATIONS_STORAGE_KEY,
  type AssessmentAdministration,
  findAssessment,
} from "@/lib/clinical/assessments";
import type { ReportDraft } from "@/lib/report-assembly";

const MAX_PER_LIST = 5;

export function QuickAccessRail() {
  const { cases, transcripts, pinnedCaseIds } = useApp();
  const [reportDrafts, setReportDrafts] = useState<ReportDraft[]>([]);
  const [administrations, setAdministrations] = useState<AssessmentAdministration[]>([]);

  useEffect(() => {
    try {
      const drafts = loadFromStorage<unknown>("psych-report-drafts-v1", []);
      setReportDrafts(Array.isArray(drafts) ? (drafts as ReportDraft[]) : []);
      const admins = loadFromStorage<unknown>(
        ASSESSMENT_ADMINISTRATIONS_STORAGE_KEY,
        []
      );
      setAdministrations(
        Array.isArray(admins) ? (admins as AssessmentAdministration[]) : []
      );
    } catch {
      // ignore
    }
  }, []);

  // Pinned cases (using the existing pinnedCaseIds list on AppContext).
  const pinnedCases = useMemo(
    () =>
      pinnedCaseIds
        .map((id) => cases.find((c) => c.id === id))
        .filter((c): c is NonNullable<typeof c> => Boolean(c))
        .slice(0, MAX_PER_LIST),
    [cases, pinnedCaseIds]
  );

  // Recent cases: most recently updated, excluding archived and pinned
  // (they already have their own list above).
  const recentCases = useMemo(() => {
    const pinned = new Set(pinnedCaseIds);
    return cases
      .filter((c) => !c.isArchived && !pinned.has(c.id))
      .sort((a, b) =>
        (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "")
      )
      .slice(0, MAX_PER_LIST);
  }, [cases, pinnedCaseIds]);

  const recentReports = useMemo(
    () =>
      reportDrafts
        .slice()
        .sort((a, b) =>
          (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "")
        )
        .slice(0, MAX_PER_LIST),
    [reportDrafts]
  );

  const recentTranscripts = useMemo(
    () =>
      transcripts
        .filter((t) => !t.isArchived)
        .slice()
        .sort((a, b) =>
          (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt)
        )
        .slice(0, MAX_PER_LIST),
    [transcripts]
  );

  const recentAssessments = useMemo(
    () =>
      administrations
        .filter((a) => a && a.assessmentId)
        .slice()
        .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
        .slice(0, MAX_PER_LIST),
    [administrations]
  );

  const hasAny =
    pinnedCases.length > 0 ||
    recentCases.length > 0 ||
    recentReports.length > 0 ||
    recentTranscripts.length > 0 ||
    recentAssessments.length > 0;

  if (!hasAny) return null;

  return (
    <div
      className="rounded-2xl border p-4 mb-5"
      style={{
        borderColor: "var(--psych-border)",
        background: "var(--psych-card)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold" style={{ color: "var(--psych-text)" }}>
          Quick access
        </div>
        <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--psych-muted)" }}>
          Pinned + recent
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
        }}
      >
        {pinnedCases.length > 0 && (
          <Column
            icon={<Pin size={12} />}
            title="Pinned cases"
            items={pinnedCases.map((c) => ({
              id: c.id,
              label: c.code,
              sub: c.shortNote,
              href: `/cases/${c.id}`,
            }))}
          />
        )}
        {recentCases.length > 0 && (
          <Column
            icon={<FolderOpen size={12} />}
            title="Recent cases"
            items={recentCases.map((c) => ({
              id: c.id,
              label: c.code,
              sub: c.shortNote,
              href: `/cases/${c.id}`,
            }))}
          />
        )}
        {recentReports.length > 0 && (
          <Column
            icon={<FileText size={12} />}
            title="Recent reports"
            items={recentReports.map((r) => ({
              id: r.id,
              label: r.title,
              sub: r.dateRange?.start
                ? `${r.dateRange.start} → ${r.dateRange.end}`
                : "draft",
              href: `/reports/builder`,
            }))}
          />
        )}
        {recentAssessments.length > 0 && (
          <Column
            icon={<ClipboardList size={12} />}
            title="Recent assessments"
            items={recentAssessments.map((a) => {
              const def = findAssessment(a.assessmentId);
              return {
                id: a.id,
                label: def?.code ?? a.assessmentId,
                sub: a.score.severity
                  ? `${a.date} · ${a.score.severity}`
                  : a.date,
                href: "/assessments/library",
              };
            })}
          />
        )}
        {recentTranscripts.length > 0 && (
          <Column
            icon={<ScrollText size={12} />}
            title="Recent transcripts"
            items={recentTranscripts.map((t) => ({
              id: t.id,
              label: t.title,
              sub: (t.createdAt ?? "").split("T")[0],
              href: "/transcripts",
            }))}
          />
        )}
      </div>
    </div>
  );
}

interface ColumnItem {
  id: string;
  label: string;
  sub?: string;
  href: string;
}

function Column({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: ColumnItem[];
}) {
  return (
    <div>
      <div
        className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider mb-2"
        style={{ color: "var(--psych-muted)" }}
      >
        {icon} {title}
      </div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="flex items-center gap-2 text-xs p-1.5 rounded-md alive-hover"
              style={{
                color: "var(--psych-text)",
                background: "var(--psych-bg)",
              }}
            >
              <span className="flex-1 min-w-0">
                <span
                  className="block truncate font-medium"
                  style={{ color: "var(--psych-text)" }}
                >
                  {item.label}
                </span>
                {item.sub && (
                  <span
                    className="block truncate"
                    style={{ color: "var(--psych-muted)", fontSize: 10 }}
                  >
                    {item.sub}
                  </span>
                )}
              </span>
              <ArrowRight
                size={11}
                style={{ color: "var(--psych-muted)", flexShrink: 0 }}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
