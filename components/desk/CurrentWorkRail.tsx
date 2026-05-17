// CurrentWorkRail — a small "pinned / on the desk" list. Each item
// is a label + sub-label + optional emoji-style glyph, rendered as a
// warm paper row that the user can click to navigate. Tuned to feel
// like a short stack of items currently on the physical desk.

import Link from "next/link";
import type { ReactNode } from "react";

export interface CurrentWorkItem {
  id: string;
  glyph?: ReactNode;
  label: ReactNode;
  sub?: ReactNode;
  href?: string;
  onClick?: () => void;
  tone?: "plum" | "berry" | "mauve" | "lav";
}

const TONE_COLOR = {
  plum: "var(--plum-mid)",
  berry: "var(--berry)",
  mauve: "var(--mauve)",
  lav: "var(--lavender-smoke)",
} as const;

export function CurrentWorkRail({
  items,
  emptyLabel = "Nothing on the desk just now.",
}: {
  items: CurrentWorkItem[];
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return (
      <div
        className="desk-serif"
        style={{
          fontStyle: "italic",
          color: "var(--ink-faded)",
          fontSize: 13,
          padding: "8px 4px",
        }}
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {items.map((m) => {
        const inner = (
          <>
            {m.glyph && (
              <span
                aria-hidden="true"
                style={{
                  fontSize: 14,
                  lineHeight: 1,
                  marginTop: 1,
                  filter: "grayscale(0.6)",
                  flexShrink: 0,
                }}
              >
                {m.glyph}
              </span>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="desk-serif"
                style={{
                  fontStyle: "italic",
                  fontSize: 13.5,
                  color: TONE_COLOR[m.tone ?? "plum"],
                  lineHeight: 1.3,
                }}
              >
                {m.label}
              </div>
              {m.sub && (
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--ink-faded)",
                    marginTop: 1,
                  }}
                >
                  {m.sub}
                </div>
              )}
            </div>
          </>
        );

        const sharedStyle = {
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          padding: "8px 9px",
          background: "var(--paper-warm)",
          border: "1px solid var(--border-light)",
          color: "inherit",
          textDecoration: "none",
          cursor: m.href || m.onClick ? "pointer" : "default",
        } as const;

        if (m.href) {
          return (
            <Link key={m.id} href={m.href} style={sharedStyle}>
              {inner}
            </Link>
          );
        }
        if (m.onClick) {
          return (
            <button
              key={m.id}
              onClick={m.onClick}
              type="button"
              style={{
                ...sharedStyle,
                textAlign: "left",
                font: "inherit",
              }}
            >
              {inner}
            </button>
          );
        }
        return (
          <div key={m.id} style={sharedStyle}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
