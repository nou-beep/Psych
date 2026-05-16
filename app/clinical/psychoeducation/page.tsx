"use client";
// Psychoeducation generator — 4 style variants per topic.

import { useMemo, useState } from "react";
import { Printer, Copy } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/Toast";
import {
  PSYCHOEDUCATION_TOPICS,
  searchTopics,
  type HandoutStyle,
} from "@/lib/clinical/psychoeducation";

const STYLE_LABELS: Record<HandoutStyle, string> = {
  clinician: "Clinician handout",
  adolescent: "Adolescent-friendly",
  parent: "Parent guidance",
  academic: "Minimalist academic",
};

export default function PsychoeducationPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(PSYCHOEDUCATION_TOPICS[0]?.id ?? "");
  const [style, setStyle] = useState<HandoutStyle>("clinician");

  const visible = useMemo(() => searchTopics(query), [query]);
  const topic = PSYCHOEDUCATION_TOPICS.find((t) => t.id === activeId);
  const variant = topic ? topic.variants[style] : null;

  function copy() {
    if (!variant) return;
    const text = [
      topic?.title,
      "",
      variant.intro,
      "",
      "WHAT IT IS",
      variant.whatItIs,
      "",
      "WHAT IT FEELS LIKE",
      variant.whatItFeelsLike,
      "",
      "WHAT HELPS",
      variant.whatHelps,
      "",
      "WHEN TO SEEK SUPPORT",
      variant.whenToSeekSupport,
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => toast("Handout copied", "success"));
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Psychoeducation"
        subtitle="Soft, evidence-informed handouts across 4 reading levels"
        action={
          <Button onClick={() => window.print()} variant="secondary" size="sm">
            <Printer size={13} /> Print
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SectionCard title="Topics" className="md:col-span-1">
          <div className="mb-3">
            <Label htmlFor="pe-search">Search</Label>
            <Input
              id="pe-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Topic or tag…"
            />
          </div>
          <ul className="space-y-1 max-h-[420px] overflow-y-auto">
            {visible.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setActiveId(t.id)}
                  className="w-full text-left p-2 rounded-lg text-sm"
                  style={{
                    backgroundColor:
                      activeId === t.id ? "var(--psych-primary-light)" : "transparent",
                    color: "var(--psych-text)",
                  }}
                >
                  <div className="font-medium">{t.title}</div>
                  <div
                    className="text-[10px]"
                    style={{ color: "var(--psych-muted)" }}
                  >
                    {t.category}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </SectionCard>

        <div className="md:col-span-2 space-y-3">
          {topic && variant ? (
            <SectionCard
              title={topic.title}
              description={topic.category}
              action={
                <div className="flex items-center gap-2 print:hidden">
                  <Select
                    value={style}
                    onChange={(e) => setStyle(e.target.value as HandoutStyle)}
                    className="w-44"
                  >
                    {(Object.keys(STYLE_LABELS) as HandoutStyle[]).map((s) => (
                      <option key={s} value={s}>
                        {STYLE_LABELS[s]}
                      </option>
                    ))}
                  </Select>
                  <Button onClick={copy} variant="secondary" size="sm">
                    <Copy size={13} /> Copy
                  </Button>
                </div>
              }
            >
              <div className="space-y-3 text-sm" style={{ color: "var(--psych-text)" }}>
                <p>{variant.intro}</p>
                <Block heading="What it is" body={variant.whatItIs} />
                <Block heading="What it feels like" body={variant.whatItFeelsLike} />
                <Block heading="What helps" body={variant.whatHelps} />
                <Block heading="When to seek support" body={variant.whenToSeekSupport} />
                {variant.closing && <p className="italic">{variant.closing}</p>}
              </div>
            </SectionCard>
          ) : (
            <SectionCard title="Pick a topic">
              <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
                Choose a topic from the list to view variants.
              </p>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

function Block({ heading, body }: { heading: string; body: string }) {
  return (
    <div>
      <h4
        className="text-[10px] font-semibold uppercase tracking-wide mb-1"
        style={{ color: "var(--psych-muted)" }}
      >
        {heading}
      </h4>
      <p style={{ lineHeight: 1.6 }}>{body}</p>
    </div>
  );
}
