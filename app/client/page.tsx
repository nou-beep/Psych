"use client";
// Client portal home — feels like entering a safe emotional space.
// No dashboard cards; soft sections with gentle copy.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CloudFog,
  CloudRain,
  Cloud,
  Wind,
  Heart,
  Compass,
  Library,
  Layers,
  ShieldHalf,
  Mic,
  Palette,
  Sparkles,
} from "lucide-react";
import { ClientShell } from "@/components/client/ClientShell";
import { useClientPortal } from "@/contexts/ClientPortalContext";
import {
  ALL_WEATHERS,
  WEATHER_META,
  rankByWeather,
  type EmotionalWeather,
} from "@/lib/client/emotional-weather";
import { ALL_JOURNEYS } from "@/lib/client/journeys";
import { buildMemoryNotes } from "@/lib/client/memory";
import {
  loadAssignments,
  acknowledge,
  saveAssignments,
  type ClientAssignment,
} from "@/lib/client/assignments";
import { ALL_WORKBOOKS } from "@/lib/client/workbooks";
import { ALL_CARDS } from "@/lib/client/therapy-cards";

const WEATHER_ICONS: Partial<Record<EmotionalWeather, typeof CloudFog>> = {
  foggy: CloudFog,
  stormy: CloudRain,
  floating: Cloud,
  loud: Wind,
  underwater: Cloud,
  numb: Cloud,
  heavy: Cloud,
  static: Wind,
  frozen: Cloud,
  open: Sparkles,
};

