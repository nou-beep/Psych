"use client";
// Soft full-screen overlay shown after intense interactions
// (workbook completion, journey step, crisis exit). Gentle prompts,
// no countdown, no "OK" button — just a "ready" link.

import { useClientPortal } from "@/contexts/ClientPortalContext";

export function AftercareOverlay() {
  const { aftercareActive, endAftercare } = useClientPortal();
  if (!aftercareActive) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Aftercare"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(20, 14, 30, 0.45)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: "cp-fade-in 0.5s ease-out both",
      }}
    >
      <div
        className="cp-card"
        style={{
          maxWidth: 420,
          textAlign: "center",
          padding: "2rem",
          margin: "0 1rem",
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }} aria-hidden>
          ✦
        </div>
        <h2
          style={{
            margin: 0,
            fontSize: "1.2rem",
            fontWeight: 600,
            color: "var(--cp-text)",
          }}
        >
          A softer moment before continuing.
        </h2>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "1rem 0 1.5rem",
            color: "var(--cp-muted)",
            fontSize: "0.9rem",
            lineHeight: 1.8,
            textAlign: "left",
          }}
        >
          <li>· Take one slow breath.</li>
          <li>· Drink some water if you can.</li>
          <li>· You do not need to solve everything right now.</li>
          <li>· Notice one thing in the room.</li>
        </ul>
        <button
          onClick={endAftercare}
          style={{
            all: "unset",
            cursor: "pointer",
            padding: "0.6rem 1.2rem",
            borderRadius: 999,
            background: "var(--cp-accent)",
            color: "white",
            fontSize: "0.9rem",
            fontWeight: 500,
          }}
        >
          I&rsquo;m ready
        </button>
      </div>
    </div>
  );
}
