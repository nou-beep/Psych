"use client";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useClinical } from "@/contexts/ClinicalContext";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import { type ConsentRecord } from "@/lib/clinical-data";
import { ShieldCheck, AlertTriangle, CheckCircle2, Circle, Printer, Search } from "lucide-react";

const CONSENT_FIELDS: { key: keyof ConsentRecord; label: string; desc: string }[] = [
  { key: "consentGiven", label: "Informed consent obtained", desc: "Client has signed or verbally agreed to treatment" },
  { key: "informationSheetGiven", label: "Information sheet provided", desc: "Client received written information about treatment" },
  { key: "withdrawalRightExplained", label: "Right to withdraw explained", desc: "Client understands they can stop at any time" },
  { key: "anonymizationComplete", label: "Anonymization complete", desc: "All identifying information removed from notes" },
  { key: "dataProtectionChecked", label: "Data protection checked", desc: "Data handling complies with local regulations" },
  { key: "supervisorApproved", label: "Supervisor approval received", desc: "Case reviewed and approved by supervisor" },
];

function ConsentCard({ record, linkedCase, onUpdate }: {
  record: ConsentRecord;
  linkedCase: { code: string; label: string } | undefined;
  onUpdate: (data: Partial<ConsentRecord>) => void;
}) {
  const [editingRef, setEditingRef] = useState(false);
  const [refValue, setRefValue] = useState(record.ethicsApprovalRef || "");
  const [notes, setNotes] = useState(record.notes || "");

  const checkedCount = CONSENT_FIELDS.filter((f) => record[f.key]).length;
  const isComplete = checkedCount === CONSENT_FIELDS.length;
  const isMostly = checkedCount >= 4;

  function toggleField(key: keyof ConsentRecord) {
    onUpdate({ [key]: !record[key] });
  }

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--psych-border)" }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold" style={{ color: "var(--psych-text)" }}>
              {linkedCase?.code || record.caseId}
            </span>
            {linkedCase && <span className="text-sm" style={{ color: "var(--psych-muted)" }}>{linkedCase.label}</span>}
          </div>
          {record.consentDate && (
            <p className="text-xs mt-0.5" style={{ color: "var(--psych-muted)" }}>Consent date: {record.consentDate}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full font-medium"
            style={isComplete
              ? { backgroundColor: "#d1fae5", color: "#065f46" }
              : isMostly
              ? { backgroundColor: "#fef3c7", color: "#92400e" }
              : { backgroundColor: "#fee2e2", color: "#991b1b" }}>
            {checkedCount}/{CONSENT_FIELDS.length} complete
          </span>
          {isComplete
            ? <CheckCircle2 size={18} style={{ color: "#10b981" }} />
            : <AlertTriangle size={18} style={{ color: isMostly ? "#f59e0b" : "#ef4444" }} />
          }
        </div>
      </div>

      <div className="p-4 space-y-2">
        {CONSENT_FIELDS.map(({ key, label, desc }) => {
          const checked = !!record[key];
          return (
            <button key={key} onClick={() => toggleField(key)}
              className="w-full flex items-start gap-3 p-2 rounded-xl text-left transition-all hover:opacity-90"
              style={{ backgroundColor: checked ? "var(--psych-primary-light)" : "transparent" }}>
              {checked
                ? <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--psych-primary)" }} />
                : <Circle size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--psych-muted)" }} />
              }
              <div>
                <p className="text-sm font-medium" style={{ color: checked ? "var(--psych-text)" : "var(--psych-muted)" }}>{label}</p>
                <p className="text-xs opacity-70" style={{ color: "var(--psych-muted)" }}>{desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="border-t px-4 pb-4 pt-3 space-y-3" style={{ borderColor: "var(--psych-border)" }}>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Consent date</label>
          <input type="date" className="rounded-xl px-3 py-1.5 text-sm border"
            style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
            value={record.consentDate || ""} onChange={(e) => onUpdate({ consentDate: e.target.value })} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium" style={{ color: "var(--psych-muted)" }}>Ethics approval reference</label>
          </div>
          <input className="w-full rounded-xl px-3 py-1.5 text-sm border"
            style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
            placeholder="e.g. ETH-2024-001"
            value={refValue} onChange={(e) => setRefValue(e.target.value)}
            onBlur={() => { if (refValue !== record.ethicsApprovalRef) onUpdate({ ethicsApprovalRef: refValue }); }} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Notes</label>
          <textarea rows={2} className="w-full rounded-xl px-3 py-1.5 text-sm border resize-none"
            style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
            placeholder="Any additional ethics notes…"
            value={notes} onChange={(e) => setNotes(e.target.value)}
            onBlur={() => { if (notes !== record.notes) onUpdate({ notes }); }} />
        </div>
      </div>
    </div>
  );
}

export default function EthicsPage() {
  const { consent, upsertConsent } = useClinical();
  const { cases } = useApp();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const activeCases = cases.filter((c) => !c.isArchived);

  // Ensure all active cases have a consent record
  const allConsent = useMemo(() => {
    const records = [...consent];
    activeCases.forEach((c) => {
      if (!records.find((r) => r.caseId === c.id)) {
        // Will create via upsertConsent on first interaction — show placeholder
      }
    });
    return records;
  }, [consent, activeCases]);

  // Cases with consent records
  const casesWithConsent = useMemo(() => {
    return activeCases
      .filter((c) => !search || c.code.toLowerCase().includes(search.toLowerCase()) || c.label.toLowerCase().includes(search.toLowerCase()))
      .map((c) => ({
        case: c,
        record: allConsent.find((r) => r.caseId === c.id),
      }));
  }, [activeCases, allConsent, search]);

  // Stats
  const totalChecked = consent.reduce((sum, r) => {
    return sum + CONSENT_FIELDS.filter((f) => r[f.key]).length;
  }, 0);
  const totalPossible = consent.length * CONSENT_FIELDS.length;
  const completeCases = consent.filter((r) => CONSENT_FIELDS.every((f) => r[f.key])).length;
  const incompleteCases = consent.length - completeCases;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Ethics & Consent Folder"
        subtitle="Track informed consent and ethical compliance per case"
        actions={
          <button onClick={() => window.print()} className="no-print flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl border"
            style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>
            <Printer size={14} /> Print summary
          </button>
        }
      />

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Cases tracked", value: consent.length, color: "var(--psych-primary)" },
          { label: "Fully complete", value: completeCases, color: "#10b981" },
          { label: "Incomplete", value: incompleteCases, color: incompleteCases > 0 ? "#ef4444" : "#10b981" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border p-4 text-center"
            style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--psych-muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      {incompleteCases > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border p-4"
          style={{ backgroundColor: "#fff7ed", borderColor: "#fed7aa" }}>
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#ea580c" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "#9a3412" }}>Ethics items missing</p>
            <p className="text-xs mt-0.5" style={{ color: "#c2410c" }}>
              {incompleteCases} case{incompleteCases !== 1 ? "s" : ""} have incomplete consent records. Review and complete them below.
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="no-print flex items-center gap-2 rounded-xl px-3 py-2 border"
        style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
        <Search size={14} style={{ color: "var(--psych-muted)" }} />
        <input placeholder="Filter by case…" className="bg-transparent flex-1 outline-none text-sm"
          style={{ color: "var(--psych-text)" }} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Consent cards */}
      {casesWithConsent.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--psych-muted)" }}>
          <ShieldCheck size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No active cases</p>
          <p className="text-sm mt-1 opacity-70">Add cases to track their consent status</p>
        </div>
      ) : (
        <div className="space-y-4">
          {casesWithConsent.map(({ case: c, record }) => {
            if (!record) {
              return (
                <div key={c.id} className="rounded-2xl border p-4 flex items-center justify-between"
                  style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
                  <div>
                    <span className="font-mono text-sm font-bold" style={{ color: "var(--psych-text)" }}>{c.code}</span>
                    <span className="text-sm ml-2" style={{ color: "var(--psych-muted)" }}>{c.label}</span>
                  </div>
                  <button onClick={() => upsertConsent(c.id, {})}
                    className="text-sm px-3 py-1.5 rounded-xl border"
                    style={{ borderColor: "var(--psych-primary)", color: "var(--psych-primary)" }}>
                    Start consent record
                  </button>
                </div>
              );
            }
            return (
              <ConsentCard key={c.id} record={record} linkedCase={c}
                onUpdate={(data) => { upsertConsent(c.id, data); toast("Consent updated", "success"); }} />
            );
          })}
        </div>
      )}
    </div>
  );
}
