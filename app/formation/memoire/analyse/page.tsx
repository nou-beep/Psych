"use client";
// Analyse des données — calm, single-purpose workspace for the
// empirical thesis study. Entry + table + live descriptives +
// correlations + clinical bands + CSV export. No fabricated data;
// empty state reads "collecte en cours".

import { useMemo, useState } from "react";
import { Plus, Trash2, Download, Copy, AlertCircle } from "lucide-react";
import { useT } from "@/contexts/LocaleContext";
import { useThesisDataset } from "@/contexts/ThesisDatasetContext";
import {
  depersonalisationGroup,
  dissociationGroup,
  GROUP_VALUES,
  respondentsToCSV,
  SEX_VALUES,
  validateRespondent,
  type Group,
  type Respondent,
  type Sex,
} from "@/lib/thesis/dataset";
import {
  describe,
  pearson,
  spearman,
  type CorrelationResult,
  type DescriptiveSummary,
} from "@/lib/thesis/stats";
import {
  countGad7Bands,
  countPhq9Bands,
  GAD7_BAND_ORDER,
  GAD7_BAND_RANGES,
  PHQ9_BAND_ORDER,
  PHQ9_BAND_RANGES,
} from "@/lib/thesis/clinical-bands";

// ─── Empty draft factory ────────────────────────────────────

interface DraftState {
  age: string;
  sex: Sex | "";
  group: Group | "";
  phq9: string;
  gad7: string;
  des: string;
  cds: string;
}

const EMPTY_DRAFT: DraftState = {
  age: "",
  sex: "",
  group: "",
  phq9: "",
  gad7: "",
  des: "",
  cds: "",
};

// ─── Page ────────────────────────────────────────────────────

