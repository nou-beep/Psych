"use client";
// Formation → Internship → Cases. Focused list of every internship
// case in the studio; click a row to open the full case workspace.

import Link from "next/link";
import { FolderOpen, Plus, ArrowRight } from "lucide-react";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { useInternship } from "@/contexts/InternshipContext";

export default function FormationInternshipCasesPage() {
  const { cases } = useInternship();

  const active = cases.filter((c) => !c.archived);
  const archived = cases.filter((c) => c.archived);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <header>
        <p
          className="text-xs uppercase tracking-widest font-semibold"
          style={{ color: "#5B36A8" }}
        >
          Formation · Internship
        </p>
        <h1
          className="text-2xl font-bold mt-1"
          style={{ color: "var(--psych-text)" }}
        >
          Internship Cases
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--psych-muted)" }}
        >
          Every case opened in your supervised internship — anonymized
          codes, structured profiles, observation grids, tests and
          reports.
        </p>
      </header>

      <SectionCard
        title={`Active cases (${active.length})`}
        action={
          <Link href="/formation/internship">
            <Button variant="ghost" size="sm">
              <Plus size={13} /> Open Studio
            </Button>
          </Link>
        }
      >
        {active.length === 0 ? (
          <div className="text-center py-10">
            <FolderOpen
              size={28}
              className="mx-auto mb-2"
              style={{ color: "var(--psych-muted)" }}
            />
            <p
              className="text-sm"
              style={{ color: "var(--psych-muted)" }}
            >
              No active internship cases yet.
            </p>
            <Link href="/formation/internship">
              <Button size="sm" className="mt-4">
                <Plus size={13} /> Open Internship Studio
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {active.map((c) => (
              <Link
                key={c.id}
                href={`/formation/internship/cases/${c.id}`}
              >
                <div
                  className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01] cursor-pointer"
                  style={{
                    backgroundColor: "var(--psych-bg)",
                    borderColor: "var(--psych-border)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #8E72CC, #B49AE2)",
                    }}
                  >
                    {(c.identification.caseCode ?? "??").slice(-2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium font-mono"
                      style={{ color: "var(--psych-text)" }}
                    >
                      {c.identification.caseCode}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      {c.identification.age ?? "Âge non précisé"}
                      {c.identification.internshipPlace
                        ? ` · ${c.identification.internshipPlace}`
                        : ""}
                    </p>
                  </div>
                  <ArrowRight
                    size={14}
                    style={{ color: "var(--psych-muted)" }}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </SectionCard>

      {archived.length > 0 && (
        <SectionCard title={`Archived (${archived.length})`}>
          <div className="space-y-2">
            {archived.map((c) => (
              <Link
                key={c.id}
                href={`/formation/internship/cases/${c.id}`}
              >
                <div
                  className="flex items-center gap-3 p-3 rounded-xl border opacity-70 cursor-pointer"
                  style={{
                    backgroundColor: "var(--psych-bg)",
                    borderColor: "var(--psych-border)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-mono"
                      style={{ color: "var(--psych-text)" }}
                    >
                      {c.identification.caseCode}
                    </p>
                  </div>
                  <span
                    className="text-[10px] uppercase tracking-widest"
                    style={{ color: "var(--psych-muted)" }}
                  >
                    Archived
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
