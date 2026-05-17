// WorkspaceHeader — the large editorial heading that opens each
// desk-themed page. Section-mark above (uppercase mono), serif
// display title (with optional italic tail), italic serif subtitle,
// and an action slot on the right for chips/buttons.

import type { ReactNode } from "react";

interface WorkspaceHeaderProps {
  sectionMark?: ReactNode;
  title: ReactNode;
  titleItalic?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  size?: "lg" | "md";
}

export function WorkspaceHeader({
  sectionMark,
  title,
  titleItalic,
  subtitle,
  actions,
  size = "lg",
}: WorkspaceHeaderProps) {
  const fontSize = size === "lg" ? 38 : 32;

  return (
    <header
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 20,
        gap: 24,
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {sectionMark && (
          <div className="section-mark" style={{ marginBottom: 4 }}>
            {sectionMark}
          </div>
        )}
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize,
            color: "var(--plum)",
            fontWeight: 700,
            letterSpacing: "-0.01em",
            lineHeight: 1.05,
            margin: 0,
          }}
        >
          {title}
          {titleItalic && (
            <span style={{ fontStyle: "italic", fontWeight: 400 }}>
              {" "}
              {titleItalic}
            </span>
          )}
        </h1>
        {subtitle && (
          <p
            className="desk-serif"
            style={{
              fontStyle: "italic",
              fontSize: 15.5,
              color: "var(--plum-mid)",
              marginTop: 6,
              maxWidth: 820,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 6,
          }}
        >
          {actions}
        </div>
      )}
    </header>
  );
}
