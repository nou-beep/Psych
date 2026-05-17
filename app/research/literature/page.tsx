"use client";
// Literature desk — reading list backed by the real references catalogue
// for the thesis "Dépersonnalisation, anxiété et dépression".

import { useEffect, useMemo, useState } from "react";
import { BookOpen, ExternalLink, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import {
  LITERATURE_STORAGE_KEY,
  searchLiterature,
  type LiteratureItem,
  type ReadingStatus,
} from "@/lib/research/literature";
import { buildLiteratureSeed } from "@/lib/research/real-references";

const STATUS_LABELS: Record<ReadingStatus, string> = {
  "to-read": "À lire",
  reading: "En cours",
  skimmed: "Parcouru",
  read: "Lu",
  archived: "Archivé",
};

export default function LiteratureDeskPage() {
  const [items, setItems] = useState<LiteratureItem[]>([]);
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = loadFromStorage<LiteratureItem[]>(LITERATURE_STORAGE_KEY, []);
      if (Array.isArray(stored) && stored.length > 0) {
        setItems(stored);
      } else {
        const seed = buildLiteratureSeed();
        setItems(seed);
        saveToStorage(LITERATURE_STORAGE_KEY, seed);
      }
    } catch {
      setItems(buildLiteratureSeed());
    }
    setReady(true);
  }, []);

  function persist(next: LiteratureItem[]) {
    setItems(next);
    saveToStorage(LITERATURE_STORAGE_KEY, next);
  }

  function updateStatus(id: string, status: ReadingStatus) {
    persist(
      items.map((i) =>
        i.id === id ? { ...i, status, updatedAt: new Date().toISOString() } : i
      )
    );
  }

  function reseed() {
    if (
      !confirm(
        "Réinitialiser la liste à partir des références réelles ? Vos statuts de lecture seront perdus."
      )
    ) {
      return;
    }
    const seed = buildLiteratureSeed();
    persist(seed);
  }

  const filtered = useMemo(
    () => searchLiterature(items, query),
    [items, query]
  );

  const byChapter = useMemo(() => {
    const out: Record<string, LiteratureItem[]> = {};
    for (const i of filtered) {
      for (const c of i.linkedChapters) {
        if (!out[c]) out[c] = [];
        out[c].push(i);
      }
    }
    return out;
  }, [filtered]);

  if (!ready) {
    return (
      <div
        className="max-w-5xl mx-auto py-12 text-sm text-center"
        style={{ color: "var(--psych-muted)" }}
      >
        Chargement de la bibliographie…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in" data-section="research">
      <PageHeader
        title="Literature desk"
        subtitle="Bibliographie réelle (Sierra, Medford, Phillips, Porges, Roth, Schilder, Minkowski, Levis & al., Mansell, Michal). DOIs non fabriqués — chaque entrée est marquée « à vérifier »."
        action={
          <Button size="sm" variant="secondary" onClick={reseed}>
            Réinitialiser le seed
          </Button>
        }
      />

      <div
        className="rounded-xl border p-3 mb-4 flex items-start gap-3"
        style={{
          background: "var(--psych-bg)",
          borderColor: "var(--psych-border)",
        }}
      >
        <AlertTriangle size={14} style={{ color: "var(--psych-accent)" }} />
        <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
          Aucun DOI n&apos;a été inventé. Chaque référence porte un drapeau
          <strong> « à vérifier »</strong> : confirmer la citation exacte, la
          pagination et le DOI auprès des sources avant publication.
        </p>
      </div>

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filtrer par auteur, thème, mot-clé…"
        className="mb-4"
      />

      <div className="space-y-3">
        {filtered.map((item) => (
          <SectionCard key={item.id} title={item.title} description={item.authors}>
            <div className="text-xs space-y-2" style={{ color: "var(--psych-text)" }}>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "var(--psych-primary-light)",
                    color: "var(--psych-primary)",
                  }}
                >
                  {item.year}
                </span>
                {item.themes.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-1.5 py-0.5 rounded-full border"
                    style={{
                      borderColor: "var(--psych-border)",
                      color: "var(--psych-muted)",
                    }}
                  >
                    {t}
                  </span>
                ))}
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto"
                  style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
                  title="À vérifier — citation à confirmer"
                >
                  à vérifier
                </span>
              </div>

              <p
                className="italic"
                style={{ color: "var(--psych-muted)", lineHeight: 1.5 }}
              >
                {item.citation}
              </p>

              <p>{item.summary}</p>

              <div className="flex items-center gap-2 pt-1">
                <label
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: "var(--psych-muted)" }}
                >
                  Statut
                </label>
                <select
                  value={item.status}
                  onChange={(e) =>
                    updateStatus(item.id, e.target.value as ReadingStatus)
                  }
                  className="text-xs px-2 py-1 rounded-md border"
                  style={{
                    borderColor: "var(--psych-border)",
                    backgroundColor: "var(--psych-card)",
                    color: "var(--psych-text)",
                  }}
                >
                  {(
                    [
                      "to-read",
                      "reading",
                      "skimmed",
                      "read",
                      "archived",
                    ] as ReadingStatus[]
                  ).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <span
                  className="text-[10px] ml-auto"
                  style={{ color: "var(--psych-muted)" }}
                >
                  Chapitres : {item.linkedChapters.join(", ")}
                </span>
              </div>
            </div>
          </SectionCard>
        ))}
        {filtered.length === 0 && (
          <p
            className="text-center text-sm py-12"
            style={{ color: "var(--psych-muted)" }}
          >
            <BookOpen size={20} className="mx-auto mb-2 opacity-60" />
            Aucune référence ne correspond à la requête.
          </p>
        )}
      </div>

      <SectionCard
        title="Index par chapitre"
        description="Liens entre les références et les chapitres de la thèse."
        className="mt-6"
      >
        <ul className="space-y-2 text-xs">
          {Object.entries(byChapter)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([chapter, refs]) => (
              <li key={chapter}>
                <div
                  className="font-semibold mb-0.5"
                  style={{ color: "var(--psych-text)" }}
                >
                  {chapter}
                </div>
                <ul
                  className="ml-3 space-y-0.5"
                  style={{ color: "var(--psych-muted)" }}
                >
                  {refs.map((r) => (
                    <li key={r.id} className="flex items-center gap-2">
                      <ExternalLink size={9} />
                      {r.authors} ({r.year})
                    </li>
                  ))}
                </ul>
              </li>
            ))}
        </ul>
      </SectionCard>
    </div>
  );
}
