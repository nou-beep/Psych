"use client";
// Hook that records a workspace visit when a page mounts. Plays well
// with the workspace memory store — pages call it once with their
// identity and the rest is automatic.

import { useEffect } from "react";
import {
  loadRecents,
  recordVisit,
  saveRecents,
  type RecentItemKind,
} from "@/lib/workspace/memory";

export function useRecordVisit(input: {
  id: string;
  kind: RecentItemKind;
  label: string;
  href: string;
  resumeHint?: string;
  // When true the hook does nothing — useful when the id isn't ready yet.
  disabled?: boolean;
}): void {
  const { id, kind, label, href, resumeHint, disabled } = input;
  useEffect(() => {
    if (disabled) return;
    if (!id || !label) return;
    try {
      const list = loadRecents();
      saveRecents(recordVisit(list, { id, kind, label, href, resumeHint }));
    } catch {
      /* ignore — non-essential */
    }
  }, [id, kind, label, href, resumeHint, disabled]);
}
