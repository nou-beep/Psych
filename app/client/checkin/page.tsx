"use client";
// Soft check-in — emotionally intelligent, multi-mode. No required fields.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClientShell } from "@/components/client/ClientShell";
import { useClientPortal } from "@/contexts/ClientPortalContext";
import {
  ALL_WEATHERS,
  WEATHER_META,
  type EmotionalWeather,
} from "@/lib/client/emotional-weather";
import type { CheckInMode } from "@/contexts/ClientPortalContext";

const PROMPTS = [
  "What's taking up the most space today?",
  "What feels loud lately?",
  "What feels distant?",
  "How connected do you feel to yourself today?",
  "What emotion keeps returning?",
  "What brought relief recently?",
];

const MODES: Array<{ id: CheckInMode; label: string; sub: string }> = [
  { id: "expressive", label: "Expressive", sub: "Words and feelings" },
  { id: "minimal", label: "Minimal", sub: "Tap and go" },
  { id: "low-energy", label: "Low energy", sub: "Pick one thing" },
  { id: "silent", label: "Silent", sub: "Just colors / weather" },
];

export default function CheckInPage() {
  const router = useRouter();
  const { addCheckIn, weather, setWeather, startAftercare } = useClientPortal();
  const [mode, setMode] = useState<CheckInMode>("expressive");
  const [prompt, setPrompt] = useState(PROMPTS[0]);
  const [text, setText] = useState("");
  const [chosenWeather, setChosenWeather] = useState<EmotionalWeather | null>(
    weather
  );

  function save() {
    addCheckIn({
      prompt,
      text: mode === "silent" ? undefined : text,
      weather: chosenWeather,
      mode,
    });
    if (chosenWeather) setWeather(chosenWeather);
    startAftercare();
    router.push("/client");
  }

  return (
    <ClientShell
      title="A gentle check-in."
      microcopy="No pressure to explain everything."
    >
      {/* Mode picker */}
      <div
        className="cp-card-soft cp-fade-in"
        style={{ marginBottom: "1.25rem" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 6,
          }}
        >
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              aria-pressed={mode === m.id}
              style={{
                all: "unset",
                cursor: "pointer",
                padding: "0.5rem 0.75rem",
                borderRadius: 12,
                border: `1px solid ${
                  mode === m.id ? "var(--cp-accent)" : "var(--cp-border)"
                }`,
                background: mode === m.id ? "var(--cp-glow)" : "transparent",
                fontSize: "0.82rem",
                color: "var(--cp-text)",
                textAlign: "center",
              }}
            >
              <div style={{ fontWeight: 500 }}>{m.label}</div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--cp-muted)",
                  marginTop: 2,
                }}
              >
                {m.sub}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt selector */}
      {(mode === "expressive" || mode === "minimal") && (
        <div className="cp-card cp-fade-in" style={{ marginBottom: "1.25rem" }}>
          <p className="cp-microcopy" style={{ fontSize: "0.82rem", marginBottom: 8 }}>
            Pick a question (or skip and just write).
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => setPrompt(p)}
                aria-pressed={prompt === p}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  padding: "0.4rem 0.7rem",
                  borderRadius: 999,
                  fontSize: "0.78rem",
                  border: `1px solid ${
                    prompt === p ? "var(--cp-accent)" : "var(--cp-border)"
                  }`,
                  background:
                    prompt === p ? "var(--cp-glow)" : "var(--cp-card-soft)",
                  color: "var(--cp-text)",
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {mode === "expressive" && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Just write whatever lands."
              style={{
                width: "100%",
                marginTop: 12,
                padding: 12,
                borderRadius: 14,
                border: "1px solid var(--cp-border)",
                background: "var(--cp-card-soft)",
                color: "var(--cp-text)",
                fontSize: "0.92rem",
                minHeight: 120,
                resize: "vertical",
                fontFamily: "inherit",
                lineHeight: 1.5,
              }}
            />
          )}

          {mode === "minimal" && (
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="One word or sentence."
              style={{
                width: "100%",
                marginTop: 12,
                padding: 12,
                borderRadius: 14,
                border: "1px solid var(--cp-border)",
                background: "var(--cp-card-soft)",
                color: "var(--cp-text)",
                fontSize: "0.95rem",
              }}
            />
          )}
        </div>
      )}

      {/* Weather picker (always) */}
      <div className="cp-card cp-fade-in" style={{ marginBottom: "1.25rem" }}>
        <p className="cp-microcopy" style={{ fontSize: "0.82rem", marginBottom: 8 }}>
          {mode === "silent"
            ? "Choose what fits — no need to explain."
            : "Add a weather (optional)."}
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
            gap: 6,
          }}
        >
          {ALL_WEATHERS.map((w) => (
            <button
              key={w}
              onClick={() =>
                setChosenWeather(chosenWeather === w ? null : w)
              }
              aria-pressed={chosenWeather === w}
              style={{
                all: "unset",
                cursor: "pointer",
                padding: "0.55rem 0.4rem",
                borderRadius: 12,
                border: `1px solid ${
                  chosenWeather === w
                    ? "var(--cp-accent)"
                    : "var(--cp-border)"
                }`,
                background:
                  chosenWeather === w ? "var(--cp-glow)" : "var(--cp-card-soft)",
                fontSize: "0.78rem",
                color: "var(--cp-text)",
                textAlign: "center",
              }}
            >
              {WEATHER_META[w].label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={save}
        style={{
          all: "unset",
          cursor: "pointer",
          width: "100%",
          padding: "0.9rem 1rem",
          borderRadius: 16,
          background: "var(--cp-accent)",
          color: "white",
          fontSize: "0.95rem",
          textAlign: "center",
          fontWeight: 500,
          boxShadow: "0 8px 24px var(--cp-glow)",
        }}
      >
        Save softly
      </button>
    </ClientShell>
  );
}
