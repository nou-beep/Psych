"use client";
// MemoryRail — the persistent working-memory panel. Renders the
// items pinned during the active session, grouped by kind, with
// quick actions: archive, recolor, remove, copy. Designed to dock
// on the right side of a SessionWorkspace or float as a standalone
// drawer.

import { useMemo, useState } from "react";
import {
  Pin,
  Archive,
  Trash2,
  Palette,
  Copy,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useSessionMemory } from "@/contexts/SessionMemoryContext";
import { useT } from "@/contexts/LocaleContext";
import {
  MEMORY_COLORS,
  MEMORY_KIND_GLYPH,
  groupMemoryByKind,
  memoryForSession,
  type MemoryColor,
  type MemoryKind,
} from "@/lib/clinical/session-memory";

interface Props {
  /** When set, the rail only shows items for that session. */
  sessionId?: string;
  /** Compact vs comfortable. Defaults to comfortable. */
  density?: "compact" | "comfortable";
  /** Whether the rail starts collapsed. */
  defaultCollapsed?: boolean;
}

const COLOR_BG: Record<MemoryColor, string> = {
  neutral: "rgba(122,96,144,0.08)",
  amber: "rgba(245,158,11,0.12)",
  violet: "rgba(140,100,200,0.14)",
  rose: "rgba(199,125,170,0.14)",
  emerald: "rgba(16,185,129,0.12)",
  blue: "rgba(59,130,246,0.12)",
};

const COLOR_INK: Record<MemoryColor, string> = {
  neutral: "#5C4870",
  amber: "#92400E",
  violet: "#5B36A8",
  rose: "#9F1239",
  emerald: "#0E7B5C",
  blue: "#1D4ED8",
};

const COLOR_DOT: Record<MemoryColor, string> = {
  neutral: "#9882C0",
  amber: "#F59E0B",
  violet: "#8E72CC",
  rose: "#D67B9E",
  emerald: "#10B981",
  blue: "#3B82F6",
};

