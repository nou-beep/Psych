"use client";

// Internship Studio settings — professional defaults that flow into
// every grid, test administration, daily / weekly / final report,
// supervision note, and printable view.
//
// Both objects already exist as `DEFAULT_EVALUATOR` /
// `DEFAULT_INSTITUTION` constants. This page just exposes them as
// editable fields backed by localStorage via `saveEvaluator()` /
// `saveInstitution()`.

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Save } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/Toast";
import {
  DEFAULT_EVALUATOR,
  loadEvaluator,
  saveEvaluator,
  type EvaluatorProfile,
} from "@/lib/internship/evaluator";
import {
  DEFAULT_INSTITUTION,
  loadInstitution,
  saveInstitution,
  type InternshipInstitution,
} from "@/lib/internship/institutions";

export default function InternshipSettingsPage() {
  const { toast } = useToast();
  const [evaluator, setEvaluator] = useState<EvaluatorProfile>(DEFAULT_EVALUATOR);
  const [institution, setInstitution] = useState<InternshipInstitution>(
    DEFAULT_INSTITUTION
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setEvaluator(loadEvaluator());
    setInstitution(loadInstitution());
    setReady(true);
  }, []);

  if (!ready) return null;

  function patchInstitution(patch: Partial<InternshipInstitution>) {
    setInstitution((prev) => ({ ...prev, ...patch }));
  }

  function save() {
    saveEvaluator(evaluator);
    saveInstitution(institution);
    toast("Préférences enregistrées.", "success");
  }

  function reset() {
    setEvaluator(DEFAULT_EVALUATOR);
    setInstitution(DEFAULT_INSTITUTION);
    toast("Valeurs par défaut restaurées (non encore enregistrées).", "info");
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-4">
      <Link href="/internship">
        <Button variant="ghost" size="sm" className="mb-2">
          <ArrowLeft size={13} /> Internship Studio
        </Button>
      </Link>

      <PageHeader
        title="Préférences du stage"
        subtitle="Valeurs par défaut utilisées dans toutes les grilles, tests, rapports, et vues imprimables."
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw size={12} /> Reset
            </Button>
            <Button size="sm" onClick={save}>
              <Save size={12} /> Enregistrer
            </Button>
          </div>
        }
      />

      <SectionCard
        title="Évaluateur"
        description="Nom et fonction utilisés comme signature et auteur par défaut sur les documents générés."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field
            label="Nom"
            value={evaluator.name}
            onChange={(v) => setEvaluator({ ...evaluator, name: v })}
          />
          <Field
            label="Rôle"
            value={evaluator.role}
            onChange={(v) => setEvaluator({ ...evaluator, role: v })}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Lieu de stage"
        description="Apparaît sur les pages de garde, la présentation institutionnelle des rapports, et l'identification des cas."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field
            label="Nom de l'institution"
            value={institution.name}
            onChange={(v) => patchInstitution({ name: v })}
          />
          <Field
            label="Setting (libellé court)"
            value={institution.setting}
            onChange={(v) => patchInstitution({ setting: v })}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Cadre académique"
        description="Programme et université. Utilisés pour la page de garde du rapport final."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field
            label="Programme"
            value={institution.academicProgram}
            onChange={(v) => patchInstitution({ academicProgram: v })}
          />
          <Field
            label="Université"
            value={institution.university}
            onChange={(v) => patchInstitution({ university: v })}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Encadrement"
        description="Encadrement académique et responsable du Master."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field
            label="Encadrement académique"
            value={institution.academicSupervisor}
            onChange={(v) => patchInstitution({ academicSupervisor: v })}
          />
          <Field
            label="Responsable du Master"
            value={institution.masterResponsible}
            onChange={(v) => patchInstitution({ masterResponsible: v })}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Description de l'équipe"
        description="Court paragraphe inséré dans la présentation du lieu de stage du rapport final."
      >
        <Textarea
          rows={3}
          value={institution.teamDescription}
          onChange={(e) =>
            patchInstitution({ teamDescription: e.target.value })
          }
        />
      </SectionCard>

      <SectionCard
        title="Population accueillie"
        description="Description du public reçu par l'institution."
      >
        <Textarea
          rows={3}
          value={institution.populationDescription}
          onChange={(e) =>
            patchInstitution({ populationDescription: e.target.value })
          }
        />
      </SectionCard>

      <SectionCard
        title="Focus du stage"
        description="Phrase utilisée comme méthodologie d'observation par défaut."
      >
        <Textarea
          rows={3}
          value={institution.internshipFocus}
          onChange={(e) =>
            patchInstitution({ internshipFocus: e.target.value })
          }
        />
      </SectionCard>

      <div
        className="text-[11px] text-center pt-2 pb-4"
        style={{ color: "var(--psych-muted)" }}
      >
        Les modifications sont sauvegardées localement (localStorage).
        Cliquer « Enregistrer » pour appliquer.
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        className="text-[10px] uppercase tracking-wider mb-1 block"
        style={{ color: "var(--psych-muted)" }}
      >
        {label}
      </label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