export default function ThesisDataAnalysisPage() {
  const t = useT();
  const { records, add, remove } = useThesisDataset();

  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  // ── Live subsamples ──
  const diss = useMemo(() => dissociationGroup(records), [records]);
  const dep = useMemo(() => depersonalisationGroup(records), [records]);

  // ── Descriptives ──
  const desc = useMemo(() => {
    const phq9All = records.map((r) => r.phq9);
    const gad7All = records.map((r) => r.gad7);
    const phq9Diss = diss.map((r) => r.phq9);
    const gad7Diss = diss.map((r) => r.gad7);
    const desDiss = diss
      .map((r) => r.des)
      .filter((v): v is number => typeof v === "number");
    const phq9Dep = dep.map((r) => r.phq9);
    const gad7Dep = dep.map((r) => r.gad7);
    const cdsDep = dep
      .map((r) => r.cds)
      .filter((v): v is number => typeof v === "number");
    return {
      phq9All: describe(phq9All),
      gad7All: describe(gad7All),
      phq9Diss: describe(phq9Diss),
      gad7Diss: describe(gad7Diss),
      desDiss: describe(desDiss),
      phq9Dep: describe(phq9Dep),
      gad7Dep: describe(gad7Dep),
      cdsDep: describe(cdsDep),
    };
  }, [records, diss, dep]);

  // ── Correlations ──
  const corr = useMemo(() => {
    const pairs = (xs: number[], ys: number[]) => ({
      pearson: pearson(xs, ys),
      spearman: spearman(xs, ys),
    });
    return {
      phq9Gad7All: pairs(
        records.map((r) => r.phq9),
        records.map((r) => r.gad7)
      ),
      gad7DesDiss: pairs(
        diss.map((r) => r.gad7),
        diss.map((r) => r.des ?? Number.NaN)
      ),
      phq9DesDiss: pairs(
        diss.map((r) => r.phq9),
        diss.map((r) => r.des ?? Number.NaN)
      ),
      gad7CdsDep: pairs(
        dep.map((r) => r.gad7),
        dep.map((r) => r.cds ?? Number.NaN)
      ),
      phq9CdsDep: pairs(
        dep.map((r) => r.phq9),
        dep.map((r) => r.cds ?? Number.NaN)
      ),
    };
  }, [records, diss, dep]);

  // ── Clinical bands ──
  const bands = useMemo(
    () => ({
      phq9: countPhq9Bands(records.map((r) => r.phq9)),
      gad7: countGad7Bands(records.map((r) => r.gad7)),
    }),
    [records]
  );

  // ── Submit handler ──
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCopyMsg(null);

    const parsed = {
      age: parseInt(draft.age, 10),
      sex: (draft.sex || undefined) as Sex | undefined,
      group: (draft.group || undefined) as Group | undefined,
      phq9: parseFloat(draft.phq9),
      gad7: parseFloat(draft.gad7),
      des:
        draft.group === "dissociation" && draft.des !== ""
          ? parseFloat(draft.des)
          : undefined,
      cds:
        draft.group === "depersonalisation" && draft.cds !== ""
          ? parseFloat(draft.cds)
          : undefined,
    };

    const errs = validateRespondent(parsed);
    if (errs.length > 0) {
      const map: Record<string, string> = {};
      for (const e of errs) {
        map[e.field] = t(`analysis.errors.${e.message}`);
      }
      setErrors(map);
      return;
    }
    setErrors({});
    add({
      age: parsed.age,
      sex: parsed.sex!,
      group: parsed.group!,
      phq9: parsed.phq9,
      gad7: parsed.gad7,
      des: parsed.des,
      cds: parsed.cds,
    });
    setDraft(EMPTY_DRAFT);
  }

  // ── Export handlers ──
  function downloadFile(name: string, content: string, mime: string) {
    if (typeof window === "undefined") return;
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportDatasetCSV() {
    downloadFile(
      `eyla-dataset-${new Date().toISOString().slice(0, 10)}.csv`,
      respondentsToCSV(records),
      "text/csv;charset=utf-8"
    );
  }

  function buildResultsCSV(): string {
    const lines: string[] = [];
    lines.push("# Descriptives");
    lines.push("scale,sample,n,mean,sd,median,min,max,skew");
    const dRows: Array<{ label: string; sample: string; d: DescriptiveSummary }> = [
      { label: "PHQ-9", sample: t("analysis.descriptives.labels.phq9All"), d: desc.phq9All },
      { label: "GAD-7", sample: t("analysis.descriptives.labels.gad7All"), d: desc.gad7All },
      { label: "PHQ-9", sample: t("analysis.descriptives.labels.phq9Diss"), d: desc.phq9Diss },
      { label: "GAD-7", sample: t("analysis.descriptives.labels.gad7Diss"), d: desc.gad7Diss },
      { label: "DES",   sample: t("analysis.descriptives.labels.desDiss"),  d: desc.desDiss },
      { label: "PHQ-9", sample: t("analysis.descriptives.labels.phq9Dep"),  d: desc.phq9Dep },
      { label: "GAD-7", sample: t("analysis.descriptives.labels.gad7Dep"),  d: desc.gad7Dep },
      { label: "CDS",   sample: t("analysis.descriptives.labels.cdsDep"),   d: desc.cdsDep },
    ];
    for (const r of dRows) {
      lines.push(
        [
          r.label,
          quoteCSV(r.sample),
          String(r.d.n),
          fmtNumCSV(r.d.mean),
          fmtNumCSV(r.d.sd),
          fmtNumCSV(r.d.median),
          fmtNumCSV(r.d.min),
          fmtNumCSV(r.d.max),
          fmtNumCSV(r.d.skew),
        ].join(",")
      );
    }
    lines.push("");
    lines.push("# Correlations");
    lines.push("pair,sample,n,pearson_r,pearson_p,spearman_rho,spearman_p");
    const cRows: Array<{
      pair: string;
      sample: string;
      pearson: CorrelationResult;
      spearman: CorrelationResult;
    }> = [
      { pair: t("analysis.correlations.pairs.phq9Gad7"), sample: t("analysis.correlations.samples.whole"),            ...corr.phq9Gad7All },
      { pair: t("analysis.correlations.pairs.gad7Des"),  sample: t("analysis.correlations.samples.dissociation"),     ...corr.gad7DesDiss },
      { pair: t("analysis.correlations.pairs.phq9Des"),  sample: t("analysis.correlations.samples.dissociation"),     ...corr.phq9DesDiss },
      { pair: t("analysis.correlations.pairs.gad7Cds"),  sample: t("analysis.correlations.samples.depersonalisation"),...corr.gad7CdsDep },
      { pair: t("analysis.correlations.pairs.phq9Cds"),  sample: t("analysis.correlations.samples.depersonalisation"),...corr.phq9CdsDep },
    ];
    for (const r of cRows) {
      lines.push(
        [
          quoteCSV(r.pair),
          quoteCSV(r.sample),
          String(r.pearson.n),
          fmtNumCSV(r.pearson.r),
          fmtNumCSV(r.pearson.p),
          fmtNumCSV(r.spearman.r),
          fmtNumCSV(r.spearman.p),
        ].join(",")
      );
    }
    return lines.join("\n");
  }

  function exportResultsCSV() {
    downloadFile(
      `eyla-results-${new Date().toISOString().slice(0, 10)}.csv`,
      buildResultsCSV(),
      "text/csv;charset=utf-8"
    );
  }

  async function copyResults() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    await navigator.clipboard.writeText(buildResultsCSV());
    setCopyMsg(t("analysis.export.copied"));
    setTimeout(() => setCopyMsg(null), 1800);
  }

  return (
    <div className="max-w-5xl mx-auto py-6 animate-fade-in">
      <header style={{ marginBottom: "1.5rem" }}>
        <p
          className="text-xs uppercase tracking-widest font-semibold"
          style={{ color: "#5B36A8" }}
        >
          Formation · Mémoire
        </p>
        <h1
          className="text-2xl font-bold mt-1"
          style={{ color: "var(--psych-text)" }}
        >
          {t("analysis.title")}
        </h1>
        <p
          className="text-sm mt-2 max-w-3xl"
          style={{ color: "var(--psych-muted)" }}
        >
          {t("analysis.subtitle")}
        </p>
      </header>

      <CountsBar
        total={records.length}
        diss={diss.length}
        dep={dep.length}
        t={t}
      />

      <Note message={t("analysis.pinnedNote")} />

      <section
        style={{
          marginTop: "1.5rem",
          display: "grid",
          gridTemplateColumns: "minmax(280px, 360px) 1fr",
          gap: "1rem",
        }}
        className="analyse-grid"
      >
        <EntryForm
          draft={draft}
          errors={errors}
          onChange={setDraft}
          onSubmit={onSubmit}
          t={t}
        />
        <RespondentsTable
          records={records}
          onRemove={(id) => {
            if (window.confirm(t("analysis.table.confirmRemove"))) remove(id);
          }}
          t={t}
        />
      </section>

      <DescriptivesTable desc={desc} t={t} />

      <CorrelationsTable corr={corr} t={t} />

      <BandsTable bands={bands} t={t} />

      <ExportPanel
        onExportData={exportDatasetCSV}
        onExportResults={exportResultsCSV}
        onCopy={copyResults}
        copyMsg={copyMsg}
        t={t}
      />

      {/* Stack the entry form above the table on narrow viewports */}
      <style jsx>{`
        @media (max-width: 900px) {
          .analyse-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Subcomponents ──────────────────────────────────────────

type TFn = ReturnType<typeof useT>;

function CountsBar({
  total,
  diss,
  dep,
  t,
}: {
  total: number;
  diss: number;
  dep: number;
  t: TFn;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "0.6rem",
      }}
    >
      <Counter label={t("analysis.counts.total")} value={total} accent="#8E72CC" />
      <Counter label={t("analysis.counts.dissociation")} value={diss} accent="#5B36A8" />
      <Counter
        label={t("analysis.counts.depersonalisation")}
        value={dep}
        accent="#9F1239"
      />
    </div>
  );
}

function Counter({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div
      style={{
        padding: "0.85rem 1rem",
        borderRadius: 14,
        background: "var(--psych-card)",
        border: `1px solid ${accent}33`,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "var(--psych-muted)",
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 600,
          color: accent,
          marginTop: 2,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Note({ message }: { message: string }) {
  return (
    <div
      style={{
        marginTop: "1rem",
        padding: "0.7rem 0.9rem",
        borderRadius: 12,
        background: "rgba(245,158,11,0.08)",
        border: "1px solid rgba(245,158,11,0.25)",
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        color: "#92400E",
        fontSize: 13,
      }}
    >
      <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
      <p style={{ margin: 0, lineHeight: 1.5 }}>{message}</p>
    </div>
  );
}

function EntryForm({
  draft,
  errors,
  onChange,
  onSubmit,
  t,
}: {
  draft: DraftState;
  errors: Record<string, string>;
  onChange: (next: DraftState) => void;
  onSubmit: (e: React.FormEvent) => void;
  t: TFn;
}) {
  function patch<K extends keyof DraftState>(k: K, v: DraftState[K]) {
    onChange({ ...draft, [k]: v });
  }

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.45rem 0.6rem",
    borderRadius: 8,
    border: "1px solid var(--psych-border)",
    fontSize: 13,
    background: "var(--psych-bg)",
    color: "var(--psych-text)",
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{
        padding: "1rem",
        borderRadius: 14,
        background: "var(--psych-card)",
        border: "1px solid var(--psych-border)",
        alignSelf: "start",
        position: "sticky",
        top: 16,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 600,
          color: "var(--psych-text)",
        }}
      >
        {t("analysis.entry.title")}
      </h2>
      <p
        style={{
          fontSize: 11,
          margin: "4px 0 12px 0",
          color: "var(--psych-muted)",
        }}
      >
        {t("analysis.entry.summary")}
      </p>

      <Field label={t("analysis.entry.age")} error={errors.age}>
        <input
          type="number"
          inputMode="numeric"
          placeholder={t("analysis.entry.agePlaceholder")}
          value={draft.age}
          onChange={(e) => patch("age", e.target.value)}
          style={fieldStyle}
        />
      </Field>

      <Field label={t("analysis.entry.sex")} error={errors.sex}>
        <select
          value={draft.sex}
          onChange={(e) => patch("sex", e.target.value as Sex | "")}
          style={fieldStyle}
        >
          <option value="">—</option>
          {SEX_VALUES.map((s) => (
            <option key={s} value={s}>
              {t(`analysis.entry.sexOptions.${s}`)}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t("analysis.entry.group")} error={errors.group}>
        <select
          value={draft.group}
          onChange={(e) => patch("group", e.target.value as Group | "")}
          style={fieldStyle}
        >
          <option value="">—</option>
          {GROUP_VALUES.map((g) => (
            <option key={g} value={g}>
              {t(`analysis.entry.groupOptions.${g}`)}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t("analysis.entry.phq9")} error={errors.phq9}>
        <input
          type="number"
          step="1"
          min={0}
          max={27}
          value={draft.phq9}
          onChange={(e) => patch("phq9", e.target.value)}
          style={fieldStyle}
        />
      </Field>

      <Field label={t("analysis.entry.gad7")} error={errors.gad7}>
        <input
          type="number"
          step="1"
          min={0}
          max={21}
          value={draft.gad7}
          onChange={(e) => patch("gad7", e.target.value)}
          style={fieldStyle}
        />
      </Field>

      {draft.group === "dissociation" && (
        <Field label={t("analysis.entry.des")} error={errors.des}>
          <input
            type="number"
            step="0.1"
            min={0}
            max={100}
            value={draft.des}
            onChange={(e) => patch("des", e.target.value)}
            style={fieldStyle}
          />
        </Field>
      )}

      {draft.group === "depersonalisation" && (
        <Field label={t("analysis.entry.cds")} error={errors.cds}>
          <input
            type="number"
            step="1"
            min={0}
            max={290}
            value={draft.cds}
            onChange={(e) => patch("cds", e.target.value)}
            style={fieldStyle}
          />
        </Field>
      )}

      <button
        type="submit"
        style={{
          marginTop: 12,
          width: "100%",
          padding: "0.55rem 0.8rem",
          borderRadius: 10,
          border: "none",
          background: "linear-gradient(135deg, #8E72CC, #5B36A8)",
          color: "white",
          fontWeight: 500,
          fontSize: 13,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <Plus size={14} /> {t("analysis.entry.submit")}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block", marginBottom: 10 }}>
      <span
        style={{
          fontSize: 11,
          color: "var(--psych-muted)",
          display: "block",
          marginBottom: 3,
        }}
      >
        {label}
      </span>
      {children}
      {error && (
        <span
          style={{
            fontSize: 11,
            color: "#9F1239",
            marginTop: 4,
            display: "block",
          }}
        >
          {error}
        </span>
      )}
    </label>
  );
}

function RespondentsTable({
  records,
  onRemove,
  t,
}: {
  records: Respondent[];
  onRemove: (id: string) => void;
  t: TFn;
}) {
  return (
    <div
      style={{
        padding: "1rem",
        borderRadius: 14,
        background: "var(--psych-card)",
        border: "1px solid var(--psych-border)",
        overflowX: "auto",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 10,
          color: "var(--psych-text)",
        }}
      >
        {t("analysis.table.title")}
      </h2>
      {records.length === 0 ? (
        <p
          style={{
            margin: 0,
            color: "var(--psych-muted)",
            fontSize: 13,
            padding: "1rem 0",
            textAlign: "center",
          }}
        >
          {t("analysis.table.empty")}
        </p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 12,
            color: "var(--psych-text)",
          }}
        >
          <thead>
            <tr style={{ background: "var(--psych-bg)" }}>
              {[
                "n", "age", "sex", "group", "phq9", "gad7", "des", "cds", "actions",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "0.4rem 0.5rem",
                    fontWeight: 500,
                    borderBottom: "1px solid var(--psych-border)",
                    fontSize: 11,
                    color: "var(--psych-muted)",
                  }}
                >
                  {t(`analysis.table.headers.${h}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={r.id}>
                <td style={tdStyle}>{records.length - i}</td>
                <td style={tdStyle}>{r.age}</td>
                <td style={tdStyle}>{t(`analysis.entry.sexOptions.${r.sex}`)}</td>
                <td style={tdStyle}>{t(`analysis.entry.groupOptions.${r.group}`)}</td>
                <td style={tdStyle}>{r.phq9}</td>
                <td style={tdStyle}>{r.gad7}</td>
                <td style={tdStyle}>{r.des ?? "—"}</td>
                <td style={tdStyle}>{r.cds ?? "—"}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => onRemove(r.id)}
                    aria-label={t("analysis.table.remove")}
                    title={t("analysis.table.remove")}
                    style={{
                      all: "unset",
                      cursor: "pointer",
                      padding: 4,
                      borderRadius: 6,
                      color: "#9F1239",
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const tdStyle: React.CSSProperties = {
  padding: "0.4rem 0.5rem",
  borderBottom: "1px solid var(--psych-border)",
};

// ── Descriptives table ──

function DescriptivesTable({
  desc,
  t,
}: {
  desc: Record<string, DescriptiveSummary>;
  t: TFn;
}) {
  const rows: Array<{ scale: string; sample: string; d: DescriptiveSummary }> = [
    { scale: "PHQ-9", sample: t("analysis.descriptives.labels.phq9All"), d: desc.phq9All },
    { scale: "GAD-7", sample: t("analysis.descriptives.labels.gad7All"), d: desc.gad7All },
    { scale: "PHQ-9", sample: t("analysis.descriptives.labels.phq9Diss"), d: desc.phq9Diss },
    { scale: "GAD-7", sample: t("analysis.descriptives.labels.gad7Diss"), d: desc.gad7Diss },
    { scale: "DES",   sample: t("analysis.descriptives.labels.desDiss"),  d: desc.desDiss },
    { scale: "PHQ-9", sample: t("analysis.descriptives.labels.phq9Dep"),  d: desc.phq9Dep },
    { scale: "GAD-7", sample: t("analysis.descriptives.labels.gad7Dep"),  d: desc.gad7Dep },
    { scale: "CDS",   sample: t("analysis.descriptives.labels.cdsDep"),   d: desc.cdsDep },
  ];

  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h2 style={sectionTitleStyle}>{t("analysis.descriptives.title")}</h2>
      <p style={sectionDescStyle}>{t("analysis.descriptives.desc")}</p>
      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {[
                "scale", "sample", "n", "mean", "sd", "median", "min", "max", "skew",
              ].map((h) => (
                <th key={h} style={thStyle}>
                  {t(`analysis.descriptives.headers.${h}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td style={tdStyle}>{r.scale}</td>
                <td style={tdStyle}>{r.sample}</td>
                <td style={tdNumStyle}>{r.d.n}</td>
                <td style={tdNumStyle}>{fmtNum(r.d.mean, t)}</td>
                <td style={tdNumStyle}>{fmtNum(r.d.sd, t)}</td>
                <td style={tdNumStyle}>{fmtNum(r.d.median, t)}</td>
                <td style={tdNumStyle}>{fmtNum(r.d.min, t)}</td>
                <td style={tdNumStyle}>{fmtNum(r.d.max, t)}</td>
                <td style={tdNumStyle}>{fmtNum(r.d.skew, t)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── Correlations table ──

function CorrelationsTable({
  corr,
  t,
}: {
  corr: Record<
    string,
    { pearson: CorrelationResult; spearman: CorrelationResult }
  >;
  t: TFn;
}) {
  const rows = [
    {
      pair: t("analysis.correlations.pairs.phq9Gad7"),
      sample: t("analysis.correlations.samples.whole"),
      data: corr.phq9Gad7All,
    },
    {
      pair: t("analysis.correlations.pairs.gad7Des"),
      sample: t("analysis.correlations.samples.dissociation"),
      data: corr.gad7DesDiss,
    },
    {
      pair: t("analysis.correlations.pairs.phq9Des"),
      sample: t("analysis.correlations.samples.dissociation"),
      data: corr.phq9DesDiss,
    },
    {
      pair: t("analysis.correlations.pairs.gad7Cds"),
      sample: t("analysis.correlations.samples.depersonalisation"),
      data: corr.gad7CdsDep,
    },
    {
      pair: t("analysis.correlations.pairs.phq9Cds"),
      sample: t("analysis.correlations.samples.depersonalisation"),
      data: corr.phq9CdsDep,
    },
  ];

  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h2 style={sectionTitleStyle}>{t("analysis.correlations.title")}</h2>
      <p style={sectionDescStyle}>{t("analysis.correlations.desc")}</p>
      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {[
                "pair", "sample", "n", "pearsonR", "pearsonP", "spearmanRho", "spearmanP",
              ].map((h) => (
                <th key={h} style={thStyle}>
                  {t(`analysis.correlations.headers.${h}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const insufficient = r.data.pearson.n < 4;
              return (
                <tr key={i}>
                  <td style={tdStyle}>{r.pair}</td>
                  <td style={tdStyle}>{r.sample}</td>
                  <td style={tdNumStyle}>{r.data.pearson.n}</td>
                  <td style={tdNumStyle}>
                    {insufficient
                      ? t("analysis.correlations.insufficient")
                      : fmtNum(r.data.pearson.r, t, 3)}
                  </td>
                  <td style={tdNumStyle}>
                    {insufficient ? "—" : fmtNum(r.data.pearson.p, t, 4)}
                  </td>
                  <td style={tdNumStyle}>
                    {insufficient
                      ? t("analysis.correlations.insufficient")
                      : fmtNum(r.data.spearman.r, t, 3)}
                  </td>
                  <td style={tdNumStyle}>
                    {insufficient ? "—" : fmtNum(r.data.spearman.p, t, 4)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── Bands table ──

function BandsTable({
  bands,
  t,
}: {
  bands: {
    phq9: Record<string, number>;
    gad7: Record<string, number>;
  };
  t: TFn;
}) {
  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h2 style={sectionTitleStyle}>{t("analysis.bands.title")}</h2>
      <p style={sectionDescStyle}>{t("analysis.bands.desc")}</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1rem",
        }}
      >
        <BandsCard
          title={t("analysis.bands.phq9Title")}
          order={PHQ9_BAND_ORDER as unknown as string[]}
          ranges={PHQ9_BAND_RANGES as unknown as Record<string, string>}
          counts={bands.phq9}
          labelNs="analysis.bands.phq9Bands"
          t={t}
        />
        <BandsCard
          title={t("analysis.bands.gad7Title")}
          order={GAD7_BAND_ORDER as unknown as string[]}
          ranges={GAD7_BAND_RANGES as unknown as Record<string, string>}
          counts={bands.gad7}
          labelNs="analysis.bands.gad7Bands"
          t={t}
        />
      </div>
    </section>
  );
}

function BandsCard({
  title,
  order,
  ranges,
  counts,
  labelNs,
  t,
}: {
  title: string;
  order: string[];
  ranges: Record<string, string>;
  counts: Record<string, number>;
  labelNs: string;
  t: TFn;
}) {
  return (
    <div
      style={{
        padding: "1rem",
        borderRadius: 14,
        background: "var(--psych-card)",
        border: "1px solid var(--psych-border)",
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 8,
          color: "var(--psych-text)",
        }}
      >
        {title}
      </h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            {["band", "range", "count"].map((h) => (
              <th key={h} style={thStyle}>
                {t(`analysis.bands.headers.${h}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {order.map((b) => (
            <tr key={b}>
              <td style={tdStyle}>{t(`${labelNs}.${b}`)}</td>
              <td style={tdNumStyle}>{ranges[b]}</td>
              <td style={tdNumStyle}>{counts[b] ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Export panel ──

function ExportPanel({
  onExportData,
  onExportResults,
  onCopy,
  copyMsg,
  t,
}: {
  onExportData: () => void;
  onExportResults: () => void;
  onCopy: () => void;
  copyMsg: string | null;
  t: TFn;
}) {
  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h2 style={sectionTitleStyle}>{t("analysis.export.title")}</h2>
      <p style={sectionDescStyle}>{t("analysis.export.desc")}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={onExportData} style={btnPrimaryStyle}>
          <Download size={13} /> {t("analysis.export.csvData")}
        </button>
        <button onClick={onExportResults} style={btnSecondaryStyle}>
          <Download size={13} /> {t("analysis.export.csvResults")}
        </button>
        <button onClick={onCopy} style={btnSecondaryStyle}>
          <Copy size={13} /> {t("analysis.export.copyResults")}
        </button>
        {copyMsg && (
          <span style={{ fontSize: 12, color: "#0E7B5C", alignSelf: "center" }}>
            {copyMsg}
          </span>
        )}
      </div>
    </section>
  );
}

// ─── Shared styles + helpers ─────────────────────────────────

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  fontWeight: 600,
  color: "var(--psych-text)",
  marginBottom: 4,
};

const sectionDescStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: "var(--psych-muted)",
  marginBottom: 10,
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 12,
  color: "var(--psych-text)",
  background: "var(--psych-card)",
  border: "1px solid var(--psych-border)",
  borderRadius: 10,
  overflow: "hidden",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.45rem 0.55rem",
  fontWeight: 500,
  fontSize: 11,
  color: "var(--psych-muted)",
  background: "var(--psych-bg)",
  borderBottom: "1px solid var(--psych-border)",
};

const tdNumStyle: React.CSSProperties = {
  ...tdStyle,
  textAlign: "right",
  fontVariantNumeric: "tabular-nums",
  fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
};

const btnPrimaryStyle: React.CSSProperties = {
  padding: "0.5rem 0.85rem",
  borderRadius: 10,
  border: "none",
  background: "linear-gradient(135deg, #8E72CC, #5B36A8)",
  color: "white",
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

const btnSecondaryStyle: React.CSSProperties = {
  padding: "0.5rem 0.85rem",
  borderRadius: 10,
  border: "1px solid var(--psych-border)",
  background: "var(--psych-bg)",
  color: "var(--psych-text)",
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

function fmtNum(
  v: number | null,
  t: TFn,
  digits = 2
): string {
  if (v === null || !Number.isFinite(v)) return "—";
  return v.toFixed(digits);
}

function fmtNumCSV(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return "";
  return String(v);
}

function quoteCSV(value: string): string {
  if (/[",\n]/.test(value)) return '"' + value.replace(/"/g, '""') + '"';
  return value;
}