export function MemoryRail({
  sessionId,
  density = "comfortable",
  defaultCollapsed = false,
}: Props) {
  const t = useT();
  const memory = useSessionMemory();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [paletteFor, setPaletteFor] = useState<string | null>(null);

  const scoped = useMemo(
    () =>
      sessionId
        ? memoryForSession(memory.items, sessionId)
        : memory.items,
    [memory.items, sessionId]
  );

  const groups = useMemo(() => groupMemoryByKind(scoped), [scoped]);

  const totalActive = groups.reduce((s, g) => s + g.items.length, 0);
  const itemPad = density === "compact" ? "0.45rem 0.6rem" : "0.6rem 0.75rem";

  return (
    <aside
      data-memory-rail
      className="no-print"
      style={{
        width: collapsed ? 44 : 280,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--psych-card, rgba(255,255,255,0.6))",
        border: "1px solid var(--psych-border, rgba(0,0,0,0.08))",
        borderRadius: 16,
        height: "100%",
        overflow: "hidden",
        transition: "width 0.18s ease",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: collapsed ? "0.6rem 0.4rem" : "0.7rem 0.85rem",
          borderBottom: "1px solid var(--psych-border, rgba(0,0,0,0.06))",
        }}
      >
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? t("common.open") : t("common.close")}
          style={{
            all: "unset",
            cursor: "pointer",
            width: 28,
            height: 28,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#5B36A8",
            background: "rgba(140,100,200,0.1)",
          }}
        >
          <Pin size={14} />
        </button>
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--psych-text, #1F1733)",
              }}
            >
              {t("memory.rail.title")}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "var(--psych-muted, #7A6090)",
              }}
            >
              {totalActive === 0
                ? t("memory.rail.empty")
                : t("memory.rail.count", { n: totalActive })}
            </div>
          </div>
        )}
      </header>

      {!collapsed && (
        <div
          className="memory-rail-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0.5rem",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {totalActive === 0 ? (
            <EmptyState />
          ) : (
            groups.map((g) => (
              <MemoryGroup
                key={g.kind}
                kind={g.kind}
                count={g.items.length}
              >
                {g.items.map((item) => (
                  <article
                    key={item.id}
                    data-memory-item
                    data-memory-kind={item.kind}
                    style={{
                      padding: itemPad,
                      borderRadius: 12,
                      background: COLOR_BG[item.color],
                      border: `1px solid ${COLOR_DOT[item.color]}33`,
                      color: COLOR_INK[item.color],
                      fontSize: 12,
                      lineHeight: 1.5,
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 4,
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          fontSize: 11,
                          color: COLOR_DOT[item.color],
                          fontWeight: 600,
                        }}
                      >
                        {MEMORY_KIND_GLYPH[item.kind]}
                      </span>
                      {item.source?.label && (
                        <span
                          style={{
                            fontSize: 10,
                            color: "var(--psych-muted, #7A6090)",
                            flex: 1,
                            minWidth: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={item.source.label}
                        >
                          {item.source.label}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        color: "var(--psych-text, #1F1733)",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {item.body}
                    </p>
                    <footer
                      style={{
                        marginTop: 6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 4,
                      }}
                    >
                      <IconBtn
                        title={t("memory.actions.copy")}
                        onClick={() => {
                          if (typeof navigator !== "undefined") {
                            navigator.clipboard?.writeText(item.body);
                          }
                        }}
                      >
                        <Copy size={11} />
                      </IconBtn>
                      <IconBtn
                        title={t("memory.actions.recolor")}
                        onClick={() =>
                          setPaletteFor((cur) =>
                            cur === item.id ? null : item.id
                          )
                        }
                      >
                        <Palette size={11} />
                      </IconBtn>
                      <IconBtn
                        title={t("memory.actions.archive")}
                        onClick={() => memory.archive(item.id)}
                      >
                        <Archive size={11} />
                      </IconBtn>
                      <IconBtn
                        title={t("memory.actions.remove")}
                        onClick={() => memory.remove(item.id)}
                      >
                        <Trash2 size={11} />
                      </IconBtn>
                    </footer>
                    {paletteFor === item.id && (
                      <div
                        style={{
                          marginTop: 6,
                          display: "flex",
                          gap: 4,
                          flexWrap: "wrap",
                        }}
                      >
                        {MEMORY_COLORS.map((c) => (
                          <button
                            key={c}
                            aria-label={c}
                            data-memory-color={c}
                            onClick={() => {
                              memory.setColor(item.id, c);
                              setPaletteFor(null);
                            }}
                            style={{
                              all: "unset",
                              cursor: "pointer",
                              width: 14,
                              height: 14,
                              borderRadius: 999,
                              background: COLOR_DOT[c],
                              border:
                                item.color === c
                                  ? "2px solid var(--psych-text, #1F1733)"
                                  : "2px solid transparent",
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </MemoryGroup>
            ))
          )}
        </div>
      )}
    </aside>
  );
}

function MemoryGroup({
  kind,
  count,
  children,
}: {
  kind: MemoryKind;
  count: number;
  children: React.ReactNode;
}) {
  const t = useT();
  const [open, setOpen] = useState(true);
  return (
    <section data-memory-group={kind}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          all: "unset",
          cursor: "pointer",
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "0.25rem 0.5rem",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--psych-muted, #7A6090)",
        }}
      >
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        <span style={{ flex: 1 }}>{t(`memory.kinds.${kind}`)}</span>
        <span
          style={{
            fontSize: 10,
            opacity: 0.7,
            fontFamily: "monospace",
          }}
        >
          {count}
        </span>
      </button>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {children}
        </div>
      )}
    </section>
  );
}

function IconBtn({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={title}
      title={title}
      style={{
        all: "unset",
        cursor: "pointer",
        padding: 4,
        borderRadius: 6,
        color: "var(--psych-muted, #7A6090)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
}

function EmptyState() {
  const t = useT();
  return (
    <div
      style={{
        padding: "1rem",
        textAlign: "center",
        color: "var(--psych-muted, #7A6090)",
        fontSize: 11,
        border: "1px dashed var(--psych-border, rgba(0,0,0,0.1))",
        borderRadius: 12,
      }}
    >
      <p style={{ margin: 0, marginBottom: 6 }}>{t("memory.empty.title")}</p>
      <p style={{ margin: 0, opacity: 0.7 }}>{t("memory.empty.hint")}</p>
    </div>
  );
}
