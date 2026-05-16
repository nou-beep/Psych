"use client";
// Clean line chart for the client progress page. Recharts under the hood.

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrackingSeries } from "@/lib/client/client-tracking";

export default function ProgressChart({ series }: { series: TrackingSeries }) {
  const data = series.points.map((p) => ({ date: p.date, value: p.value }));
  return (
    <div style={{ width: "100%", height: 240 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 6 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis dataKey="date" fontSize={10} tickMargin={6} />
          <YAxis domain={[0, 10]} fontSize={10} tickMargin={6} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--cp-card)",
              border: "1px solid var(--cp-border)",
              borderRadius: 10,
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--cp-accent)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--cp-accent)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
