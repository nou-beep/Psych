"use client";
// Open loops — global unresolved-work dashboard across the workspace.

import { PageHeader } from "@/components/shared/PageHeader";
import { OpenLoopsBoard } from "@/components/clinical/OpenLoopsBoard";

export default function OpenLoopsPage() {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Open loops"
        subtitle="Everything unfinished, unresolved, or revisit-later — pulled from every module."
      />
      <OpenLoopsBoard />
    </div>
  );
}
