// AnnotationLabel — small handwritten marginalia.
//
// Three variants:
//   - "inline" (default): a quick Caveat-styled note that sits in a flow.
//   - "margin": left rule + handwritten note for the side of a paragraph.
//   - "section": uppercase mono section mark.
//
// All variants are colour-tunable through the `tone` prop, and the
// children are free-form so callers can embed <em>, <br/>, etc.

import type { CSSProperties, ReactNode } from "react";

export type AnnotationTone = "plum" | "mauve" | "berry" | "muted";

interface AnnotationLabelProps {
  variant?: "inline" | "margin" | "section";
  tone?: AnnotationTone;
  prefix?: ReactNode;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

const TONE_COLOR: Record<AnnotationTone, string> = {
  plum: "var(--plum-mid)",
  mauve: "var(--mauve)",
  berry: "var(--berry)",
  muted: "var(--ink-faded)",
};

export function AnnotationLabel({
  variant = "inline",
  tone = "plum",
  prefix,
  className = "",
  style,
  children,
}: AnnotationLabelProps) {
  if (variant === "section") {
    return (
      <div className={`section-mark ${className}`.trim()} style={style}>
        {children}
      </div>
    );
  }

  if (variant === "margin") {
    return (
      <div
        className={`margin-note ${className}`.trim()}
        style={{ color: TONE_COLOR[tone], ...style }}
      >
        {prefix}
        {children}
      </div>
    );
  }

  return (
    <span
      className={`anno ${className}`.trim()}
      style={{ color: TONE_COLOR[tone], ...style }}
    >
      {prefix}
      {children}
    </span>
  );
}
