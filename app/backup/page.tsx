"use client";
// Backup & Export page — export full data or a single case as JSON,
// import a backup with preview + validation, and reset local data with
// a typed confirmation phrase.

import { useState, useRef } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Download,
  Upload,
  AlertTriangle,
  Database,
  FileJson,
  Trash2,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useApp } from "@/contexts/AppContext";
import {
  FULL_BACKUP_KEYS,
  buildFullBackup,
  buildSingleCaseBackup,
  parseBackupJSON,
  previewBackup,
  isResetConfirmed,
  RESET_CONFIRM_PHRASE,
  type BackupPreview,
  type ValidationResult,
} from "@/lib/backup";

function downloadJSON(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function readLocalStorageSnapshot(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of FULL_BACKUP_KEYS) {
    const raw = window.localStorage.getItem(key);
    if (raw === null) continue;
    try {
      out[key] = JSON.parse(raw);
    } catch {
      out[key] = raw;
    }
  }
  return out;
}

export default function BackupPage() {
  const { toast } = useToast();
  const { cases } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [importResult, setImportResult] = useState<ValidationResult | null>(
    null
  );
  const [importPreview, setImportPreview] = useState<BackupPreview | null>(
    null
  );
  const [resetPhrase, setResetPhrase] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  function exportFull() {
    const snapshot = readLocalStorageSnapshot();
    const backup = buildFullBackup(snapshot, {
      caseCount: Array.isArray(snapshot["psych-cases-v2"])
        ? (snapshot["psych-cases-v2"] as unknown[]).length
        : undefined,
    });
    const date = new Date().toISOString().split("T")[0];
    downloadJSON(`psych-backup-${date}.json`, backup);
    toast("Full backup downloaded", "success");
  }

  function exportSingleCase() {
    if (!selectedCaseId) {
      toast("Pick a case first", "warning");
      return;
    }
    const c = cases.find((x) => x.id === selectedCaseId);
    if (!c) return;

    // Pull all related arrays from localStorage so we capture the latest
    // persisted state, not just what's in React memory.
    const snap = readLocalStorageSnapshot();
    const arr = (k: string) =>
      Array.isArray(snap[k]) ? (snap[k] as unknown[]) : [];
    const matchByCase = (items: unknown[]) =>
      items.filter(
        (item: unknown) =>
          item !== null &&
          typeof item === "object" &&
          (item as { caseId?: string }).caseId === c.id
      );
    const matchByLinkedCase = (items: unknown[]) =>
      items.filter(
        (item: unknown) =>
          item !== null &&
          typeof item === "object" &&
          (item as { linkedCaseId?: string }).linkedCaseId === c.id
      );

    const backup = buildSingleCaseBackup({
      caseId: c.id,
      caseCode: c.code,
      case: c,
      checkIns: matchByCase(arr("psych-checkins-v2")),
      weeklyReviews: matchByCase(arr("psych-weekly-v2")),
      monthlyReviews: matchByCase(arr("psych-monthly-v2")),
      sessions: matchByCase(arr("psych-sessions-v2")),
      sessionPlans: matchByCase(arr("clinical_plans")),
      supervisionNotes: matchByCase(arr("psych-supervision-v2")),
      reflections: matchByLinkedCase(arr("clinical_reflections")),
      interventions: matchByCase(arr("clinical_interventions")),
      transcripts: matchByCase(arr("psych-transcripts-v2")),
      formulations: matchByCase(arr("clinical_formulations")),
      goals: matchByCase(arr("psych-goals-v2")),
      files: matchByCase(arr("psych-files-v2")),
      consent: matchByCase(arr("clinical_consent")),
      audioNotes: [],
    });
    downloadJSON(`psych-case-${c.code}.json`, backup);
    toast(`Exported ${c.code}`, "success");
  }

  function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      const result = parseBackupJSON(text);
      setImportResult(result);
      setImportPreview(previewBackup(result));
      if (!result.ok) {
        toast(result.error, "warning");
      }
    });
    e.target.value = "";
  }

  function confirmImport() {
    if (!importResult || !importResult.ok) return;
    if (importResult.kind === "full") {
      for (const [key, value] of Object.entries(importResult.backup.data)) {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
      toast("Imported. Reloading…", "success");
    } else {
      // Single-case import: merge the case + related arrays into existing
      // localStorage arrays, replacing any items with matching ids.
      const b = importResult.backup;
      const upsertArray = (key: string, items: unknown[]) => {
        const existingRaw = window.localStorage.getItem(key);
        let existing: unknown[] = [];
        if (existingRaw) {
          try {
            const parsed = JSON.parse(existingRaw);
            if (Array.isArray(parsed)) existing = parsed;
          } catch {}
        }
        const incomingIds = new Set(
          items
            .filter((x): x is { id: string } =>
              !!x && typeof x === "object" && typeof (x as { id?: unknown }).id === "string"
            )
            .map((x) => x.id)
        );
        const filtered = existing.filter(
          (x) =>
            !x ||
            typeof x !== "object" ||
            !incomingIds.has((x as { id?: string }).id ?? "")
        );
        window.localStorage.setItem(
          key,
          JSON.stringify([...items, ...filtered])
        );
      };

      // Merge the case itself into the cases array.
      upsertArray("psych-cases-v2", [b.data.case]);
      upsertArray("psych-checkins-v2", b.data.checkIns);
      upsertArray("psych-weekly-v2", b.data.weeklyReviews);
      upsertArray("psych-monthly-v2", b.data.monthlyReviews);
      upsertArray("psych-sessions-v2", b.data.sessions);
      upsertArray("psych-supervision-v2", b.data.supervisionNotes);
      upsertArray("psych-goals-v2", b.data.goals);
      upsertArray("psych-transcripts-v2", b.data.transcripts);
      upsertArray("psych-files-v2", b.data.files);
      upsertArray("clinical_plans", b.data.sessionPlans);
      upsertArray("clinical_reflections", b.data.reflections);
      upsertArray("clinical_interventions", b.data.interventions);
      upsertArray("clinical_formulations", b.data.formulations);
      upsertArray("clinical_consent", b.data.consent);
      toast(`Imported case ${b.caseCode ?? b.caseId}`, "success");
    }
    setImportResult(null);
    setImportPreview(null);
    // Trigger context re-hydration by reloading. Simpler and safer than
    // wiring imperative replace methods through every context.
    setTimeout(() => window.location.reload(), 600);
  }

  function performReset() {
    if (!isResetConfirmed(resetPhrase)) {
      toast(`Type "${RESET_CONFIRM_PHRASE}" to confirm`, "warning");
      return;
    }
    for (const key of FULL_BACKUP_KEYS) {
      window.localStorage.removeItem(key);
    }
    toast("Local data cleared. Reloading…", "info");
    setTimeout(() => window.location.reload(), 600);
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <PageHeader
        title="Backup & Export"
        subtitle="Move your local Psych data between devices, or reset everything"
      />

      <div className="space-y-6">
        {/* Export */}
        <SectionCard
          title="Export"
          description="Download a JSON snapshot of your local data"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "var(--psych-primary-light)" }}
              >
                <Database
                  size={18}
                  style={{ color: "var(--psych-primary)" }}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Full backup</p>
                <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
                  Everything — cases, notes, goals, clinical data,
                  thesis, settings.
                </p>
              </div>
              <Button onClick={exportFull} size="sm">
                <Download size={14} /> Download
              </Button>
            </div>

            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label htmlFor="case-select">Single case</Label>
                <Select
                  id="case-select"
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                >
                  <option value="">Pick a case…</option>
                  {cases
                    .filter((c) => !c.isArchived)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.type}
                      </option>
                    ))}
                </Select>
              </div>
              <Button onClick={exportSingleCase} size="sm" variant="secondary">
                <Download size={14} /> Export case
              </Button>
            </div>
            <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
              Case packets and PDF export are placeholders for a future
              release. JSON keeps your data portable in the meantime.
            </p>
          </div>
        </SectionCard>

        {/* Import */}
        <SectionCard
          title="Import"
          description="Load a backup file. Preview before applying."
        >
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={onFilePicked}
              style={{ display: "none" }}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="sm"
              variant="secondary"
            >
              <Upload size={14} /> Choose backup file
            </Button>

            {importResult && !importResult.ok && (
              <div
                className="rounded-lg p-3 text-sm flex items-start gap-2"
                style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}
              >
                <AlertTriangle size={14} className="mt-0.5" />
                {importResult.error}
              </div>
            )}

            {importResult && importResult.ok && importPreview && (
              <div
                className="rounded-lg border p-3 space-y-2"
                style={{ borderColor: "var(--psych-border)" }}
              >
                <div className="flex items-center gap-2 text-sm">
                  <FileJson size={14} />
                  <span className="font-medium">{importPreview.format}</span>
                  <span style={{ color: "var(--psych-muted)" }}>
                    v{importPreview.version} · exported{" "}
                    {importPreview.exportedAt}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1 text-xs">
                  {Object.entries(importPreview.itemCounts).map(([k, v]) => (
                    <div key={k} style={{ color: "var(--psych-muted)" }}>
                      <span className="font-medium" style={{ color: "var(--psych-text)" }}>
                        {v}
                      </span>{" "}
                      {k}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={confirmImport} size="sm">
                    Apply import (reloads)
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setImportResult(null);
                      setImportPreview(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Reset */}
        <SectionCard
          title="Reset all local data"
          description="Wipes every Psych key from this browser's storage. Cannot be undone."
        >
          {!showResetConfirm ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              style={{ color: "#DC2626", borderColor: "#FCA5A5" }}
            >
              <Trash2 size={14} /> Reset…
            </Button>
          ) : (
            <div
              className="rounded-lg p-3 space-y-2"
              style={{ backgroundColor: "#FEF3C7" }}
            >
              <p className="text-sm" style={{ color: "#92400E" }}>
                Type{" "}
                <strong className="font-mono">{RESET_CONFIRM_PHRASE}</strong>{" "}
                to confirm. This will remove every Psych entry from
                localStorage and reload the page.
              </p>
              <Input
                value={resetPhrase}
                onChange={(e) => setResetPhrase(e.target.value)}
                placeholder={RESET_CONFIRM_PHRASE}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={performReset}
                  variant="outline"
                  style={{ color: "#DC2626", borderColor: "#FCA5A5" }}
                >
                  Permanently reset
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowResetConfirm(false);
                    setResetPhrase("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </SectionCard>

        {/* History note */}
        <SectionCard
          title="Backup history"
          description="Coming soon — keep recent backups in IndexedDB"
        >
          <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
            Each export is currently a one-time download. A future release
            will keep your last few backups stored locally so you can roll
            back without leaving the app.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
