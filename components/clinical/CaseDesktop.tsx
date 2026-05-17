"use client";
// Per-case desktop — rearrangeable panels driven by lib/desk/layouts.
// Each panel is a thin renderer that pulls from the data it already has
// (psy graph, sessions, clinical contexts, calendar). Panels are
// resize-able (sm/md/lg widths), collapsible, pinnable, and
// reorderable via Move Up / Move Down. Layouts persist per case.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Copy,
  Layers,
  Pin,
  PinOff,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import {
  DESKTOP_ACTIVE_LAYOUT_KEY,
  DESKTOP_LAYOUTS_STORAGE_KEY,
  LAYOUT_PRESETS,
  PANEL_LABELS,
  type DesktopLayout,
  type PanelKind,
  type PanelSize,
  addPanel,
  duplicateLayout,
  fromPreset,
  patchPanel,
  removePanel,
  reorderPanels,
  visiblePanels,
} from "@/lib/desk/layouts";
import { useApp } from "@/contexts/AppContext";
import { useClinical } from "@/contexts/ClinicalContext";
import { usePsyGraph } from "@/contexts/PsyGraphContext";
import { recurringThreads } from "@/lib/psy/threads";
import { CaseTimeline } from "@/components/shared/CaseTimeline";
import { BodyMap } from "@/components/psy/BodyMap";
import { ThoughtWeb } from "@/components/psy/ThoughtWeb";
import { SessionRecapVisual } from "@/components/psy/SessionRecapVisual";

type LayoutMap = Record<string, string>; // caseId → layoutId

function sizeWidth(size: PanelSize): string {
  if (size === "lg") return "100%";
  if (size === "md") return "calc(50% - 6px)";
  return "calc(33% - 8px)";
}

interface Props {
  caseId: string;
}