export default function ClientHomePage() {
  const {
    weather,
    setWeather,
    weatherHistory,
    audioReflectionCount,
    groundingUses,
    lowEnergySessionCount,
    journeyProgress,
    favouriteCardIds,
    comfortObjects,
  } = useClientPortal();

  // A short list of suggested journeys for the current weather.
  const suggestedJourneys = useMemo(() => {
    return rankByWeather(ALL_JOURNEYS, weather).slice(0, 3);
  }, [weather]);

  // Recent in-progress journey (if any).
  const activeJourney = useMemo(() => {
    const entries = Object.values(journeyProgress).filter(
      (p): p is NonNullable<typeof p> => !!p && p.completedSteps.length > 0
    );
    if (entries.length === 0) return null;
    const latest = entries.sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    )[0];
    return ALL_JOURNEYS.find((j) => j.id === latest.journeyId) ?? null;
  }, [journeyProgress]);

  const memoryNotes = useMemo(
    () =>
      buildMemoryNotes({
        weatherHistory,
        audioReflectionCount,
        groundingUses,
        lowEnergySessionCount,
        favouriteDecks: favouriteCardIds,
        comfortObjectCount: comfortObjects.length,
        completedSteps: Object.values(journeyProgress).reduce(
          (acc, p) => acc + (p?.completedSteps.length ?? 0),
          0
        ),
      }),
    [
      weatherHistory,
      audioReflectionCount,
      groundingUses,
      lowEnergySessionCount,
      favouriteCardIds,
      comfortObjects.length,
      journeyProgress,
    ]
  );

  // Therapist→client assignments (read from shared localStorage).
  const [assignments, setAssignments] = useState<ClientAssignment[]>([]);
  useEffect(() => {
    setAssignments(loadAssignments());
  }, []);
  const unread = assignments.filter((a) => !a.acknowledged);

  function ackAssignment(id: string) {
    const next = acknowledge(assignments, id);
    setAssignments(next);
    saveAssignments(next);
  }

  function assignmentHref(a: ClientAssignment): string | null {
    if (a.kind === "workbook" && a.targetId) return `/client/workbooks/${a.targetId}`;
    if (a.kind === "journey" && a.targetId) return `/client/journeys/${a.targetId}`;
    if (a.kind === "card") return "/client/cards";
    return null;
  }

  function describeAssignment(a: ClientAssignment): string {
    if (a.kind === "workbook") {
      const wb = ALL_WORKBOOKS.find((w) => w.id === a.targetId);
      return wb ? `Workbook: ${wb.title}` : "A workbook";
    }
    if (a.kind === "journey") {
      // Avoid extra imports — journey display name fallback.
      return `A journey: ${a.targetId ?? ""}`;
    }
    if (a.kind === "card") {
      const card = ALL_CARDS.find((c) => c.id === a.targetId);
      return card ? `A card: "${card.prompt}"` : "A card";
    }
    return "A supportive note";
  }

  return (
    <ClientShell title="A softer place to land." microcopy="You can move slowly here.">
      {/* From your therapist */}
      {unread.length > 0 && (
        <section className="cp-card cp-fade-in" style={{ marginBottom: "1.25rem" }}>
          <h2
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              margin: "0 0 0.5rem",
              color: "var(--cp-text)",
            }}
          >
            From your therapist
          </h2>
          <p
            className="cp-microcopy"
            style={{ fontSize: "0.82rem", marginBottom: 10 }}
          >
            Soft things they wanted you to have.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
            {unread.map((a) => {
              const href = assignmentHref(a);
              const label = describeAssignment(a);
              return (
                <li
                  key={a.id}
                  className="cp-card-soft"
                  style={{ display: "flex", gap: 10, alignItems: "center" }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.88rem", color: "var(--cp-text)" }}>
                      {label}
                    </div>
                    {a.note && (
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: "0.78rem",
                          color: "var(--cp-muted)",
                          lineHeight: 1.5,
                        }}
                      >
                        “{a.note}”
                      </div>
                    )}
                  </div>
                  {href ? (
                    <Link
                      href={href}
                      onClick={() => ackAssignment(a.id)}
                      style={{
                        padding: "0.45rem 0.8rem",
                        borderRadius: 999,
                        background: "var(--cp-accent)",
                        color: "white",
                        textDecoration: "none",
                        fontSize: "0.78rem",
                      }}
                    >
                      Open
                    </Link>
                  ) : (
                    <button
                      onClick={() => ackAssignment(a.id)}
                      style={{
                        all: "unset",
                        cursor: "pointer",
                        padding: "0.45rem 0.8rem",
                        borderRadius: 999,
                        background: "var(--cp-card)",
                        border: "1px solid var(--cp-border)",
                        fontSize: "0.78rem",
                        color: "var(--cp-muted)",
                      }}
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

      {/* Today's emotional weather */}
      <section className="cp-card cp-fade-in" style={{ marginBottom: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.6rem",
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
            Today&rsquo;s emotional weather
          </h2>
          <Link
            href="/client/express"
            style={{
              fontSize: "0.78rem",
              color: "var(--cp-accent)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Palette size={12} /> I can&rsquo;t explain it
          </Link>
        </div>
        <p className="cp-microcopy" style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
          {weather ? WEATHER_META[weather].microcopy : "What feels closest today?"}
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
            gap: 8,
          }}
        >
          {ALL_WEATHERS.map((w) => {
            const Icon = WEATHER_ICONS[w] ?? Cloud;
            const active = weather === w;
            return (
              <button
                key={w}
                onClick={() => setWeather(active ? null : w)}
                aria-pressed={active}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: "0.7rem 0.4rem",
                  borderRadius: 14,
                  border: `1px solid ${
                    active ? "var(--cp-accent)" : "var(--cp-border)"
                  }`,
                  background: active
                    ? "var(--cp-glow)"
                    : "var(--cp-card-soft)",
                  color: "var(--cp-text)",
                  fontSize: "0.75rem",
                  textAlign: "center",
                  transition: "transform 0.2s, background 0.2s",
                }}
              >
                <Icon size={16} style={{ color: "var(--cp-accent)" }} />
                {WEATHER_META[w].label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Continue your journey */}
      {activeJourney && (
        <section className="cp-card cp-fade-in" style={{ marginBottom: "1.25rem" }}>
          <h2
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              margin: "0 0 0.4rem",
              color: "var(--cp-text)",
            }}
          >
            Continue your journey
          </h2>
          <p className="cp-microcopy" style={{ marginBottom: "0.8rem", fontSize: "0.85rem" }}>
            {activeJourney.microcopy}
          </p>
          <Link
            href={`/client/journeys/${activeJourney.id}`}
            style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              borderRadius: 999,
              background: "var(--cp-accent)",
              color: "white",
              fontSize: "0.85rem",
              textDecoration: "none",
            }}
          >
            {activeJourney.title} →
          </Link>
        </section>
      )}

      {/* Gentle quick actions */}
      <section
        className="cp-fade-in"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 10,
          marginBottom: "1.25rem",
        }}
      >
        {[
          { href: "/client/checkin", icon: Heart, label: "Gentle check-in", sub: "What's closest?" },
          { href: "/client/grounding", icon: Compass, label: "Grounding", sub: "A reset room" },
          { href: "/client/cards", icon: Layers, label: "A card", sub: "Just one" },
          { href: "/client/workbooks", icon: Library, label: "Workbook", sub: "Soft pages" },
          { href: "/client/comfort", icon: ShieldHalf, label: "Comfort shelf", sub: "Anchors" },
          { href: "/client/audio", icon: Mic, label: "Voice note", sub: "Quieter than typing" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="cp-card-soft"
              style={{
                textDecoration: "none",
                display: "block",
                color: "var(--cp-text)",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "var(--cp-glow)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--cp-accent)",
                  marginBottom: 8,
                }}
              >
                <Icon size={16} />
              </div>
              <div style={{ fontSize: "0.88rem", fontWeight: 500 }}>
                {item.label}
              </div>
              <div
                style={{
                  fontSize: "0.74rem",
                  color: "var(--cp-muted)",
                  marginTop: 2,
                }}
              >
                {item.sub}
              </div>
            </Link>
          );
        })}
      </section>

      {/* Suggested journeys (weather-aware) */}
      {weather && suggestedJourneys.length > 0 && (
        <section className="cp-card cp-fade-in" style={{ marginBottom: "1.25rem" }}>
          <h2
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              margin: "0 0 0.6rem",
              color: "var(--cp-text)",
            }}
          >
            For a day that feels {WEATHER_META[weather].label.toLowerCase()}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {suggestedJourneys.map((j) => (
              <Link
                key={j.id}
                href={`/client/journeys/${j.id}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.7rem 0.85rem",
                  borderRadius: 14,
                  background: "var(--cp-card-soft)",
                  textDecoration: "none",
                  color: "var(--cp-text)",
                  border: "1px solid var(--cp-border)",
                }}
              >
                <span style={{ fontSize: "0.88rem" }}>{j.title}</span>
                <span style={{ fontSize: "0.74rem", color: "var(--cp-muted)" }}>
                  {j.microcopy}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Therapy memory — gentle observations */}
      {memoryNotes.length > 0 && (
        <section className="cp-card cp-fade-in" style={{ marginBottom: "1.25rem" }}>
          <h2
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              margin: "0 0 0.6rem",
              color: "var(--cp-text)",
            }}
          >
            Some things this space has noticed
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {memoryNotes.map((n) => (
              <li
                key={n.id}
                style={{
                  fontSize: "0.86rem",
                  color: "var(--cp-text)",
                  padding: "0.55rem 0.7rem",
                  borderRadius: 12,
                  background: "var(--cp-card-soft)",
                  marginBottom: 6,
                  lineHeight: 1.5,
                }}
              >
                ✦ {n.text}
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer
        className="cp-microcopy cp-fade-in"
        style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.78rem" }}
      >
        No pressure to explain everything.
        <br />
        <Link
          href="/welcome"
          style={{ color: "var(--cp-accent)", textDecoration: "none" }}
        >
          Switch portal →
        </Link>
      </footer>
    </ClientShell>
  );
}
