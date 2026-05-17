"use client";
// Applies workspace-mode class names to a wrapper around the
// therapist chrome. Quietly does nothing on client-portal routes.

import type { ReactNode } from "react";
import { useWorkspaceMode } from "@/contexts/WorkspaceModeContext";

export function WorkspaceModeShell({ children }: { children: ReactNode }) {
  const { classNames } = useWorkspaceMode();
  return <div className={classNames.join(" ")}>{children}</div>;
}
