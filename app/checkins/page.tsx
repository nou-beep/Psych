"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DailyCheckInForm } from "@/components/checkins/DailyCheckInForm";
import { WeeklyReviewForm } from "@/components/checkins/WeeklyReviewForm";
import { MonthlyReviewForm } from "@/components/checkins/MonthlyReviewForm";
import { useApp } from "@/contexts/AppContext";

export default function CheckInsPage() {
  const { checkIns, weeklyReviews, monthlyReviews, cases, deleteCheckIn } = useApp();

  const activeCheckIns = checkIns.filter((c) => !c.isArchived).sort((a, b) => b.date.localeCompare(a.date));
  const activeWeekly = weeklyReviews.filter((r) => !r.isArchived).sort((a, b) => b.weekStart.localeCompare(a.weekStart));
  const activeMonthly = monthlyReviews.filter((r) => !r.isArchived).sort((a, b) => b.month.localeCompare(a.month));

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <PageHeader
        title="Check-ins"
        subtitle="Log daily observations, weekly reviews, and monthly summaries"
      />

      <Tabs defaultValue="daily">
        <TabsList className="mb-6">
          <TabsTrigger value="daily">Daily Check-in</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Review</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Review</TabsTrigger>
          <TabsTrigger value="history">
            History {activeCheckIns.length > 0 && `(${activeCheckIns.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <SectionCard title="New Daily Check-in" description="Record today's session observations">
            <DailyCheckInForm />
          </SectionCard>
        </TabsContent>

        <TabsContent value="weekly">
          <SectionCard title="New Weekly Review" description="End-of-week clinical summary">
            <WeeklyReviewForm />
          </SectionCard>
        </TabsContent>

        <TabsContent value="monthly">
          <SectionCard title="New Monthly Review" description="Monthly clinical evolution summary">
            <MonthlyReviewForm />
          </SectionCard>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-6">
            {/* Recent daily check-ins */}
            <SectionCard title={`Daily Check-ins (${activeCheckIns.length})`}>
              {activeCheckIns.length > 0 ? (
                <div className="space-y-3">
                  {activeCheckIns.map((chk) => {
                    const relatedCase = cases.find((c) => c.id === chk.caseId);
                    return (
                      <div
                        key={chk.id}
                        className="p-4 rounded-xl border group relative"
                        style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)" }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-bold" style={{ color: "var(--psych-primary)" }}>
                            {relatedCase?.code ?? chk.caseId}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: "var(--psych-muted)" }}>{chk.date}</span>
                            <button
                              onClick={() => deleteCheckIn(chk.id)}
                              className="opacity-0 group-hover:opacity-100 text-[10px] px-1.5 py-0.5 rounded transition-opacity"
                              style={{ color: "#EF4444", backgroundColor: "#FEF2F2" }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="text-xs mb-1" style={{ color: "var(--psych-muted)" }}>{chk.contextType}</p>
                        <p className="text-sm line-clamp-2" style={{ color: "var(--psych-text)" }}>
                          {chk.moodAffect}
                        </p>
                        {chk.followUpNeeded && (
                          <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>
                            Follow-up needed
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm py-4 text-center" style={{ color: "var(--psych-muted)" }}>No check-ins yet. Create one using the Daily Check-in tab.</p>
              )}
            </SectionCard>

            {/* Weekly reviews */}
            <SectionCard title={`Weekly Reviews (${activeWeekly.length})`}>
              {activeWeekly.length > 0 ? (
                <div className="space-y-3">
                  {activeWeekly.map((rev) => {
                    const relatedCase = cases.find((c) => c.id === rev.caseId);
                    return (
                      <div
                        key={rev.id}
                        className="p-4 rounded-xl border"
                        style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)" }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-bold" style={{ color: "var(--psych-primary)" }}>
                            {relatedCase?.code ?? rev.caseId}
                          </span>
                          <span className="text-xs" style={{ color: "var(--psych-muted)" }}>
                            {rev.weekStart} – {rev.weekEnd}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2" style={{ color: "var(--psych-text)" }}>
                          {rev.mainProgress}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm py-4 text-center" style={{ color: "var(--psych-muted)" }}>No weekly reviews yet.</p>
              )}
            </SectionCard>

            {/* Monthly reviews */}
            <SectionCard title={`Monthly Reviews (${activeMonthly.length})`}>
              {activeMonthly.length > 0 ? (
                <div className="space-y-3">
                  {activeMonthly.map((rev) => {
                    const relatedCase = cases.find((c) => c.id === rev.caseId);
                    return (
                      <div
                        key={rev.id}
                        className="p-4 rounded-xl border"
                        style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)" }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-bold" style={{ color: "var(--psych-primary)" }}>
                            {relatedCase?.code ?? rev.caseId}
                          </span>
                          <span className="text-xs" style={{ color: "var(--psych-muted)" }}>{rev.month}</span>
                        </div>
                        <p className="text-sm line-clamp-2" style={{ color: "var(--psych-text)" }}>
                          {rev.overallEvolution}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm py-4 text-center" style={{ color: "var(--psych-muted)" }}>No monthly reviews yet.</p>
              )}
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
