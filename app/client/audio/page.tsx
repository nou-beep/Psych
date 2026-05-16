"use client";
// Audio-first healing — voice reflection list. Recording API isn't
// implemented in this build; we capture metadata + an optional transcript
// so the architecture is ready for native recording later.

import { useState } from "react";
import { Mic, Trash2 } from "lucide-react";
import { ClientShell } from "@/components/client/ClientShell";
import { useClientPortal } from "@/contexts/ClientPortalContext";

export default function ClientAudioPage() {
  const { clientAudio, addClientAudio, deleteClientAudio, weather } =
    useClientPortal();
  const [name, setName] = useState("");
  const [transcript, setTranscript] = useState("");

  function save() {
    if (!name.trim() && !transcript.trim()) return;
    addClientAudio({
      name: name.trim() || "Voice note",
      transcript: transcript.trim() || undefined,
      weather,
    });
    setName("");
    setTranscript("");
  }

  return (
    <ClientShell
      title="Quieter than typing."
      microcopy="Capture a voice reflection. Recording will come in a later release — for now you can save a title and transcript."
    >
      <div className="cp-card cp-fade-in" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              background: "var(--cp-glow)",
              color: "var(--cp-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Mic size={18} />
          </div>
          <div className="cp-microcopy" style={{ fontSize: "0.85rem" }}>
            A soft title and (optionally) what you said.
          </div>
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="A short title (e.g. 'a quieter night')"
          style={fieldStyle()}
        />
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Optional transcript — what you'd say, or notes."
          style={{ ...fieldStyle(), minHeight: 100, marginTop: 8 }}
        />
        <button
          onClick={save}
          style={{
            all: "unset",
            cursor: "pointer",
            marginTop: 10,
            display: "inline-block",
            padding: "0.6rem 1rem",
            borderRadius: 12,
            background: "var(--cp-accent)",
            color: "white",
            fontSize: "0.88rem",
          }}
        >
          Save reflection
        </button>
      </div>

      {clientAudio.length === 0 ? (
        <p className="cp-microcopy" style={{ fontSize: "0.85rem" }}>
          No voice reflections yet. Even one counts.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
          {clientAudio.map((a) => (
            <li
              key={a.id}
              className="cp-card-soft cp-fade-in"
              style={{ display: "flex", gap: 10 }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "0.92rem",
                    color: "var(--cp-text)",
                    fontWeight: 500,
                  }}
                >
                  {a.name}
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--cp-muted)",
                    marginTop: 2,
                  }}
                >
                  {a.createdAt.split("T")[0]}
                  {a.weather ? ` · ${a.weather}` : ""}
                </div>
                {a.transcript && (
                  <p
                    style={{
                      marginTop: 8,
                      fontSize: "0.85rem",
                      color: "var(--cp-text)",
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {a.transcript}
                  </p>
                )}
              </div>
              <button
                onClick={() => deleteClientAudio(a.id)}
                aria-label="Delete reflection"
                style={{
                  all: "unset",
                  cursor: "pointer",
                  padding: 6,
                  color: "var(--cp-muted)",
                }}
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

function fieldStyle(): React.CSSProperties {
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
  };
}
