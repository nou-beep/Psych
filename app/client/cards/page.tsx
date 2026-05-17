"use client";
// Therapy Cards — draw, shuffle, favourite. Soft reveal animation.

import { useMemo, useState } from "react";
import { Heart, Shuffle, Sparkles } from "lucide-react";
import { ClientShell } from "@/components/client/ClientShell";
import { useClientPortal } from "@/contexts/ClientPortalContext";
import {
  ALL_CARDS,
  DECK_LABELS,
  cardsInDeck,
  drawCard,
  type CardDeck,
  type TherapyCard,
} from "@/lib/client/therapy-cards";
import { rankByWeather } from "@/lib/client/emotional-weather";

const DECK_IDS: CardDeck[] = [
  "grounding",
  "coping",
  "validation",
  "nervous-system",
  "self-soothing",
  "journaling",
  "reflection",
  "reassurance",
  "sensory",
  "reminders",
];

export default function CardsPage() {
  const { weather, favouriteCardIds, toggleFavouriteCard } = useClientPortal();
  const [deck, setDeck] = useState<CardDeck | "all">("all");
  const [drawn, setDrawn] = useState<TherapyCard | null>(null);
  const [revealKey, setRevealKey] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);

  const pool = useMemo<TherapyCard[]>(() => {
    const base = deck === "all" ? ALL_CARDS : cardsInDeck(deck);
    return rankByWeather(base, weather);
  }, [deck, weather]);

  function draw() {
    const c = drawCard(pool, recent);
    setDrawn(c);
    setRevealKey((k) => k + 1);
    if (c) setRecent((r) => [c.id, ...r].slice(0, 6));
  }

  function isFav(id: string) {
    return favouriteCardIds.includes(id);
  }

  return (
    <ClientShell
      title="A card, just for now."
      microcopy="One soft thought at a time."
    >
      {/* Deck selector */}
      <div
        className="cp-card-soft cp-fade-in"
        style={{
          marginBottom: "1rem",
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setDeck("all")}
          aria-pressed={deck === "all"}
          style={pillStyle(deck === "all")}
        >
          All decks
        </button>
        {DECK_IDS.map((d) => (
          <button
            key={d}
            onClick={() => setDeck(d)}
            aria-pressed={deck === d}
            style={pillStyle(deck === d)}
          >
            {DECK_LABELS[d]}
          </button>
        ))}
      </div>

      {/* Draw area */}
      <div
        className="cp-card cp-fade-in"
        style={{ textAlign: "center", padding: "2rem 1.5rem" }}
      >
        {drawn ? (
          <div
            key={revealKey}
            className="cp-fade-in"
            style={{
              padding: "1.5rem 1rem",
              borderRadius: 20,
              background:
                "linear-gradient(135deg, var(--cp-glow), var(--cp-card-soft))",
              border: "1px solid var(--cp-border)",
            }}
          >
            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--cp-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 8,
              }}
            >
              {DECK_LABELS[drawn.deck]}
            </div>
            <p
              style={{
                fontSize: "1.15rem",
                color: "var(--cp-text)",
                lineHeight: 1.5,
                margin: "0 0 1rem",
              }}
            >
              {drawn.prompt}
            </p>
            <button
              onClick={() => toggleFavouriteCard(drawn.id)}
              aria-pressed={isFav(drawn.id)}
              aria-label={isFav(drawn.id) ? "Remove from favourites" : "Save card"}
              style={{
                all: "unset",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "0.4rem 0.8rem",
                borderRadius: 999,
                background: "var(--cp-card)",
                border: "1px solid var(--cp-border)",
                fontSize: "0.82rem",
                color: isFav(drawn.id) ? "var(--cp-accent)" : "var(--cp-muted)",
              }}
            >
              <Heart
                size={14}
                fill={isFav(drawn.id) ? "currentColor" : "none"}
              />
              {isFav(drawn.id) ? "Saved" : "Save"}
            </button>
          </div>
        ) : (
          <div style={{ padding: "2rem 0", color: "var(--cp-muted)" }}>
            <Sparkles size={20} style={{ marginBottom: 8 }} />
            <p style={{ margin: 0, fontSize: "0.9rem" }}>
              Tap below to draw a card.
            </p>
          </div>
        )}

        <button
          onClick={draw}
          style={{
            all: "unset",
            cursor: "pointer",
            marginTop: 16,
            padding: "0.7rem 1.4rem",
            borderRadius: 999,
            background: "var(--cp-accent)",
            color: "white",
            fontSize: "0.9rem",
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Shuffle size={14} /> {drawn ? "Draw another" : "Draw a card"}
        </button>
      </div>

      {/* Favourites */}
      {favouriteCardIds.length > 0 && (
        <div className="cp-card cp-fade-in" style={{ marginTop: "1.25rem" }}>
          <h2
            style={{
              margin: "0 0 0.6rem",
              fontSize: "0.92rem",
              fontWeight: 600,
              color: "var(--cp-text)",
            }}
          >
            Saved cards
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {favouriteCardIds
              .map((id) => ALL_CARDS.find((c) => c.id === id))
              .filter((c): c is TherapyCard => !!c)
              .map((c) => (
                <li
                  key={c.id}
                  style={{
                    padding: "0.65rem 0.8rem",
                    borderRadius: 12,
                    background: "var(--cp-card-soft)",
                    marginBottom: 6,
                    fontSize: "0.86rem",
                    color: "var(--cp-text)",
                  }}
                >
                  {c.prompt}
                </li>
              ))}
          </ul>
        </div>
      )}
    </ClientShell>
  );
}

function pillStyle(active: boolean): React.CSSProperties {
  return {
    all: "unset",
    cursor: "pointer",
    padding: "0.35rem 0.7rem",
    borderRadius: 999,
    fontSize: "0.78rem",
    border: `1px solid ${active ? "var(--cp-accent)" : "var(--cp-border)"}`,
    background: active ? "var(--cp-glow)" : "transparent",
    color: "var(--cp-text)",
  };
}
