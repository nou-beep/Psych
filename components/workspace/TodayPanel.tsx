"use client";
// TodayPanel — renders a small ordered list of next-action items
// from `computeXToday()` helpers. Used on every portal home so the
// trainee/therapist/client sees the 3-5 things that matter today
// before anything else.

import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  CheckCircle,
  ClipboardCheck,
  FileText,
  FolderOpen,
  GraduationCap,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { useT } from "@/contexts/LocaleContext";
import type { TodayItem, TodayPriority } from "@/lib/clinical/today";

const CATEGORY_ICON: Record<
  NonNullable<TodayItem["category"]>,
  LucideIcon
> = {
  thesis: GraduationCap,
  internship: FolderOpen,
  session: ClipboardCheck,
  assessment: FileText,
  report: FileText,
  supervision: UserCheck,
  assignment: CheckCircle,
  calendar: CalendarRange,
};

const PRIORITY_INK: Record<TodayPriority, string> = {
  critical: "#9F1239",
  high: "#B07A4F",
  normal: "#5B36A8",
  low: "#7A6090",
};

const PRIORITY_BG: Record<TodayPriority, string> = {
  critical: "rgba(159,18,57,0.10)",
  high: "rgba(245,158,11,0.10)",
  normal: "rgba(140,100,200,0.10)",
  low: "rgba(122,96,144,0.08)",
};

interface Props {
  items: TodayItem[];
  /** Title override — defaults to t("today.title"). */
  title?: string;
}

export function TodayPanel({ items, title }: Props) {
  const t = useT();
  const heading = title ?? t("today.title");

  if (items.length === 0) {
    return (
      <section
        data-today-panel
        style={{
          borderRadius: 16,
          padding: "1rem 1.1rem",
          background: "var(--psych-card, rgba(255,255,255,0.65))",
          border: "1px solid var(--psych-border, rgba(0,0,0,0.06))",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "0.78rem",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--psych-muted, #7A6090)",
          }}
        >
          {heading}
        </h2>
        <p
          style={{
            marginTop: 8,
            marginBottom: 0,
            fontSize: 13,
            color: "var(--psych-text, #1F1733)",
          }}
        >
          {t("today.empty")}
        </p>
      </section>
    );
  }

  return (
    <section
      data-today-panel
      style={{
        borderRadius: 16,
        padding: "1rem 1.1rem",
        background: "var(--psych-card, rgba(255,255,255,0.65))",
        border: "1px solid var(--psych-border, rgba(0,0,0,0.06))",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "0.78rem",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--psych-muted, #7A6090)",
          }}
        >
          {heading}
        </h2>
        <span
          style={{
            fontSize: 11,
            color: "var(--psych-muted, #7A6090)",
          }}
        >
          {t("today.count", { n: items.length })}
        </span>
      </header>
      <ol
        data-today-list
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {items.map((item) => {
          const Icon = item.category ? CATEGORY_ICON[item.category] : ArrowRight;
          return (
            <li key={item.id} data-priority={item.priority}>
              <Link
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "0.55rem 0.7rem",
                  borderRadius: 10,
                  background: PRIORITY_BG[item.priority],
                  textDecoration: "none",
                  color: "var(--psych-text, #1F1733)",
                  fontSize: 13,
                  transition: "background 0.15s ease",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.7)",
                    color: PRIORITY_INK[item.priority],
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={13} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.label}
                  </p>
                  {item.subtitle && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        color: "var(--psych-muted, #7A6090)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.subtitle}
                    </p>
                  )}
                </div>
                <ArrowRight
                  size={13}
                  style={{
                    color: PRIORITY_INK[item.priority],
                    flexShrink: 0,
                  }}
                />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
