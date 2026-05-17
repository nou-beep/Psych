"use client";
// Workbook library — soft cards, weather-aware ordering.

import Link from "next/link";
import { useMemo } from "react";
import { ClientShell } from "@/components/client/ClientShell";
import { useClientPortal } from "@/contexts/ClientPortalContext";
import { ALL_WORKBOOKS } from "@/lib/client/workbooks";
import { rankByWeather } from "@/lib/client/emotional-weather";

export default function WorkbooksPage() {
  const { weather } = useClientPortal();
  const ordered = useMemo(
    () => rankByWeather(ALL_WORKBOOKS, weather),
    [weather]
  );

  return (
    <ClientShell
      title="Soft pages."
      microcopy="Workbooks shaped for how today feels."
    >
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {ordered.map((w) => (
          <Link
            key={w.id}
            href={`/client/workbooks/${w.id}`}
            className="cp-card cp-fade-in"
            style={{
              textDecoration: "none",
              color: "var(--cp-text)",
              display: "block",
            }}
          >
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--cp-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 4,
              }}
            >
              {w.category}
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: "1.05rem",
                fontWeight: 600,
              }}
            >
              {w.title}
            </h3>
            <p
              className="cp-microcopy"
              style={{ marginTop: 4, fontSize: "0.85rem" }}
            >
              {w.microcopy}
            </p>
            <p
              style={{
                marginTop: 8,
                fontSize: "0.74rem",
                color: "var(--cp-accent)",
              }}
            >
              {w.steps.length} gentle steps →
            </p>
          </Link>
        ))}
      </div>
    </ClientShell>
  );
}
