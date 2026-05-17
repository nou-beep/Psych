"use client";
// Tracked Loops — explicit cross-system open loops the user is
// actively keeping in mind. Surfaces priority, emotional weight,
// optional revisit-by date, related materials.

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Pause,
  Pin,
  Plus,
  Search,
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
  PRIORITY_LABELS,
  STATUS_LABELS,
  SURFACE_LABELS,
  TRACKED_LOOPS_STORAGE_KEY,
  WEIGHT_LABELS,
  filterLoops,
  loopStats,
  newLoop,
  patchLoop,
  rankLoops,
  removeLoop,
  setStatus,
  staleLoops,
  type EmotionalWeight,
  type LoopPriority,
  type LoopStatus,
  type LoopSurface,
  type TrackedLoop,
} from "@/lib/workspace/tracked-loops";
import { PHRASES } from "@/lib/workspace/microcopy";

export default function LoopsPage() {
  const { toast } = useToast();
  const [list, setList] = useState<TrackedLoop[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [query, setQuery] = useState("");
  const [surfaceFilter, setSurfaceFilter] = useState<"all" | LoopSurface>(
    "all"
  );
  const [statusFilter, setStatusFilter] = useState<"all" | LoopStatus>("open");

  useEffect(() => {
    try {
      const stored = loadFromStorage<TrackedLoop[]>(
        TRACKED_LOOPS_STORAGE_KEY,
        []
      );
      setList(Array.isArray(stored) ? stored : []);
    } catch {
      setList([]);
    }
  }, []);

  function persist(next: TrackedLoop[]) {
    setList(next);
    saveToStorage(TRACKED_LOOPS_STORAGE_KEY, next);
  }

  const stats = useMemo(() => loopStats(list), [list]);
  const stale = useMemo(() => staleLoops(list), [list]);

  const visible = useMemo(() => {
    let v = list;
    if (surfaceFilter !== "all") {
      v = filterLoops(v, { surface: surfaceFilter });
    }
    if (statusFilter !== "all") {
      v = filterLoops(v, { status: statusFilter });
    }
    const q = query.trim().toLowerCase();
    if (q) {
      v = v.filter((l) => {
        const hay = [l.title, l.body ?? "", l.tags.join(" ")]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    return rankLoops(v);
  }, [list, surfaceFilter, statusFilter, query]);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Tracked loops"
        subtitle="Boucles que l'on garde ouvertes : priorité, poids émotionnel, échéance, matériaux liés."
        action={
          <Button size="sm" onClick={() => setShowNew(true)}>
            <Plus size={12} /> Nouvelle boucle
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
        <StatCard label="Open" value={stats.open} />
        <StatCard label="In progress" value={stats.inProgress} />
        <StatCard label="High priority" value={stats.highPriority} />
        <StatCard label="Heavy" value={stats.heavy} />
        <StatCard
          label="Stale"
          value={stats.stale}
          danger={stats.stale > 0}
        />
      </div>

      {stale.length > 0 && (
        <SectionCard
          title="Bouclées qui traînent"
          description={`${stale.length} boucle(s) sans activité depuis 14 jours ou en retard.`}
          className="mb-4"
        >
          <ul className="space-y-1 text-xs">
            {stale.slice(0, 3).map((l) => (
              <li
                key={l.id}
                className="flex items-center gap-2"
                style={{ color: "var(--psych-text)" }}
              >
                <AlertTriangle
                  size={11}
                  style={{ color: "#9F1239" }}
                />
                <span className="flex-1">{l.title}</span>
                <span
                  className="text-[10px]"
                  style={{ color: "var(--psych-muted)" }}
                >
                  {SURFACE_LABELS[l.surface]}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <SectionCard title="Filtres" className="mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={11}
              className="absolute left-2 top-1/2 -translate-y-1/2"
              style={{ color: "var(--psych-muted)" }}
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrer…"
              className="pl-7 text-xs"
            />
          </div>
          <Select
            value={surfaceFilter}
            onChange={(e) =>
              setSurfaceFilter(e.target.value as "all" | LoopSurface)
            }
            className="text-xs"
          >
            <option value="all">Toutes surfaces</option>
            {Object.entries(SURFACE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | LoopStatus)
            }
            className="text-xs"
          >
            <option value="all">Tous statuts</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
      </SectionCard>

      <div className="space-y-2">
        {visible.length === 0 ? (
          <div
            className="text-center py-12 rounded-xl border text-sm"
            style={{
              borderColor: "var(--psych-border)",
              color: "var(--psych-muted)",
              backgroundColor: "var(--psych-card)",
            }}
          >
            <CheckCircle2 size={20} className="mx-auto mb-2 opacity-50" />
            {PHRASES.emptyOpenLoops}
          </div>
        ) : (
          visible.map((l) => (
            <LoopRow
              key={l.id}
              loop={l}
              onPatch={(p) => persist(patchLoop(list, l.id, p))}
              onSetStatus={(s, note) => {
                persist(setStatus(list, l.id, s, note));
                toast(
                  s === "resolved"
                    ? PHRASES.resolved
                    : s === "parked"
                    ? PHRASES.parked
                    : "État modifié.",
                  "success"
                );
              }}
              onRemove={() => {
                if (!confirm("Retirer cette boucle ?")) return;
                persist(removeLoop(list, l.id));
              }}
            />
          ))
        )}
      </div>

      {showNew && (
        <NewLoopModal
          onClose={() => setShowNew(false)}
          onCreate={(input) => {
            persist([newLoop(input), ...list]);
            setShowNew(false);
            toast("Boucle ouverte.", "success");
          }}
        />
      )}
    </div>
  );
}

function LoopRow({
  loop,
  onPatch,
  onSetStatus,
  onRemove,
}: {
  loop: TrackedLoop;
  onPatch: (p: Partial<TrackedLoop>) => void;
  onSetStatus: (s: LoopStatus, note?: string) => void;
  onRemove: () => void;
}) {
  const priorityBg: Record<LoopPriority, string> = {
    high: "#FEE2E2",
    medium: "var(--psych-primary-light)",
    low: "var(--psych-bg)",
  };
  const priorityFg: Record<LoopPriority, string> = {
    high: "#9F1239",
    medium: "var(--psych-primary)",
    low: "var(--psych-muted)",
  };
  const weightIcon: Record<EmotionalWeight, string> = {
    light: "•",
    moderate: "••",
    heavy: "•••",
  };

  return (
    <article
      className="rounded-xl border p-3"
      style={{
        backgroundColor:
          loop.status === "resolved" ? "var(--psych-bg)" : "var(--psych-card)",
        borderColor: "var(--psych-border)",
        opacity: loop.status === "resolved" ? 0.7 : 1,
      }}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: priorityBg[loop.priority],
                color: priorityFg[loop.priority],
              }}
            >
              {PRIORITY_LABELS[loop.priority]}
            </span>
            <span
              className="text-[10px]"
              style={{ color: "var(--psych-muted)" }}
              title={`Emotional weight: ${WEIGHT_LABELS[loop.weight]}`}
            >
              {weightIcon[loop.weight]}
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full border"
              style={{
                borderColor: "var(--psych-border)",
                color: "var(--psych-muted)",
              }}
            >
              {SURFACE_LABELS[loop.surface]}
            </span>
            {loop.revisitBy && (
              <span
                className="text-[10px] inline-flex items-center gap-1"
                style={{
                  color:
                    Date.parse(loop.revisitBy) < Date.now()
                      ? "#9F1239"
                      : "var(--psych-muted)",
                }}
              >
                <CalendarClock size={10} /> {loop.revisitBy}
              </span>
            )}
            <span
              className="text-[10px] ml-auto"
              style={{ color: "var(--psych-muted)" }}
            >
              {STATUS_LABELS[loop.status]}
            </span>
          </div>
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--psych-text)" }}
          >
            {loop.title}
          </h3>
          {loop.body && (
            <p
              className="text-xs mt-1 whitespace-pre-wrap"
              style={{ color: "var(--psych-text)" }}
            >
              {loop.body}
            </p>
          )}
          {loop.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              {loop.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-1.5 py-0.5 rounded-full border"
                  style={{
                    borderColor: "var(--psych-border)",
                    color: "var(--psych-muted)",
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
          {loop.related.length > 0 && (
            <div
              className="flex items-center gap-1 mt-1 flex-wrap text-[10px]"
              style={{ color: "var(--psych-muted)" }}
            >
              <Pin size={9} />
              {loop.related.slice(0, 4).map((r, i) => (
                <span key={i} className="italic">
                  {r.label}
                  {i < Math.min(loop.related.length, 4) - 1 ? " ·" : ""}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div
        className="flex items-center gap-1 mt-2 pt-2 border-t"
        style={{ borderColor: "var(--psych-border)" }}
      >
        <Select
          value={loop.priority}
          onChange={(e) =>
            onPatch({ priority: e.target.value as LoopPriority })
          }
          className="text-[10px] w-24"
        >
          {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
        <Select
          value={loop.weight}
          onChange={(e) =>
            onPatch({ weight: e.target.value as EmotionalWeight })
          }
          className="text-[10px] w-24"
        >
          {Object.entries(WEIGHT_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
        <Input
          type="date"
          value={loop.revisitBy ?? ""}
          onChange={(e) => onPatch({ revisitBy: e.target.value || undefined })}
          className="text-[10px] w-32"
        />
        {loop.status !== "resolved" ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSetStatus("in-progress")}
              className="ml-auto"
            >
              {PHRASES.pickUpAgain}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSetStatus("parked")}
            >
              <Pause size={11} /> Park
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const note = prompt(
                  "Note de résolution (facultatif) :",
                  ""
                );
                onSetStatus("resolved", note ?? undefined);
              }}
            >
              <CheckCircle2 size={11} /> Résoudre
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSetStatus("open")}
            className="ml-auto"
          >
            Reopen
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={onRemove}
          aria-label="Retirer"
        >
          <Trash2 size={11} />
        </Button>
      </div>
    </article>
  );
}

function NewLoopModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: {
    title: string;
    body?: string;
    surface: LoopSurface;
    priority: LoopPriority;
    weight: EmotionalWeight;
    revisitBy?: string;
    tags?: string[];
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [surface, setSurface] = useState<LoopSurface>("global");
  const [priority, setPriority] = useState<LoopPriority>("medium");
  const [weight, setWeight] = useState<EmotionalWeight>("moderate");
  const [revisitBy, setRevisitBy] = useState("");
  const [tagsStr, setTagsStr] = useState("");

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="rounded-3xl border shadow-2xl w-full max-w-md p-5"
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
            Nouvelle boucle
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{ color: "var(--psych-muted)" }}
          >
            <X size={14} />
          </button>
        </div>
        <Input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ce que je veux garder ouvert…"
          className="mb-2"
        />
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Détail, contexte, raison d'être (optionnel)"
          className="min-h-[80px] text-sm mb-2"
        />
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Select
            value={surface}
            onChange={(e) => setSurface(e.target.value as LoopSurface)}
          >
            {Object.entries(SURFACE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
          <Input
            type="date"
            value={revisitBy}
            onChange={(e) => setRevisitBy(e.target.value)}
            placeholder="Revisit by"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Select
            value={priority}
            onChange={(e) => setPriority(e.target.value as LoopPriority)}
          >
            {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                Priorité : {v}
              </option>
            ))}
          </Select>
          <Select
            value={weight}
            onChange={(e) => setWeight(e.target.value as EmotionalWeight)}
          >
            {Object.entries(WEIGHT_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                Poids : {v}
              </option>
            ))}
          </Select>
        </div>
        <Input
          value={tagsStr}
          onChange={(e) => setTagsStr(e.target.value)}
          placeholder="Tags (séparer par ,)"
          className="text-xs mb-3"
        />
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (!title.trim()) return;
              onCreate({
                title: title.trim(),
                body: body.trim() || undefined,
                surface,
                priority,
                weight,
                revisitBy: revisitBy || undefined,
                tags: tagsStr
                  .split(/[,#]+/)
                  .map((t) => t.trim())
                  .filter(Boolean),
              });
            }}
          >
            Ouvrir
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  danger,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div
      className="rounded-xl border p-3"
      style={{
        backgroundColor: "var(--psych-card)",
        borderColor: "var(--psych-border)",
      }}
    >
      <div
        className="text-[10px] uppercase tracking-wider"
        style={{ color: "var(--psych-muted)" }}
      >
        {label}
      </div>
      <div
        className="text-xl font-semibold"
        style={{ color: danger && value > 0 ? "#9F1239" : "var(--psych-text)" }}
      >
        {value}
      </div>
    </div>
  );
}
