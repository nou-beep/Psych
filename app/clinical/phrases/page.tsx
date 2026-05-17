"use client";
// Trilingual phrase library — clinical phrasings the clinician can copy
// into reports.

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/Toast";
import {
  CLINICAL_PHRASES,
  PHRASE_CATEGORY_LABELS,
  renderPhrase,
  searchPhrases,
  type Lang,
  type PhraseCategory,
} from "@/lib/clinical/phrases";

export default function PhrasesPage() {
  const { toast } = useToast();
  const [lang, setLang] = useState<Lang>("en");
  const [category, setCategory] = useState<PhraseCategory | "all">("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    let base = query ? searchPhrases(query, lang) : CLINICAL_PHRASES;
    if (category !== "all") base = base.filter((p) => p.category === category);
    return base;
  }, [query, lang, category]);

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => toast("Phrase copied", "success"));
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Phrase library"
        subtitle="Trilingual clinical phrasings (EN · FR · AR)"
      />

      <SectionCard title="Filter">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="ph-search">Search</Label>
            <Input
              id="ph-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Anxiety, grounding, follow-up…"
            />
          </div>
          <div>
            <Label htmlFor="ph-lang">Language</Label>
            <Select
              id="ph-lang"
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="ph-cat">Category</Label>
            <Select
              id="ph-cat"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as PhraseCategory | "all")
              }
            >
              <option value="all">All categories</option>
              {(Object.keys(PHRASE_CATEGORY_LABELS) as PhraseCategory[]).map((c) => (
                <option key={c} value={c}>
                  {PHRASE_CATEGORY_LABELS[c]}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title={`${visible.length} phrase(s)`}
        className="mt-4"
      >
        <ul className="space-y-2">
          {visible.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border p-3"
              style={{ borderColor: "var(--psych-border)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "var(--psych-primary-light)",
                        color: "var(--psych-accent)",
                      }}
                    >
                      {PHRASE_CATEGORY_LABELS[p.category]}
                    </span>
                    <span
                      className="text-[10px]"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      {p.topic}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.92rem",
                      color: "var(--psych-text)",
                      lineHeight: 1.55,
                      direction: lang === "ar" ? "rtl" : "ltr",
                      textAlign: lang === "ar" ? "right" : "left",
                    }}
                  >
                    {renderPhrase(p, lang)}
                  </p>
                </div>
                <button
                  onClick={() => copy(renderPhrase(p, lang))}
                  className="p-2 rounded-lg"
                  style={{ color: "var(--psych-accent)" }}
                  aria-label="Copy phrase"
                >
                  <Copy size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
