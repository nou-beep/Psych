"use client";
// Quick Capture inbox — where every quick capture lands until the
// therapist/researcher processes it: link it, move it to a worksheet,
// promote to a hypothesis, archive, etc.

import { useEffect, useMemo, useState } from "react";
import { Inbox, Pin, Archive, Check, Trash2, Search, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/Toast";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import {
  CAPTURE_KIND_LABELS,
  CAPTURE_KINDS,
  QUICK_CAPTURE_STORAGE_KEY,
  archiveCapture,
  captureStats,
  pinCapture,
  processCapture,
  removeCapture,
  restoreCapture,
  searchCaptures,
  type CaptureKind,
  type CaptureNote,
  type CaptureStatus,
} from "@/lib/workspace/quick-capture";

const COLOR_BG: Record<string, string> = {
  default: "var(--psych-card)",
  amber: "#FEF3C7",
  rose: "#FFE4E6",
  violet: "#EDE9FE",
  teal: "#CCFBF1",
  slate: "#E2E8F0",
};

export default function InboxPage() {
  const [list, setList] = useState<CaptureNote[]>([]);
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | CaptureKind>("all");
  const [status, setStatus] = useState<CaptureStatus>("inbox");
  const { toast } = useToast();

  useEffect(() => {
    try {
      const stored = loadFromStorage<CaptureNote[]>(
        QUICK_CAPTURE_STORAGE_KEY,
        []
      );
      setList(Array.isArray(stored) ? stored : []);
    } catch {
      setList([]);
    }
  }, []);

  function persist(next: CaptureNote[]) {
    setList(next);
    saveToStorage(QUICK_CAPTURE_STORAGE_KEY, next);
  }

  const visible = useMemo(() => {
    let v = list.filter((c) => c.status === status);
    if (kindFilter !== "all") v = v.filter((c) => c.kind === kindFilter);
    v = searchCaptures(v, query);
    return v.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [list, status, kindFilter, query]);

  const stats = useMemo(() => captureStats(list), [list]);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Inbox"
        subtitle="Captures rapides en attente de traitement. Inbox-zero pour les pensées cliniques et de recherche."
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
        <StatCard label="Inbox" value={stats.inbox} />
        <StatCard label="Pinned" value={stats.pinned} />
        <StatCard label="Processed" value={stats.processed} />
        <StatCard label="Archived" value={stats.archived} />
        <StatCard label="Total" value={stats.total} />
      </div>

      <SectionCard title="Filters" className="mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
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
            value={kindFilter}
            onChange={(e) =>
              setKindFilter(e.target.value as "all" | CaptureKind)
            }
            className="text-xs"
          >
            <option value="all">Tous types</option>
            {CAPTURE_KINDS.map((k) => (
              <option key={k} value={k}>
                {CAPTURE_KIND_LABELS[k]}
              </option>
            ))}
          </Select>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as CaptureStatus)}
            className="text-xs"
          >
            <option value="inbox">Inbox</option>
            <option value="processed">Processed</option>
            <option value="archived">Archived</option>
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
            <Inbox size={22} className="mx-auto mb-2 opacity-50" />
            {status === "inbox"
              ? "Inbox vide. Ctrl+Shift+. ou le bouton Capture en bas pour ajouter."
              : `Aucun élément ${status === "processed" ? "traité" : "archivé"}.`}
          </div>
        ) : (
          visible.map((c) => (
            <article
              key={c.id}
              className="rounded-xl border p-3 shadow-sm relative"
              style={{
                backgroundColor: COLOR_BG[c.color] ?? "var(--psych-card)",
                borderColor: "var(--psych-border)",
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: "var(--psych-primary-light)",
                    color: "var(--psych-primary)",
                  }}
                >
                  {CAPTURE_KIND_LABELS[c.kind]}
                </span>
                {c.pinned && (
                  <Pin
                    size={10}
                    style={{ color: "var(--psych-primary)" }}
                    title="Épinglé"
                  />
                )}
                <span
                  className="text-[10px] ml-auto"
                  style={{ color: "var(--psych-muted)" }}
                >
                  {new Date(c.createdAt).toLocaleString()}
                </span>
              </div>
              <p
                className="text-sm whitespace-pre-wrap"
                style={{ color: "var(--psych-text)", lineHeight: 1.55 }}
              >
                {c.body}
              </p>
              {(c.tags.length > 0 || c.source) && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {c.tags.map((t) => (
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
                  {c.source && (
                    <span
                      className="text-[9px] ml-auto italic"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      from {c.source}
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-1 mt-2 pt-2 border-t" style={{ borderColor: "var(--psych-border)" }}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => persist(pinCapture(list, c.id, !c.pinned))}
                  title={c.pinned ? "Détacher" : "Épingler"}
                >
                  <Pin size={11} />
                </Button>
                {c.status === "inbox" ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        persist(processCapture(list, c.id));
                        toast("Marqué comme traité.", "success");
                      }}
                    >
                      <Check size={11} /> Traité
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => persist(archiveCapture(list, c.id))}
                    >
                      <Archive size={11} /> Archiver
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => persist(restoreCapture(list, c.id))}
                  >
                    <RotateCcw size={11} /> Restore
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto"
                  onClick={() => {
                    if (!confirm("Supprimer définitivement cette capture ?"))
                      return;
                    persist(removeCapture(list, c.id));
                  }}
                >
                  <Trash2 size={11} />
                </Button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
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
        style={{ color: "var(--psych-text)" }}
      >
        {value}
      </div>
    </div>
  );
}
