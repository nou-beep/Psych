// Clinical hub — entry point for the new clinical-scientific tools.

import Link from "next/link";
import {
  Stethoscope,
  ClipboardList,
  Brain,
  TrendingUp,
  Microscope,
  BookOpen,
  Search,
  Library,
  Languages,
  GraduationCap,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";

const TOOLS = [
  {
    href: "/assessments/library",
    title: "Assessment library",
    description:
      "PHQ-9, GAD-7, DASS-21 fully scoreable. BDI-II, STAI, CDS-29, DES-II, PCL-5, AQ-50, RAADS-R as placeholder shells with administration tracking.",
    icon: ClipboardList,
    accent: "#EC4899",
  },
  {
    href: "/clinical/interview",
    title: "Clinical interview",
    description:
      "Structured intake and follow-up templates with anxiety, dissociation, and developmental variants. Comparable across sessions.",
    icon: Stethoscope,
    accent: "#8B5CF6",
  },
  {
    href: "/clinical/mse",
    title: "Mental Status Exam",
    description:
      "16-domain MSE with descriptor chips, free-text observations, and report narrative builder.",
    icon: Brain,
    accent: "#3B82F6",
  },
  {
    href: "/clinical/longitudinal",
    title: "Longitudinal tracking",
    description:
      "Symptom evolution charts, period comparison, intervention overlays. Built on the assessment engine.",
    icon: TrendingUp,
    accent: "#10B981",
  },
  {
    href: "/clinical/hypothesis",
    title: "Hypothesis workspace",
    description:
      "Structured clinical reasoning. Evidence for / against, differentials, supervision tracking. Not diagnosis automation.",
    icon: Microscope,
    accent: "#F59E0B",
  },
  {
    href: "/clinical/interventions",
    title: "Intervention library",
    description:
      "Evidence-informed interventions across CBT, ACT, DBT, exposure, grounding, trauma stabilization, and more.",
    icon: Library,
    accent: "#14B8A6",
  },
  {
    href: "/clinical/disorders",
    title: "Disorder reference",
    description:
      "Navigation layer for DSM-5-TR / ICD-11 disorders. Linked assessments, interventions, terminology, and workbooks.",
    icon: BookOpen,
    accent: "#A855F7",
  },
  {
    href: "/clinical/psychoeducation",
    title: "Psychoeducation",
    description:
      "Soft handouts across 4 reading levels — clinician, adolescent, parent, academic.",
    icon: GraduationCap,
    accent: "#F97316",
  },
  {
    href: "/clinical/search",
    title: "Clinical search",
    description:
      "Cross-domain search over cases, sessions, assessments, interventions, terminology, reports, transcripts, and reference materials.",
    icon: Search,
    accent: "#0EA5E9",
  },
  {
    href: "/clinical/phrases",
    title: "Phrase library",
    description:
      "Trilingual (EN/FR/AR) report and clinical-note phrasings. Copy or insert into reports.",
    icon: Languages,
    accent: "#BE185D",
  },
];

export default function ClinicalHubPage() {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Clinical tools"
        subtitle="Standardised assessments, structured interviews, MSE, hypothesis workspace, and reference materials"
      />

      <SectionCard
        title="Scientifically grounded · clinically useful"
        description="Built around evidence-informed clinical workflows. Nothing here automates diagnosis — these tools support reasoning, documentation, and supervision."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TOOLS.map((t) => {
            const Icon = t.icon;
            return (
              <Link key={t.href} href={t.href} className="block group">
                <div
                  className="rounded-2xl border p-4 h-full transition-all hover:shadow-md hover:scale-[1.005]"
                  style={{
                    backgroundColor: "var(--psych-card)",
                    borderColor: "var(--psych-border)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: t.accent + "20", color: t.accent }}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-sm font-semibold"
                        style={{ color: "var(--psych-text)" }}
                      >
                        {t.title}
                      </h3>
                      <p
                        className="text-xs leading-relaxed mt-1"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        {t.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
