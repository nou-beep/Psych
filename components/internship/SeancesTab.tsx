"use client";
// Séances tab on the dossier detail page — lists the dossier's
// séances most recent first and offers "Nouvelle séance", which
// creates one and routes straight into the Espace séance.

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarClock, Plus } from "lucide-react";

import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { useSeances } from "@/contexts/SeanceContext";
import { useLocale, useT } from "@/contexts/LocaleContext";
import { seancesForDossier } from "@/lib/internship/seance";

interface Props {
  caseId: string;
}

export function SeancesTab({ caseId }: Props) {
  const t = useT();
  const { formatDate } = useLocale();
  const router = useRouter();
  const store = useSeances();

  const seances = useMemo(
    () => seancesForDossier(store.seances, caseId),
    [store.seances, caseId]
  );

  function createAndOpen() {
    const s = store.create({ dossierId: caseId });
    router.push(`/formation/internship/cases/${caseId}/seance/${s.id}`);
  }

  return (
    <SectionCard
      title={t("seance.tabLabel")}
      action={
        <Button size="sm" onClick={createAndOpen}>
          <Plus size={13} /> {t("seance.newSeance")}
        </Button>
      }
    >
      {seances.length === 0 ? (
        <div className="text-center py-8">
          <CalendarClock
            size={24}
            className="mx-auto mb-2"
            style={{ color: "var(--psych-muted)" }}
          />
          <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
            {t("seance.emptyList")}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {seances.map((s) => (
            <Link
              key={s.id}
              href={`/formation/internship/cases/${caseId}/seance/${s.id}`}
              className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01]"
              style={{
                backgroundColor: "var(--psych-bg)",
                borderColor: "var(--psych-border)",
                color: "var(--psych-text)",
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                style={{
                  background: "linear-gradient(135deg, #8E72CC, #B49AE2)",
                }}
              >
                <CalendarClock size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium m-0">
                  {formatDate(s.date)}
                </p>
                <p
                  className="text-xs m-0"
                  style={{ color: "var(--psych-muted)" }}
                >
                  {t(`seance.status.${s.status}`)} ·{" "}
                  {t("seance.center.notesSummary", { n: s.notes.length })} ·{" "}
                  {t("seance.center.observationsSummary", {
                    n: s.observations.length,
                    total: 5,
                  })}
                </p>
              </div>
              <ArrowRight
                size={14}
                style={{ color: "var(--psych-muted)", flexShrink: 0 }}
              />
            </Link>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
