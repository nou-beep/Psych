"use client";
// Body map — SVG silhouette with clickable regions. The same component
// is used in the therapist viewer (read + annotate) and the client
// entry (tap + describe). The caller passes the selected region id
// and an aggregated intensity map per region.

import { BODY_REGIONS, type BodyRegionId } from "@/lib/psy/body-regions";

interface Props {
  selectedRegion?: BodyRegionId | null;
  // Map of region id → 0..1 intensity (used for heatmap fill opacity).
  heat?: Partial<Record<BodyRegionId, number>>;
  // When false, regions are display-only.
  interactive?: boolean;
  onSelect?: (id: BodyRegionId) => void;
  // Accent colour for the active region.
  accent?: string;
  // Optional region badge counts (e.g. number of entries) shown next to
  // each region.
  counts?: Partial<Record<BodyRegionId, number>>;
}

export function BodyMap({
  selectedRegion,
  heat,
  interactive = true,
  onSelect,
  accent = "var(--psych-primary, #C77DAA)",
  counts,
}: Props) {
  return (
    <svg
      viewBox="0 0 200 400"
      width="100%"
      height="100%"
      role="img"
      aria-label="Body map"
      style={{ maxHeight: 480 }}
    >
      <defs>
        <linearGradient id="body-bg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--section-tint, rgba(199,125,170,0.10))" />
          <stop offset="100%" stopColor="var(--psych-card, white)" />
        </linearGradient>
      </defs>

      {/* Silhouette — composed from simple ellipses + rounded rects.
          Not anatomically detailed by design; the focus is the regions. */}
      <g stroke="var(--psych-border, #FECDD3)" strokeWidth="1.2" fill="url(#body-bg)">
        {/* Head */}
        <ellipse cx="100" cy="36" rx="22" ry="26" />
        {/* Neck */}
        <rect x="92" y="60" width="16" height="14" rx="4" />
        {/* Torso */}
        <path d="M68 78 Q70 74 100 74 Q130 74 132 78 L138 200 Q120 226 100 226 Q80 226 62 200 Z" />
        {/* Hips */}
        <path d="M70 220 Q70 244 100 250 Q130 244 130 220 Z" />
        {/* Left arm */}
        <path d="M68 88 Q52 90 50 140 Q48 200 40 226 Q44 230 50 226 Q60 200 64 144 Q64 110 70 96 Z" />
        {/* Right arm */}
        <path d="M132 88 Q148 90 150 140 Q152 200 160 226 Q156 230 150 226 Q140 200 136 144 Q136 110 130 96 Z" />
        {/* Left leg */}
        <path d="M82 250 Q78 290 84 360 L94 372 Q100 320 96 256 Z" />
        {/* Right leg */}
        <path d="M118 250 Q122 290 116 360 L106 372 Q100 320 104 256 Z" />
      </g>

      {/* Region hit areas */}
      {BODY_REGIONS.filter((r) => r.id !== "whole-body").map((r) => {
        const intensity = heat?.[r.id] ?? 0;
        const active = selectedRegion === r.id;
        const fill = active
          ? accent
          : intensity > 0
          ? accent
          : "transparent";
        const opacity = active ? 0.85 : intensity > 0 ? 0.18 + intensity * 0.6 : 0;
        const c = counts?.[r.id] ?? 0;
        return (
          <g key={r.id}>
            <circle
              cx={r.cx}
              cy={r.cy}
              r={r.r}
              fill={fill}
              fillOpacity={opacity}
              stroke={active ? accent : "transparent"}
              strokeWidth={active ? 1.5 : 0}
              style={{
                cursor: interactive ? "pointer" : "default",
                transition: "fill-opacity 0.2s, stroke 0.2s",
              }}
              onClick={() => interactive && onSelect?.(r.id)}
              role={interactive ? "button" : undefined}
              aria-label={`${r.label}${c > 0 ? ` (${c} entries)` : ""}`}
            />
            {c > 0 && (
              <text
                x={r.cx}
                y={r.cy + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fontWeight={600}
                fill="white"
                pointerEvents="none"
                style={{
                  paintOrder: "stroke",
                  stroke: accent,
                  strokeWidth: 0.8,
                }}
              >
                {c}
              </text>
            )}
          </g>
        );
      })}

      {/* Whole-body band at the bottom */}
      <g>
        <rect
          x="20"
          y="384"
          width="160"
          height="12"
          rx="6"
          fill={
            selectedRegion === "whole-body"
              ? accent
              : (heat?.["whole-body"] ?? 0) > 0
              ? accent
              : "transparent"
          }
          fillOpacity={
            selectedRegion === "whole-body"
              ? 0.85
              : 0.15 + (heat?.["whole-body"] ?? 0) * 0.5
          }
          stroke="var(--psych-border, #FECDD3)"
          strokeWidth="1"
          style={{ cursor: interactive ? "pointer" : "default" }}
          onClick={() => interactive && onSelect?.("whole-body")}
          role={interactive ? "button" : undefined}
          aria-label="Whole body"
        />
        <text
          x="100"
          y="394"
          textAnchor="middle"
          fontSize="8"
          fill="var(--psych-muted, #64748B)"
          pointerEvents="none"
        >
          whole body
        </text>
      </g>
    </svg>
  );
}
