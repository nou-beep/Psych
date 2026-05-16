"use client";
// Client portal settings — theme, low-energy mode, switch portal.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClientShell } from "@/components/client/ClientShell";
import { useClientPortal, type ClientTheme } from "@/contexts/ClientPortalContext";
import { setPortalPreference } from "@/lib/client/portal-store";

const THEMES: Array<{ id: ClientTheme; label: string; swatch: string; sub: string }> = [
  { id: "rose-calm", label: "Rose Calm", swatch: "linear-gradient(135deg, #FFE8EE, #F8D8E5)", sub: "Default soft pink" },
  { id: "moonlight", label: "Moonlight", swatch: "linear-gradient(135deg, #1E1E2E, #2A2440)", sub: "Quiet, dark, calming" },
  { id: "ocean-quiet", label: "Ocean Quiet", swatch: "linear-gradient(135deg, #D8E8F0, #B8D0E3)", sub: "Cool blue stillness" },
  { id: "lavender-rest", label: "Lavender Rest", swatch: "linear-gradient(135deg, #EDE5F5, #D8CCE8)", sub: "Dreamy lavender" },
  { id: "golden-hour", label: "Golden Hour", swatch: "linear-gradient(135deg, #FBE8D3, #F0CFA4)", sub: "Warm light" },
  { id: "cloud-room", label: "Cloud Room", swatch: "linear-gradient(135deg, #F5F5FA, #E8E8F0)", sub: "Quiet white" },
];

export default function ClientSettingsPage() {
  const router = useRouter();
  const { theme, setTheme, lowEnergyMode, setLowEnergyMode } = useClientPortal();

  function leavePortal() {
    setPortalPreference(null);
    router.push("/welcome");
  }

  function toTherapist() {
    setPortalPreference("therapist");
    router.push("/");
  }

  return (
    <ClientShell title="You here." microcopy="A few gentle controls.">
      {/* Theme grid */}
      <section className="cp-card cp-fade-in" style={{ marginBottom: "1.25rem" }}>
        <h2
          style={{
            margin: "0 0 0.5rem",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "var(--cp-text)",
          }}
        >
          Atmosphere
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 8,
          }}
        >
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              aria-pressed={theme === t.id}
              style={{
                all: "unset",
                cursor: "pointer",
                borderRadius: 16,
                overflow: "hidden",
                border: `1px solid ${
                  theme === t.id ? "var(--cp-accent)" : "var(--cp-border)"
                }`,
              }}
            >
              <div style={{ height: 60, background: t.swatch }} />
              <div style={{ padding: "0.55rem 0.7rem" }}>
                <div
                  style={{
                    fontSize: "0.86rem",
                    fontWeight: 500,
                    color: "var(--cp-text)",
                  }}
                >
                  {t.label}
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--cp-muted)",
                    marginTop: 2,
                  }}
                >
                  {t.sub}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Low energy toggle */}
      <section className="cp-card cp-fade-in" style={{ marginBottom: "1.25rem" }}>
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={lowEnergyMode}
            onChange={(e) => setLowEnergyMode(e.target.checked)}
            style={{ marginTop: 4 }}
          />
          <span>
            <span style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--cp-text)" }}>
              Low energy mode
            </span>
            <span
              style={{
                display: "block",
                fontSize: "0.82rem",
                color: "var(--cp-muted)",
                marginTop: 2,
                lineHeight: 1.5,
              }}
            >
              Simpler UI. Fewer choices. Less motion. Bigger touches.
            </span>
          </span>
        </label>
      </section>

      {/* Portal switching */}
      <section className="cp-card cp-fade-in" style={{ marginBottom: "1.25rem" }}>
        <h2
          style={{
            margin: "0 0 0.5rem",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "var(--cp-text)",
          }}
        >
          Portals
        </h2>
        <p
          className="cp-microcopy"
          style={{ fontSize: "0.85rem", marginBottom: 12 }}
        >
          You can switch any time. Your data stays on this device.
        </p>
        <div style={{ display: "grid", gap: 8 }}>
          <Link
            href="/client/safe-people"
            style={{
              padding: "0.7rem 0.9rem",
              borderRadius: 12,
              border: "1px solid var(--cp-border)",
              color: "var(--cp-text)",
              textDecoration: "none",
              fontSize: "0.88rem",
            }}
          >
            Safe people →
          </Link>
          <Link
            href="/client/journeys"
            style={{
              padding: "0.7rem 0.9rem",
              borderRadius: 12,
              border: "1px solid var(--cp-border)",
              color: "var(--cp-text)",
              textDecoration: "none",
              fontSize: "0.88rem",
            }}
          >
            All journeys →
          </Link>
          <button
            onClick={toTherapist}
            style={{
              all: "unset",
              cursor: "pointer",
              padding: "0.7rem 0.9rem",
              borderRadius: 12,
              border: "1px solid var(--cp-border)",
              color: "var(--cp-text)",
              fontSize: "0.88rem",
              textAlign: "left",
            }}
          >
            Switch to therapist workspace →
          </button>
          <button
            onClick={leavePortal}
            style={{
              all: "unset",
              cursor: "pointer",
              padding: "0.7rem 0.9rem",
              borderRadius: 12,
              border: "1px solid var(--cp-border)",
              color: "var(--cp-muted)",
              fontSize: "0.82rem",
              textAlign: "left",
            }}
          >
            Forget portal preference (show welcome again)
          </button>
        </div>
      </section>
    </ClientShell>
  );
}
