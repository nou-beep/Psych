"use client";
// Article library — PDF article records. We do NOT auto-extract
// metadata (no fabrication). The UI accepts PDF uploads, soft-parses
// the filename, stores the record, and prompts manual verification.
// The actual PDF is held in browser memory only for the current
// session (a future migration can stash the file via FileSystem API).

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Upload,
  Search,
  Star,
  Highlighter,
  StickyNote,
  AlertTriangle,
  Trash2,
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
  ARTICLE_LIBRARY_STORAGE_KEY,
  READING_STATUS_LABELS,
  addHighlight,
  addStickyNote,
  articlesByChapter,
  guessFromFilename,
  newArticleRecord,
  patchArticle,
  searchArticles,
  type ArticleRecord,
  type ReadingStatus,
} from "@/lib/research/article-library";
import {
  formatBibliography,
  parseAuthorString,
  type ArticleType,
} from "@/lib/research/apa";
import { REAL_CHAPTER_OUTLINE } from "@/lib/thesis/real-seed";
import { useRecordVisit } from "@/components/shared/useRecordVisit";

const HIGHLIGHT_COLORS: Array<"yellow" | "blue" | "green" | "pink" | "violet"> = [
  "yellow",
  "blue",
  "green",
  "pink",
  "violet",
];
const COLOR_BG: Record<string, string> = {
  yellow: "#FEF3C7",
  blue: "#DBEAFE",
  green: "#DCFCE7",
  pink: "#FCE7F3",
  violet: "#EDE9FE",
};

