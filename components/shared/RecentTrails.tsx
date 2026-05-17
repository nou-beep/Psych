"use client";
// Recent trails — a compact "continue where you left off" rail that
// shows the last things the user touched, with optional resume hints.
// Reads from lib/workspace/memory.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import {
  RECENT_ITEM_LABELS,
  loadRecents,
  recentItems,
  type RecentItem,
} from "@/lib/workspace/memory";
import { daysSinceLabel } from "@/lib/workspace/human-traces";
import { PHRASES } from "@/lib/workspace/microcopy";

function daysAgo(iso: string): number | null {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return null;
  return Math.floor((Date.now() - parsed) / (24 * 60 * 60 * 1000));
}

export function RecentTrails({
  limit = 6,
  title = PHRASES.recentlyWorkedOn,
}: {
  limit?: number;
  title?: string;
}) {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    try {
      setItems(loadRecents());
    } catch {
      setItems([]);
    }
  }, []);

  const visible = recentItems(items, limit);

  if (visible.length === 0) {
    return (
      <div
        className="rounded-xl border p-3 text-xs text-center"
        style={{
          backgroundColor: "var(--psych-card)",
          borderColor: "var(--psych-border)",
          color: "var(--psych-muted)",
        }}
      >
        {PHRASES.emptyRecent}
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border p-3"
      style={{
        backgroundColor: "var(--psych-card)",
        borderColor: "var(--psych-border)",
      }}
    >
      <div
        className="text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5"
        style={{ color: "var(--psych-muted)" }}
      >
        <Clock size={9} />
        {title}
      </div>
      <ul className="space-y-1">
        {visible.map((r) => (
          <li key={`${r.kind}:${r.id}`}>
            <Link
              href={r.href}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors"
              style={{ color: "var(--psych-text)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor =
                  "var(--psych-primary-light)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")
              }
            >
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
                style={{
                  backgroundColor: "var(--psych-primary-light)",
                  color: "var(--psych-primary)",
                }}
              >
                {RECENT_ITEM_LABELS[r.kind]}
              </span>
              <span className="flex-1 truncate text-xs">{r.label}</span>
              {r.resumeHint && (
                <span
                  className="text-[10px] italic"
                  style={{ color: "var(--psych-muted)" }}
                >
                  {r.resumeHint}
                </span>
              )}
              <span
                className="text-[10px]"
                style={{ color: "var(--psych-muted)" }}
              >
                {daysSinceLabel(daysAgo(r.lastVisitedAt))}
              </span>
              <ArrowRight size={10} style={{ color: "var(--psych-muted)" }} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
