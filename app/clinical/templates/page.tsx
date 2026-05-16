"use client";
// Clinical note templates — 5 French templates with formal-phrase
// suggestions per section.

import { useState } from "react";
import { Copy, Printer } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";
import {
  CLINICAL_NOTE_TEMPLATES,
  FORMAL_PHRASES_FR,
  findTemplate,
} from "@/lib/clinical/note-templates";

export default function ClinicalTemplatesPage() {
  const { toast } = useToast();
  const [activeId, setActiveId] = useState(CLINICAL_NOTE_TEMPLATES[0].id);
  const template = findTemplate(activeId);

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => toast("Copié", "success"));
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Modèles cliniques"
        subtitle="Modèles structurés en français pour observation, compte rendu, synthèse, bilan et supervision."
        action={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => window.print()}
          >
            <Printer size={13} /> Imprimer
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Catalogue */}
        <SectionCard title="Modèles" className="md:col-span-1">
          <ul className="space-y-1">
            {CLINICAL_NOTE_TEMPLATES.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setActiveId(t.id)}
                  className="w-full text-left p-2 rounded-md"
                  style={{
                    background:
                      activeId === t.id
                        ? "var(--psych-primary-light)"
                        : "transparent",
                    color: "var(--psych-text)",
                  }}
                >
                  <div className="text-sm font-medium">{t.title}</div>
                  <div
                    className="text-[10px]"
                    style={{ color: "var(--psych-muted)" }}
                  >
                    {t.sections.length} sections
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Active template */}
        <div className="md:col-span-2">
          {template && (
            <article className="paper-card" data-state="draft">
              <div
                className="text-[10px] uppercase tracking-wider"
                style={{ color: "var(--psych-muted)" }}
              >
                Modèle clinique · {template.language.toUpperCase()}
              </div>
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--psych-text)" }}
              >
                {template.title}
              </h2>
              <p
                className="text-sm mt-1 mb-4"
                style={{ color: "var(--psych-muted)" }}
              >
                {template.description}
              </p>

              <div className="space-y-4">
                {template.sections.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-md border p-3"
                    style={{ borderColor: "var(--psych-border)" }}
                  >
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: "var(--psych-text)" }}
                    >
                      {s.heading}
                    </h3>
                    {s.hint && (
                      <p
                        className="text-[11px] mt-1"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        {s.hint}
                      </p>
                    )}
                    {s.suggestedPhrases && (
                      <div className="mt-2">
                        <div
                          className="text-[10px] uppercase tracking-wider mb-1"
                          style={{ color: "var(--psych-muted)" }}
                        >
                          Phrases suggérées
                        </div>
                        <ul className="space-y-1">
                          {s.suggestedPhrases.map((p) => (
                            <li
                              key={p}
                              className="flex items-center gap-2 text-xs"
                              style={{ color: "var(--psych-text)" }}
                            >
                              <span
                                className="annot-pin flex-1"
                                style={{ fontStyle: "italic" }}
                              >
                                {p}
                              </span>
                              <button
                                onClick={() => copy(p)}
                                className="opacity-60 hover:opacity-100 print:hidden"
                                aria-label="Copier la phrase"
                                style={{ color: "var(--psych-accent)" }}
                              >
                                <Copy size={11} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <p
                className="text-[11px] mt-4 italic"
                style={{ color: "var(--psych-muted)" }}
              >
                Modèle éditable. Les phrases formelles ci-dessus sont
                délibérément neutres et prudentes — à adapter au cas.
              </p>
            </article>
          )}

          <SectionCard
            title="Bibliothèque de phrases formelles"
            description="Les phrases ci-dessous sont réutilisables. Cliquer pour copier."
            className="mt-4"
          >
            <ul className="space-y-1">
              {FORMAL_PHRASES_FR.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm">
                  <span style={{ color: "var(--psych-text)" }} className="flex-1">
                    {p}
                  </span>
                  <button
                    onClick={() => copy(p)}
                    className="opacity-60 hover:opacity-100"
                    aria-label="Copier"
                    style={{ color: "var(--psych-accent)" }}
                  >
                    <Copy size={12} />
                  </button>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
