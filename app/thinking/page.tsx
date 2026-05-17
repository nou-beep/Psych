"use client";
// Thinking Mode — a freeform intellectual workspace. A wall for
// half-formed thoughts: drag-positioned cards, connections, color
// clusters, pinned references. Not a chapter editor.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Link2,
  Pin,
  Plus,
  Sparkles,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/Toast";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import {
  THINKING_BOARD_STORAGE_KEY,
  THOUGHT_KIND_LABELS,
  addThought,
  boardStats,
  clustersOf,
  emptyBoard,
  isolatedThoughts,
  linkThoughts,
  moveThought,
  patchThought,
  removeThought,
  unlinkThoughts,
  type ThinkingBoard,
  type Thought,
  type ThoughtColor,
  type ThoughtKind,
} from "@/lib/workspace/thinking-mode";
import { PHRASES } from "@/lib/workspace/microcopy";
import { useRecordVisit } from "@/components/shared/useRecordVisit";

const COLOR_BG: Record<ThoughtColor, string> = {
  default: "var(--psych-card)",
  amber: "#FEF3C7",
  rose: "#FFE4E6",
  violet: "#EDE9FE",
  teal: "#CCFBF1",
  slate: "#E2E8F0",
  sage: "#D1FAE5",
};

const COLOR_FG: Record<ThoughtColor, string> = {
  default: "var(--psych-text)",
  amber: "#78350F",
  rose: "#881337",
  violet: "#4C1D95",
  teal: "#134E4A",
  slate: "#1E293B",
  sage: "#065F46",
};

const COLORS: ThoughtColor[] = [
  "default",
  "amber",
  "rose",
  "violet",
  "teal",
  "slate",
  "sage",
];

