"use client";
// DSM-5-TR / ICD-11 Reference (navigation layer only — no copyrighted text).

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DISORDER_REFERENCE,
  searchDisorders,
} from "@/lib/clinical/disorders";

export default function DisordersPage() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(
    DISORDER_REFERENCE[0]?.id ?? null
  );

  const filtered = useMemo(
    () => (query ? searchDisorders(query) : DISORDER_REFERENCE),
    [query]
  );
  const active = DISORDER_REFERENCE.find((d) => d.id === activeId);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Disorder reference"
        subtitle="Navigation layer for DSM-5-TR / ICD-11 — no copyrighted criterion text. Clinician supplies authoritative content from their licensed reference."
      />

      <div
        className="rounded-xl border p-3 mb-4 text-xs"
        style={{
          borderColor: "var(--psych-border)",
          backgroundColor: "var(--psych-primary-light)",
          color: "var(--psych-accent)",
        }}
      >
        ✦ This module is a navigation + linkage layer only. Criterion text is
        intentionally omitted. Pair with your official DSM-5-TR or ICD-11
        reference for diagnostic decisions.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SectionCard title="Disorders" className="md:col-span-1">
          <div className="mb-2">
            <Label htmlFor="dis-search">Search</Label>
            <Input
              id="dis-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or category…"
            />
          </div>
          <ul className="space-y-1 max-h-[520px] overflow-y-auto">
            {filtered.map((d) => (
              <li key={d.id}>
                <button
                  onClick={() => setActiveId(d.id)}
                  className="w-full text-left p-2 rounded-lg text-sm"
                  style={{
                    backgroundColor:
                      activeId === d.id ? "var(--psych-primary-light)" : "transparent",
                    color: "var(--psych-text)",
                  }}
                >
                  <div className="font-medium">{d.name}</div>
                  <div
                    className="text-[10px]"
                    style={{ color: "var(--psych-muted)" }}
                  >
                    {d.category}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </SectionCard>

        <div className="md:col-span-2 space-y-4">
          {active ? (
            <>
              <SectionCard title={active.name} description={active.category}>
                <div className="flex items-center gap-3 mb-3 text-xs">
                  <span
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: "var(--psych-bg)",
                      color: "var(--psych-muted)",
                    }}
                  >
                    {active.dsmCode ?? "DSM code: see official text"}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: "var(--psych-bg)",
                      color: "var(--psych-muted)",
                    }}
                  >
                    {active.icdCode ?? "ICD code: see official text"}
                  </span>
                </div>
                <p className="text-sm mb-3" style={{ color: "var(--psych-text)" }}>
                  {active.shortSummary}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <h4
                      className="text-[10px] font-semibold uppercase tracking-wide mb-1"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      Associated features
                    </h4>
                    <ul className="space-y-0.5">
                      {active.associatedFeatures.map((f) => (
                        <li key={f}>· {f}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4
                      className="text-[10px] font-semibold uppercase tracking-wide mb-1"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      Differential considerations
                    </h4>
                    <ul className="space-y-0.5">
                      {active.differentialConsiderations.map((f) => (
                        <li key={f}>· {f}</li>
                      ))}
                    </ul>
                  </div>
                  {active.specifiers.length > 0 && (
                    <div>
                      <h4
                        className="text-[10px] font-semibold uppercase tracking-wide mb-1"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        Specifiers (placeholder)
                      </h4>
                      <ul className="space-y-0.5">
                        {active.specifiers.map((s) => (
                          <li key={s}>· {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {active.culturalConsiderations.length > 0 && (
                    <div>
                      <h4
                        className="text-[10px] font-semibold uppercase tracking-wide mb-1"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        Cultural considerations
                      </h4>
                      <ul className="space-y-0.5">
                        {active.culturalConsiderations.map((s) => (
                          <li key={s}>· {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Linked materials in Psych">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {active.linkedAssessmentIds.length > 0 && (
                    <div>
                      <h4
                        className="text-[10px] font-semibold uppercase tracking-wide mb-1"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        Assessments
                      </h4>
                      <ul className="space-y-0.5">
                        {active.linkedAssessmentIds.map((id) => (
                          <li key={id}>
                            <Link
                              href={`/assessments/library`}
                              className="underline"
                              style={{ color: "var(--psych-primary)" }}
                            >
                              {id.toUpperCase()}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {active.linkedInterventionIds.length > 0 && (
                    <div>
                      <h4
                        className="text-[10px] font-semibold uppercase tracking-wide mb-1"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        Interventions
                      </h4>
                      <ul className="space-y-0.5">
                        {active.linkedInterventionIds.map((id) => (
                          <li key={id}>
                            <Link
                              href={`/clinical/interventions`}
                              className="underline"
                              style={{ color: "var(--psych-primary)" }}
                            >
                              {id}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {active.linkedWorkbookIds.length > 0 && (
                    <div>
                      <h4
                        className="text-[10px] font-semibold uppercase tracking-wide mb-1"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        Workbooks (client-facing)
                      </h4>
                      <ul className="space-y-0.5">
                        {active.linkedWorkbookIds.map((id) => (
                          <li key={id}>
                            <Link
                              href={`/client/workbooks/${id}`}
                              className="underline"
                              style={{ color: "var(--psych-primary)" }}
                            >
                              {id}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </SectionCard>
            </>
          ) : (
            <SectionCard title="Pick a disorder">
              <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
                Select an entry from the list.
              </p>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
