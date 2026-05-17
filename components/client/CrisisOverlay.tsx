"use client";
// Crisis Mode — full-screen calming overlay. Activated by the floating
// "I'm overwhelmed" button. Simplified UI: bigger buttons, no animations,
// reduced color, only the gentlest tools.

import Link from "next/link";
import { useClientPortal } from "@/contexts/ClientPortalContext";

export function CrisisOverlay() {
  const { crisisModeActive, exitCrisis, safePeople, startAftercare } =
    useClientPortal();
  if (!crisisModeActive) return null;

  function leave() {
    exitCrisis();
    startAftercare();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Calming mode"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        background:
          "linear-gradient(160deg, #E5E0E8 0%, #D5CFE0 50%, #B6BBD0 100%)",
        color: "#22203A",
        padding: "2rem 1.5rem",
        overflow: "auto",
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto", paddingTop: "1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: 32 }} aria-hidden>✦</div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              margin: "0.5rem 0 0.25rem",
            }}
          >
            You&rsquo;re safe here.
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: "#4D466B",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            We&rsquo;ll go slowly. Pick one thing.
          </p>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <Link
            href="/client/grounding"
            style={bigButtonStyle("#4D5A8A", "#FFFFFF")}
          >
            Breathe with me
          </Link>
          <Link
            href="/client/cards"
            style={bigButtonStyle("#6E5A8A", "#FFFFFF")}
          >
            One soft card
          </Link>
          {safePeople.length > 0 && (
            <Link
              href="/client/safe-people"
              style={bigButtonStyle("#FFFFFF", "#22203A")}
            >
              See safe people
            </Link>
          )}
          <button
            onClick={leave}
            style={{
              ...bigButtonStyle("transparent", "#22203A"),
              border: "1px solid rgba(34, 32, 58, 0.25)",
            }}
          >
            I&rsquo;m okay to leave this mode
          </button>
        </div>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "2rem 0 0",
            fontSize: "0.9rem",
            color: "#4D466B",
            lineHeight: 1.7,
            textAlign: "center",
          }}
        >
          <li>· It&rsquo;s okay that this is hard.</li>
          <li>· You don&rsquo;t have to solve anything right now.</li>
          <li>· Coming back to this screen counts.</li>
        </ul>
      </div>
    </div>
  );
}

function bigButtonStyle(bg: string, fg: string): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.1rem 1rem",
    borderRadius: 20,
    background: bg,
    color: fg,
    fontSize: "1.05rem",
    fontWeight: 500,
    textDecoration: "none",
    cursor: "pointer",
    border: "none",
    minHeight: 60,
  };
}
