"use client";

// Generated text block — shows auto-generated clinical prose with
// source attribution + edit / regenerate / insert affordances.
//
// The rule-based engines elsewhere in the app (profile summary,
// daily report, grid summary, etc.) all produce text the user
// should be able to:
//   - read with context ("Generated from 3 grids, 12 scored items")
//   - edit inline if the wording doesn't fit
//   - regenerate from the current source data
//   - insert into a draft report
//
// This component handles those affordances generically. Callers
// pass the generated text + source description + button handlers.

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Pencil, RefreshCw, Send, X } from "lucide-react";

import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface GeneratedTextBlockProps {
  title?: string;
  description?: string;
  // The generated text. When `regenerate` is provided the component
  // refreshes its local copy each time `value` changes.
  value: string;
  // Optional source description ("Generated from 3 grids · 12 items").
  source?: ReactNode;
  // Optional regenerate callback — when provided, surfaces a refresh
  // button that calls back. The new generated text should come back
  // via the `value` prop on the next render.
  onRegenerate?: () => void;
  // Optional insert callback — when provided, surfaces an "Insert"
  // button. The current (possibly edited) text is passed in.
  onInsert?: (text: string) => void;
  // Optional insert button label override.
  insertLabel?: string;
  // Optional disabled state.
  disabled?: boolean;
  rows?: number;
  className?: string;
  style?: CSSProperties;
}

export function GeneratedTextBlock({
  title,
  description,
  value,
  source,
  onRegenerate,
  onInsert,
  insertLabel = "Insert into report",
  disabled,
  rows = 5,
  className,
  style,
}: GeneratedTextBlockProps) {
  const [editing, setEditing] = useState(false);
  // Local edit buffer — separate from the generated value so the
  // user can revise without losing the regenerate option.
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const text = editing ? draft : value;

  return (
    <SectionCard
      title={title}
      description={description}
      action={
        <div className="flex items-center gap-1.5">
          {onRegenerate && !editing && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRegenerate}
              disabled={disabled}
            >
              <RefreshCw size={11} /> Regenerate
            </Button>
          )}
          {!editing ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setEditing(true)}
              disabled={disabled}
            >
              <Pencil size={11} /> Edit
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditing(false)}
              disabled={disabled}
            >
              <X size={11} /> Done
            </Button>
          )}
          {onInsert && !editing && (
            <Button
              size="sm"
              onClick={() => onInsert(text)}
              disabled={disabled || !text.trim()}
            >
              <Send size={11} /> {insertLabel}
            </Button>
          )}
        </div>
      }
      className={className}
    >
      <div style={style}>
        {source && (
          <p
            className="text-[10px] italic mb-1.5"
            style={{ color: "var(--psych-muted)" }}
          >
            {source}
          </p>
        )}
        {editing ? (
          <Textarea
            rows={rows}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Réécrire le paragraphe généré…"
            disabled={disabled}
          />
        ) : (
          <p
            className="text-sm whitespace-pre-wrap"
            style={{
              color: "var(--psych-text)",
              lineHeight: 1.55,
              minHeight: rows * 18,
            }}
          >
            {value || (
              <span style={{ color: "var(--psych-muted)", fontStyle: "italic" }}>
                Aucun texte généré pour l&rsquo;instant.
              </span>
            )}
          </p>
        )}
      </div>
    </SectionCard>
  );
}
