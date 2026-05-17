"use client";
// Notes from therapist — assignments + supportive notes the therapist
// shared. Placeholder for future real-time sync; for now sources from
// the same shared localStorage as the therapist assign panel.

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClientShell } from "@/components/client/ClientShell";
import {
  acknowledge,
  loadAssignments,
  saveAssignments,
  type ClientAssignment,
} from "@/lib/client/assignments";
import { ALL_WORKBOOKS } from "@/lib/client/workbooks";
import { ALL_JOURNEYS } from "@/lib/client/journeys";
import { ALL_CARDS } from "@/lib/client/therapy-cards";

export default function ClientNotesPage() {
  const [items, setItems] = useState<ClientAssignment[]>([]);

  useEffect(() => {
    setItems(loadAssignments());
  }, []);

  function ack(id: string) {
    const next = acknowledge(items, id);
    setItems(next);
    saveAssignments(next);
  }

  function label(a: ClientAssignment): string {
    if (a.kind === "workbook") {
      const wb = ALL_WORKBOOKS.find((w) => w.id === a.targetId);
      return wb ? `Workbook · ${wb.title}` : "Workbook";
    }
    if (a.kind === "journey") {
      const j = ALL_JOURNEYS.find((x) => x.id === a.targetId);
      return j ? `Path · ${j.title}` : "Therapeutic path";
    }
    if (a.kind === "card") {
      const c = ALL_CARDS.find((x) => x.id === a.targetId);
      return c ? `Card · ${c.prompt}` : "Card";
    }
    return "Therapist note";
  }

  function href(a: ClientAssignment): string | null {
    if (a.kind === "workbook" && a.targetId) return `/client/workbooks/${a.targetId}`;
    if (a.kind === "journey" && a.targetId) return `/client/journeys/${a.targetId}`;
    if (a.kind === "card") return "/client/resources";
    return null;
  }

  const unread = items.filter((i) => !i.acknowledged);
  const seen = items.filter((i) => i.acknowledged);

  return (
    <ClientShell
      title="Therapist notes."
      microcopy="Anything your therapist has shared with you."
    >
      {items.length === 0 ? (
        <p className="cp-microcopy" style={{ fontSize: "0.88rem" }}>
          Nothing has been shared with you yet.
        </p>
      ) : (
        <>
          {unread.length > 0 && (
            <section className="cp-card cp-fade-in" style={{ marginBottom: "1.25rem" }}>
              <h2
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  margin: "0 0 8px",
                  color: "var(--cp-text)",
                }}
              >
                New ({unread.length})
              </h2>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                {unread.map((a) => {
                  const open = href(a);
                  return (
                    <li
                      key={a.id}
                      className="cp-card-soft"
                      style={{ display: "flex", gap: 10, alignItems: "center" }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.88rem", color: "var(--cp-text)" }}>
                          {label(a)}
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
                      {open ? (
                        <Link
                          href={open}
                          onClick={() => ack(a.id)}
                          style={pill()}
                        >
                          Open
                        </Link>
                      ) : (
                        <button
                          onClick={() => ack(a.id)}
                          style={{ ...pill(), background: "var(--cp-card)" }}
                        >
                          Got it
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {seen.length > 0 && (
            <section className="cp-card cp-fade-in">
              <h2
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  margin: "0 0 8px",
                  color: "var(--cp-text)",
                }}
              >
                Seen
              </h2>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
                {seen.map((a) => (
                  <li
                    key={a.id}
                    className="cp-card-soft"
                    style={{ fontSize: "0.84rem", color: "var(--cp-muted)" }}
                  >
                    {label(a)}
                    {a.note && <div style={{ marginTop: 4 }}>“{a.note}”</div>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </ClientShell>
  );
}

function pill(): React.CSSProperties {
  return {
    padding: "0.4rem 0.8rem",
    borderRadius: 999,
    background: "var(--cp-accent)",
    color: "white",
    textDecoration: "none",
    fontSize: "0.78rem",
    border: "none",
    cursor: "pointer",
  };
}
