"use client";
// Client threads — show recurring themes from the client's own
// authored nodes + anything the therapist has shared. Soft framing.

import { useMemo } from "react";
import { ClientShell } from "@/components/client/ClientShell";
import { useApp } from "@/contexts/AppContext";
import { usePsyGraph } from "@/contexts/PsyGraphContext";
import { analyzeThreads } from "@/lib/psy/threads";
import { visibleToClient } from "@/lib/psy/nodes";

export default function ClientThreadsPage() {
  const { cases } = useApp();
  const { nodes } = usePsyGraph();
  const active = cases.find((c) => !c.isArchived) ?? cases[0];
  const caseId = active?.id ?? "client-self";

  const visible = useMemo(() => {
    const own = nodes.filter((n) => n.caseId === caseId);
    return visibleToClient(own);
  }, [nodes, caseId]);

  const threads = useMemo(
    () => analyzeThreads(visible).filter((t) => t.count >= 2),
    [visible]
  );

  return (
    <ClientShell
      title="Threads."
      microcopy="What keeps showing up across what you've noticed."
    >
      {visible.length === 0 ? (
        <p className="cp-microcopy" style={{ fontSize: "0.9rem" }}>
          Once you&rsquo;ve noticed a few body sensations or written a few
          reflections tagged with themes, the recurring threads will
          surface here.
        </p>
      ) : threads.length === 0 ? (
        <p className="cp-microcopy" style={{ fontSize: "0.9rem" }}>
          Nothing recurring yet. Take your time.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
          {threads.map((t) => (
            <li
              key={t.tag}
              className="cp-card cp-fade-in"
              style={{ padding: "0.9rem 1rem" }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--cp-muted)",
                }}
              >
                Showing up across {Object.keys(t.kindBreakdown).length} kind
                {Object.keys(t.kindBreakdown).length === 1 ? "" : "s"}
              </div>
              <div
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  color: "var(--cp-text)",
                  marginTop: 4,
                }}
              >
                {t.tag}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--cp-muted)",
                  marginTop: 4,
                }}
              >
                {t.count} time{t.count > 1 ? "s" : ""} · last seen{" "}
                {t.lastSeen ? t.lastSeen.split("T")[0] : "—"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </ClientShell>
  );
}
