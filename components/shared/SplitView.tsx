"use client";
// Split View primitive — renders 1, 2, or 3 panes with a draggable
// divider. Each pane gets independent scroll. Persists per-scope.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeftRight,
  ArrowUpDown,
  Columns,
  Rows,
  X,
} from "lucide-react";
import {
  addPane,
  defaultConfig,
  isSplit,
  loadConfig,
  removePane,
  resizePane,
  saveConfig,
  setOrientation,
  swapPanes,
  type SplitConfig,
  type SplitOrientation,
  COMMON_PANE_TARGETS,
  findPaneTarget,
} from "@/lib/workspace/split-view";

export interface SplitViewProps {
  // Scope key — used to remember the split config (e.g. route family).
  scope: string;
  // Map of pane target id → renderer. Always include "primary".
  renderers: Record<string, () => React.ReactNode>;
  // Targets available in the "open in split" menu.
  availableTargets?: string[];
  // Default config if nothing is persisted.
  initial?: SplitConfig;
}

export function SplitView({
  scope,
  renderers,
  availableTargets,
  initial,
}: SplitViewProps) {
  const [config, setConfig] = useState<SplitConfig>(() => initial ?? defaultConfig());
  const [hydrated, setHydrated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConfig(loadConfig(scope) ?? defaultConfig());
    setHydrated(true);
  }, [scope]);

  const apply = useCallback(
    (next: SplitConfig) => {
      setConfig(next);
      saveConfig(scope, next);
    },
    [scope]
  );

  const menuTargets = useMemo(() => {
    const ids =
      availableTargets ??
      COMMON_PANE_TARGETS.map((p) => p.id).filter((id) => id !== "primary");
    return ids
      .map((id) => findPaneTarget(id) ?? { id, label: id })
      .filter((t) => renderers[t.id] || t.id === "primary");
  }, [availableTargets, renderers]);

  function openSplit(targetId: string, orientation: SplitOrientation) {
    apply(addPane(setOrientation(config, orientation), targetId, orientation));
  }

  function closePane(index: number) {
    apply(removePane(config, index));
  }

  function toggleOrientation() {
    apply(
      setOrientation(
        config,
        config.orientation === "horizontal" ? "vertical" : "horizontal"
      )
    );
  }

  function startDrag(index: number, e: React.PointerEvent) {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const horizontal = config.orientation === "horizontal";

    function onMove(ev: PointerEvent) {
      const total = horizontal ? rect.width : rect.height;
      const pos = horizontal ? ev.clientX - rect.left : ev.clientY - rect.top;
      let cumulative = 0;
      for (let i = 0; i < index; i++) {
        cumulative += (config.panes[i].size / 100) * total;
      }
      const newSize = ((pos - cumulative) / total) * 100;
      apply(resizePane(config, index, newSize));
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  if (!hydrated) {
    return (
      <div className="text-xs" style={{ color: "var(--psych-muted)" }}>
        Loading workspace…
      </div>
    );
  }

  const horizontal = config.orientation === "horizontal";
  const splittable = isSplit(config);

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="no-print flex items-center gap-2 mb-2">
        <div className="relative">
          <details className="relative">
            <summary
              className="list-none cursor-pointer flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border"
              style={{
                borderColor: "var(--psych-border)",
                color: "var(--psych-muted)",
                backgroundColor: "var(--psych-card)",
              }}
            >
              {horizontal ? <Columns size={12} /> : <Rows size={12} />}
              Open in split view
            </summary>
            <div
              className="absolute top-full mt-1 left-0 w-56 rounded-xl border shadow-lg z-10 overflow-hidden"
              style={{
                backgroundColor: "var(--psych-card)",
                borderColor: "var(--psych-border)",
              }}
            >
              {menuTargets
                .filter((t) => t.id !== "primary")
                .map((t) => (
                  <div
                    key={t.id}
                    className="grid grid-cols-2 text-xs"
                  >
                    <button
                      onClick={() => openSplit(t.id, "horizontal")}
                      className="px-2 py-1.5 text-left border-b transition-colors"
                      style={{ borderColor: "var(--psych-border)" }}
                    >
                      <Columns size={10} className="inline mr-1" />
                      {t.label}
                    </button>
                    <button
                      onClick={() => openSplit(t.id, "vertical")}
                      className="px-2 py-1.5 text-left border-b border-l transition-colors"
                      style={{ borderColor: "var(--psych-border)" }}
                    >
                      <Rows size={10} className="inline mr-1" />
                      {t.label}
                    </button>
                  </div>
                ))}
              {menuTargets.filter((t) => t.id !== "primary").length === 0 && (
                <div
                  className="px-3 py-2 text-xs"
                  style={{ color: "var(--psych-muted)" }}
                >
                  No companion panes registered for this view.
                </div>
              )}
            </div>
          </details>
        </div>
        {splittable && (
          <>
            <button
              onClick={toggleOrientation}
              className="text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5"
              style={{
                borderColor: "var(--psych-border)",
                color: "var(--psych-muted)",
                backgroundColor: "var(--psych-card)",
              }}
              title="Toggle orientation"
            >
              {horizontal ? <ArrowUpDown size={12} /> : <ArrowLeftRight size={12} />}
              {horizontal ? "Vertical" : "Horizontal"}
            </button>
            {config.panes.length === 2 && (
              <button
                onClick={() => apply(swapPanes(config, 0, 1))}
                className="text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5"
                style={{
                  borderColor: "var(--psych-border)",
                  color: "var(--psych-muted)",
                  backgroundColor: "var(--psych-card)",
                }}
              >
                <ArrowLeftRight size={12} /> Swap
              </button>
            )}
          </>
        )}
      </div>

      <div
        ref={containerRef}
        className="rounded-xl border overflow-hidden"
        style={{
          borderColor: "var(--psych-border)",
          minHeight: 420,
          display: "flex",
          flexDirection: horizontal ? "row" : "column",
          gap: 0,
        }}
      >
        {config.panes.map((pane, idx) => {
          const render = renderers[pane.target] ?? renderers["primary"];
          const sizeStyle =
            horizontal
              ? { width: `${pane.size}%`, minWidth: 100 }
              : { height: `${pane.size}%`, minHeight: 100 };
          return (
            <div
              key={`${pane.target}-${idx}`}
              className="relative flex flex-col"
              style={{
                ...sizeStyle,
                borderRight:
                  horizontal && idx < config.panes.length - 1
                    ? "1px solid var(--psych-border)"
                    : undefined,
                borderBottom:
                  !horizontal && idx < config.panes.length - 1
                    ? "1px solid var(--psych-border)"
                    : undefined,
                backgroundColor:
                  idx === 0 ? "var(--psych-bg)" : "var(--psych-card)",
              }}
            >
              <div
                className="no-print flex items-center justify-between gap-2 px-2 py-1 border-b text-[10px]"
                style={{
                  borderColor: "var(--psych-border)",
                  color: "var(--psych-muted)",
                  backgroundColor: "var(--psych-card)",
                }}
              >
                <span className="uppercase tracking-wider">
                  {findPaneTarget(pane.target)?.label ?? pane.target}
                </span>
                {splittable && (
                  <button
                    onClick={() => closePane(idx)}
                    aria-label="Close pane"
                    style={{ color: "var(--psych-muted)" }}
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-auto p-3">{render?.()}</div>

              {/* Resize handle */}
              {idx < config.panes.length - 1 && (
                <div
                  onPointerDown={(e) => startDrag(idx, e)}
                  className="absolute z-10 no-print"
                  style={{
                    cursor: horizontal ? "col-resize" : "row-resize",
                    ...(horizontal
                      ? { top: 0, right: -3, width: 6, height: "100%" }
                      : { left: 0, bottom: -3, height: 6, width: "100%" }),
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
