"use client";
// Journeys — list of guided emotional paths.

import Link from "next/link";
import { useMemo } from "react";
import { ClientShell } from "@/components/client/ClientShell";
import { useClientPortal } from "@/contexts/ClientPortalContext";
import { ALL_JOURNEYS, percentDone } from "@/lib/client/journeys";
import { rankByWeather } from "@/lib/client/emotional-weather";

export default function JourneysListPage() {
  const { weather, journeyProgress } = useClientPortal();
  const ordered = useMemo(() => rankByWeather(ALL_JOURNEYS, weather), [weather]);

  return (
    <ClientShell title="Gentle paths." microcopy="Short, guided emotional walks.">
      <div style={{ display: "grid", gap: 10 }}>
        {ordered.map((j) => {
          const progress = journeyProgress[j.id];
          const pct = progress ? percentDone(j, progress) : 0;
          return (
            <Link
              key={j.id}
              href={`/client/journeys/${j.id}`}
              className="cp-card cp-fade-in"
              style={{
                textDecoration: "none",
                color: "var(--cp-text)",
                display: "block",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.05rem",
                  fontWeight: 600,
                }}
              >
                {j.title}
              </h3>
              <p
                className="cp-microcopy"
                style={{ marginTop: 4, fontSize: "0.86rem" }}
              >
                {j.microcopy}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 10,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 999,
                    background: "var(--cp-border)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: "var(--cp-accent)",
                    }}
                  />
                </div>
                <span style={{ fontSize: "0.72rem", color: "var(--cp-muted)" }}>
                  {pct}%
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </ClientShell>
  );
}