export default function ArticleLibraryPage() {
  const { toast } = useToast();
  const [list, setList] = useState<ArticleRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  // Local-only blob URLs for the current session; not persisted.
  const [blobs, setBlobs] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const stored = loadFromStorage<ArticleRecord[]>(
        ARTICLE_LIBRARY_STORAGE_KEY,
        []
      );
      setList(Array.isArray(stored) ? stored : []);
    } catch {
      setList([]);
    }
  }, []);

  function persist(next: ArticleRecord[]) {
    setList(next);
    saveToStorage(ARTICLE_LIBRARY_STORAGE_KEY, next);
  }

  function onFiles(files: FileList | null) {
    if (!files) return;
    const additions: ArticleRecord[] = [];
    const blobMap: Record<string, string> = { ...blobs };
    for (const f of Array.from(files)) {
      const guess = guessFromFilename(f.name);
      const rec = newArticleRecord({
        fileName: f.name,
        fileSize: f.size,
        title: guess.title,
        year: guess.year,
        authors: guess.authorGuess
          ? parseAuthorString(guess.authorGuess)
          : [],
      });
      additions.push(rec);
      try {
        blobMap[rec.id] = URL.createObjectURL(f);
      } catch {
        // ignore (e.g., headless test)
      }
    }
    setBlobs(blobMap);
    persist([...additions, ...list]);
    if (additions.length > 0) {
      setActiveId(additions[0].id);
      toast(
        `${additions.length} article(s) importé(s). Métadonnées à vérifier manuellement.`,
        "info"
      );
    }
  }

  const visible = useMemo(() => searchArticles(list, query), [list, query]);
  const active = useMemo(
    () => visible.find((a) => a.id === activeId) ?? null,
    [visible, activeId]
  );

  useRecordVisit({
    id: active?.id ?? "",
    kind: "article",
    label: active?.title ?? "Article",
    href: "/research/articles",
    disabled: !active,
  });

  return (
    <div className="max-w-7xl mx-auto animate-fade-in" data-section="research">
      <PageHeader
        title="Article library"
        subtitle="PDF académiques importés manuellement. Métadonnées à confirmer — aucune extraction n&apos;invente de données."
        action={
          <Button size="sm" onClick={() => fileInput.current?.click()}>
            <Upload size={12} /> Importer un PDF
          </Button>
        }
      />
      <input
        ref={fileInput}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
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
          Eyla ne tente pas d&apos;extraire automatiquement les métadonnées des
          PDF. Confirmer manuellement <strong>titre, auteurs, année, journal et DOI</strong>{" "}
          avant toute citation. Les fichiers téléversés ne sont gardés que
          pour la session courante (pas de stockage persistant des PDF).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Catalogue */}
        <SectionCard title="Catalogue" className="md:col-span-1">
          <div className="relative mb-2">
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
          <ul className="space-y-1 max-h-[520px] overflow-y-auto">
            {visible.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => setActiveId(a.id)}
                  className="w-full text-left p-2 rounded-md"
                  style={{
                    backgroundColor:
                      activeId === a.id
                        ? "var(--psych-primary-light)"
                        : "transparent",
                    color: "var(--psych-text)",
                  }}
                >
                  <div className="text-xs font-medium flex items-center gap-1">
                    {a.favorite && (
                      <Star size={9} style={{ color: "#F59E0B" }} />
                    )}
                    <span className="truncate flex-1">{a.title}</span>
                    {a.metadataIncomplete && (
                      <span
                        className="text-[9px] px-1 rounded-full"
                        style={{
                          backgroundColor: "#FEF3C7",
                          color: "#92400E",
                        }}
                        title="Métadonnées à vérifier"
                      >
                        !
                      </span>
                    )}
                  </div>
                  <div
                    className="text-[10px]"
                    style={{ color: "var(--psych-muted)" }}
                  >
                    {a.authors
                      .slice(0, 2)
                      .map((au) => au.family)
                      .join(", ") || "Auteurs ?"}{" "}
                    {a.year ? `(${a.year})` : ""}
                  </div>
                </button>
              </li>
            ))}
            {visible.length === 0 && (
              <li
                className="text-xs text-center py-6"
                style={{ color: "var(--psych-muted)" }}
              >
                <BookOpen size={16} className="mx-auto mb-1 opacity-50" />
                Aucun article. Importer un PDF pour commencer.
              </li>
            )}
          </ul>
        </SectionCard>

        {/* Active article editor */}
        <div className="md:col-span-2 space-y-4">
          {!active ? (
            <SectionCard title="Aucun article sélectionné">
              <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
                Importer ou sélectionner un PDF pour éditer ses métadonnées,
                surligner des passages et lier l&apos;article à des chapitres.
              </p>
            </SectionCard>
          ) : (
            <ArticleEditor
              article={active}
              blobUrl={blobs[active.id]}
              onPatch={(p) => persist(patchArticle(list, active.id, p))}
              onAddHighlight={(h) => persist(addHighlight(list, active.id, h))}
              onAddSticky={(body, page) =>
                persist(addStickyNote(list, active.id, body, page))
              }
              onDelete={() => {
                if (!confirm("Supprimer cet article ?")) return;
                persist(list.filter((a) => a.id !== active.id));
                setActiveId(null);
              }}
            />
          )}
        </div>
      </div>

      <SectionCard
        title="Par chapitre"
        description="Articles liés aux chapitres de la thèse."
        className="mt-6"
      >
        <ul className="space-y-2 text-xs">
          {Object.entries(articlesByChapter(list))
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([chapter, refs]) => {
              const label =
                REAL_CHAPTER_OUTLINE.find((c) => c.id === chapter)?.label ??
                chapter;
              return (
                <li key={chapter}>
                  <div
                    className="font-semibold"
                    style={{ color: "var(--psych-text)" }}
                  >
                    {label}
                  </div>
                  <ul
                    className="ml-3"
                    style={{ color: "var(--psych-muted)" }}
                  >
                    {refs.map((r) => (
                      <li key={r.id}>
                        ·{" "}
                        {r.authors[0]?.family ?? "?"}
                        {r.year ? ` (${r.year})` : ""} — {r.title}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          {Object.keys(articlesByChapter(list)).length === 0 && (
            <li style={{ color: "var(--psych-muted)" }}>
              Aucun lien article-chapitre pour le moment.
            </li>
          )}
        </ul>
      </SectionCard>
    </div>
  );
}

function ArticleEditor({
  article,
  blobUrl,
  onPatch,
  onAddHighlight,
  onAddSticky,
  onDelete,
}: {
  article: ArticleRecord;
  blobUrl?: string;
  onPatch: (p: Partial<ArticleRecord>) => void;
  onAddHighlight: (h: {
    page?: string;
    text: string;
    color: "yellow" | "blue" | "green" | "pink" | "violet";
    note?: string;
    linkedChapters: string[];
    linkedQuoteIds: string[];
    linkedThemes: string[];
  }) => void;
  onAddSticky: (body: string, page?: string) => void;
  onDelete: () => void;
}) {
  const [highlightText, setHighlightText] = useState("");
  const [highlightPage, setHighlightPage] = useState("");
  const [highlightColor, setHighlightColor] =
    useState<"yellow" | "blue" | "green" | "pink" | "violet">("yellow");
  const [stickyBody, setStickyBody] = useState("");
  const [authorsRaw, setAuthorsRaw] = useState(
    article.authors
      .map((a) =>
        a.given ? `${a.family}, ${a.given}` : a.family
      )
      .join("; ")
  );

  const bib = formatBibliography({
    type: article.type,
    authors: article.authors,
    year: article.year,
    title: article.title,
    journal: article.journal,
    volume: article.volume,
    issue: article.issue,
    pages: article.pages,
    doi: article.doi,
    url: article.url,
    publisher: article.publisher,
  });

  return (
    <>
      <SectionCard
        title={article.title || "Untitled article"}
        description={article.metadataIncomplete ? "Métadonnées incomplètes." : undefined}
        headerAction={
          <button
            onClick={onDelete}
            className="text-xs opacity-60 hover:opacity-100"
            style={{ color: "var(--psych-muted)" }}
            aria-label="Supprimer"
          >
            <Trash2 size={12} />
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Input
            value={article.title}
            onChange={(e) => onPatch({ title: e.target.value })}
            placeholder="Titre"
          />
          <Input
            type="number"
            value={article.year ?? ""}
            onChange={(e) =>
              onPatch({
                year: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="Année"
          />
          <Textarea
            value={authorsRaw}
            onChange={(e) => {
              setAuthorsRaw(e.target.value);
              onPatch({ authors: parseAuthorString(e.target.value) });
            }}
            placeholder="Auteurs (Last, F.; Last, F.)"
            className="md:col-span-2 text-sm"
          />
          <Input
            value={article.journal ?? ""}
            onChange={(e) => onPatch({ journal: e.target.value })}
            placeholder="Journal"
          />
          <Input
            value={article.publisher ?? ""}
            onChange={(e) => onPatch({ publisher: e.target.value })}
            placeholder="Publisher (livres)"
          />
          <Input
            value={article.doi ?? ""}
            onChange={(e) => onPatch({ doi: e.target.value })}
            placeholder="DOI (ne pas inventer)"
          />
          <Input
            value={article.url ?? ""}
            onChange={(e) => onPatch({ url: e.target.value })}
            placeholder="URL"
          />
          <Select
            value={article.type}
            onChange={(e) =>
              onPatch({ type: e.target.value as ArticleType })
            }
          >
            <option value="journal-article">Journal article</option>
            <option value="book">Book</option>
            <option value="book-chapter">Book chapter</option>
            <option value="thesis">Thesis</option>
            <option value="report">Report</option>
            <option value="conference-paper">Conference paper</option>
            <option value="webpage">Webpage</option>
          </Select>
          <Select
            value={article.status}
            onChange={(e) =>
              onPatch({ status: e.target.value as ReadingStatus })
            }
          >
            {Object.entries(READING_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <label className="text-xs inline-flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={article.favorite}
              onChange={(e) => onPatch({ favorite: e.target.checked })}
            />
            Favori
          </label>
          <Textarea
            value={article.abstract ?? ""}
            onChange={(e) => onPatch({ abstract: e.target.value })}
            placeholder="Abstract / notes générales"
            className="flex-1 text-sm"
          />
        </div>
        <div
          className="mt-3 p-3 rounded-md border text-sm"
          style={{
            borderColor: "var(--psych-border)",
            backgroundColor: "var(--psych-bg)",
            fontFamily: "Georgia, serif",
          }}
          dangerouslySetInnerHTML={{
            __html: bib.replace(/\*([^*]+)\*/g, "<em>$1</em>"),
          }}
        />
      </SectionCard>

      {blobUrl && (
        <SectionCard title="Lecture (session courante)">
          <object
            data={blobUrl}
            type="application/pdf"
            className="w-full"
            style={{ height: 480 }}
          >
            <p
              className="text-xs"
              style={{ color: "var(--psych-muted)" }}
            >
              Le navigateur ne peut pas prévisualiser ce PDF. <a href={blobUrl} target="_blank" rel="noopener">Ouvrir dans un nouvel onglet</a>.
            </p>
          </object>
        </SectionCard>
      )}

      <SectionCard
        title="Highlights"
        description="Surlignages extraits manuellement du PDF."
      >
        <div className="space-y-2 mb-2">
          <Textarea
            value={highlightText}
            onChange={(e) => setHighlightText(e.target.value)}
            placeholder="Coller le passage exact à surligner…"
            className="text-sm"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              value={highlightPage}
              onChange={(e) => setHighlightPage(e.target.value)}
              placeholder="Page (ex. 145 ou 145-146)"
              className="text-xs w-32"
            />
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setHighlightColor(c)}
                className="w-5 h-5 rounded-full border"
                aria-label={c}
                style={{
                  backgroundColor: COLOR_BG[c],
                  borderColor:
                    highlightColor === c ? "var(--psych-primary)" : "var(--psych-border)",
                  borderWidth: highlightColor === c ? 2 : 1,
                }}
              />
            ))}
            <Button
              size="sm"
              onClick={() => {
                if (!highlightText.trim()) return;
                onAddHighlight({
                  text: highlightText.trim(),
                  page: highlightPage || undefined,
                  color: highlightColor,
                  linkedChapters: [],
                  linkedQuoteIds: [],
                  linkedThemes: [],
                });
                setHighlightText("");
                setHighlightPage("");
              }}
            >
              <Highlighter size={11} /> Ajouter
            </Button>
          </div>
        </div>
        <ul className="space-y-1">
          {article.highlights.map((h) => (
            <li
              key={h.id}
              className="rounded-md p-2 text-xs"
              style={{
                backgroundColor: COLOR_BG[h.color],
                color: "#1F2937",
              }}
            >
              <p>{h.text}</p>
              {h.page && (
                <p className="text-[10px] mt-1 opacity-70">p. {h.page}</p>
              )}
            </li>
          ))}
          {article.highlights.length === 0 && (
            <li
              className="text-xs"
              style={{ color: "var(--psych-muted)" }}
            >
              Aucun surlignage pour le moment.
            </li>
          )}
        </ul>
      </SectionCard>

      <SectionCard title="Sticky notes">
        <div className="flex items-end gap-2 mb-2">
          <Textarea
            value={stickyBody}
            onChange={(e) => setStickyBody(e.target.value)}
            placeholder="Note dans la marge…"
            className="text-sm flex-1"
          />
          <Button
            size="sm"
            onClick={() => {
              if (!stickyBody.trim()) return;
              onAddSticky(stickyBody.trim());
              setStickyBody("");
            }}
          >
            <StickyNote size={11} /> Ajouter
          </Button>
        </div>
        <ul className="space-y-1">
          {article.stickyNotes.map((s) => (
            <li
              key={s.id}
              className="rounded-md p-2 text-xs"
              style={{
                backgroundColor: "#FEF3C7",
                color: "#1F2937",
              }}
            >
              {s.body}
              {s.page && (
                <span
                  className="text-[10px] ml-2 opacity-70"
                >
                  · p. {s.page}
                </span>
              )}
            </li>
          ))}
        </ul>
      </SectionCard>
    </>
  );
}
