"use client";
// APA 7 reference builder — deterministic, no fabrication. Renders
// parenthetical, narrative, and full bibliography entries live as the
// user fills in the fields.

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/Toast";
import {
  formatBibliography,
  inTextNarrative,
  inTextParenthetical,
  parseAuthorString,
  validateApaInput,
  type ApaCitationInput,
  type ArticleType,
  type AuthorName,
} from "@/lib/research/apa";

const TYPE_LABELS: Record<ArticleType, string> = {
  "journal-article": "Journal article",
  book: "Book",
  "book-chapter": "Book chapter",
  "edited-book": "Edited book",
  thesis: "Thesis / dissertation",
  report: "Report",
  "conference-paper": "Conference paper",
  webpage: "Webpage",
};

export default function ApaBuilderPage() {
  const { toast } = useToast();
  const [type, setType] = useState<ArticleType>("journal-article");
  const [authorsRaw, setAuthorsRaw] = useState("Sierra, M., & Berrios, G. E.");
  const [year, setYear] = useState<string>("1998");
  const [title, setTitle] = useState(
    "Depersonalization: neurobiological perspectives"
  );
  const [journal, setJournal] = useState("Biological Psychiatry");
  const [volume, setVolume] = useState("44");
  const [issue, setIssue] = useState("9");
  const [pages, setPages] = useState("898-908");
  const [doi, setDoi] = useState("");
  const [url, setUrl] = useState("");
  const [publisher, setPublisher] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [editorsRaw, setEditorsRaw] = useState("");
  const [edition, setEdition] = useState("");
  const [institution, setInstitution] = useState("");

  const authors = useMemo<AuthorName[]>(
    () => parseAuthorString(authorsRaw),
    [authorsRaw]
  );
  const editors = useMemo<AuthorName[]>(
    () => parseAuthorString(editorsRaw),
    [editorsRaw]
  );

  const input: ApaCitationInput = useMemo(
    () => ({
      type,
      authors,
      year: year ? Number(year) : undefined,
      title,
      journal: journal || undefined,
      volume: volume || undefined,
      issue: issue || undefined,
      pages: pages || undefined,
      doi: doi || undefined,
      url: url || undefined,
      publisher: publisher || undefined,
      bookTitle: bookTitle || undefined,
      editors: editors.length ? editors : undefined,
      edition: edition || undefined,
      thesisInstitution: institution || undefined,
    }),
    [
      type,
      authors,
      year,
      title,
      journal,
      volume,
      issue,
      pages,
      doi,
      url,
      publisher,
      bookTitle,
      editors,
      edition,
      institution,
    ]
  );

  const bibliography = formatBibliography(input);
  const inText = inTextParenthetical(authors, input.year);
  const narrative = inTextNarrative(authors, input.year);
  const issues = validateApaInput(input);

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() =>
      toast(`${label} copié.`, "success")
    );
  }

  // Convert "*italic*" markers from formatBibliography into <em>.
  const bibHtml = bibliography.replace(
    /\*([^*]+)\*/g,
    (_m, inner) => `<em>${inner}</em>`
  );

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="APA reference builder"
        subtitle="APA 7e édition. Génération déterministe — rien n'est inventé. Saisir manuellement les champs ; les manques sont signalés."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Source">
          <div className="space-y-2">
            <label className="text-xs" style={{ color: "var(--psych-muted)" }}>
              Type
            </label>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as ArticleType)}
            >
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>

            <label className="text-xs" style={{ color: "var(--psych-muted)" }}>
              Authors — “Last, F. M., & Last, F. M.” or “Last, F.; Last, F.”
            </label>
            <Textarea
              value={authorsRaw}
              onChange={(e) => setAuthorsRaw(e.target.value)}
              className="text-sm"
            />

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs" style={{ color: "var(--psych-muted)" }}>
                  Year
                </label>
                <Input
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="1998"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs" style={{ color: "var(--psych-muted)" }}>
                  Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            {type === "journal-article" && (
              <div className="space-y-2">
                <label className="text-xs" style={{ color: "var(--psych-muted)" }}>
                  Journal
                </label>
                <Input
                  value={journal}
                  onChange={(e) => setJournal(e.target.value)}
                />
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    placeholder="Volume"
                  />
                  <Input
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder="Issue"
                  />
                  <Input
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    placeholder="Pages"
                  />
                </div>
                <Input
                  value={doi}
                  onChange={(e) => setDoi(e.target.value)}
                  placeholder="DOI (e.g. 10.1234/abc.def) — ne pas inventer"
                />
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="URL (si pas de DOI)"
                />
              </div>
            )}

            {(type === "book" || type === "edited-book") && (
              <>
                <Input
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="Publisher"
                />
                <Input
                  value={edition}
                  onChange={(e) => setEdition(e.target.value)}
                  placeholder="Edition (e.g. 2nd ed.)"
                />
              </>
            )}

            {type === "book-chapter" && (
              <>
                <label className="text-xs" style={{ color: "var(--psych-muted)" }}>
                  Editors
                </label>
                <Textarea
                  value={editorsRaw}
                  onChange={(e) => setEditorsRaw(e.target.value)}
                  className="text-sm"
                />
                <Input
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="Book title"
                />
                <Input
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  placeholder="Pages (e.g. 145-160)"
                />
                <Input
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="Publisher"
                />
              </>
            )}

            {type === "thesis" && (
              <Input
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Institution"
              />
            )}
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="In-text citation">
            <div className="space-y-2">
              <Row
                label="Parenthetical"
                value={inText}
                onCopy={() => copy(inText, "Parenthetical")}
              />
              <Row
                label="Narrative"
                value={narrative}
                onCopy={() => copy(narrative, "Narrative")}
              />
            </div>
          </SectionCard>

          <SectionCard title="Bibliography entry">
            <div
              className="rounded-md border p-3 text-sm leading-relaxed"
              style={{
                borderColor: "var(--psych-border)",
                backgroundColor: "var(--psych-bg)",
                color: "var(--psych-text)",
                fontFamily: "Georgia, serif",
              }}
            >
              <span dangerouslySetInnerHTML={{ __html: bibHtml }} />
            </div>
            <div className="flex justify-end mt-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  copy(
                    bibliography.replace(/\*/g, ""),
                    "Bibliography entry"
                  )
                }
              >
                <Copy size={11} /> Copier
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="Validation">
            {issues.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
                Aucun avertissement.
              </p>
            ) : (
              <ul className="space-y-1">
                {issues.map((i, idx) => (
                  <li
                    key={idx}
                    className="text-xs"
                    style={{
                      color:
                        i.severity === "error" ? "#9F1239" : "var(--psych-muted)",
                    }}
                  >
                    <strong>{i.severity === "error" ? "✗" : "!"}</strong>{" "}
                    {i.field}: {i.message}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="text-[10px] uppercase tracking-wider w-24"
        style={{ color: "var(--psych-muted)" }}
      >
        {label}
      </div>
      <code
        className="flex-1 text-xs rounded-md border px-2 py-1.5"
        style={{
          borderColor: "var(--psych-border)",
          backgroundColor: "var(--psych-bg)",
          color: "var(--psych-text)",
        }}
      >
        {value}
      </code>
      <button
        onClick={onCopy}
        className="opacity-60 hover:opacity-100"
        aria-label="Copier"
        style={{ color: "var(--psych-accent)" }}
      >
        <Copy size={11} />
      </button>
    </div>
  );
}
