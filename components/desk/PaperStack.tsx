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
  // paper-stack-root carries the negative-margin bleed + responsive
  // padding so the paper background reaches the chrome edges instead
  // of floating in a frame of the surrounding theme colour.
  return (
    <div
      className={`desk-scope paper-stack-root ${
        warm ? "paper-warm-bg" : "paper-bg"
      } ${className}`.trim()}
      style={{ position: "relative", ...style }}
    >
      {children}
    </div>
  );
}
