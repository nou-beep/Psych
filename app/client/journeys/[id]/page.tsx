"use client";
// Journey player — step-by-step with soft pacing. No timers; user moves.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ClientShell } from "@/components/client/ClientShell";
import { useClientPortal } from "@/contexts/ClientPortalContext";
import {
  getJourney,
  percentDone,
  type JourneyId,
} from "@/lib/client/journeys";

export default function JourneyPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as JourneyId) ?? ("" as JourneyId);
  const journey = useMemo(() => getJourney(id), [id]);
  const {
    journeyProgress,
    completeJourneyStep,
    startAftercare,
  } = useClientPortal();
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    setStepIdx(0);
  }, [id]);

  if (!journey) {
    return (
      <ClientShell title="Journey not found">
        <Link
          href="/client/journeys"
          style={{ color: "var(--cp-accent)", textDecoration: "none" }}
        >
          ← Back to journeys
        </Link>
      </ClientShell>
    );
  }

  const step = journey.steps[stepIdx];
  const progress = journeyProgress[journey.id];
  const pct = progress ? percentDone(journey, progress) : 0;
  const isLast = stepIdx === journey.steps.length - 1;

  function next() {
    completeJourneyStep(journey!.id, step.id);
    if (isLast) {
      startAftercare();
      router.push("/client/journeys");
    } else {
      setStepIdx((i) => i + 1);
    }
  }

  return (
    <ClientShell title={journey.title} microcopy={journey.microcopy}>
      <Link
        href="/client/journeys"
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
        <ArrowLeft size={14} /> Journeys
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
        Step {stepIdx + 1} of {journey.steps.length}
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

      <div
        key={step.id}
        className="cp-card cp-fade-in"
        style={{ marginBottom: "1rem", textAlign: "center", padding: "2rem 1.25rem" }}
      >
        <div
          style={{
            fontSize: "0.72rem",
            color: "var(--cp-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 6,
          }}
        >
          {step.kind}
        </div>
        <h2
          style={{
            margin: 0,
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "var(--cp-text)",
          }}
        >
          {step.title}
        </h2>
        <p
          className="cp-microcopy"
          style={{
            marginTop: 12,
            fontSize: "0.95rem",
            lineHeight: 1.6,
            maxWidth: 460,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {step.body}
        </p>
        {step.microcopy && (
          <p
            className="cp-microcopy"
            style={{ marginTop: 8, fontSize: "0.78rem" }}
          >
            {step.microcopy}
          </p>
        )}
      </div>

      <button
        onClick={next}
        style={{
          all: "unset",
          cursor: "pointer",
          display: "block",
          width: "100%",
          textAlign: "center",
          padding: "0.9rem",
          borderRadius: 16,
          background: "var(--cp-accent)",
          color: "white",
          fontSize: "0.92rem",
          fontWeight: 500,
        }}
      >
        {isLast ? "Finish softly" : "Continue gently"}
      </button>
    </ClientShell>
  );
}
