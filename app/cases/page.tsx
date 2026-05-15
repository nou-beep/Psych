"use client";
// Cases list page — filterable grid of all clinical cases.

import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CaseCard } from "@/components/shared/CaseCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockCases, type CaseType, type CaseStatus } from "@/lib/mock-data";
import Link from "next/link";

const ALL_TYPES: CaseType[] = [
  "Clinical Case",
  "Child Follow-Up",
  "Autism Internship Case",
  "Adult Case",
  "Research Participant",
  "Supervision Case",
  "Assessment Only",
];

const ALL_STATUSES: CaseStatus[] = ["Active", "Paused", "Archived", "Needs Review"];

export default function CasesPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = useMemo(() => {
    return mockCases.filter((c) => {
      const matchSearch =
        !search ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.shortNote.toLowerCase().includes(search.toLowerCase()) ||
        c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchType = filterType === "all" || c.type === filterType;
      const matchStatus = filterStatus === "all" || c.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [search, filterType, filterStatus]);

  function resetFilters() {
    setSearch("");
    setFilterType("all");
    setFilterStatus("all");
  }

  const hasFilters = search || filterType !== "all" || filterStatus !== "all";

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <PageHeader
        title="Cases"
        subtitle={`${mockCases.length} total · ${mockCases.filter(c => c.status === 'Active').length} active`}
        action={
          <Button size="sm">
            <Plus size={14} />
            New Case
          </Button>
        }
      />

      {/* Filters */}
      <div
        className="rounded-2xl border p-4 mb-6 flex flex-wrap gap-3 items-center"
        style={{
          backgroundColor: "var(--psych-card)",
          borderColor: "var(--psych-border)",
        }}
      >
        <div className="relative flex-1 min-w-[180px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--psych-muted)" }}
          />
          <Input
            placeholder="Search cases, codes, tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-48"
        >
          <option value="all">All types</option>
          {ALL_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-40"
        >
          <option value="all">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2 mb-4">
        <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
          Showing {filtered.length} {filtered.length === 1 ? "case" : "cases"}
        </p>
        {hasFilters && (
          <Badge variant="secondary">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</Badge>
        )}
      </div>

      {/* Cases grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <CaseCard key={c.id} caseData={c} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No cases found"
          description="Try adjusting your filters or search terms."
          icon="🔍"
          actionLabel="Clear filters"
          onAction={resetFilters}
        />
      )}
    </div>
  );
}
