"use client";
// Evidence-informed intervention library — browse by modality, search.

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  INTERVENTION_LIBRARY,
  MODALITY_ORDER,
  searchInterventions,
  type ModalityId,
} from "@/lib/clinical/interventions-library";

const EVIDENCE_COLOURS: Record<string, string> = {
  strong: "#10B981",
  moderate: "#3B82F6",
  emerging: "#F59E0B",
  "clinical-consensus": "#8B5CF6",
  placeholder: "#94A3B8",
};

export default function InterventionLibraryPage() {
  const [query, setQuery] = useState("");
  const [modality, setModality] = useState<ModalityId | "all">("all");

  const items = useMemo(() => {
    const base = query ? searchInterventions(query) : INTERVENTION_LIBRARY;
    return modality === "all" ? base : base.filter((i) => i.modality === modality);
  }, [query, modality]);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Intervention library"
        subtitle={`${INTERVENTION_LIBRARY.length} interventions across CBT, ACT, DBT, exposure, grounding, trauma stabilization, and more`}
      />

      <SectionCard title="Browse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="md:col-span-2">
            <Label htmlFor="iv-search">Search</Label>
            <Input
              id="iv-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, indication, tag…"
            />
          </div>
          <div>
            <Label htmlFor="iv-mod">Modality</Label>
            <Select
              id="iv-mod"
              value={modality}
              onChange={(e) => setModality(e.target.value as ModalityId | "all")}
            >
              <option value="all">All modalities</option>
              {MODALITY_ORDER.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <ul className="space-y-3">
          {items.map((i) => (
            <li
              key={i.id}
              className="rounded-xl border p-4"
              style={{
                borderColor: "var(--psych-border)",
                backgroundColor: "var(--psych-card)",
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3
                  className="text-sm font-semibold"
                  style={{ color: "var(--psych-text)" }}
                >
                  {i.name}
                </h3>
                <div className="flex items-center gap-1 flex-wrap">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: "var(--psych-primary-light)",
                      color: "var(--psych-accent)",
                    }}
                  >
                    {i.modality}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full text-white"
                    style={{
                      backgroundColor: EVIDENCE_COLOURS[i.evidenceLevel] ?? "#94A3B8",
                    }}
                  >
                    evidence: {i.evidenceLevel}
                  </span>
                </div>
              </div>
              <p
                className="text-xs leading-relaxed mb-2"
                style={{ color: "var(--psych-text)" }}
              >
                {i.description}
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--psych-muted)" }}
              >
                <strong>Therapeutic goal:</strong> {i.therapeuticGoal}
              </p>
              {i.indications.length > 0 && (
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--psych-muted)" }}
                >
                  <strong>Indications:</strong> {i.indications.join(", ")}
                </p>
              )}
              {i.contraindications.length > 0 && (
                <p
                  className="text-xs mt-1"
                  style={{ color: "#9F1239" }}
                >
                  <strong>Contraindications:</strong> {i.contraindications.join(", ")}
                </p>
              )}
              {i.evidenceNote && (
                <p
                  className="text-[11px] mt-1 italic"
                  style={{ color: "var(--psych-muted)" }}
                >
                  {i.evidenceNote}
                </p>
              )}
              {i.linkedWorkbookIds.length > 0 && (
                <p
                  className="text-[11px] mt-2"
                  style={{ color: "var(--psych-primary)" }}
                >
                  Linked workbooks:{" "}
                  {i.linkedWorkbookIds.map((id, idx) => (
                    <span key={id}>
                      <Link
                        href={`/client/workbooks/${id}`}
                        className="underline"
                      >
                        {id}
                      </Link>
                      {idx < i.linkedWorkbookIds.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ul>

        {items.length === 0 && (
          <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
            No interventions match.
          </p>
        )}
      </SectionCard>
    </div>
  );
}
