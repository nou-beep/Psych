"use client";
// Client reflections — post-session, things-forgot-to-say, emotional
// reactions, questions for next session. Saved locally.

import { useEffect, useMemo, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { ClientShell } from "@/components/client/ClientShell";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import {
  REFLECTIONS_STORAGE_KEY,
  REFLECTION_KIND_LABELS,
  REFLECTION_KIND_PROMPTS,
  emptyReflection,
  reflectionsByKind,
  timeline,
  update,
  type ClientReflection,
  type ReflectionKind,
} from "@/lib/client/reflections";

const KINDS: ReflectionKind[] = [
  "post-session",
  "forgot-to-say",
  "emotional-reaction",
  "question-for-next",
];

export default function ClientReflectionsPage() {
  const [reflections, setReflections] = useState<ClientReflection[]>([]);
  const [activeKind, setActiveKind] = useState<ReflectionKind>("post-session");
  const [draft, setDraft] = useState<ClientReflection | null>(null);

  useEffect(() => {
    setReflections(loadFromStorage<ClientReflection[]>(REFLECTIONS_STORAGE_KEY, []));
  }, []);

  function persist(next: ClientReflection[]) {
    setReflections(next);
    saveToStorage(REFLECTIONS_STORAGE_KEY, next);
  }

  function startDraft() {
    setDraft(emptyReflection(activeKind));
  }

  function saveDraft() {
    if (!draft) return;
    if (!draft.body.trim()) {
      setDraft(null);
      return;
    }
    persist([draft, ...reflections]);
    setDraft(null);
  }

  function deleteOne(id: string) {
    persist(reflections.filter((r) => r.id !== id));
  }

  const list = useMemo(
    () => (activeKind ? reflectionsByKind(reflections, activeKind) : timeline(reflections)),
    [reflections, activeKind]
  );

  return (
    <ClientShell
      title="Reflections."
      microcopy="Between-session notes that travel with you."
    >
      {/* Kind tabs */}
      <div
        className="cp-card-soft cp-fade-in"
        style={{ marginBottom: "1rem", display: "flex", gap: 6, flexWrap: "wrap" }}
      >
        {KINDS.map((k) => (
          <button
            key={k}
            onClick={() => setActiveKind(k)}
            aria-pressed={activeKind === k}
            style={{
              all: "unset",
              cursor: "pointer",
              padding: "0.4rem 0.8rem",
              borderRadius: 999,
              fontSize: "0.8rem",
              border: `1px solid ${
                activeKind === k ? "var(--cp-accent)" : "var(--cp-border)"
              }`,
              background: activeKind === k ? "var(--cp-glow)" : "transparent",
              color: "var(--cp-text)",
            }}
          >
            {REFLECTION_KIND_LABELS[k]}
          </button>
        ))}
      </div>

      {/* Draft */}
      {draft ? (
        <div className="cp-card cp-fade-in" style={{ marginBottom: "1rem" }}>
          <div
            style={{
              fontSize: "0.72rem",
              color: "var(--cp-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 4,
            }}
          >
            {REFLECTION_KIND_LABELS[draft.kind]}
          </div>
          <p className="cp-microcopy" style={{ fontSize: "0.85rem", marginBottom: 8 }}>
            {REFLECTION_KIND_PROMPTS[draft.kind]}
          </p>
          <textarea
            value={draft.body}
            onChange={(e) => setDraft(update(draft, { body: e.target.value }))}
            placeholder="Whatever lands. No structure required."
            style={{
              width: "100%",
              minHeight: 120,
              padding: 12,
              borderRadius: 14,
              border: "1px solid var(--cp-border)",
              background: "var(--cp-card-soft)",
              color: "var(--cp-text)",
              fontSize: "0.92rem",
              fontFamily: "inherit",
              resize: "vertical",
            }}
          />
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 8,
              fontSize: "0.82rem",
              color: "var(--cp-text)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={draft.visibleToTherapist}
              onChange={(e) =>
                setDraft(update(draft, { visibleToTherapist: e.target.checked }))
              }
            />
            Share with my therapist (placeholder — real sync coming later)
          </label>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={saveDraft} style={primaryButton()}>
              Save reflection
            </button>
            <button
              onClick={() => setDraft(null)}
              style={ghostButton()}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={startDraft}
          className="cp-card-soft cp-fade-in"
          style={{
            all: "unset",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "0.55rem 0.9rem",
            borderRadius: 999,
            background: "var(--cp-accent)",
            color: "white",
            fontSize: "0.86rem",
            marginBottom: "1rem",
          }}
        >
          <Plus size={13} /> New {REFLECTION_KIND_LABELS[activeKind].toLowerCase()}
        </button>
      )}

      {/* Timeline */}
      {list.length === 0 ? (
        <p className="cp-microcopy" style={{ fontSize: "0.85rem" }}>
          Nothing here yet. The first entry is enough.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
          {list.map((r) => (
            <li
              key={r.id}
              className="cp-card-soft cp-fade-in"
              style={{ display: "flex", gap: 10 }}
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
                  {REFLECTION_KIND_LABELS[r.kind]} · {r.date}
                  {r.visibleToTherapist && (
                    <span style={{ marginLeft: 6, color: "var(--cp-accent)" }}>
                      shared
                    </span>
                  )}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.92rem",
                    color: "var(--cp-text)",
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {r.body}
                </p>
              </div>
              <button
                onClick={() => deleteOne(r.id)}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  color: "var(--cp-muted)",
                  padding: 4,
                }}
                aria-label="Delete"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </ClientShell>
  );
}

function primaryButton(): React.CSSProperties {
  return {
    all: "unset",
    cursor: "pointer",
    padding: "0.6rem 1rem",
    borderRadius: 12,
    background: "var(--cp-accent)",
    color: "white",
    fontSize: "0.88rem",
    fontWeight: 500,
  };
}
function ghostButton(): React.CSSProperties {
  return {
    all: "unset",
    cursor: "pointer",
    padding: "0.6rem 1rem",
    borderRadius: 12,
    border: "1px solid var(--cp-border)",
    color: "var(--cp-muted)",
    fontSize: "0.88rem",
  };
}