export default function ThinkingPage() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState<ThinkingBoard | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [linkSource, setLinkSource] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    try {
      const stored = loadFromStorage<ThinkingBoard | null>(
        THINKING_BOARD_STORAGE_KEY,
        null
      );
      setBoard(stored ?? emptyBoard());
    } catch {
      setBoard(emptyBoard());
    }
  }, []);

  useRecordVisit({
    id: board?.id ?? "",
    kind: "thought-board",
    label: board?.title ?? "Thinking",
    href: "/thinking",
    resumeHint: board ? PHRASES.thoughtsCount(board.thoughts.length) : undefined,
    disabled: !board,
  });

  function persist(next: ThinkingBoard) {
    setBoard(next);
    saveToStorage(THINKING_BOARD_STORAGE_KEY, next);
  }

  function handleDrag(id: string, e: React.PointerEvent) {
    if (!board || !canvasRef.current) return;
    e.preventDefault();
    const card = e.currentTarget as HTMLElement;
    const rect = canvasRef.current.getBoundingClientRect();
    const thought = board.thoughts.find((t) => t.id === id);
    if (!thought) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = thought.x;
    const origY = thought.y;
    card.setPointerCapture(e.pointerId);

    function onMove(ev: PointerEvent) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const x = Math.max(
        4,
        Math.min(rect.width - 60, origX + dx)
      );
      const y = Math.max(
        4,
        Math.min(rect.height - 60, origY + dy)
      );
      // mutate via setBoard — but avoid persisting on every frame.
      setBoard((b) => (b ? moveThought(b, id, x, y) : b));
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      // Persist final position.
      setBoard((b) => {
        if (b) saveToStorage(THINKING_BOARD_STORAGE_KEY, b);
        return b;
      });
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function onCanvasDoubleClick(e: React.MouseEvent) {
    if (!board || !canvasRef.current) return;
    if ((e.target as HTMLElement).closest("[data-thought]")) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 110;
    const y = e.clientY - rect.top - 30;
    setShowAdd(true);
    setPendingPosition({ x, y });
  }

  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(
    null
  );

  const stats = useMemo(() => (board ? boardStats(board) : null), [board]);
  const orphans = useMemo(
    () => (board ? isolatedThoughts(board) : []),
    [board]
  );
  const clusters = useMemo(() => (board ? clustersOf(board) : {}), [board]);
  const selected = useMemo(
    () => (board && selectedId ? board.thoughts.find((t) => t.id === selectedId) ?? null : null),
    [board, selectedId]
  );

  if (!board) return null;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <PageHeader
        title="Thinking"
        subtitle="Une surface libre. Déposer une pensée, la déplacer, la relier à une autre. Rien n'est encore un chapitre."
        action={
          <div className="flex items-center gap-2">
            <span
              className="text-xs"
              style={{ color: "var(--psych-muted)" }}
            >
              {stats ? PHRASES.thoughtsCount(stats.total) : ""}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setPendingPosition({ x: 60 + Math.random() * 80, y: 60 + Math.random() * 80 });
                setShowAdd(true);
              }}
            >
              <Plus size={12} /> {PHRASES.dropThought}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Canvas */}
        <div className="lg:col-span-3">
          <div
            ref={canvasRef}
            onDoubleClick={onCanvasDoubleClick}
            className="relative rounded-2xl border overflow-hidden"
            style={{
              borderColor: "var(--psych-border)",
              backgroundColor: "var(--psych-bg)",
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)",
              backgroundSize: "18px 18px",
              minHeight: 640,
            }}
          >
            {/* SVG link layer */}
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: "100%", height: "100%" }}
            >
              {board.links.map((l) => {
                const from = board.thoughts.find((t) => t.id === l.from);
                const to = board.thoughts.find((t) => t.id === l.to);
                if (!from || !to) return null;
                return (
                  <g key={l.id}>
                    <line
                      x1={from.x + from.width / 2}
                      y1={from.y + 30}
                      x2={to.x + to.width / 2}
                      y2={to.y + 30}
                      stroke="var(--psych-accent)"
                      strokeWidth={1.5}
                      strokeDasharray={l.style === "dotted" ? "4 4" : undefined}
                      opacity={0.5}
                    />
                    {l.label && (
                      <text
                        x={(from.x + to.x + from.width / 2 + to.width / 2) / 2}
                        y={(from.y + to.y) / 2 + 26}
                        fontSize={10}
                        fill="var(--psych-muted)"
                        textAnchor="middle"
                        style={{ fontStyle: "italic" }}
                      >
                        {l.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Thought cards */}
            {board.thoughts.map((t) => {
              const isSelected = selectedId === t.id;
              const isLinkSource = linkSource === t.id;
              return (
                <article
                  key={t.id}
                  data-thought={t.id}
                  onClick={() => {
                    if (linkSource && linkSource !== t.id) {
                      persist(linkThoughts(board, linkSource, t.id));
                      setLinkSource(null);
                      toast("Pensée reliée.", "success");
                      return;
                    }
                    setSelectedId(t.id);
                  }}
                  onPointerDown={(e) => {
                    if ((e.target as HTMLElement).closest("button")) return;
                    handleDrag(t.id, e);
                  }}
                  className="absolute rounded-xl border shadow-sm cursor-grab active:cursor-grabbing transition-shadow"
                  style={{
                    left: t.x,
                    top: t.y,
                    width: t.width,
                    backgroundColor: COLOR_BG[t.color],
                    color: COLOR_FG[t.color],
                    borderColor: isSelected
                      ? "var(--psych-primary)"
                      : isLinkSource
                      ? "var(--psych-accent)"
                      : "var(--psych-border)",
                    borderWidth: isSelected || isLinkSource ? 2 : 1,
                    boxShadow: isSelected ? "0 4px 16px rgba(0,0,0,0.08)" : undefined,
                    zIndex: isSelected ? 5 : 1,
                  }}
                >
                  <div
                    className="flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-wider border-b"
                    style={{
                      borderColor: "rgba(0,0,0,0.08)",
                      opacity: 0.7,
                    }}
                  >
                    <span className="flex-1">
                      {THOUGHT_KIND_LABELS[t.kind]}
                    </span>
                    {t.pinned && <Pin size={9} />}
                    {t.cluster && <span className="italic">·{t.cluster}</span>}
                  </div>
                  <p
                    className="px-2.5 py-2 text-sm whitespace-pre-wrap"
                    style={{ lineHeight: 1.45, fontFamily: "Georgia, serif" }}
                  >
                    {t.body || (
                      <span style={{ opacity: 0.5 }}>(vide)</span>
                    )}
                  </p>
                </article>
              );
            })}

            {board.thoughts.length === 0 && (
              <div
                className="absolute inset-0 flex items-center justify-center text-center"
                style={{ color: "var(--psych-muted)" }}
              >
                <div>
                  <Sparkles
                    size={20}
                    className="mx-auto mb-2"
                    style={{ color: "var(--psych-primary)" }}
                  />
                  <p className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                    {PHRASES.emptyThoughts}
                  </p>
                  <p className="text-[11px] mt-1 italic">
                    Double-cliquer pour déposer une pensée.
                  </p>
                </div>
              </div>
            )}
          </div>

          {linkSource && (
            <div
              className="mt-2 rounded-md border px-3 py-2 text-xs flex items-center gap-2"
              style={{
                borderColor: "var(--psych-accent)",
                backgroundColor: "var(--psych-primary-light)",
                color: "var(--psych-text)",
              }}
            >
              <Link2 size={12} />
              Mode liaison. Cliquer une seconde pensée pour la relier.
              <button
                onClick={() => setLinkSource(null)}
                className="ml-auto"
                aria-label="Annuler"
              >
                <X size={11} />
              </button>
            </div>
          )}
        </div>

        {/* Side panel: selected thought + stats */}
        <div className="space-y-3">
          {selected ? (
            <ThoughtEditor
              thought={selected}
              onPatch={(p) => persist(patchThought(board, selected.id, p))}
              onLink={() => {
                setLinkSource(selected.id);
                toast(
                  "Cliquer une seconde pensée pour la relier.",
                  "info"
                );
              }}
              onRemove={() => {
                persist(removeThought(board, selected.id));
                setSelectedId(null);
              }}
              connectedLinks={board.links.filter(
                (l) => l.from === selected.id || l.to === selected.id
              )}
              onUnlink={(linkId) => persist(unlinkThoughts(board, linkId))}
            />
          ) : (
            <SectionCard
              title="Aucune pensée sélectionnée"
              description="Cliquer une carte sur le mur pour l'éditer."
            >
              <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
                Double-cliquer le mur pour déposer une pensée à cet endroit.
                Glisser-déposer pour les organiser. Cliquer 2 cartes après le
                bouton « relier » pour tracer un lien.
              </p>
            </SectionCard>
          )}

          {stats && stats.total > 0 && (
            <SectionCard title="Mur" description="État du mur de pensées.">
              <ul
                className="text-xs space-y-0.5"
                style={{ color: "var(--psych-text)" }}
              >
                <li>{PHRASES.thoughtsCount(stats.total)}</li>
                <li>
                  {stats.linkCount} lien{stats.linkCount === 1 ? "" : "s"}
                </li>
                <li>
                  {stats.clusters} cluster{stats.clusters === 1 ? "" : "s"}
                </li>
                <li>
                  {stats.isolated} isolée{stats.isolated === 1 ? "" : "s"}
                </li>
                {stats.pinned > 0 && <li>{stats.pinned} épinglée{stats.pinned === 1 ? "" : "s"}</li>}
              </ul>
            </SectionCard>
          )}

          {orphans.length > 0 && (
            <SectionCard
              title="Pensées orphelines"
              description="Pas encore reliées à autre chose."
            >
              <ul className="space-y-1">
                {orphans.slice(0, 5).map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => setSelectedId(t.id)}
                      className="text-xs text-left w-full px-2 py-1 rounded-md"
                      style={{
                        backgroundColor: COLOR_BG[t.color],
                        color: COLOR_FG[t.color],
                      }}
                    >
                      {t.body.slice(0, 60) || "(vide)"}
                    </button>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {Object.keys(clusters).filter((k) => k !== "(unclustered)").length > 0 && (
            <SectionCard title="Clusters">
              <ul className="text-xs space-y-1">
                {Object.entries(clusters)
                  .filter(([k]) => k !== "(unclustered)")
                  .map(([cluster, items]) => (
                    <li
                      key={cluster}
                      className="flex items-center gap-2"
                      style={{ color: "var(--psych-text)" }}
                    >
                      <StickyNote size={10} />
                      <span className="flex-1">{cluster}</span>
                      <span
                        className="text-[10px]"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        {items.length}
                      </span>
                    </li>
                  ))}
              </ul>
            </SectionCard>
          )}
        </div>
      </div>

      {showAdd && (
        <AddThoughtModal
          onClose={() => {
            setShowAdd(false);
            setPendingPosition(null);
          }}
          onAdd={(input) => {
            persist(
              addThought(board, {
                ...input,
                x: pendingPosition?.x,
                y: pendingPosition?.y,
              })
            );
            setShowAdd(false);
            setPendingPosition(null);
            toast("Pensée déposée.", "success");
          }}
        />
      )}
    </div>
  );
}

function ThoughtEditor({
  thought,
  onPatch,
  onLink,
  onRemove,
  connectedLinks,
  onUnlink,
}: {
  thought: Thought;
  onPatch: (p: Partial<Thought>) => void;
  onLink: () => void;
  onRemove: () => void;
  connectedLinks: Array<{ id: string; from: string; to: string; label?: string }>;
  onUnlink: (linkId: string) => void;
}) {
  return (
    <SectionCard
      title={THOUGHT_KIND_LABELS[thought.kind]}
      headerAction={
        <button
          onClick={() => onPatch({ pinned: !thought.pinned })}
          className="rounded-md p-1.5 border transition-all"
          aria-label={thought.pinned ? "Détacher" : "Épingler"}
          style={{
            borderColor: thought.pinned ? "var(--psych-primary)" : "var(--psych-border)",
            color: thought.pinned ? "var(--psych-primary)" : "var(--psych-muted)",
          }}
        >
          <Pin size={11} />
        </button>
      }
    >
      <Textarea
        value={thought.body}
        onChange={(e) => onPatch({ body: e.target.value })}
        placeholder="Pensée…"
        className="min-h-[100px] text-sm"
        style={{
          fontFamily: "Georgia, serif",
          backgroundColor: COLOR_BG[thought.color],
          color: COLOR_FG[thought.color],
        }}
      />
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div>
          <label
            className="text-[10px] uppercase tracking-wider"
            style={{ color: "var(--psych-muted)" }}
          >
            Type
          </label>
          <Select
            value={thought.kind}
            onChange={(e) => onPatch({ kind: e.target.value as ThoughtKind })}
            className="text-xs"
          >
            {Object.entries(THOUGHT_KIND_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label
            className="text-[10px] uppercase tracking-wider"
            style={{ color: "var(--psych-muted)" }}
          >
            Cluster
          </label>
          <Input
            value={thought.cluster ?? ""}
            onChange={(e) => onPatch({ cluster: e.target.value })}
            placeholder="anxiety, dpdr…"
            className="text-xs"
          />
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        <span
          className="text-[10px] uppercase tracking-wider mr-1"
          style={{ color: "var(--psych-muted)" }}
        >
          Couleur
        </span>
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onPatch({ color: c })}
            aria-label={c}
            className="w-5 h-5 rounded-full border"
            style={{
              backgroundColor: COLOR_BG[c],
              borderColor:
                thought.color === c ? "var(--psych-primary)" : "var(--psych-border)",
              borderWidth: thought.color === c ? 2 : 1,
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t" style={{ borderColor: "var(--psych-border)" }}>
        <Button size="sm" variant="secondary" onClick={onLink}>
          <Link2 size={11} /> Relier
        </Button>
        <Button size="sm" variant="ghost" onClick={onRemove}>
          <Trash2 size={11} /> Retirer
        </Button>
      </div>
      {connectedLinks.length > 0 && (
        <div className="mt-3">
          <div
            className="text-[10px] uppercase tracking-wider mb-1"
            style={{ color: "var(--psych-muted)" }}
          >
            Liens
          </div>
          <ul className="space-y-0.5">
            {connectedLinks.map((l) => (
              <li
                key={l.id}
                className="flex items-center gap-1 text-[11px]"
                style={{ color: "var(--psych-text)" }}
              >
                <Link2 size={9} />
                <span className="flex-1 italic">
                  {l.label ?? "lien"}
                </span>
                <button
                  onClick={() => onUnlink(l.id)}
                  aria-label="Retirer le lien"
                  style={{ color: "var(--psych-muted)" }}
                >
                  <X size={10} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  );
}

function AddThoughtModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (input: {
    body: string;
    kind: ThoughtKind;
    color: ThoughtColor;
    cluster?: string;
  }) => void;
}) {
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<ThoughtKind>("fragment");
  const [color, setColor] = useState<ThoughtColor>("default");
  const [cluster, setCluster] = useState("");

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="rounded-3xl border shadow-2xl w-full max-w-md p-5 animate-fade-in"
        style={{
          backgroundColor: "var(--psych-card)",
          borderColor: "var(--psych-border)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2
            className="text-base font-semibold"
            style={{ color: "var(--psych-text)" }}
          >
            Déposer une pensée
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{ color: "var(--psych-muted)" }}
          >
            <X size={14} />
          </button>
        </div>
        <Textarea
          autoFocus
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Une question, une contradiction, un fragment de citation…"
          className="min-h-[120px] text-sm"
          style={{
            fontFamily: "Georgia, serif",
            backgroundColor: COLOR_BG[color],
            color: COLOR_FG[color],
          }}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              if (body.trim()) onAdd({ body: body.trim(), kind, color, cluster: cluster || undefined });
            }
          }}
        />
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Select
            value={kind}
            onChange={(e) => setKind(e.target.value as ThoughtKind)}
          >
            {Object.entries(THOUGHT_KIND_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
          <Input
            value={cluster}
            onChange={(e) => setCluster(e.target.value)}
            placeholder="Cluster (optionnel)"
          />
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <span
            className="text-[10px] uppercase tracking-wider"
            style={{ color: "var(--psych-muted)" }}
          >
            Couleur
          </span>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-5 h-5 rounded-full border"
              aria-label={c}
              style={{
                backgroundColor: COLOR_BG[c],
                borderColor:
                  color === c ? "var(--psych-primary)" : "var(--psych-border)",
                borderWidth: color === c ? 2 : 1,
              }}
            />
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 mt-4">
          <Button size="sm" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (!body.trim()) return;
              onAdd({
                body: body.trim(),
                kind,
                color,
                cluster: cluster.trim() || undefined,
              });
            }}
          >
            Déposer
          </Button>
        </div>
      </div>
    </div>
  );
}
