"use client";
// Client → Assigned Work. A focused list of therapist-assigned items
// (workbooks, assessments, therapeutic cards, notes) with completion
// state and one-click access to each item.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  ArrowRight,
  Library,
  Brain,
  FileText,
  StickyNote,
  Compass,
} from "lucide-react";
import { ClientShell } from "@/components/client/ClientShell";
import {
  acknowledge,
  loadAssignments,
  saveAssignments,
  type ClientAssignment,
  type AssignmentKind,
} from "@/lib/client/assignments";
import { ALL_WORKBOOKS } from "@/lib/client/workbooks";
import { ALL_JOURNEYS } from "@/lib/client/journeys";

const KIND_META: Record<
  AssignmentKind,
  { label: string; icon: typeof Library; tint: string }
> = {
  workbook: { label: "Workbook", icon: Library, tint: "#9882C0" },
  assessment: { label: "Assessment", icon: Brain, tint: "#7C4FB3" },
  card: { label: "Therapeutic card", icon: FileText, tint: "#6B7AA0" },
  journey: { label: "Therapeutic path", icon: Compass, tint: "#8B4A66" },
  note: { label: "Therapist note", icon: StickyNote, tint: "#B07A4F" },
};

function hrefFor(a: ClientAssignment): string {
  if (a.kind === "workbook" && a.targetId)
    return `/client/workbooks/${a.targetId}`;
  if (a.kind === "journey" && a.targetId)
    return `/client/journeys/${a.targetId}`;
  if (a.kind === "assessment") return "/client/assessments";
  if (a.kind === "card") return "/client/resources";
  return "/client/notes";
}

function labelFor(a: ClientAssignment): string {
  if (a.kind === "workbook") {
    const wb = ALL_WORKBOOKS.find((w) => w.id === a.targetId);
    return wb?.title ?? "Workbook";
  }
  if (a.kind === "journey") {
    const j = ALL_JOURNEYS.find((x) => x.id === a.targetId);
    return j?.title ?? "Therapeutic path";
  }
  if (a.kind === "assessment") return "Assessment to complete";
  if (a.kind === "card") return "Therapeutic card";
  return "Note from your therapist";
}

export default function ClientAssignedPage() {
  const [assignments, setAssignments] = useState<ClientAssignment[]>([]);

  useEffect(() => {
    setAssignments(loadAssignments());
  }, []);

  function ack(id: string) {
    const next = acknowledge(assignments, id);
    setAssignments(next);
    saveAssignments(next);
  }

  const pending = useMemo(
    () => assignments.filter((a) => !a.acknowledged),
    [assignments]
  );
  const done = useMemo(
    () => assignments.filter((a) => a.acknowledged),
    [assignments]
  );

  return (
    <ClientShell
      title="Assigned work"
      microcopy="Material your therapist asked you to work through, between sessions."
    >
      {/* Counts */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <CountBadge
          icon={<ClipboardCheck size={14} />}
          label="Pending"
          value={pending.length}
          tint="#9882C0"
        />
        <CountBadge
          icon={<CheckCircle2 size={14} />}
          label="Done"
          value={done.length}
          tint="#10B981"
        />
      </div>

      {/* Pending section */}
      <Section title="Pending">
        {pending.length === 0 ? (
          <EmptyRow text="Nothing pending. Your therapist will assign material as you go." />
        ) : (
          <div className="space-y-2">
            {pending.map((a) => (
              <AssignmentRow key={a.id} a={a} onAcknowledge={() => ack(a.id)} />
            ))}
          </div>
        )}
      </Section>

      {/* Done section */}
      {done.length > 0 && (
        <Section title="Completed">
          <div className="space-y-2">
            {done.map((a) => (
              <AssignmentRow key={a.id} a={a} muted />
            ))}
          </div>
        </Section>
      )}
    </ClientShell>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "1.75rem" }}>
      <h2
        style={{
          fontSize: "0.78rem",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#5C4870",
          marginBottom: 10,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

interface AssignmentRowProps {
  a: ClientAssignment;
  muted?: boolean;
  onAcknowledge?: () => void;
}

function AssignmentRow({ a, muted, onAcknowledge }: AssignmentRowProps) {
  const meta = KIND_META[a.kind];
  const Icon = meta.icon;
  const href = hrefFor(a);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0.9rem 1rem",
        borderRadius: 16,
        background: muted
          ? "rgba(245,243,250,0.5)"
          : "rgba(255,255,255,0.7)",
        border: muted
          ? "1px solid rgba(16,185,129,0.2)"
          : `1px solid ${meta.tint}33`,
        opacity: muted ? 0.75 : 1,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: meta.tint + "22",
          color: meta.tint,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontWeight: 500,
            color: "#1F1733",
            fontSize: "0.92rem",
          }}
        >
          {labelFor(a)}
        </p>
        <p
          style={{
            margin: 0,
            color: "#7A6090",
            fontSize: "0.74rem",
            marginTop: 2,
          }}
        >
          {meta.label}
          {a.note ? ` · ${a.note}` : ""}
        </p>
      </div>
      {!muted && onAcknowledge && (
        <button
          onClick={onAcknowledge}
          style={{
            all: "unset",
            cursor: "pointer",
            padding: "0.4rem 0.7rem",
            borderRadius: 10,
            border: "1px solid rgba(16,185,129,0.3)",
            color: "#0E7B5C",
            fontSize: "0.78rem",
            fontWeight: 500,
            background: "rgba(16,185,129,0.08)",
          }}
        >
          Mark done
        </button>
      )}
      <Link href={href}>
        <ArrowRight
          size={16}
          style={{ color: "#7A6090", flexShrink: 0 }}
        />
      </Link>
    </div>
  );
}

interface CountBadgeProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  tint: string;
}

function CountBadge({ icon, label, value, tint }: CountBadgeProps) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "0.5rem 0.85rem",
        borderRadius: 999,
        background: "rgba(255,255,255,0.6)",
        border: `1px solid ${tint}33`,
        fontSize: "0.78rem",
        color: "#5C4870",
      }}
    >
      <span style={{ color: tint, display: "flex" }}>{icon}</span>
      <strong style={{ color: "#1F1733" }}>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: "1.5rem",
        textAlign: "center",
        borderRadius: 18,
        background: "rgba(255,255,255,0.5)",
        border: "1px solid rgba(140,100,200,0.15)",
        color: "#5C4870",
        fontSize: "0.85rem",
      }}
    >
      {text}
    </div>
  );
}
