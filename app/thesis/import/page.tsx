"use client";
// Real participant-data import workflow. Drop or paste a CSV, preview
// the validated rows, then import — replaces the demo seed data in
// ThesisContext.

import { useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, FileUp, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/Toast";
import { saveToStorage } from "@/lib/store";
import {
  EXAMPLE_CSV,
  toThesisParticipants,
  validateImport,
  type ImportPreview,
} from "@/lib/thesis/csv-import";

export default function ThesisImportPage() {
  const { toast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<ImportPreview | null>(null);

  function runValidate() {
    if (!csvText.trim()) {
      setPreview(null);
      return;
    }
    setPreview(validateImport(csvText));
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      setCsvText(text);
      setPreview(validateImport(text));
    });
    e.target.value = "";
  }

  function commitImport() {
    if (!preview) return;
    if (preview.issues.some((i) => i.severity === "error")) {
      toast("Resolve errors before importing", "warning");
      return;
    }
    const participants = toThesisParticipants(preview);
    saveToStorage("thesis_participants", participants);
    toast(`Imported ${participants.length} participants`, "success");
    setTimeout(() => window.location.assign("/thesis/dashboard"), 600);
  }

  function loadExample() {
    setCsvText(EXAMPLE_CSV);
    setPreview(validateImport(EXAMPLE_CSV));
  }

  const errors = preview?.issues.filter((i) => i.severity === "error") ?? [];
  const warnings = preview?.issues.filter((i) => i.severity === "warning") ?? [];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in" data-section="thesis">
      <PageHeader
        title="Import participant-level data"
        subtitle="Drop in your thesis CSV. Each participant becomes a row in the Thesis Studio dataset."
        action={
          <Link href="/thesis/dashboard">
            <Button size="sm" variant="ghost">
              ← Dashboard
            </Button>
          </Link>
        }
      />

      <SectionCard
        title="Expected columns"
        description="Headers are normalised to lower-case; common aliases are recognised."
      >
        <table className="w-full text-xs">
          <thead>
            <tr style={{ color: "var(--psych-muted)" }} className="text-left">
              <th className="py-1">Column</th>
              <th>Required</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {[
              { col: "participant_id", req: "yes", note: "Unique. Aliases: id, participant." },
              { col: "age", req: "no", note: "Integer 14–99." },
              { col: "gender", req: "no", note: "Free text. Alias: sex." },
              { col: "CDS_total", req: "recommended", note: "0–290 plausible range." },
              { col: "STAI_trait", req: "recommended", note: "20–80 plausible range. Alias: trait_anxiety." },
              { col: "STAI_state", req: "no", note: "20–80 plausible range." },
              { col: "PHQ9_total", req: "recommended", note: "0–27. Alias: phq9_score." },
              { col: "qualitative_group", req: "no", note: "Clinical / Subclinical / Control. Derived if missing." },
              { col: "notes", req: "no", note: "Free text." },
            ].map((row) => (
              <tr key={row.col} className="border-t" style={{ borderColor: "var(--psych-border)" }}>
                <td className="py-1 font-mono">{row.col}</td>
                <td>{row.req}</td>
                <td style={{ color: "var(--psych-muted)" }}>{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      <SectionCard
        title="CSV input"
        description="Drop a file or paste the CSV directly."
        className="mt-4"
        action={
          <div className="flex gap-2">
            <input
              ref={fileInput}
              type="file"
              accept=".csv,text/csv"
              onChange={onFile}
              style={{ display: "none" }}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => fileInput.current?.click()}
            >
              <FileUp size={13} /> Choose CSV
            </Button>
            <Button size="sm" variant="ghost" onClick={loadExample}>
              Load example
            </Button>
          </div>
        }
      >
        <Textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder="participant_id,age,gender,CDS_total,STAI_trait,PHQ9_total,group,notes…"
          className="font-mono text-xs"
          style={{ minHeight: 220 }}
        />
        <div className="flex gap-2 mt-3">
          <Button size="sm" onClick={runValidate} disabled={!csvText.trim()}>
            Validate
          </Button>
          {csvText && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setCsvText("");
                setPreview(null);
              }}
            >
              <Trash2 size={12} /> Clear
            </Button>
          )}
        </div>
      </SectionCard>

      {preview && (
        <SectionCard
          title={`Preview · ${preview.summary.total} row(s)`}
          description={`CDS: ${preview.summary.withCds} · STAI: ${preview.summary.withStai} · PHQ-9: ${preview.summary.withPhq9}`}
          className="mt-4"
        >
          {errors.length > 0 && (
            <div
              className="rounded-xl p-3 mb-3"
              style={{ background: "#FEE2E2", color: "#9B4D3A" }}
            >
              <div className="flex items-center gap-2 mb-1 text-sm font-semibold">
                <AlertTriangle size={14} /> {errors.length} error(s) — resolve
                before importing
              </div>
              <ul className="text-xs space-y-1 list-disc ml-5">
                {errors.slice(0, 8).map((e, i) => (
                  <li key={i}>
                    {e.rowIndex >= 0 ? `Row ${e.rowIndex}: ` : ""}
                    {e.participantId ? `[${e.participantId}] ` : ""}
                    {e.message}
                  </li>
                ))}
                {errors.length > 8 && (
                  <li>… and {errors.length - 8} more.</li>
                )}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div
              className="rounded-xl p-3 mb-3"
              style={{
                background: "var(--psych-primary-light)",
                color: "var(--psych-accent)",
              }}
            >
              <div className="text-sm font-medium mb-1">
                {warnings.length} warning(s)
              </div>
              <ul className="text-xs space-y-1 list-disc ml-5">
                {warnings.slice(0, 6).map((w, i) => (
                  <li key={i}>
                    {w.rowIndex >= 0 ? `Row ${w.rowIndex}: ` : ""}
                    {w.participantId ? `[${w.participantId}] ` : ""}
                    {w.message}
                  </li>
                ))}
                {warnings.length > 6 && <li>… and {warnings.length - 6} more.</li>}
              </ul>
            </div>
          )}

          {preview.rows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr style={{ color: "var(--psych-muted)" }}>
                    <th className="py-1 pr-2 text-left">ID</th>
                    <th className="text-left">Age</th>
                    <th className="text-left">Gender</th>
                    <th className="text-right">CDS</th>
                    <th className="text-right">STAI-trait</th>
                    <th className="text-right">PHQ-9</th>
                    <th className="text-left">Group</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.slice(0, 10).map((r) => (
                    <tr
                      key={r.rowIndex}
                      className="border-t"
                      style={{ borderColor: "var(--psych-border)" }}
                    >
                      <td className="py-1 pr-2 font-mono">{r.participantId}</td>
                      <td>{r.age ?? "—"}</td>
                      <td>{r.gender || "—"}</td>
                      <td className="text-right font-mono">
                        {r.cdsTotal ?? "—"}
                      </td>
                      <td className="text-right font-mono">
                        {r.staiTrait ?? "—"}
                      </td>
                      <td className="text-right font-mono">
                        {r.phq9Total ?? "—"}
                      </td>
                      <td>{r.group || "(derived)"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.rows.length > 10 && (
                <p
                  className="text-xs mt-2"
                  style={{ color: "var(--psych-muted)" }}
                >
                  Showing first 10 of {preview.rows.length} rows.
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 mt-4">
            <Button
              size="sm"
              onClick={commitImport}
              disabled={errors.length > 0 || preview.rows.length === 0}
            >
              <CheckCircle2 size={13} /> Import {preview.rows.length} row(s)
            </Button>
            <span
              className="text-xs"
              style={{ color: "var(--psych-muted)" }}
            >
              Existing seed participants will be replaced.
            </span>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