export function CaseDesktop({ caseId }: Props) {
  const [layouts, setLayouts] = useState<DesktopLayout[]>([]);
  const [activeLayoutMap, setActiveLayoutMap] = useState<LayoutMap>({});
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = loadFromStorage<unknown>(DESKTOP_LAYOUTS_STORAGE_KEY, []);
      setLayouts(Array.isArray(stored) ? (stored as DesktopLayout[]) : []);
      const activeMap = loadFromStorage<LayoutMap>(
        DESKTOP_ACTIVE_LAYOUT_KEY,
        {}
      );
      setActiveLayoutMap(activeMap || {});
    } catch {
      // ignore
    }
  }, []);

  function persistLayouts(next: DesktopLayout[]) {
    setLayouts(next);
    saveToStorage(DESKTOP_LAYOUTS_STORAGE_KEY, next);
  }
  function persistActive(next: LayoutMap) {
    setActiveLayoutMap(next);
    saveToStorage(DESKTOP_ACTIVE_LAYOUT_KEY, next);
  }

  const caseLayouts = useMemo(
    () => layouts.filter((l) => l.caseId === caseId),
    [layouts, caseId]
  );

  const activeLayoutId = activeLayoutMap[caseId];
  const activeLayout =
    caseLayouts.find((l) => l.id === activeLayoutId) ?? caseLayouts[0] ?? null;

  function applyPreset(presetId: string) {
    const preset = LAYOUT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const layout = fromPreset(preset, caseId);
    persistLayouts([layout, ...layouts]);
    persistActive({ ...activeLayoutMap, [caseId]: layout.id });
    setPickerOpen(false);
  }

  function updateActive(updater: (l: DesktopLayout) => DesktopLayout) {
    if (!activeLayout) return;
    persistLayouts(
      layouts.map((l) => (l.id === activeLayout.id ? updater(l) : l))
    );
  }

  function deleteActive() {
    if (!activeLayout) return;
    if (!confirm(`Delete layout "${activeLayout.name}"?`)) return;
    persistLayouts(layouts.filter((l) => l.id !== activeLayout.id));
    const next = { ...activeLayoutMap };
    delete next[caseId];
    persistActive(next);
  }

  function duplicateActive() {
    if (!activeLayout) return;
    const dup = duplicateLayout(activeLayout);
    persistLayouts([dup, ...layouts]);
    persistActive({ ...activeLayoutMap, [caseId]: dup.id });
  }

  function selectLayout(id: string) {
    persistActive({ ...activeLayoutMap, [caseId]: id });
  }

  // Empty state — let the therapist pick a preset.
  if (!activeLayout) {
    return (
      <div
        className="rounded-2xl border p-6 text-center"
        style={{
          background: "var(--psych-card)",
          borderColor: "var(--psych-border)",
        }}
      >
        <Layers
          size={20}
          className="mx-auto mb-2"
          style={{ color: "var(--psych-muted)" }}
        />
        <p className="text-sm mb-3" style={{ color: "var(--psych-muted)" }}>
          No desktop layout for this case yet. Start from a preset:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {LAYOUT_PRESETS.map((p) => (
            <Button
              key={p.id}
              size="sm"
              variant="secondary"
              onClick={() => applyPreset(p.id)}
            >
              <Plus size={12} /> {p.name}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Layout controls */}
      <div
        className="rounded-xl border p-2 flex items-center gap-2 flex-wrap"
        style={{
          background: "var(--psych-card)",
          borderColor: "var(--psych-border)",
        }}
      >
        <Layers size={13} style={{ color: "var(--psych-muted)" }} />
        <Select
          value={activeLayout.id}
          onChange={(e) => selectLayout(e.target.value)}
          className="w-56"
        >
          {caseLayouts.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </Select>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setPickerOpen((v) => !v)}
        >
          <Plus size={12} /> Add layout
        </Button>
        <Button size="sm" variant="ghost" onClick={duplicateActive}>
          <Copy size={12} /> Duplicate
        </Button>
        <Button size="sm" variant="ghost" onClick={deleteActive}>
          <Trash2 size={12} /> Delete
        </Button>

        <div className="ml-auto flex items-center gap-1">
          <span className="text-[10px]" style={{ color: "var(--psych-muted)" }}>
            Add panel:
          </span>
          <Select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                updateActive((l) => addPanel(l, e.target.value as PanelKind));
                e.target.value = "";
              }
            }}
            className="w-44"
          >
            <option value="">(pick a panel)</option>
            {(Object.keys(PANEL_LABELS) as PanelKind[])
              .filter(
                (k) => !activeLayout.panels.some((p) => p.kind === k)
              )
              .map((k) => (
                <option key={k} value={k}>
                  + {PANEL_LABELS[k]}
                </option>
              ))}
          </Select>
        </div>
      </div>

      {/* Preset picker */}
      {pickerOpen && (
        <div
          className="rounded-xl border p-3"
          style={{
            background: "var(--psych-card)",
            borderColor: "var(--psych-border)",
          }}
        >
          <div
            className="text-[10px] uppercase tracking-wider mb-2"
            style={{ color: "var(--psych-muted)" }}
          >
            Add a new layout from a preset
          </div>
          <div className="flex flex-wrap gap-2">
            {LAYOUT_PRESETS.map((p) => (
              <Button
                key={p.id}
                size="sm"
                variant="secondary"
                onClick={() => applyPreset(p.id)}
              >
                {p.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Panel grid */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {visiblePanels(activeLayout).map((panel) => {
          const realIndex = activeLayout.panels.findIndex((p) => p.id === panel.id);
          return (
            <div
              key={panel.id}
              style={{
                width: sizeWidth(panel.size),
                minWidth: 280,
              }}
            >
              <PanelChrome
                kind={panel.kind}
                size={panel.size}
                collapsed={panel.collapsed}
                pinned={panel.pinned}
                onToggleCollapse={() =>
                  updateActive((l) =>
                    patchPanel(l, panel.id, { collapsed: !panel.collapsed })
                  )
                }
                onTogglePin={() =>
                  updateActive((l) =>
                    patchPanel(l, panel.id, { pinned: !panel.pinned })
                  )
                }
                onSetSize={(size) =>
                  updateActive((l) => patchPanel(l, panel.id, { size }))
                }
                onMoveUp={
                  realIndex > 0
                    ? () =>
                        updateActive((l) =>
                          reorderPanels(l, realIndex, realIndex - 1)
                        )
                    : undefined
                }
                onMoveDown={
                  realIndex < activeLayout.panels.length - 1
                    ? () =>
                        updateActive((l) =>
                          reorderPanels(l, realIndex, realIndex + 1)
                        )
                    : undefined
                }
                onRemove={() =>
                  updateActive((l) => removePanel(l, panel.id))
                }
              >
                <PanelBody kind={panel.kind} caseId={caseId} />
              </PanelChrome>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface PanelChromeProps {
  kind: PanelKind;
  size: PanelSize;
  collapsed: boolean;
  pinned: boolean;
  onToggleCollapse: () => void;
  onTogglePin: () => void;
  onSetSize: (size: PanelSize) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove: () => void;
  children: React.ReactNode;
}

function PanelChrome({
  kind,
  size,
  collapsed,
  pinned,
  onToggleCollapse,
  onTogglePin,
  onSetSize,
  onMoveUp,
  onMoveDown,
  onRemove,
  children,
}: PanelChromeProps) {
  return (
    <div
      className="rounded-xl border alive-hover"
      style={{
        background: "var(--psych-card)",
        borderColor: pinned ? "var(--psych-primary)" : "var(--psych-border)",
        borderLeftWidth: pinned ? 4 : 1,
      }}
    >
      <div
        className="flex items-center gap-1 px-3 py-1.5 text-xs"
        style={{
          borderBottom: collapsed ? "none" : "1px solid var(--psych-border)",
          color: "var(--psych-muted)",
        }}
      >
        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-1"
          aria-label="Collapse panel"
          style={{ color: "var(--psych-text)" }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          <span className="font-medium">{PANEL_LABELS[kind]}</span>
        </button>
        <div className="ml-auto flex items-center gap-1">
          {(["sm", "md", "lg"] as PanelSize[]).map((s) => (
            <button
              key={s}
              onClick={() => onSetSize(s)}
              className="text-[9px] font-mono"
              style={{
                color: s === size ? "var(--psych-accent)" : "var(--psych-muted)",
                padding: "2px 4px",
                borderRadius: 4,
                background: s === size ? "var(--psych-primary-light)" : "transparent",
              }}
              aria-label={`Size ${s}`}
            >
              {s}
            </button>
          ))}
          {onMoveUp && (
            <button onClick={onMoveUp} aria-label="Move up">
              <ArrowUp size={11} />
            </button>
          )}
          {onMoveDown && (
            <button onClick={onMoveDown} aria-label="Move down">
              <ArrowDown size={11} />
            </button>
          )}
          <button
            onClick={onTogglePin}
            aria-label={pinned ? "Unpin" : "Pin"}
            style={{ color: pinned ? "var(--psych-primary)" : "var(--psych-muted)" }}
          >
            {pinned ? <PinOff size={11} /> : <Pin size={11} />}
          </button>
          <button
            onClick={onRemove}
            aria-label="Remove panel"
            style={{ color: "var(--psych-muted)" }}
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
      {!collapsed && <div className="p-3">{children}</div>}
    </div>
  );
}

function PanelBody({ kind, caseId }: { kind: PanelKind; caseId: string }) {
  const { supervisionNotes, transcripts } = useApp();
  const { interventions } = useClinical();
  const { nodes } = usePsyGraph();

  switch (kind) {
    case "timeline":
      return <CaseTimeline caseId={caseId} />;
    case "session-recap":
      return <SessionRecapVisual caseId={caseId} view="therapist" />;
    case "body-map":
      return (
        <div style={{ maxWidth: 280, margin: "0 auto" }}>
          <BodyMap interactive={false} />
        </div>
      );
    case "thought-web":
      return (
        <ThoughtWeb
          nodes={nodes.filter((n) => n.caseId === caseId)}
          links={[]}
          readOnly
        />
      );
    case "open-threads":
      return <OpenThreadsPanel caseId={caseId} />;
    case "supervision-reminders":
      return (
        <PanelList
          items={supervisionNotes
            .filter((s) => s.caseId === caseId)
            .slice(0, 4)
            .map((s) => ({
              id: s.id,
              label: `Supervision · ${s.date}`,
              sub: s.actionPlan,
            }))}
          emptyText="No supervision notes yet."
          href="/supervision"
        />
      );
    case "assigned-interventions":
      return (
        <PanelList
          items={interventions
            .filter((i) => i.caseId === caseId)
            .slice(0, 6)
            .map((i) => ({
              id: i.id,
              label: i.name,
              sub: i.date,
            }))}
          emptyText="No interventions logged yet."
          href="/interventions"
        />
      );
    case "transcript-excerpts":
      return (
        <PanelList
          items={transcripts
            .filter((t) => t.caseId === caseId)
            .slice(0, 4)
            .map((t) => ({
              id: t.id,
              label: t.title,
              sub: (t.createdAt ?? "").split("T")[0],
            }))}
          emptyText="No transcripts on this case yet."
          href="/transcripts"
        />
      );
    case "reports-in-progress":
      return <ReportDraftsPanel caseId={caseId} />;
    case "quick-notes":
      return <QuickNotesPanel caseId={caseId} />;
    case "session-prep":
      return (
        <Link
          href={`/cases/${caseId}`}
          className="text-xs"
          style={{ color: "var(--psych-primary)" }}
        >
          Open the Clinical snapshot tab for session prep ✦
        </Link>
      );
    default:
      return (
        <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
          The {PANEL_LABELS[kind]} panel ties into existing data; its dedicated
          drilldown is available from the case detail tabs.
        </p>
      );
  }
}

function OpenThreadsPanel({ caseId }: { caseId: string }) {
  const { nodes } = usePsyGraph();
  const threads = recurringThreads(
    nodes.filter((n) => n.caseId === caseId)
  ).slice(0, 5);
  if (threads.length === 0) {
    return (
      <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
        No recurring threads yet. Tag a few thought-web or body-map nodes.
      </p>
    );
  }
  return (
    <ul className="space-y-1 text-sm">
      {threads.map((t) => (
        <li
          key={t.tag}
          className="flex items-center gap-2"
          style={{ color: "var(--psych-text)" }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "#9F1239" }}
          />
          <strong>{t.tag}</strong>
          <span
            className="text-[10px] ml-auto"
            style={{ color: "var(--psych-muted)" }}
          >
            {t.count}× · {Object.keys(t.kindBreakdown).length} kinds
          </span>
        </li>
      ))}
    </ul>
  );
}

function QuickNotesPanel({ caseId }: { caseId: string }) {
  const notes = useMemo(() => {
    try {
      const raw = loadFromStorage<unknown>("psych-quick-notes-v1", []);
      if (!Array.isArray(raw)) return [];
      return (raw as Array<{ id: string; body: string; caseId?: string; updatedAt: string }>)
        .filter((n) => n.caseId === caseId)
        .slice(0, 4);
    } catch {
      return [];
    }
  }, [caseId]);
  if (notes.length === 0) {
    return (
      <Link
        href="/quick-notes"
        className="text-xs"
        style={{ color: "var(--psych-primary)" }}
      >
        Drop a thought into the quick-notes board →
      </Link>
    );
  }
  return (
    <ul className="space-y-1.5">
      {notes.map((n) => (
        <li
          key={n.id}
          className="text-xs p-2 rounded-md"
          style={{
            background: "var(--psych-bg)",
            color: "var(--psych-text)",
          }}
        >
          {n.body.length > 120 ? n.body.slice(0, 119) + "…" : n.body}
        </li>
      ))}
    </ul>
  );
}

function ReportDraftsPanel({ caseId }: { caseId: string }) {
  const drafts = useMemo(() => {
    try {
      const raw = loadFromStorage<unknown>("psych-report-drafts-v1", []);
      if (!Array.isArray(raw)) return [];
      return (raw as Array<{ id: string; title: string; caseId?: string; updatedAt: string }>)
        .filter((d) => d.caseId === caseId)
        .slice(0, 4);
    } catch {
      return [];
    }
  }, [caseId]);
  if (drafts.length === 0) {
    return (
      <Link
        href="/reports/builder"
        className="text-xs"
        style={{ color: "var(--psych-primary)" }}
      >
        Start a draft in the smart report builder →
      </Link>
    );
  }
  return (
    <ul className="space-y-1 text-sm">
      {drafts.map((d) => (
        <li key={d.id}>
          <Link
            href="/reports/builder"
            className="block p-2 rounded-md alive-hover"
            style={{ background: "var(--psych-bg)", color: "var(--psych-text)" }}
          >
            {d.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

interface PanelListItem {
  id: string;
  label: string;
  sub?: string;
}

function PanelList({
  items,
  emptyText,
  href,
}: {
  items: PanelListItem[];
  emptyText: string;
  href: string;
}) {
  if (items.length === 0) {
    return (
      <Link
        href={href}
        className="text-xs"
        style={{ color: "var(--psych-primary)" }}
      >
        {emptyText} →
      </Link>
    );
  }
  return (
    <ul className="space-y-1 text-sm">
      {items.map((item) => (
        <li
          key={item.id}
          className="p-2 rounded-md"
          style={{ background: "var(--psych-bg)", color: "var(--psych-text)" }}
        >
          <div className="font-medium">{item.label}</div>
          {item.sub && (
            <div
              className="text-[10px]"
              style={{ color: "var(--psych-muted)" }}
            >
              {item.sub}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
