"use client";
// Small mode switcher dropdown — lives in the Header so the therapist
// can flip between Session / Writing / Research / Review / Supervision
// modes without losing context.

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { useWorkspaceMode } from "@/contexts/WorkspaceModeContext";
import type { WorkspaceMode } from "@/lib/desk/modes";

export function WorkspaceModeMenu() {
  const { mode, setMode, modes } = useWorkspaceMode();
  const [open, setOpen] = useState(false);
  const meta = modes.find((m) => m.id === mode);

  return (
    <div style={{ position: "relative" }} className="no-print">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border alive-hover"
        style={{
          borderColor: "var(--psych-border)",
          color: "var(--psych-muted)",
          background: "var(--psych-card)",
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Sparkles size={11} style={{ color: "var(--psych-primary)" }} />
        Mode: <strong style={{ color: "var(--psych-text)" }}>{meta?.label}</strong>
        <ChevronDown size={11} />
      </button>
      {open && (
        <ul
          role="listbox"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 6px)",
            minWidth: 240,
            zIndex: 30,
            background: "var(--psych-card)",
            border: "1px solid var(--psych-border)",
            borderRadius: 12,
            padding: 6,
            boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
            listStyle: "none",
            margin: 0,
          }}
        >
          {modes.map((m) => {
            const active = m.id === mode;
            return (
              <li key={m.id}>
                <button
                  onClick={() => {
                    setMode(m.id as WorkspaceMode);
                    setOpen(false);
                  }}
                  className="w-full text-left text-xs px-2 py-1.5 rounded-md"
                  style={{
                    background: active
                      ? "var(--psych-primary-light)"
                      : "transparent",
                    color: "var(--psych-text)",
                  }}
                >
                  <div className="font-medium">{m.label}</div>
                  <div
                    className="text-[10px]"
                    style={{ color: "var(--psych-muted)" }}
                  >
                    {m.description}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
