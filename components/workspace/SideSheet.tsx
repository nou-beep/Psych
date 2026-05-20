"use client";
// SideSheet — a non-routing drawer. Use it to open worksheets,
// grids, generated reports or transcripts without leaving the
// current page. Renders into document.body via a portal, supports
// left/right anchoring, click-outside-to-close, and Esc.

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  /** Side the sheet docks to. Defaults to right. */
  anchor?: "left" | "right";
  /** Width in pixels (or CSS string). Default 480. */
  width?: number | string;
  /** Footer slot (Save / Cancel / Generate buttons). */
  footer?: ReactNode;
  /** Right-aligned header slot for contextual actions. */
  headerActions?: ReactNode;
  children: ReactNode;
}

export function SideSheet({
  open,
  onClose,
  title,
  description,
  anchor = "right",
  width = 480,
  footer,
  headerActions,
  children,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      data-side-sheet
      data-open={open}
      aria-hidden={!open}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: open ? "rgba(31,23,51,0.32)" : "transparent",
          backdropFilter: open ? "blur(2px)" : "none",
          WebkitBackdropFilter: open ? "blur(2px)" : "none",
          transition: "background 0.2s ease",
        }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          [anchor]: 0,
          width:
            typeof width === "number" ? `min(${width}px, 92vw)` : width,
          background: "var(--psych-bg, #fff)",
          boxShadow:
            anchor === "right"
              ? "-12px 0 40px rgba(31,23,51,0.18)"
              : "12px 0 40px rgba(31,23,51,0.18)",
          transform: open
            ? "translateX(0)"
            : anchor === "right"
              ? "translateX(100%)"
              : "translateX(-100%)",
          transition: "transform 0.22s ease",
          display: "flex",
          flexDirection: "column",
          color: "var(--psych-text, #1F1733)",
        }}
      >
        {(title || headerActions) && (
          <header
            style={{
              padding: "1rem 1.25rem",
              borderBottom:
                "1px solid var(--psych-border, rgba(0,0,0,0.08))",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              {title && (
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  style={{
                    margin: 0,
                    marginTop: 4,
                    fontSize: 12,
                    color: "var(--psych-muted, #7A6090)",
                  }}
                >
                  {description}
                </p>
              )}
            </div>
            {headerActions}
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                all: "unset",
                cursor: "pointer",
                padding: 6,
                borderRadius: 8,
                color: "var(--psych-muted, #7A6090)",
              }}
            >
              <X size={16} />
            </button>
          </header>
        )}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1rem 1.25rem",
          }}
        >
          {children}
        </div>
        {footer && (
          <footer
            style={{
              padding: "0.85rem 1.25rem",
              borderTop:
                "1px solid var(--psych-border, rgba(0,0,0,0.08))",
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              background: "var(--psych-card, rgba(255,255,255,0.6))",
            }}
          >
            {footer}
          </footer>
        )}
      </aside>
    </div>,
    document.body
  );
}
