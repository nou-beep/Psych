"use client";
// Safe People — trusted contacts + grounding reminders linked to them.
// No messaging, no emergency calling.

import { useState } from "react";
import { Plus, Trash2, Edit3 } from "lucide-react";
import { ClientShell } from "@/components/client/ClientShell";
import { useClientPortal, type SafePerson } from "@/contexts/ClientPortalContext";

export default function SafePeoplePage() {
  const { safePeople, addSafePerson, updateSafePerson, deleteSafePerson } =
    useClientPortal();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [reminder, setReminder] = useState("");

  function reset() {
    setShowForm(false);
    setEditingId(null);
    setName("");
    setRole("");
    setReminder("");
  }

  function save() {
    if (!name.trim()) return;
    if (editingId) {
      updateSafePerson(editingId, {
        name: name.trim(),
        role: role.trim(),
        reminder: reminder.trim(),
      });
    } else {
      addSafePerson({
        name: name.trim(),
        role: role.trim(),
        reminder: reminder.trim(),
      });
    }
    reset();
  }

  function startEdit(p: SafePerson) {
    setEditingId(p.id);
    setName(p.name);
    setRole(p.role ?? "");
    setReminder(p.reminder ?? "");
    setShowForm(true);
  }

  return (
    <ClientShell
      title="Safe people."
      microcopy="A short list of people who feel safe. Even one is enough."
    >
      <button
        onClick={() => (showForm ? reset() : setShowForm(true))}
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
        <Plus size={14} /> {editingId ? "Cancel" : "Add a safe person"}
      </button>

      {showForm && (
        <div
          className="cp-card cp-fade-in"
          style={{ marginBottom: "1rem", display: "grid", gap: 8 }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (first name is enough)"
            style={fieldStyle()}
          />
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Their role — friend, sibling, therapist…"
            style={fieldStyle()}
          />
          <textarea
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
            placeholder="A reminder they'd give you, or a memory of feeling safe with them."
            style={{ ...fieldStyle(), minHeight: 80 }}
          />
          <button
            onClick={save}
            style={{
              all: "unset",
              cursor: "pointer",
              padding: "0.7rem",
              borderRadius: 14,
              background: "var(--cp-accent)",
              color: "white",
              textAlign: "center",
              fontSize: "0.88rem",
              fontWeight: 500,
            }}
          >
            Save
          </button>
        </div>
      )}

      {safePeople.length === 0 ? (
        <p className="cp-microcopy" style={{ fontSize: "0.88rem" }}>
          No safe people yet. The list can be tiny.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
          {safePeople.map((p) => (
            <li
              key={p.id}
              className="cp-card-soft cp-fade-in"
              style={{ display: "flex", gap: 10 }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "0.95rem",
                    color: "var(--cp-text)",
                    fontWeight: 500,
                  }}
                >
                  {p.name}
                  {p.role ? (
                    <span
                      style={{
                        fontSize: "0.74rem",
                        color: "var(--cp-muted)",
                        marginLeft: 8,
                        fontWeight: 400,
                      }}
                    >
                      · {p.role}
                    </span>
                  ) : null}
                </div>
                {p.reminder && (
                  <p
                    style={{
                      marginTop: 6,
                      fontSize: "0.86rem",
                      color: "var(--cp-text)",
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {p.reminder}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button onClick={() => startEdit(p)} aria-label="Edit" style={iconBtn()}>
                  <Edit3 size={12} />
                </button>
                <button
                  onClick={() => deleteSafePerson(p.id)}
                  aria-label="Remove"
                  style={iconBtn()}
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
function iconBtn(): React.CSSProperties {
  return {
    all: "unset",
    cursor: "pointer",
    padding: 4,
    borderRadius: 8,
    color: "var(--cp-muted)",
  };
}
