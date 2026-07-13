"use client";
// CaseloadDashboard — the four workplace-psychology sections on the
// Espace Thérapeute home. Every number is deterministic arithmetic
// over entered records (lib/therapist/collaborateurs.ts). No causal
// claims — the data is shown; interpretation stays with the
// clinician.

import Link from "next/link";
import { useMemo } from "react";
import {
  AlertCircle,
  ArrowRight,
  FlaskConical,
  TrendingUp,
  Users,
} from "lucide-react";

import { SectionCard } from "@/components/shared/SectionCard";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { DemoBanner } from "@/components/therapist/DemoBanner";
import LongitudinalChart from "@/components/clinical/LongitudinalChart";
import { useCollaborateurs } from "@/contexts/CollaborateurContext";
import { useT } from "@/contexts/LocaleContext";
import {
  absenceTotal,
  departureCount,
  riskDistribution,
  riskImprovedCount,
  teamClimate,
  teamClimateSeries,
} from "@/lib/therapist/collaborateurs";
import type { NamedSeries } from "@/lib/clinical/longitudinal";

const TEAM_COLORS = ["#8E72CC", "#D67B9E", "#3B82F6", "#10B981", "#F59E0B", "#7C4FB3"];

function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function CaseloadDashboard() {
  const t = useT();
  const store = useCollaborateurs();
  const list = store.collaborateurs;

  const dist = useMemo(() => riskDistribution(list), [list]);
  const climate = useMemo(() => teamClimate(list), [list]);
  const climateSeries = useMemo(() => {
    const series = teamClimateSeries(list);
    return series.map<NamedSeries>((s, i) => ({
      id: s.team,
      label: s.team,
      color: TEAM_COLORS[i % TEAM_COLORS.length],
      points: s.points.map((p) => ({ date: p.date, value: p.value })),
    }));
  }, [list]);

  const from90 = daysAgoISO(90);
  const to = daysAgoISO(0);
  const absence = useMemo(
    () => absenceTotal(list, from90, to),
    [list, from90, to]
  );
  const departures = useMemo(
    () => departureCount(list, from90, to),
    [list, from90, to]
  );
  const improved = useMemo(
    () => riskImprovedCount(list, from90, to),
    [list, from90, to]
  );
  const activeCount = list.filter((c) => c.status !== "clos").length;

  if (list.length === 0) {
    return (
      <SectionCard title={t("collab.rosterTitle")}>
        <div className="text-center py-8">
          <Users
            size={26}
            className="mx-auto mb-3"
            style={{ color: "var(--psych-muted)" }}
          />
          <p className="text-sm mb-4" style={{ color: "var(--psych-muted)" }}>
            {t("collab.empty")}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Link href="/therapist/collaborateurs">
              <Button size="sm">{t("collab.newCollaborateur")}</Button>
            </Link>
            <Button size="sm" variant="outline" onClick={store.seedDemo}>
              <FlaskConical size={13} /> {t("collab.seedDemo")}
            </Button>
          </div>
        </div>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-4" data-caseload-dashboard>
      {store.hasDemo && <DemoBanner onClear={store.clearDemo} />}

      {/* 1 — Aperçu des risques */}
      <SectionCard
        title={t("collab.dashboard.riskOverviewTitle")}
        description={t("collab.dashboard.riskOverviewDesc")}
        action={
          <Link href="/therapist/collaborateurs">
            <Button size="sm" variant="ghost">
              {t("collab.rosterTitle")} <ArrowRight size={12} />
            </Button>
          </Link>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <StatCard
            label={t("collab.risk.high")}
            value={String(dist.high)}
            icon={<AlertCircle size={16} />}
            color="#991B1B"
            delay={0}
          />
          <StatCard
            label={t("collab.risk.watch")}
            value={String(dist.watch)}
            icon={<AlertCircle size={16} />}
            color="#92400E"
            delay={50}
          />
          <StatCard
            label={t("collab.risk.ok")}
            value={String(dist.ok)}
            icon={<Users size={16} />}
            color="#065F46"
            delay={100}
          />
          <StatCard
            label={t("collab.risk.none")}
            value={String(dist.none)}
            icon={<Users size={16} />}
            color="var(--psych-muted)"
            delay={150}
          />
        </div>
        {dist.highList.length > 0 && (
          <div>
            <h4
              className="text-[10px] uppercase tracking-wider mb-1"
              style={{ color: "#991B1B" }}
            >
              {t("collab.dashboard.highNow")}
            </h4>
            <div className="flex gap-2 flex-wrap">
              {dist.highList.map((c) => (
                <Link
                  key={c.id}
                  href={`/therapist/collaborateurs/${c.id}`}
                  className="text-xs px-2.5 py-1 rounded-full border font-medium"
                  style={{
                    borderColor: "#FCA5A5",
                    background: "#FEE2E2",
                    color: "#991B1B",
                  }}
                >
                  {c.displayName} · {c.team}
                </Link>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      {/* 2 — Climat par équipe */}
      <SectionCard
        title={t("collab.dashboard.climateTitle")}
        description={t("collab.dashboard.climateDesc")}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {climate.map((tc) => (
            <div
              key={tc.team}
              className="rounded-xl border p-3"
              style={{
                borderColor: "var(--psych-border)",
                background: "var(--psych-bg)",
              }}
            >
              <p
                className="text-[10px] uppercase tracking-wider m-0"
                style={{ color: "var(--psych-muted)" }}
              >
                {tc.team}
              </p>
              <p
                className="text-xl font-bold m-0 mt-1"
                style={{ color: "var(--psych-text)" }}
              >
                {tc.average === null
                  ? "—"
                  : (Math.round(tc.average * 10) / 10).toFixed(1)}
                <span
                  className="text-xs font-normal"
                  style={{ color: "var(--psych-muted)" }}
                >
                  {" "}
                  /10
                </span>
              </p>
              <p
                className="text-[10px] m-0"
                style={{ color: "var(--psych-muted)" }}
              >
                {tc.scoredCount}/{tc.memberCount}
              </p>
            </div>
          ))}
        </div>
        {climateSeries.some((s) => s.points.length > 1) && (
          <LongitudinalChart series={climateSeries} />
        )}
      </SectionCard>

      {/* 4 — Impact rétention & absence */}
      <SectionCard
        title={t("collab.dashboard.impactTitle")}
        description={t("collab.dashboard.impactDesc")}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label={t("collab.dashboard.activeCases")}
            value={String(activeCount)}
            icon={<Users size={16} />}
            color="var(--psych-primary)"
            delay={0}
          />
          <StatCard
            label={t("collab.dashboard.absenceDays")}
            value={String(absence)}
            icon={<AlertCircle size={16} />}
            color="#F59E0B"
            delay={50}
          />
          <StatCard
            label={t("collab.dashboard.departures")}
            value={String(departures)}
            icon={<ArrowRight size={16} />}
            color="#9F1239"
            delay={100}
          />
          <StatCard
            label={t("collab.dashboard.riskImproved")}
            value={String(improved)}
            icon={<TrendingUp size={16} />}
            color="#10B981"
            delay={150}
          />
        </div>
      </SectionCard>
    </div>
  );
}
