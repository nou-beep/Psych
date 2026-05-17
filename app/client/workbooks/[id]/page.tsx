"use client";
// Interactive workbook player. Steps render different controls depending
// on kind (slider, body map, free-write, thought cards, before/after).

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ClientShell } from "@/components/client/ClientShell";
import { useClientPortal } from "@/contexts/ClientPortalContext";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import { CLIENT_STORE_KEYS } from "@/lib/client/portal-store";
import {
  SAMPLE_THOUGHT_CARDS,
  emptyProgress,
  getWorkbook,
  markCompleted,
  percentCompleted,
  setAnswer,
  type WorkbookProgress,
} from "@/lib/client/workbooks";

const BODY_REGIONS = [
  "Head",
  "Chest",
  "Stomach",
  "Throat",
  "Shoulders",
  "Hands",
  "Legs",
  "All over",
];

type ProgressMap = Record<string, WorkbookProgress>;

function loadProgressMap(): ProgressMap {
  return loadFromStorage<ProgressMap>(CLIENT_STORE_KEYS.WORKBOOK_PROGRESS, {});
}
function saveProgressMap(p: ProgressMap) {
  saveToStorage(CLIENT_STORE_KEYS.WORKBOOK_PROGRESS, p);
}

export default function WorkbookPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) ?? "";
  const wb = useMemo(() => getWorkbook(id), [id]);
  const { startAftercare } = useClientPortal();

  const [progress, setProgress] = useState<WorkbookProgress | null>(null);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const map = loadProgressMap();
    setProgress(map[id] ?? emptyProgress(id));
  }, [id]);

  function persist(next: WorkbookProgress) {
    setProgress(next);
    const map = loadProgressMap();
    map[id] = next;
    saveProgressMap(map);
  }

  if (!wb) {
    return (
      <ClientShell title="Workbook not found">
        <Link
          href="/client/workbooks"
          style={{
            color: "var(--cp-accent)",
            textDecoration: "none",
            fontSize: "0.9rem",
          }}
        >
          ← Back to workbooks
        </Link>
      </ClientShell>
    );
  }

  if (!progress) return <ClientShell title={wb.title} />;

  const step = wb.steps[stepIdx];
  const answer = progress.answers[step.id] ?? {};

  function patch(p: Partial<typeof answer>) {
    if (!progress) return;
    persist(setAnswer(progress, step.id, p));
  }

  function next() {
    if (stepIdx < wb.steps.length - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      // Last step — mark completed, start aftercare, back to list.
      if (progress) persist(markCompleted(progress));
      startAftercare();
      router.push("/client/workbooks");
    }
  }

  const pct = percentCompleted(wb, progress);

  return (
    <ClientShell title={wb.title} microcopy={wb.microcopy}>
      <Link
        href="/client/workbooks"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: "0.82rem",
          color: "var(--cp-muted)",
          textDecoration: "none",
          marginBottom: 12,
        }}
      >
        <ArrowLeft size={14} /> Workbooks
      </Link>

      <div
        className="cp-card-soft cp-fade-in"
        style={{
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: "0.82rem",
          color: "var(--cp-muted)",
        }}
      >
        Step {stepIdx + 1} of {wb.steps.length}
        <div
          style={{
            flex: 1,
            height: 4,
            borderRadius: 999,
            background: "var(--cp-border)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: "var(--cp-accent)",
            }}
          />
        </div>
      </div>

      <div className="cp-card cp-fade-in" style={{ marginBottom: "1rem" }}>
        <div
          style={{
            fontSize: "0.72rem",
            color: "var(--cp-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 4,
          }}
        >
          {step.kind.replace("-", " ")}
        </div>
        <h2
          style={{
            margin: 0,
            fontSize: "1.05rem",
            fontWeight: 600,
            color: "var(--cp-text)",
          }}
        >
          {step.title}
        </h2>
        <p
          className="cp-microcopy"
          style={{ marginTop: 4, fontSize: "0.88rem" }}
        >
          {step.prompt}
        </p>
        {step.microcopy && (
          <p
            className="cp-microcopy"
            style={{ marginTop: 4, fontSize: "0.78rem" }}
          >
            {step.microcopy}
          </p>
        )}

        <div style={{ marginTop: "1rem" }}>
          {step.kind === "free-write" && (
            <textarea
              value={answer.text ?? ""}
              onChange={(e) => patch({ text: e.target.value })}
              placeholder="Whatever lands."
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 14,
                border: "1px solid var(--cp-border)",
                background: "var(--cp-card-soft)",
                color: "var(--cp-text)",
                fontSize: "0.9rem",
                minHeight: 120,
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
          )}

          {step.kind === "emotion-slider" && (
            <div>
              <input
                type="range"
                min={0}
                max={10}
                value={
                  typeof answer.sliderBefore === "number"
                    ? answer.sliderBefore
                    : 5
                }
                onChange={(e) =>
                  patch({ sliderBefore: Number(e.target.value) })
                }
                style={{ width: "100%", accentColor: "var(--cp-accent)" }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.74rem",
                  color: "var(--cp-muted)",
                }}
              >
                <span>Quiet</span>
                <span>{answer.sliderBefore ?? 5}</span>
                <span>Loud</span>
              </div>
            </div>
          )}

          {step.kind === "before-after" && (
            <div style={{ display: "grid", gap: 12 }}>
              <SliderRow
                label="Before"
                value={answer.sliderBefore}
                onChange={(v) => patch({ sliderBefore: v })}
              />
              <SliderRow
                label="After"
                value={answer.sliderAfter}
                onChange={(v) => patch({ sliderAfter: v })}
              />
            </div>
          )}

          {step.kind === "body-map" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                gap: 6,
              }}
            >
              {BODY_REGIONS.map((r) => {
                const selected = answer.bodyMap?.includes(r) ?? false;
                return (
                  <button
                    key={r}
                    onClick={() =>
                      patch({
                        bodyMap: selected
                          ? (answer.bodyMap ?? []).filter((x) => x !== r)
                          : [...(answer.bodyMap ?? []), r],
                      })
                    }
                    aria-pressed={selected}
                    style={{
                      all: "unset",
                      cursor: "pointer",
                      padding: "0.55rem 0.8rem",
                      borderRadius: 12,
                      border: `1px solid ${
                        selected ? "var(--cp-accent)" : "var(--cp-border)"
                      }`,
                      background: selected
                        ? "var(--cp-glow)"
                        : "var(--cp-card-soft)",
                      fontSize: "0.82rem",
                      color: "var(--cp-text)",
                      textAlign: "center",
                    }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          )}

          {step.kind === "thought-cards" && (
            <div style={{ display: "grid", gap: 6 }}>
              {SAMPLE_THOUGHT_CARDS.map((card) => {
                const chosen = answer.chosenCard === card;
                return (
                  <button
                    key={card}
                    onClick={() =>
                      patch({ chosenCard: chosen ? undefined : card })
                    }
                    aria-pressed={chosen}
                    style={{
                      all: "unset",
                      cursor: "pointer",
                      padding: "0.7rem 0.85rem",
                      borderRadius: 14,
                      border: `1px solid ${
                        chosen ? "var(--cp-accent)" : "var(--cp-border)"
                      }`,
                      background: chosen
                        ? "var(--cp-glow)"
                        : "var(--cp-card-soft)",
                      fontSize: "0.88rem",
                      color: "var(--cp-text)",
                      lineHeight: 1.5,
                    }}
                  >
                    {card}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {stepIdx > 0 && (
          <button
            onClick={() => setStepIdx(stepIdx - 1)}
            style={{
              all: "unset",
              cursor: "pointer",
              flex: 1,
              textAlign: "center",
              padding: "0.85rem",
              borderRadius: 16,
              border: "1px solid var(--cp-border)",
              background: "var(--cp-card-soft)",
              color: "var(--cp-text)",
              fontSize: "0.88rem",
            }}
          >
            Back
          </button>
        )}
        <button
          onClick={next}
          style={{
            all: "unset",
            cursor: "pointer",
            flex: 2,
            textAlign: "center",
            padding: "0.85rem",
            borderRadius: 16,
            background: "var(--cp-accent)",
            color: "white",
            fontSize: "0.9rem",
            fontWeight: 500,
          }}
        >
          {stepIdx === wb.steps.length - 1 ? "Finish softly" : "Next"}
        </button>
      </div>
    </ClientShell>
  );
}

function SliderRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: "0.78rem",
          color: "var(--cp-muted)",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <input
        type="range"
        min={0}
        max={10}
        value={typeof value === "number" ? value : 5}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--cp-accent)" }}
      />
      <div
        style={{
          fontSize: "0.74rem",
          color: "var(--cp-muted)",
          textAlign: "center",
        }}
      >
        {value ?? "—"}
      </div>
    </div>
  );
}
