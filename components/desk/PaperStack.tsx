// PaperStack — paper-textured wrapper for an entire screen. Use it
// at the root of a desk-themed page so the background gets the
// subtle paper-grain texture from desk-theme.css.
//
// The component:
//   - adds .desk-scope (which loads all the tokens + font stack)
//   - adds .paper-bg or .paper-warm-bg for the texture
//   - applies sensible page padding
//
// Inside it, use DeskPanel, PinnedNote, etc. freely.

import type { CSSProperties, ReactNode } from "react";

interface PaperStackProps {
  warm?: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function PaperStack({
  warm,
  children,
  className = "",
  style,
}: PaperStackProps) {
  return (
    <div
      className={`desk-scope ${warm ? "paper-warm-bg" : "paper-bg"} ${className}`.trim()}
      style={{
        position: "relative",
        padding: "22px 24px 60px",
        minHeight: "calc(100vh - 60px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
