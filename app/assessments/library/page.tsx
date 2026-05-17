"use client";
// Assessment Library — browse instruments, administer one, view history.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/Modal";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import {
  ASSESSMENT_ADMINISTRATIONS_STORAGE_KEY,
  ASSESSMENT_LIBRARY,
  buildAdministration,
  scoreAssessment,
  type AssessmentAdministration,
  type AssessmentDefinition,
} from "@/lib/clinical/assessments";
import { Plus, TrendingUp, AlertTriangle } from "lucide-react";

export default function AssessmentLibraryPage() {
  const { toast } = useToast();
  const { cases } = useApp();
  const [admins, setAdmins] = useState<AssessmentAdministration[]>([]);
  const [openAdminModal, setOpenAdminModal] = useState(false);
  const [activeDef, setActiveDef] = useState<AssessmentDefinition | null>(null);
  const [items, setItems] = useState<Array<number | null>>([]);
  const [caseId, setCaseId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "scoreable" | "placeholder">("all");
  const [selectedCaseFilter, setSelectedCaseFilter] = useState("");

  useEffect(() => {
    setAdmins(loadFromStorage<AssessmentAdministration[]>(
      ASSESSMENT_ADMINISTRATIONS_STORAGE_KEY,
      []
    ));
  }, []);

  function persist(next: AssessmentAdministration[]) {
    setAdmins(next);
    saveToStorage(ASSESSMENT_ADMINISTRATIONS_STORAGE_KEY, next);
  }

  function openAdminister(def: AssessmentDefinition) {
    setActiveDef(def);
    setItems(Array(def.itemCount).fill(null));
    setDate(new Date().toISOString().split("T")[0]);
    setCaseId("");
    setNotes("");
    setOpenAdminModal(true);
  }

  function save() {
    if (!activeDef) return;
    if (items.some((v) => v === null)) {
      const proceed = window.confirm(
        "Some items are missing. Save administration with partial scoring?"
      );
      if (!proceed) return;
    }
    try {
      const admin = buildAdministration(activeDef, {
        caseId: caseId || undefined,
        date,
        items,
        clinicianNotes: notes,
      });
      persist([admin, ...admins]);
      setOpenAdminModal(false);
      toast(`${activeDef.code} administration saved`, "success");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to score";
      toast(msg, "warning");
    }
  }

  const visibleDefs = useMemo(() => {
    if (filterStatus === "all") return ASSESSMENT_LIBRARY;
    return ASSESSMENT_LIBRARY.filter((d) => d.status === filterStatus);
  }, [filterStatus]);

  const filteredAdmins = useMemo(() => {
    if (!selectedCaseFilter) return admins;
    return admins.filter((a) => a.caseId === selectedCaseFilter);
  }, [admins, selectedCaseFilter]);

  function liveScore() {
    if (!activeDef) return null;
    try {
      return scoreAssessment(activeDef, items);
    } catch {
      return null;
    }
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Assessment library"
        subtitle={`${ASSESSMENT_LIBRARY.length} instruments — PHQ-9, GAD-7, DASS-21 fully scoreable; others as placeholder shells`}
        action={
          <Link href="/clinical">
            <Button variant="ghost" size="sm">
              Clinical hub →
            </Button>
          </Link>
        }
      />

      <SectionCard
        title="Instruments"
        description="Browse, administer, and review longitudinal score history per case."
      >
        <div className="flex items-center gap-3 mb-4">
          <Label className="text-xs">Show</Label>
          <Select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as "all" | "scoreable" | "placeholder")
            }
            className="w-48"
          >
            <option value="all">All</option>
            <option value="scoreable">Scoreable</option>
            <option value="placeholder">Placeholder shells</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visibleDefs.map((d) => (
            <div
              key={d.id}
              className="rounded-2xl border p-4"
              style={{
                backgroundColor: "var(--psych-card)",
                borderColor: "var(--psych-border)",
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-sm font-semibold" style={{ color: "var(--psych-text)" }}>
                  {d.code}
                </h3>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor:
                      d.status === "scoreable" ? "#D1FAE5" : "var(--psych-primary-light)",
                    color: d.status === "scoreable" ? "#065F46" : "var(--psych-accent)",
                  }}
                >
                  {d.status}
                </span>
              </div>
              <p className="text-xs font-medium" style={{ color: "var(--psych-text)" }}>
                {d.title}
              </p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--psych-muted)" }}>
                {d.description}
              </p>
              <p className="text-[10px] mt-2" style={{ color: "var(--psych-muted)" }}>
                {d.itemCount} items · range {d.response.min}–{d.response.max} ·{" "}
                <em>{d.citation}</em>
              </p>
              <Button
                onClick={() => openAdminister(d)}
                size="sm"
                className="mt-3"
              >
                <Plus size={13} /> Administer
              </Button>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Recorded administrations"
        description="History across all cases. Filter by case to see one client's trajectory."
        className="mt-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <Label className="text-xs">Filter by case</Label>
          <Select
            value={selectedCaseFilter}
            onChange={(e) => setSelectedCaseFilter(e.target.value)}
            className="w-64"
          >
            <option value="">All cases</option>
            {cases
              .filter((c) => !c.isArchived)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.type}
                </option>
              ))}
          </Select>
          {selectedCaseFilter && (
            <Link
              href={`/clinical/longitudinal?caseId=${selectedCaseFilter}`}
              className="ml-auto"
            >
              <Button variant="secondary" size="sm">
                <TrendingUp size={13} /> Open longitudinal view
              </Button>
            </Link>
          )}
        </div>

        {filteredAdmins.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
            No administrations recorded yet. Pick an instrument above to start.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left" style={{ color: "var(--psych-muted)" }}>
                <th className="py-2 pr-3 text-[11px] font-semibold uppercase tracking-wide">Date</th>
                <th className="py-2 pr-3 text-[11px] font-semibold uppercase tracking-wide">Instrument</th>
                <th className="py-2 pr-3 text-[11px] font-semibold uppercase tracking-wide">Case</th>
                <th className="py-2 pr-3 text-[11px] font-semibold uppercase tracking-wide">Total</th>
                <th className="py-2 pr-3 text-[11px] font-semibold uppercase tracking-wide">Severity</th>
                <th className="py-2 pr-3 text-[11px] font-semibold uppercase tracking-wide">Flags</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins
                .slice()
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((a) => {
                  const def = ASSESSMENT_LIBRARY.find((d) => d.id === a.assessmentId);
                  const caseCode = cases.find((c) => c.id === a.caseId)?.code ?? "—";
                  return (
                    <tr
                      key={a.id}
                      className="border-t"
                      style={{ borderColor: "var(--psych-border)" }}
                    >
                      <td className="py-2 pr-3 font-mono text-xs">{a.date}</td>
                      <td className="py-2 pr-3">{def?.code ?? a.assessmentId}</td>
                      <td className="py-2 pr-3 font-mono text-xs">{caseCode}</td>
                      <td className="py-2 pr-3">{a.score.total}</td>
                      <td className="py-2 pr-3">{a.score.severity ?? "—"}</td>
                      <td className="py-2 pr-3">
                        {a.score.flaggedItems.length > 0 && (
                          <span
                            className="text-[11px] inline-flex items-center gap-1"
                            style={{ color: "#DC2626" }}
                          >
                            <AlertTriangle size={11} /> item{" "}
                            {a.score.flaggedItems.join(", ")}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </SectionCard>

      {/* Administer modal */}
      {openAdminModal && activeDef && (
        <Modal
          open={openAdminModal}
          onClose={() => setOpenAdminModal(false)}
          title={`Administer ${activeDef.code}`}
          subtitle={activeDef.title}
          size="lg"
        >
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <Label htmlFor="adm-case">Linked case</Label>
                <Select
                  id="adm-case"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                >
                  <option value="">(none)</option>
                  {cases
                    .filter((c) => !c.isArchived)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.type}
                      </option>
                    ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="adm-date">Administration date</Label>
                <Input
                  id="adm-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div
              className="rounded-xl border p-3 mb-3"
              style={{
                backgroundColor: "var(--psych-bg)",
                borderColor: "var(--psych-border)",
              }}
            >
              <p className="text-xs mb-3" style={{ color: "var(--psych-muted)" }}>
                Item content is omitted in-app (copyrighted). Enter the score for each
                item from the official instrument. Range: {activeDef.response.min}–
                {activeDef.response.max}.
              </p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {items.map((v, i) => (
                  <div key={i}>
                    <Label className="text-[11px]">Item {i + 1}</Label>
                    <Input
                      type="number"
                      min={activeDef.response.min}
                      max={activeDef.response.max}
                      value={v ?? ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? null : Number(e.target.value);
                        setItems((prev) => {
                          const next = [...prev];
                          next[i] = val;
                          return next;
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Live score preview */}
            {(() => {
              const s = liveScore();
              if (!s) return null;
              return (
                <div
                  className="rounded-xl border p-3 mb-3 text-sm"
                  style={{
                    backgroundColor: "var(--psych-primary-light)",
                    borderColor: "var(--psych-border)",
                    color: "var(--psych-text)",
                  }}
                >
                  <p className="font-medium mb-1">Preview</p>
                  <p className="text-xs">
                    Total: <strong>{s.total}</strong>
                    {s.severity && (
                      <>
                        {" · "}severity: <strong>{s.severity}</strong>
                      </>
                    )}
                    {s.incomplete && (
                      <span style={{ color: "#9F1239" }}> · {s.missing} item(s) missing</span>
                    )}
                  </p>
                  {s.subscales && (
                    <ul className="mt-1 text-xs space-y-0.5">
                      {s.subscales.map((sub) => (
                        <li key={sub.id}>
                          {sub.label}: score <strong>{sub.score}</strong>
                          {sub.severity && <> · {sub.severity}</>}
                          {sub.missing > 0 && (
                            <span style={{ color: "#9F1239" }}> · {sub.missing} missing</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  {s.flaggedItems.length > 0 && (
                    <p
                      className="text-xs mt-1 inline-flex items-center gap-1"
                      style={{ color: "#DC2626" }}
                    >
                      <AlertTriangle size={12} /> Item {s.flaggedItems.join(", ")} flagged — review safety
                    </p>
                  )}
                </div>
              );
            })()}

            <div>
              <Label htmlFor="adm-notes">Clinician notes</Label>
              <Textarea
                id="adm-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Context, observations during administration, follow-up plans…"
                className="min-h-[80px]"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpenAdminModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={save} size="sm">
              Save administration
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
