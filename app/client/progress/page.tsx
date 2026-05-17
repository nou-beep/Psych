"use client";
// Client progress — daily check-in entry + symptom trajectory chart.
// No streaks, no achievements. Clinically styled visualisation.

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Save } from "lucide-react";
import { ClientShell } from "@/components/client/ClientShell";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import {
  TRACKING_DOMAINS,
  TRACKING_STORAGE_KEY,
  buildSeries,
  domainAverages,
  emptyEntry,
  homeworkCompletionRate,
  setHomework,
  setScore,
  type ClientTrackingEntry,
  type TrackingDomain,
} from "@/lib/client/client-tracking";

const ProgressChart = dynamic(
  () => import("@/components/client/ProgressChart"),
  { ssr: false }
);

export default function ClientProgressPage() {
  const [entries, setEntries] = useState<ClientTrackingEntry[]>([]);
  const [active, setActive] = useState<ClientTrackingEntry | null>(null);
  const [domain, setDomain] = useState<TrackingDomain>("mood");

  useEffect(() => {
    const stored = loadFromStorage<ClientTrackingEntry[]>(TRACKING_STORAGE_KEY, []);
    setEntries(stored);
    const today = new Date().toISOString().split("T")[0];
    const existing = stored.find((e) => e.date === today);
    setActive(existing ? { ...existing } : emptyEntry(today));
  }, []);

  function persist(next: ClientTrackingEntry[]) {
    setEntries(next);
    saveToStorage(TRACKING_STORAGE_KEY, next);
  }

  function save() {
    if (!active) return;
    const existing = entries.find((e) => e.date === active.date);
    const next = existing
      ? entries.map((e) => (e.id === existing.id ? active : e))
      : [active, ...entries];
    persist(next);
  }

  const averages = useMemo(() => domainAverages(entries, 14), [entries]);
  const homework = useMemo(() => homeworkCompletionRate(entries, 30), [entries]);
  const series = useMemo(() => buildSeries(entries, domain), [entries, domain]);
  const meta = TRACKING_DOMAINS.find((d) => d.id === domain);

  return (
    <ClientShell
      title="Progress."
      microcopy="A short daily check-in builds the trajectory."
    >
      {/* Daily entry */}
      {active && (
        <section className="cp-card cp-fade-in" style={{ marginBottom: "1.25rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <h2
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                margin: 0,
                color: "var(--cp-text)",
              }}
            >
              Today&rsquo;s check-in
            </h2>
            <span style={{ fontSize: "0.72rem", color: "var(--cp-muted)" }}>
              {active.date}
            </span>
          </div>
          <p className="cp-microcopy" style={{ fontSize: "0.82rem", marginBottom: 12 }}>
            Skip any domain you don&rsquo;t want to track today.
          </p>

          <div style={{ display: "grid", gap: 14 }}>
            {TRACKING_DOMAINS.map((d) => {
              const value =
                typeof active.scores[d.id] === "number"
                  ? (active.scores[d.id] as number)
                  : null;
              return (
                <div key={d.id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: 4,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: 500,
                          color: "var(--cp-text)",
                        }}
                      >
                        {d.label}
                      </span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--cp-muted)",
                          marginLeft: 6,
                        }}
                      >
                        {d.scaleLabel}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--cp-text)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {value === null ? "—" : value}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={value ?? 5}
                    onChange={(e) =>
                      setActive(setScore(active, d.id, Number(e.target.value)))
                    }
                    style={{ width: "100%", accentColor: "var(--cp-accent)" }}
                    aria-label={d.label}
                  />
                  {value !== null && (
                    <button
                      onClick={() => setActive(setScore(active, d.id, null))}
                      style={{
                        all: "unset",
                        cursor: "pointer",
                        fontSize: "0.7rem",
                        color: "var(--cp-muted)",
                        marginTop: 2,
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              );
            })}

            <div>
              <div
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 500,
                  color: "var(--cp-text)",
                  marginBottom: 6,
                }}
              >
                Therapist-assigned homework done today?
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { value: true, label: "Yes" },
                  { value: false, label: "Not yet" },
                  { value: null, label: "Not assigned" },
                ].map((opt) => {
                  const isActive = active.homeworkCompleted === opt.value;
                  return (
                    <button
                      key={String(opt.value)}
                      onClick={() => setActive(setHomework(active, opt.value))}
                      style={{
                        all: "unset",
                        cursor: "pointer",
                        padding: "0.4rem 0.8rem",
                        borderRadius: 999,
                        fontSize: "0.82rem",
                        border: `1px solid ${
                          isActive ? "var(--cp-accent)" : "var(--cp-border)"
                        }`,
                        background: isActive
                          ? "var(--cp-glow)"
                          : "transparent",
                        color: "var(--cp-text)",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.86rem",
                  fontWeight: 500,
                  color: "var(--cp-text)",
                  marginBottom: 4,
                }}
              >
                Anything you want to note for your next session?
              </label>
              <textarea
                value={active.notes}
                onChange={(e) =>
                  setActive({
                    ...active,
                    notes: e.target.value,
                    updatedAt: new Date().toISOString(),
                  })
                }
                style={{
                  width: "100%",
                  minHeight: 80,
                  padding: 10,
                  borderRadius: 12,
                  border: "1px solid var(--cp-border)",
                  background: "var(--cp-card-soft)",
                  color: "var(--cp-text)",
                  fontSize: "0.9rem",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </div>
          </div>

          <button
            onClick={save}
            style={{
              all: "unset",
              cursor: "pointer",
              marginTop: 12,
              padding: "0.7rem 1.1rem",
              borderRadius: 14,
              background: "var(--cp-accent)",
              color: "white",
              fontSize: "0.9rem",
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Save size={14} /> Save check-in
          </button>
        </section>
      )}

      {/* Two-week summary */}
      <section className="cp-card cp-fade-in" style={{ marginBottom: "1.25rem" }}>
        <h2
          style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            margin: "0 0 6px",
            color: "var(--cp-text)",
          }}
        >
          Two-week summary
        </h2>
        <p className="cp-microcopy" style={{ fontSize: "0.78rem", marginBottom: 12 }}>
          Mean scores across the last 14 days. Higher / lower depends on the
          domain — see the scale.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            gap: 8,
          }}
        >
          {TRACKING_DOMAINS.map((d) => {
            const v = averages[d.id];
            return (
              <div
                key={d.id}
                style={{
                  padding: "0.7rem 0.85rem",
                  borderRadius: 14,
                  border: "1px solid var(--cp-border)",
                  background: "var(--cp-card-soft)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--cp-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 2,
                  }}
                >
                  {d.label}
                </div>
                <div
                  style={{
                    fontSize: "1.1rem",
                    color: "var(--cp-text)",
                    fontWeight: 600,
                  }}
                >
                  {v === null ? "—" : v.toFixed(1)}
                </div>
                <div
                  style={{
                    fontSize: "0.62rem",
                    color: "var(--cp-muted)",
                    marginTop: 2,
                  }}
                >
                  {d.scaleLabel}
                </div>
              </div>
            );
          })}
          {homework.rate !== null && (
            <div
              style={{
                padding: "0.7rem 0.85rem",
                borderRadius: 14,
                border: "1px solid var(--cp-border)",
                background: "var(--cp-card-soft)",
              }}
            >
              <div
                style={{
                  fontSize: "0.68rem",
                  color: "var(--cp-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 2,
                }}
              >
                Homework done
              </div>
              <div
                style={{
                  fontSize: "1.1rem",
                  color: "var(--cp-text)",
                  fontWeight: 600,
                }}
              >
                {Math.round(homework.rate * 100)}%
              </div>
              <div style={{ fontSize: "0.62rem", color: "var(--cp-muted)", marginTop: 2 }}>
                {homework.numerator} / {homework.denominator} in 30 days
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trajectory chart */}
      <section className="cp-card cp-fade-in">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <h2
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              margin: 0,
              color: "var(--cp-text)",
            }}
          >
            Trajectory · {meta?.label}
          </h2>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value as TrackingDomain)}
            style={{
              all: "unset",
              cursor: "pointer",
              padding: "0.4rem 0.7rem",
              borderRadius: 10,
              border: "1px solid var(--cp-border)",
              background: "var(--cp-card-soft)",
              color: "var(--cp-text)",
              fontSize: "0.84rem",
            }}
          >
            {TRACKING_DOMAINS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        {series.points.length === 0 ? (
          <p className="cp-microcopy" style={{ fontSize: "0.84rem" }}>
            No data points yet. Daily check-ins build this view.
          </p>
        ) : (
          <ProgressChart series={series} />
        )}
        <p
          className="cp-microcopy"
          style={{ fontSize: "0.7rem", marginTop: 8 }}
        >
          {meta?.scaleLabel}
        </p>
      </section>
    </ClientShell>
  );
}
