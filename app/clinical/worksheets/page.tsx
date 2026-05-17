"use client";
// Real worksheet library — browseable, printable, structured templates.

import { useMemo, useState } from "react";
import { Printer, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  WORKSHEET_LIBRARY,
  findWorksheet,
  searchWorksheets,
  worksheetFieldCount,
  type WorksheetCategory,
  type WorksheetDefinition,
} from "@/lib/clinical/worksheets-library";

const CATEGORY_OPTIONS: Array<{ id: WorksheetCategory | "all"; label: string }> = [
  { id: "all", label: "All categories" },
  { id: "cbt", label: "CBT" },
  { id: "behavioral-activation", label: "Behavioral activation" },
  { id: "sleep", label: "Sleep" },
  { id: "panic", label: "Panic" },
  { id: "dissociation", label: "Dissociation / DPDR" },
  { id: "exposure", label: "Exposure" },
  { id: "emotion-regulation", label: "Emotion regulation" },
  { id: "sensory", label: "Sensory" },
  { id: "session", label: "Session" },
];

export default function WorksheetsLibraryPage() {
  const [activeId, setActiveId] = useState<string>(WORKSHEET_LIBRARY[0]?.id ?? "");
  const [category, setCategory] = useState<WorksheetCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [audience, setAudience] = useState<"therapist" | "client">("therapist");

  const visible = useMemo(() => {
    let pool = query ? searchWorksheets(query) : WORKSHEET_LIBRARY;
    if (category !== "all") pool = pool.filter((w) => w.category === category);
    return pool;
  }, [query, category]);

  const active = findWorksheet(activeId) ?? visible[0];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <PageHeader
        title="Worksheets"
        subtitle="10 clinician-usable structured worksheets — printable, assignable to client portal."
        action={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => window.print()}
          >
            <Printer size={13} /> Print
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Catalogue */}
        <SectionCard title="Catalogue" className="md:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Search size={13} style={{ color: "var(--psych-muted)" }} />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="text-sm"
            />
          </div>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as WorksheetCategory | "all")}
            className="mb-3 text-sm"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
          <ul
            className="space-y-1 sidebar-scroll overflow-y-auto"
            style={{ maxHeight: 480 }}
          >
            {visible.map((w) => (
              <li key={w.id}>
                <button
                  onClick={() => setActiveId(w.id)}
                  className="w-full text-left p-2 rounded-md"
                  style={{
                    background:
                      active?.id === w.id
                        ? "var(--psych-primary-light)"
                        : "transparent",
                    color: "var(--psych-text)",
                  }}
                >
                  <div className="text-sm font-medium">{w.title}</div>
                  <div
                    className="text-[10px]"
                    style={{ color: "var(--psych-muted)" }}
                  >
                    {w.category} · {worksheetFieldCount(w)} fields
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Active worksheet */}
        <div className="md:col-span-2">
          {active ? (
            <WorksheetView worksheet={active} audience={audience} onAudience={setAudience} />
          ) : (
            <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
              Pick a worksheet from the catalogue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function WorksheetView({
  worksheet,
  audience,
  onAudience,
}: {
  worksheet: WorksheetDefinition;
  audience: "therapist" | "client";
  onAudience: (a: "therapist" | "client") => void;
}) {
  const sections = worksheet.sections
    .map((s) => ({
      ...s,
      fields: s.fields.filter(
        (f) =>
          !f.audience ||
          f.audience === "both" ||
          (audience === "therapist" && f.audience === "therapist-only") ||
          (audience === "client" && f.audience === "client-only")
      ),
    }))
    .filter((s) => s.fields.length > 0);

  return (
    <article className="paper-card" data-state="draft">
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div>
          <div
            className="text-[10px] uppercase tracking-wider"
            style={{ color: "var(--psych-muted)" }}
          >
            {worksheet.category}
          </div>
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--psych-text)" }}
          >
            {worksheet.title}
          </h2>
        </div>
        <div className="flex gap-1 print:hidden">
          <button
            onClick={() => onAudience("therapist")}
            className="text-[11px] px-2 py-1 rounded-md border"
            style={{
              borderColor: audience === "therapist"
                ? "var(--psych-primary)"
                : "var(--psych-border)",
              background: audience === "therapist"
                ? "var(--psych-primary-light)"
                : "transparent",
              color: audience === "therapist"
                ? "var(--psych-accent)"
                : "var(--psych-muted)",
            }}
          >
            Therapist view
          </button>
          <button
            onClick={() => onAudience("client")}
            className="text-[11px] px-2 py-1 rounded-md border"
            style={{
              borderColor: audience === "client"
                ? "var(--psych-primary)"
                : "var(--psych-border)",
              background: audience === "client"
                ? "var(--psych-primary-light)"
                : "transparent",
              color: audience === "client"
                ? "var(--psych-accent)"
                : "var(--psych-muted)",
            }}
          >
            Client view
          </button>
        </div>
      </div>

      <p className="text-sm" style={{ color: "var(--psych-text)" }}>
        {worksheet.description}
      </p>
      <p
        className="annot-margin-note text-xs mt-2"
        style={{ color: "var(--psych-muted)" }}
      >
        Evidence note · {worksheet.evidence}
      </p>

      <div className="space-y-4 mt-5">
        {sections.map((s) => (
          <div key={s.id}>
            <h3
              className="text-sm font-semibold mb-2"
              style={{ color: "var(--psych-text)" }}
            >
              {s.heading}
            </h3>
            {s.description && (
              <p
                className="text-xs mb-2"
                style={{ color: "var(--psych-muted)" }}
              >
                {s.description}
              </p>
            )}
            <ul className="space-y-2">
              {s.fields.map((f) => (
                <li
                  key={f.id}
                  className="rounded-md border p-2"
                  style={{
                    borderColor: "var(--psych-border)",
                    borderStyle: f.audience === "therapist-only" ? "dashed" : "solid",
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="text-sm"
                      style={{ color: "var(--psych-text)" }}
                    >
                      {f.label}
                      {f.audience === "therapist-only" && (
                        <span
                          className="ml-2 text-[10px] px-1.5 py-0 rounded-full"
                          style={{
                            background: "var(--psych-primary-light)",
                            color: "var(--psych-accent)",
                          }}
                        >
                          therapist-only
                        </span>
                      )}
                    </div>
                    <span
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      {f.kind}
                    </span>
                  </div>
                  {f.hint && (
                    <div
                      className="text-[11px] mt-1"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      {f.hint}
                    </div>
                  )}
                  {f.options && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {f.options.map((o) => (
                        <span
                          key={o}
                          className="text-[10px] px-1.5 py-0 rounded-full border"
                          style={{
                            borderColor: "var(--psych-border)",
                            color: "var(--psych-muted)",
                          }}
                        >
                          {o}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p
        className="text-[11px] mt-4 italic"
        style={{ color: "var(--psych-muted)" }}
      >
        This is a template shell. Fields can be saved to a case, assigned to
        the client portal, or printed for in-session use.
      </p>
    </article>
  );
}
