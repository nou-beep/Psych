"use client";
// Grounding Space — breathing visual, sensory prompts, low-stim mode.

import { useEffect, useState } from "react";
import { ClientShell } from "@/components/client/ClientShell";
import { useClientPortal } from "@/contexts/ClientPortalContext";

const PROMPTS = [
  "Notice 5 things you can see.",
  "Press your feet into the floor.",
  "Hold something with texture for 10 seconds.",
  "Lengthen your exhale: in 4, out 6.",
  "Name the room, the day, one true thing.",
  "Hum quietly for three breaths.",
];

export default function GroundingPage() {
  const { incrementGroundingUse } = useClientPortal();
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [promptIdx, setPromptIdx] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    incrementGroundingUse();
    // Note: this only counts page visits, not breaths — by design.
    // We don't want a "streak" or pressure feeling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!running) return;
    const cycle = phase === "in" ? 4000 : phase === "hold" ? 2000 : 6000;
    const t = setTimeout(() => {
      setPhase((p) => (p === "in" ? "hold" : p === "hold" ? "out" : "in"));
    }, cycle);
    return () => clearTimeout(t);
  }, [phase, running]);

  const scale = phase === "in" ? 1.3 : phase === "hold" ? 1.3 : 0.85;
  const label = phase === "in" ? "Breathe in" : phase === "hold" ? "Hold" : "Breathe out";

  function nextPrompt() {
    setPromptIdx((i) => (i + 1) % PROMPTS.length);
  }

  return (
    <ClientShell
      title="A reset room."
      microcopy="Stay as long as you'd like. No timer."
    >
      <div
        className="cp-card cp-fade-in"
        style={{ textAlign: "center", padding: "2rem 1.25rem" }}
      >
        <div
          aria-label="Breathing circle"
          style={{
            width: 180,
            height: 180,
            borderRadius: "50%",
            margin: "0 auto",
            background:
              "radial-gradient(circle at 50% 40%, var(--cp-accent), var(--cp-glow))",
            transform: `scale(${scale})`,
            transition: "transform 4s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 18px 60px var(--cp-glow)",
          }}
        />
        <p
          style={{
            marginTop: "1.5rem",
            color: "var(--cp-text)",
            fontSize: "1.05rem",
            fontWeight: 500,
          }}
        >
          {running ? label : "Press to start."}
        </p>
        <button
          onClick={() => setRunning((r) => !r)}
          style={{
            all: "unset",
            cursor: "pointer",
            marginTop: 16,
            padding: "0.6rem 1.2rem",
            borderRadius: 999,
            background: running ? "var(--cp-card-soft)" : "var(--cp-accent)",
            color: running ? "var(--cp-text)" : "white",
            border: "1px solid var(--cp-border)",
            fontSize: "0.88rem",
          }}
        >
          {running ? "Pause" : "Begin gently"}
        </button>
      </div>

      <div
        className="cp-card-soft cp-fade-in"
        style={{ marginTop: "1.25rem" }}
      >
        <p className="cp-microcopy" style={{ fontSize: "0.85rem", marginBottom: 10 }}>
          A sensory prompt to try.
        </p>
        <p
          style={{
            fontSize: "1.05rem",
            color: "var(--cp-text)",
            margin: "0 0 1rem",
            lineHeight: 1.5,
          }}
        >
          {PROMPTS[promptIdx]}
        </p>
        <button
          onClick={nextPrompt}
          style={{
            all: "unset",
            cursor: "pointer",
            padding: "0.55rem 1rem",
            borderRadius: 999,
            background: "var(--cp-card)",
            border: "1px solid var(--cp-border)",
            color: "var(--cp-accent)",
            fontSize: "0.85rem",
          }}
        >
          Another, please
        </button>
      </div>
    </ClientShell>
  );
}
