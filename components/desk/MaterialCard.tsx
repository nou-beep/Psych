// MaterialCard — paper-card row used for case rows, pinned material
// rows, quote bank entries, etc. Composable: title (serif italic),
// subtitle (small ink-faded), tag chip on the side, and an optional
// dog-eared corner-fold for "active" / featured cards.

import type { CSSProperties, ReactNode } from "react";

interface MaterialCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  rightSlot?: ReactNode;
  footer?: ReactNode;
  tone?: "plum" | "berry" | "mauve" | "lav";
  highlight?: boolean;
  warm?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const TONE_COLOR = {
  plum: "var(--plum-mid)",
  berry: "var(--berry)",
  mauve: "var(--mauve)",
  lav: "var(--lavender-smoke)",
} as const;

export function MaterialCard({
  title,
  subtitle,
  meta,
  rightSlot,
  footer,
  tone = "plum",
  highlight,
  warm,
  href,
  onClick,
  className = "",
  style,
  children,
}: MaterialCardProps) {
  const Element = href ? "a" : onClick ? "button" : "div";
  const interactive = Boolean(href || onClick);

  return (
    <Element
      {...(href ? { href } : {})}
      {...(onClick ? { onClick, type: "button" as const } : {})}
      className={`material-card ${className}`.trim()}
      style={{
        display: "block",
        textAlign: "left",
        width: "100%",
        border: "1px solid var(--border-mid)",
        background: highlight
          ? "var(--paper-cream)"
          : warm
          ? "var(--paper-warm)"
          : "var(--paper)",
        padding: "10px 12px",
        position: "relative",
        boxShadow: highlight
          ? "2px 3px 10px rgba(28,24,18,0.10)"
          : undefined,
        cursor: interactive ? "pointer" : "default",
        color: "var(--ink-soft)",
        ...style,
      }}
    >
      {highlight && <div className="corner-fold" />}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="desk-serif"
            style={{
              fontSize: 14,
              fontStyle: "italic",
              color: TONE_COLOR[tone],
              lineHeight: 1.3,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 11.5,
                color: "var(--ink-faded)",
                marginTop: 2,
              }}
            >
              {subtitle}
            </div>
          )}
          {meta && (
            <div
              className="desk-mono"
              style={{
                fontSize: 9,
                color: "var(--rose-dust)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginTop: 3,
              }}
            >
              {meta}
            </div>
          )}
        </div>
        {rightSlot && <div style={{ flexShrink: 0 }}>{rightSlot}</div>}
      </div>
      {children}
      {footer && <div style={{ marginTop: 8 }}>{footer}</div>}
    </Element>
  );
}
