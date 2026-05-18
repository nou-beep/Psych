"use client";

// "Ajouter une note si nécessaire" — collapsed textarea that only
// expands when the user wants to add free text. Auto-expanded when
// a note already exists so the value is always visible.

import { useState, type CSSProperties } from "react";
import { ChevronRight, PenLine } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface OptionalNoteCollapseProps {
  value: string;
  onChange: (next: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  // Localised label for the closed affordance.
  closedLabel?: string;
}

export function OptionalNoteCollapse({
  value,
  onChange,
  label = "Note (optionnelle)",
  placeholder = "Détail clinique que les chips ne capturent pas…",
  rows = 2,
  disabled,
  className,
  style,
  closedLabel = "Ajouter une note si nécessaire",
}: OptionalNoteCollapseProps) {
  const [open, setOpen] = useState(Boolean(value));
  if (open) {
    return (
      <div className={className} style={style}>
        <label
          className="text-[10px] uppercase tracking-wider mb-1 block"
          style={{ color: "var(--psych-muted)" }}
        >
          {label}
        </label>
        <Textarea
          rows={rows}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      disabled={disabled}
      className={`text-[11px] inline-flex items-center gap-1 ${className ?? ""}`}
      style={{ color: "var(--psych-muted)", ...style }}
    >
      <PenLine size={10} /> {closedLabel}
      <ChevronRight size={10} />
    </button>
  );
}
