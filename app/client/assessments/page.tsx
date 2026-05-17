"use client";
// Client-side assessments view — assigned assessments + history of
// administered scores. Scoring on the client side stays read-only;
// the therapist administers and records.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClientShell } from "@/components/client/ClientShell";
import { loadFromStorage } from "@/lib/store";
import {
  acknowledge,
  loadAssignments,
  saveAssignments,
  type ClientAssignment,
} from "@/lib/client/assignments";
import {
  ASSESSMENT_ADMINISTRATIONS_STORAGE_KEY,
  ASSESSMENT_LIBRARY,
  findAssessment,
  type AssessmentAdministration,
} from "@/lib/clinical/assessments";

export default function ClientAssessmentsPage() {
  const [assignments, setAssignments] = useState<ClientAssignment[]>([]);
  const [admins, setAdmins] = useState<AssessmentAdministration[]>([]);

  useEffect(() => {
    setAssignments(loadAssignments());
    setAdmins(
      loadFromStorage<AssessmentAdministration[]>(
        ASSESSMENT_ADMINISTRATIONS_STORAGE_KEY,
        []
      )
    );
  }, []);

  function ack(id: string) {
    const next = acknowledge(assignments, id);
    setAssignments(next);
    saveAssignments(next);
  }

  // Therapist-assigned assessments arrive as ClientAssignment with kind
  // === "card" or "workbook" — but with the catalog growing we just look
  // for any assignment whose targetId matches a known assessment id.
  const assignedAssessments = useMemo(() => {
    return assignments.filter((a) => {
      if (!a.targetId) return false;
      return ASSESSMENT_LIBRARY.some((x) => x.id === a.targetId);
    });
  }, [assignments]);

  const history = useMemo(
    () => admins.slice().sort((a, b) => b.date.localeCompare(a.date)),
    [admins]
  );

  return (
    <ClientShell
      title="Assessments."
      microcopy="What your therapist has asked you to complete, and your recorded scores."
    >
      {/* Assigned */}
      <section className="cp-card cp-fade-in" style={{ marginBottom: "1.25rem" }}>
        <h2
          style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            margin: "0 0 8px",
            color: "var(--cp-text)",
          }}
        >
          Assigned by your therapist
        </h2>
        {assignedAssessments.length === 0 ? (
          <p className="cp-microcopy" style={{ fontSize: "0.85rem" }}>
            Nothing assigned right now. Your therapist will surface
            questionnaires through this view when relevant.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
            {assignedAssessments.map((a) => {
              const def = ASSESSMENT_LIBRARY.find((x) => x.id === a.targetId);
              return (
                <li
                  key={a.id}
                  className="cp-card-soft"
                  style={{ display: "flex", gap: 10, alignItems: "center" }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.88rem", color: "var(--cp-text)" }}>
                      {def ? `${def.code} — ${def.title}` : "Assessment"}
                    </div>
                    {a.note && (
                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--cp-muted)",
                          marginTop: 4,
                        }}
                      >
                        “{a.note}”
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => ack(a.id)}
                    style={{
                      all: "unset",
                      cursor: "pointer",
                      padding: "0.4rem 0.8rem",
                      borderRadius: 999,
                      background: a.acknowledged
                        ? "var(--cp-card)"
                        : "var(--cp-accent)",
                      color: a.acknowledged ? "var(--cp-muted)" : "white",
                      fontSize: "0.78rem",
                    }}
                  >
                    {a.acknowledged ? "Acknowledged" : "Got it"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Recorded scores */}
      <section className="cp-card cp-fade-in">
        <h2
          style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            margin: "0 0 8px",
            color: "var(--cp-text)",
          }}
        >
          Your recorded scores
        </h2>
        <p className="cp-microcopy" style={{ fontSize: "0.78rem", marginBottom: 10 }}>
          Read-only. Scores are recorded by your therapist during sessions.
        </p>
        {history.length === 0 ? (
          <p className="cp-microcopy" style={{ fontSize: "0.85rem" }}>
            No scores recorded yet.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
            {history.map((a) => {
              const def = findAssessment(a.assessmentId);
              return (
                <li
                  key={a.id}
                  className="cp-card-soft"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.86rem", color: "var(--cp-text)" }}>
                      {def?.code ?? a.assessmentId}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--cp-muted)" }}>
                      {a.date}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "0.95rem",
                        color: "var(--cp-text)",
                        fontWeight: 600,
                      }}
                    >
                      {a.score.total}
                    </div>
                    {a.score.severity && (
                      <div style={{ fontSize: "0.72rem", color: "var(--cp-muted)" }}>
                        {a.score.severity}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p
        className="cp-microcopy"
        style={{ marginTop: "1.5rem", fontSize: "0.74rem", textAlign: "center" }}
      >
        Need to track how you&rsquo;re feeling between sessions?{" "}
        <Link
          href="/client/progress"
          style={{ color: "var(--cp-accent)" }}
        >
          Open daily check-in →
        </Link>
      </p>
    </ClientShell>
  );
}
