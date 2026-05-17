"use client";
// Recharts-based line chart for the longitudinal tracking view.

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  NamedSeries,
  OverlayMarker,
} from "@/lib/clinical/longitudinal";

const PALETTE = [
  "#EC4899",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#14B8A6",
];

function buildChartData(series: NamedSeries[]): Array<Record<string, number | string>> {
  // Collect all dates across all series, sorted ascending.
  const dates = Array.from(
    new Set(series.flatMap((s) => s.points.map((p) => p.date)))
  ).sort();
  return dates.map((date) => {
    const row: Record<string, number | string> = { date };
    for (const s of series) {
      const found = s.points.find((p) => p.date === date);
      if (found) row[s.label] = found.value;
    }
    return row;
  });
}

export default function LongitudinalChart({
  series,
  overlays,
}: {
  series: NamedSeries[];
  overlays?: OverlayMarker[];
}) {
  const data = buildChartData(series);

  if (data.length === 0) {
    return (
      <div
        className="text-sm py-8 text-center"
        style={{ color: "var(--psych-muted)" }}
      >
        No data points to chart yet.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 10, right: 12, left: 0, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis dataKey="date" fontSize={11} tickMargin={6} />
          <YAxis fontSize={11} tickMargin={6} />
          <Tooltip
            wrapperStyle={{ fontSize: 12 }}
            contentStyle={{
              backgroundColor: "var(--psych-card)",
              border: "1px solid var(--psych-border)",
              borderRadius: 10,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {series.map((s, i) => (
            <Line
              key={s.id}
              type="monotone"
              dataKey={s.label}
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
          {/* Overlay markers as vertical reference lines */}
          {(overlays ?? []).map((m, i) => (
            <ReferenceLine
              key={`${m.date}-${i}`}
              x={m.date}
              stroke={m.color ?? "rgba(120,120,120,0.35)"}
              strokeDasharray="3 3"
              label={{
                value: m.kind[0].toUpperCase(),
                position: "top",
                fontSize: 10,
                fill: m.color ?? "rgba(120,120,120,0.7)",
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {overlays && overlays.length > 0 && (
        <div
          className="text-[11px] mt-1 flex flex-wrap gap-2"
          style={{ color: "var(--psych-muted)" }}
        >
          {overlays.slice(0, 8).map((m, i) => (
            <span key={i}>
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  marginRight: 4,
                  backgroundColor: m.color ?? "#94A3B8",
                }}
              />
              {m.date} — {m.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
