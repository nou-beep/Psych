"use client";
// Comfort objects — quotes, reminders, color anchors. Drag-free in this
// version (just create + reorder via arrow buttons + delete).

import { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { ClientShell } from "@/components/client/ClientShell";
import { useClientPortal, type ComfortObject } from "@/contexts/ClientPortalContext";

const KIND_OPTIONS: Array<{ id: ComfortObject["kind"]; label: string }> = [
  { id: "reminder", label: "Reminder" },
  { id: "quote", label: "Quote" },
  { id: "memory", label: "Safe memory" },
  { id: "color", label: "Calming color" },
  { id: "image", label: "Image link" },
];

export default function ComfortPage() {
  const {
    comfortObjects,
    addComfortObject,
    deleteComfortObject,
    reorderComfortObjects,
  } = useClientPortal();
  const [showForm, setShowForm] = useState(false);
  const [kind, setKind] = useState<ComfortObject["kind"]>("reminder");
  const [body, setBody] = useState("");
  const [hint, setHint] = useState("");

  function add() {
    if (!body.trim()) return;
    addComfortObject({ kind, body: body.trim(), hint: hint.trim() || undefined });
    setBody("");
    setHint("");
    setShowForm(false);
  }

  function move(id: string, dir: -1 | 1) {
    const idx = comfortObjects.findIndex((o) => o.id === id);
    if (idx === -1) return;
    const target = idx + dir;
    if (target < 0 || target >= comfortObjects.length) return;
    const next = [...comfortObjects];
    [next[idx], next[target]] = [next[target], next[idx]];
    reorderComfortObjects(next.map((o) => o.id));
  }

  return (
    <ClientShell
      title="Your comfort shelf."
      microcopy="Anchors. Reminders. Quiet things."
    >
      <button
        onClick={() => setShowForm((s) => !s)}
        className="cp-card-soft cp-fade-in"
        style={{
          all: "unset",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "0.55rem 0.85rem",
          borderRadius: 999,
          background: "var(--cp-accent)",
          color: "white",
          fontSize: "0.85rem",
          marginBottom: "1rem",
        }}
      >
        <Plus size={14} /> Add something soft
      </button>

      {showForm && (
        <div
          className="cp-card cp-fade-in"
          style={{ marginBottom: "1rem", display: "grid", gap: 8 }}
        >
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {KIND_OPTIONS.map((k) => (
              <button
                key={k.id}
                onClick={() => setKind(k.id)}
                aria-pressed={kind === k.id}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  padding: "0.35rem 0.7rem",
                  borderRadius: 999,
                  fontSize: "0.78rem",
                  border: `1px solid ${
                    kind === k.id ? "var(--cp-accent)" : "var(--cp-border)"
                  }`,
                  background: kind === k.id ? "var(--cp-glow)" : "transparent",
                  color: "var(--cp-text)",
                }}
              >
                {k.label}
              </button>
            ))}
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="The reminder, quote, or anchor."
            style={inputStyle({ minHeight: 80 })}
          />
          <input
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder="A short hint (optional)"
            style={inputStyle()}
          />
          <button
            onClick={add}
            style={{
              all: "unset",
              cursor: "pointer",
              textAlign: "center",
              padding: "0.7rem",
              borderRadius: 14,
              background: "var(--cp-accent)",
              color: "white",
              fontSize: "0.88rem",
              fontWeight: 500,
            }}
          >
            Save
          </button>
        </div>
      )}

      {comfortObjects.length === 0 ? (
        <p className="cp-microcopy" style={{ fontSize: "0.88rem" }}>
          Your shelf is empty. Add something kind — a quote, a memory, a
          reminder. Even one is enough.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
          {comfortObjects.map((o, i) => (
            <li
              key={o.id}
              className="cp-card-soft cp-fade-in"
              style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--cp-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 2,
                  }}
                >
                  {o.kind}
                </div>
                <div
                  style={{
                    color: "var(--cp-text)",
                    fontSize: "0.9rem",
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {o.body}
                </div>
                {o.hint && (
                  <div
                    style={{
                      marginTop: 2,
                      color: "var(--cp-muted)",
                      fontSize: "0.75rem",
                    }}
                  >
                    {o.hint}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button
                  onClick={() => move(o.id, -1)}
                  disabled={i === 0}
                  aria-label="Move up"
                  style={iconBtnStyle()}
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  onClick={() => move(o.id, 1)}
                  disabled={i === comfortObjects.length - 1}
                  aria-label="Move down"
                  style={iconBtnStyle()}
                >
                  <ArrowDown size={12} />
                </button>
                <button
                  onClick={() => deleteComfortObject(o.id)}
                  aria-label="Remove"
                  style={iconBtnStyle()}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </ClientShell>
  );
}

function inputStyle(extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    width: "100%",
    padding: 10,
    borderRadius: 12,
    border: "1px solid var(--cp-border)",
    background: "var(--cp-card-soft)",
    color: "var(--cp-text)",
    fontSize: "0.88rem",
    fontFamily: "inherit",
    resize: "vertical",
    ...extra,
  };
}

function iconBtnStyle(): React.CSSProperties {
  return {
    all: "unset",
    cursor: "pointer",
    padding: 4,
    borderRadius: 8,
    color: "var(--cp-muted)",
  };
}
