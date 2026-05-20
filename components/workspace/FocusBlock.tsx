"use client";
// FocusBlock — a collapsible disclosure block. Replaces giant
// always-visible form sections with progressive reveal: a labelled
// header, optional one-line summary, an action area on the right,
// and the body unfolds on click. Each block persists its open state
// to localStorage if `id` is provided.

import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, type LucideIcon } from "lucide-react";
import { loadFromStorage, saveToStorage } from "@/lib/store";

interface Props {
  /** Block heading. */
  title: string;
  /** Optional one-line summary shown collapsed (e.g. "3 items pinned"). */
  summary?: string;
  /** Lucide icon to render at the left edge. */
  icon?: LucideIcon;
  /** Accent colour (border + icon tint). */
  tint?: string;
  /** Stable id — when present, open state persists across reloads. */
  id?: string;
  /** Whether the block starts expanded. Default true. */
  defaultOpen?: boolean;
  /** Right-aligned slot — keep small (button, badge, count). */
  action?: ReactNode;
  /** Visual emphasis. */
  emphasis?: "low" | "normal" | "high";
  children: ReactNode;
}

const STORAGE_KEY = "eyla-focus-block-state-v1";

interface OpenState {
  [blockId: string]: boolean;
}

function readOpen(id: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  const state = loadFromStorage<OpenState>(STORAGE_KEY, {});
  return id in state ? state[id] : fallback;
}

function writeOpen(id: string, open: boolean): void {
  const state = loadFromStorage<OpenState>(STORAGE_KEY, {});
  state[id] = open;
  saveToStorage(STORAGE_KEY, state);
}

export function FocusBlock({
  title,
  summary,
  icon: Icon,
  tint = "#8E72CC",
  id,
  defaultOpen = true,
  action,
  emphasis = "normal",
  children,
}: Props) {
  const [open, setOpen] = useState<boolean>(defaultOpen);

  useEffect(() => {
    if (id) setOpen(readOpen(id, defaultOpen));
  }, [id, defaultOpen]);

  function toggle() {
    setOpen((cur) => {
      const next = !cur;
      if (id) writeOpen(id, next);
      return next;
    });
  }

  const emphasisStyles =
    emphasis === "high"
      ? {
          background: "var(--psych-card, rgba(255,255,255,0.85))",
          border: `1px solid ${tint}44`,
          boxShadow: `0 1px 0 ${tint}22`,
        }
      : emphasis === "low"
        ? {
            background: "transparent",
            border: "1px dashed var(--psych-border, rgba(0,0,0,0.08))",
            boxShadow: "none",
          }
        : {
            background: "var(--psych-card, rgba(255,255,255,0.65))",
            border: "1px solid var(--psych-border, rgba(0,0,0,0.06))",
            boxShadow: "none",
          };

  return (
    <section
      data-focus-block={id ?? title}
      data-open={open}
      style={{
        borderRadius: 14,
        overflow: "hidden",
        ...emphasisStyles,
        transition: "border-color 0.2s ease",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0.8rem 1rem",
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={toggle}
        role="button"
        aria-expanded={open}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
      >
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: tint,
          }}
        >
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        {Icon && (
          <span
            aria-hidden
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: `${tint}1F`,
              color: tint,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={14} />
          </span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--psych-text, #1F1733)",
              lineHeight: 1.3,
            }}
          >
            {title}
          </p>
          {!open && summary && (
            <p
              style={{
                margin: 0,
                marginTop: 2,
                fontSize: 11,
                color: "var(--psych-muted, #7A6090)",
                lineHeight: 1.35,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {summary}
            </p>
          )}
        </div>
        {action && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ flexShrink: 0 }}
          >
            {action}
          </div>
        )}
      </header>
      {open && (
        <div
          style={{
            padding: "0 1rem 1rem 1rem",
            borderTop: "1px solid var(--psych-border, rgba(0,0,0,0.05))",
            paddingTop: "0.8rem",
          }}
        >
          {children}
        </div>
      )}
    </section>
  );
}
