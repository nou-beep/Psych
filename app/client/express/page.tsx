"use client";
// "I can't explain it" mode — visual emotional expression canvas.
// Tap to add a soft color blob, drag to move, tap again to grow.
// No labels, no validation, no diagnosis.

import { useState, useRef } from "react";
import { ClientShell } from "@/components/client/ClientShell";
import { useClientPortal } from "@/contexts/ClientPortalContext";
import { useRouter } from "next/navigation";

const PALETTE = [
  "#F2B5CB",
  "#C7B2E0",
  "#8AB5CD",
  "#E8C8A0",
  "#B5CDB0",
  "#D6A4D6",
  "#E0A8A0",
  "#9AA8C7",
];

interface Blob {
  id: string;
  x: number; // 0..1
  y: number; // 0..1
  radius: number;
  color: string;
  intensity: number;
}

function rid() {
  return `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function ExpressPage() {
  const router = useRouter();
  const { addExpression, weather, startAftercare } = useClientPortal();
  const [color, setColor] = useState(PALETTE[1]);
  const [intensity, setIntensity] = useState(0.6);
  const [blobs, setBlobs] = useState<Blob[]>([]);
  const [note, setNote] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);

  function addBlob(e: React.MouseEvent<HTMLDivElement>) {
    const el = canvasRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setBlobs((prev) => [
      ...prev,
      {
        id: rid(),
        x,
        y,
        radius: 60 + intensity * 80,
        color,
        intensity,
      },
    ]);
  }

  function clear() {
    setBlobs([]);
  }

  function save() {
    addExpression({ blobs, note, weather });
    startAftercare();
    router.push("/client");
  }

  return (
    <ClientShell
      title="No need for words."
      microcopy="Touch the space below. Let the colors speak."
    >
      {/* Palette */}
      <div
        className="cp-card-soft cp-fade-in"
        style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}
      >
        {PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            aria-label={`Select color ${c}`}
            aria-pressed={color === c}
            style={{
              all: "unset",
              cursor: "pointer",
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: c,
              outline:
                color === c
                  ? "3px solid var(--cp-accent)"
                  : "1px solid var(--cp-border)",
              outlineOffset: 2,
            }}
          />
        ))}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: "0.78rem",
            color: "var(--cp-muted)",
          }}
        >
          intensity
          <input
            type="range"
            min={0.2}
            max={1.2}
            step={0.05}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            style={{ accentColor: "var(--cp-accent)" }}
            aria-label="Intensity"
          />
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        onClick={addBlob}
        role="application"
        aria-label="Emotional expression canvas"
        className="cp-fade-in"
        style={{
          position: "relative",
          minHeight: 340,
          borderRadius: 24,
          background:
            "radial-gradient(circle at 50% 50%, var(--cp-card-soft), var(--cp-card))",
          border: "1px solid var(--cp-border)",
          overflow: "hidden",
          cursor: "crosshair",
        }}
      >
        {blobs.map((b) => (
          <span
            key={b.id}
            style={{
              position: "absolute",
              left: `${b.x * 100}%`,
              top: `${b.y * 100}%`,
              transform: "translate(-50%, -50%)",
              width: b.radius * 2,
              height: b.radius * 2,
              borderRadius: "50%",
              background: b.color,
              filter: "blur(20px)",
              opacity: b.intensity,
              pointerEvents: "none",
            }}
          />
        ))}
        {blobs.length === 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--cp-muted)",
              fontSize: "0.85rem",
              pointerEvents: "none",
            }}
          >
            Tap anywhere.
          </div>
        )}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="A word or two, only if it lands. Otherwise leave blank."
        className="cp-fade-in"
        style={{
          width: "100%",
          marginTop: "1rem",
          padding: 12,
          borderRadius: 16,
          border: "1px solid var(--cp-border)",
          background: "var(--cp-card-soft)",
          color: "var(--cp-text)",
          fontSize: "0.9rem",
          minHeight: 60,
          resize: "vertical",
          fontFamily: "inherit",
        }}
      />

      <div style={{ display: "flex", gap: 8, marginTop: "1rem" }}>
        <button
          onClick={clear}
          style={{
            all: "unset",
            cursor: "pointer",
            flex: 1,
            textAlign: "center",
            padding: "0.85rem",
            borderRadius: 16,
            background: "var(--cp-card-soft)",
            border: "1px solid var(--cp-border)",
            color: "var(--cp-muted)",
            fontSize: "0.85rem",
          }}
        >
          Clear softly
        </button>
        <button
          onClick={save}
          style={{
            all: "unset",
            cursor: "pointer",
            flex: 2,
            textAlign: "center",
            padding: "0.85rem",
            borderRadius: 16,
            background: "var(--cp-accent)",
            color: "white",
            fontSize: "0.9rem",
            fontWeight: 500,
          }}
        >
          Save expression
        </button>
      </div>
    </ClientShell>
  );
}
