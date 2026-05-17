// DeskPanel — workspace primitive used inside .desk-scope.
//
// Looks like a stack of paper: aged-cream header strip with a mono
// uppercase title, a small meta number, three faux window controls,
// and a paper-textured body. Tones: default / cream / aged / plum
// (the plum tone is used for the thesis activity panel — dark and
// punctuating).

import type { CSSProperties, ReactNode } from "react";

export type DeskPanelTone = "default" | "cream" | "aged" | "plum";

interface DeskPanelProps {
  title: string;
  meta?: string;
  tone?: DeskPanelTone;
  folder?: boolean;
  controls?: boolean;
  headerExtra?: ReactNode;
  className?: string;
  style?: CSSProperties;
  bodyClassName?: string;
  bodyStyle?: CSSProperties;
  flush?: boolean;
  tight?: boolean;
  children: ReactNode;
}

export function DeskPanel({
  title,
  meta,
  tone = "default",
  folder,
  controls = true,
  headerExtra,
  className = "",
  style,
  bodyClassName = "",
  bodyStyle,
  flush,
  tight,
  children,
}: DeskPanelProps) {
  const toneClass = tone === "default" ? "" : tone;
  const bodyMod = flush ? "flush" : tight ? "tight" : "";
  return (
    <div
      className={`desk-panel ${toneClass} ${folder ? "folder" : ""} ${className}`.trim()}
      style={style}
    >
      <div className="desk-panel-h">
        <span className="desk-panel-title">{title}</span>
        {headerExtra}
        {meta && <span className="meta">{meta}</span>}
        {controls && (
          <span className="controls" aria-hidden="true">
            <i title="minimize" />
            <i title="expand" />
            <i title="close" />
          </span>
        )}
      </div>
      <div
        className={`desk-panel-body ${bodyMod} ${bodyClassName}`.trim()}
        style={bodyStyle}
      >
        {children}
      </div>
    </div>
  );
}
