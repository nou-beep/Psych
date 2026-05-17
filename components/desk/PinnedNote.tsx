// PinnedNote — handwritten sticky note pinned to the workspace.
//
// Absolutely positioned (caller supplies top/left/right/bottom).
// Auto-hidden under 1100px to avoid clipping on tablets. Use
// sparingly; one or two per screen is the right dose.

import type { CSSProperties, ReactNode } from "react";

export type StickyTone = "y" | "p" | "b" | "g";

interface PinnedNoteProps {
  tone?: StickyTone;
  rot?: number;
  pin?: boolean;
  author?: string;
  style?: CSSProperties;
  className?: string;
  children: ReactNode;
}

export function PinnedNote({
  tone = "y",
  rot = -2,
  pin = false,
  author,
  style,
  className = "",
  children,
}: PinnedNoteProps) {
  return (
    <div
      className={`pinned-note tone-${tone} ${className}`.trim()}
      style={{ ...style, transform: `rotate(${rot}deg)` }}
    >
      {pin && <span className="pin" />}
      {children}
      {author && <span className="author">{author}</span>}
    </div>
  );
}
