"use client";
// Thesis export packs — compose printable export bundles from the
// thesis seed, methodology sections, descriptive statistics, real
// references, and quote bank. Print-to-PDF via the browser.

import { useMemo, useState } from "react";
import { Printer, FileText, Check } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  EXPORT_PACKS,
  addSection,
  emptyComposed,
  findPack,
  tableOfContents,
  totalWordCount,
  type ComposedPack,
  type ExportPackId,
} from "@/lib/export/thesis-packs";
import {
  ANALYSIS_PLAN,
  METHODOLOGY_SECTIONS,
  REAL_CHAPTER_OUTLINE,
  REAL_CORRELATIONS,
  REAL_DESCRIPTIVES,
  REAL_THESIS_DESIGN,
  REGRESSION_FINDING,
  THESIS_FR_TITLE,
  THESIS_OWNER,
} from "@/lib/thesis/real-seed";
import { REAL_REFERENCES } from "@/lib/research/real-references";
import { formatBibliography } from "@/lib/research/apa";

export default function ThesisExportsPage() {
  const [packId, setPackId] = useState<ExportPackId>("methodology");
  const pack = findPack(packId);

  const composed: ComposedPack | null = useMemo(() => {
    if (!pack) return null;
    let c = emptyComposed(
      pack,
      THESIS_FR_TITLE,
      `${THESIS_OWNER.author} · ${THESIS_OWNER.supervisor} · ${THESIS_OWNER.academicYear}`
    );
    switch (pack.id) {
      case "methodology": {
        c = addSection(c, {
          id: "design",
          heading: "1. Plan de recherche",
          body: REAL_THESIS_DESIGN.methodology,
        });
        c = addSection(c, {
          id: "pop",
          heading: "2. Échantillon",
          body: REAL_THESIS_DESIGN.sampleDescription,
        });
        c = addSection(c, {
          id: "incl",
          heading: "3. Critères d'inclusion / exclusion",
          body: `Inclusion : ${REAL_THESIS_DESIGN.inclusionCriteria}\n\nExclusion : ${REAL_THESIS_DESIGN.exclusionCriteria}`,
        });
        c = addSection(c, {
          id: "hyp",
          heading: "4. Hypothèses",
          rows: REAL_THESIS_DESIGN.hypotheses.map((h, i) => ({
            label: `H${i + 1}`,
            value: h,
          })),
        });
        c = addSection(c, {
          id: "vars",
          heading: "5. Variables",
          rows: [
            ...REAL_THESIS_DESIGN.independentVariables.map((v) => ({
              label: "VI",
              value: v,
            })),
            ...REAL_THESIS_DESIGN.dependentVariables.map((v) => ({
              label: "VD",
              value: v,
            })),
            ...REAL_THESIS_DESIGN.controlVariables.map((v) => ({
              label: "Contrôle",
              value: v,
            })),
          ],
        });
        c = addSection(c, {
          id: "plan",
          heading: "6. Plan d'analyse statistique",
          rows: ANALYSIS_PLAN.map((a) => ({
            label: a.label,
            value: a.description,
          })),
        });
        c = addSection(c, {
          id: "subs",
          heading: "7. Sections méthodologiques détaillées",
          children: METHODOLOGY_SECTIONS.map((s) => ({
            id: `sub-${s}`,
            heading: s,
            body: "À compléter dans la version finale du chapitre méthodologie.",
          })),
        });
        c = addSection(c, {
          id: "ethics",
          heading: "8. Considérations éthiques",
          body: REAL_THESIS_DESIGN.ethicalConsiderations,
        });
        break;
      }
      case "literature-review": {
        c = addSection(c, {
          id: "intro",
          heading: "Introduction",
          body: "Synthèse de la littérature relative à la dépersonnalisation et à ses liens avec l'anxiété et la dépression.",
        });
        for (const chapter of REAL_CHAPTER_OUTLINE) {
          const refs = REAL_REFERENCES.filter((r) =>
            r.linkedChapters.includes(chapter.id)
          );
          if (refs.length === 0) continue;
          c = addSection(c, {
            id: chapter.id,
            heading: chapter.label,
            children: refs.map((r) => ({
              id: `${chapter.id}-${r.authors.slice(0, 12)}`,
              heading: `${r.authors} (${r.year})`,
              body: `${r.title}. ${r.relevance}`,
            })),
          });
        }
        break;
      }
      case "descriptive-statistics": {
        c = addSection(c, {
          id: "desc",
          heading: "1. Statistiques descriptives — protocole (n planifié = 50)",
          rows: REAL_DESCRIPTIVES.map((d) => ({
            label: `${d.acronym}`,
            value: `n planifié = ${d.plannedN} · étendue ${d.scoreRange}`,
            note: `${d.instrument} — ${d.status}`,
          })),
        });
        c = addSection(c, {
          id: "corr",
          heading: "2. Corrélations prévues (H1 & H2)",
          rows: REAL_CORRELATIONS.map((co) => ({
            label: `${co.hypothesis} : ${co.variableA} × ${co.variableB}`,
            value: `${co.test} · ${co.alphaThreshold}`,
            note: `Attendu : ${co.expected}. ${co.status}`,
          })),
        });
        c = addSection(c, {
          id: "reg",
          heading: "3. Régression linéaire multiple (H3)",
          body: `Variable dépendante : ${REGRESSION_FINDING.outcome}\nPrédicteurs : ${REGRESSION_FINDING.predictors.join(" · ")}\nCovariables : ${REGRESSION_FINDING.covariates.join(" · ")}\nMéthode : ${REGRESSION_FINDING.method}\n\nPostulats vérifiés : ${REGRESSION_FINDING.postulatesChecks.join(" ; ")}.\n\nAttendu : ${REGRESSION_FINDING.expected}\n\n${REGRESSION_FINDING.status}`,
        });
        break;
      }
      case "supervisor-review": {
        c = addSection(c, {
          id: "progress",
          heading: "1. Avancement",
          rows: REAL_CHAPTER_OUTLINE.map((ch) => ({
            label: ch.label,
            value: "Section éditable — voir Thesis writer.",
          })),
        });
        c = addSection(c, {
          id: "open",
          heading: "2. Questions ouvertes",
          body: "À compléter par le thésard avant la séance de supervision.",
        });
        c = addSection(c, {
          id: "hyp",
          heading: "3. Hypothèses en discussion",
          rows: REAL_THESIS_DESIGN.hypotheses.map((h, i) => ({
            label: `H${i + 1}`,
            value: h,
          })),
        });
        break;
      }
      case "progress-summary": {
        c = addSection(c, {
          id: "chapters",
          heading: "Avancement par chapitre",
          rows: REAL_CHAPTER_OUTLINE.map((ch) => ({
            label: ch.label,
            value: "Editable shell — see Thesis Writer.",
          })),
        });
        c = addSection(c, {
          id: "refs",
          heading: "Références collectées",
          rows: REAL_REFERENCES.map((r) => ({
            label: `${r.authors} (${r.year})`,
            value: r.title,
          })),
        });
        break;
      }
      case "thesis-chapter": {
        // Placeholder section — the actual chapter content is in the
        // Thesis Writer. The exported view points back to it.
        c = addSection(c, {
          id: "note",
          heading: "Chapter export",
          body: "Le contenu détaillé du chapitre vit dans Thesis Writer. Imprimer cette page pour une trame export-ready avec en-tête, pagination et bibliographie.",
        });
        break;
      }
      case "participant-summary":
      case "coding-summary":
      case "quote-collection":
      case "appendix":
      default: {
        c = addSection(c, {
          id: "todo",
          heading: pack.label,
          body: "Editable shell — feed in the relevant data once it has been imported. Ce pack est prêt à recevoir les contenus correspondants.",
        });
      }
    }

    if (pack.apaFormatting) {
      c = {
        ...c,
        bibliography: REAL_REFERENCES.map((r) =>
          formatBibliography({
            type: "journal-article",
            authors: [{ family: r.authors.split(",")[0]?.trim() ?? "", given: "" }],
            year: r.year,
            title: r.title,
          }).replace(/\*([^*]+)\*/g, "$1")
        ),
      };
    }

    return c;
  }, [pack, packId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-5xl mx-auto animate-fade-in" data-section="research">
      <PageHeader
        title="Thesis export packs"
        subtitle="Compose un export prêt à imprimer (PDF via navigateur). Données réelles de la thèse — aucune fabrication."
        action={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => window.print()}
          >
            <Printer size={12} /> Imprimer
          </Button>
        }
      />

      <SectionCard title="Pack" className="mb-4 print:hidden">
        <Select
          value={packId}
          onChange={(e) => setPackId(e.target.value as ExportPackId)}
          className="text-sm"
        >
          {EXPORT_PACKS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </Select>
        {pack && (
          <p
            className="text-xs mt-2"
            style={{ color: "var(--psych-muted)" }}
          >
            {pack.description}
          </p>
        )}
      </SectionCard>

      {composed && (
        <article className="paper-card" data-state="draft">
          <header className="mb-6 pb-4 border-b" style={{ borderColor: "var(--psych-border)" }}>
            <div
              className="text-[10px] uppercase tracking-wider"
              style={{ color: "var(--psych-muted)" }}
            >
              {composed.pack.label} · {totalWordCount(composed)} mots
            </div>
            <h1
              className="text-xl font-semibold"
              style={{
                color: "var(--psych-text)",
                fontFamily: "Georgia, serif",
              }}
            >
              {composed.documentTitle}
            </h1>
            {composed.authorLine && (
              <p
                className="text-xs mt-1"
                style={{ color: "var(--psych-muted)" }}
              >
                {composed.authorLine}
              </p>
            )}
            <p
              className="text-[10px] mt-2"
              style={{ color: "var(--psych-muted)" }}
            >
              Généré le {new Date(composed.generatedAt).toLocaleString("fr-FR")}
            </p>
          </header>

          {composed.pack.tocSupported && (
            <section className="mb-6">
              <h2
                className="text-sm uppercase tracking-wider mb-2"
                style={{ color: "var(--psych-muted)" }}
              >
                Table des matières
              </h2>
              <ul className="text-sm" style={{ color: "var(--psych-text)" }}>
                {tableOfContents(composed).map((t) => (
                  <li
                    key={t.id}
                    style={{
                      paddingLeft: `${t.depth * 12}px`,
                      lineHeight: 1.7,
                    }}
                  >
                    <FileText size={9} className="inline mr-1 opacity-50" />
                    {t.heading}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {composed.sections.map((s) => (
            <PackSectionView key={s.id} section={s} depth={0} />
          ))}

          {composed.bibliography && composed.bibliography.length > 0 && (
            <section className="mt-8 pt-6 border-t" style={{ borderColor: "var(--psych-border)" }}>
              <h2
                className="text-base font-semibold mb-3"
                style={{ color: "var(--psych-text)" }}
              >
                Références
              </h2>
              <ul
                className="text-sm space-y-2"
                style={{
                  color: "var(--psych-text)",
                  fontFamily: "Georgia, serif",
                }}
              >
                {composed.bibliography.map((b, i) => (
                  <li key={i} style={{ paddingLeft: 24, textIndent: -24 }}>
                    {b}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <footer
            className="mt-8 pt-4 border-t text-[10px]"
            style={{
              borderColor: "var(--psych-border)",
              color: "var(--psych-muted)",
            }}
          >
            <Check size={9} className="inline mr-1" />
            Aucune donnée fabriquée. Les sections sans données disponibles
            sont marquées « editable shell » ou « awaiting participant data ».
          </footer>
        </article>
      )}
    </div>
  );
}

function PackSectionView({
  section,
  depth,
}: {
  section: import("@/lib/export/thesis-packs").PackSection;
  depth: number;
}) {
  const HeadingTag = (depth === 0 ? "h2" : depth === 1 ? "h3" : "h4") as keyof JSX.IntrinsicElements;
  return (
    <section className="mb-5">
      <HeadingTag
        className={
          depth === 0
            ? "text-base font-semibold mb-2"
            : "text-sm font-semibold mb-1.5"
        }
        style={{ color: "var(--psych-text)" }}
      >
        {section.heading}
      </HeadingTag>
      {section.body && (
        <p
          className="text-sm"
          style={{
            color: "var(--psych-text)",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            fontFamily: "Georgia, serif",
          }}
        >
          {section.body}
        </p>
      )}
      {section.rows && section.rows.length > 0 && (
        <table className="text-sm w-full mt-2 border-collapse">
          <tbody>
            {section.rows.map((r, i) => (
              <tr
                key={i}
                style={{ borderTop: "1px solid var(--psych-border)" }}
              >
                <td
                  className="py-1 pr-3 align-top font-medium"
                  style={{
                    color: "var(--psych-text)",
                    width: "30%",
                  }}
                >
                  {r.label}
                </td>
                <td
                  className="py-1 align-top"
                  style={{ color: "var(--psych-text)" }}
                >
                  {r.value}
                  {r.note && (
                    <span
                      className="block text-[10px] mt-0.5"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      {r.note}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {section.children?.map((c) => (
        <PackSectionView key={c.id} section={c} depth={depth + 1} />
      ))}
    </section>
  );
}
