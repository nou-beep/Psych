"use client";
// Direct recharts usage — imported via dynamic() with ssr:false from ChartsPanel
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Legend, Cell,
} from "recharts";
import { type ThesisParticipant, statMean } from "@/lib/thesis-data";

const GROUP_COLORS: Record<string, string> = {
  Clinical: "#F43F5E",
  Subclinical: "#A78BFA",
  Control: "#34D399",
};

const SCALE_COLORS = {
  depression: "#F43F5E",
  anxiety: "#F59E0B",
  depersonalization: "#8B5CF6",
  derealization: "#6366F1",
};

interface Props {
  participants: ThesisParticipant[];
}

function scoreDistribution(participants: ThesisParticipant[], key: keyof ThesisParticipant, bins: number[]) {
  return bins.map((bin, i) => {
    const next = bins[i + 1] ?? Infinity;
    const count = participants.filter((p) => {
      const v = p[key];
      return typeof v === "number" && v >= bin && v < next;
    }).length;
    return { range: `${bin}${next === Infinity ? "+" : `–${next - 1}`}`, count };
  });
}

export function DepressionDistributionChart({ participants }: Props) {
  const data = scoreDistribution(participants, "depressionScore", [0, 5, 10, 15, 20, 25]);
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="range" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" fill={SCALE_COLORS.depression} radius={[4, 4, 0, 0]} name="Participants" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AnxietyDistributionChart({ participants }: Props) {
  const data = scoreDistribution(participants, "anxietyScore", [0, 5, 10, 15, 20]);
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="range" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" fill={SCALE_COLORS.anxiety} radius={[4, 4, 0, 0]} name="Participants" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DPDRDistributionChart({ participants }: Props) {
  const data = scoreDistribution(participants, "depersonalizationScore", [0, 5, 10, 15, 20, 25]);
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="range" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" fill={SCALE_COLORS.depersonalization} radius={[4, 4, 0, 0]} name="Participants" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ScatterDepAnx({ participants }: Props) {
  const data = participants
    .filter((p) => p.depressionScore !== null && p.anxietyScore !== null)
    .map((p) => ({ x: p.depressionScore!, y: p.anxietyScore!, group: p.group }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ScatterChart margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="x" name="Depression" tick={{ fontSize: 10 }} label={{ value: "Depression", position: "insideBottom", offset: -2, fontSize: 10 }} />
        <YAxis dataKey="y" name="Anxiety" tick={{ fontSize: 10 }} />
        <ZAxis range={[40, 40]} />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(v: number, name: string) => [v, name === "x" ? "Depression" : "Anxiety"]} />
        <Scatter name="Participants" data={data}>
          {data.map((entry, i) => (
            <Cell key={i} fill={GROUP_COLORS[entry.group] ?? "#94A3B8"} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function ScatterAnxDPDR({ participants }: Props) {
  const data = participants
    .filter((p) => p.anxietyScore !== null && p.depersonalizationScore !== null)
    .map((p) => ({ x: p.anxietyScore!, y: p.depersonalizationScore!, group: p.group }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ScatterChart margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="x" name="Anxiety" tick={{ fontSize: 10 }} label={{ value: "Anxiety", position: "insideBottom", offset: -2, fontSize: 10 }} />
        <YAxis dataKey="y" name="Depersonalization" tick={{ fontSize: 10 }} />
        <ZAxis range={[40, 40]} />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Scatter name="Participants" data={data}>
          {data.map((entry, i) => (
            <Cell key={i} fill={GROUP_COLORS[entry.group] ?? "#94A3B8"} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function GroupComparisonChart({ participants }: Props) {
  const groups = ["Clinical", "Subclinical", "Control"] as const;
  const data = groups.map((g) => {
    const gp = participants.filter((p) => p.group === g);
    const nums = (key: keyof ThesisParticipant) =>
      gp.map((p) => p[key]).filter((v): v is number => typeof v === "number");
    return {
      group: g,
      Depression: parseFloat(statMean(nums("depressionScore")).toFixed(1)),
      Anxiety: parseFloat(statMean(nums("anxietyScore")).toFixed(1)),
      DPDR: parseFloat(statMean(nums("depersonalizationScore")).toFixed(1)),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="group" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 10 }} />
        <Bar dataKey="Depression" fill={SCALE_COLORS.depression} radius={[3, 3, 0, 0]} />
        <Bar dataKey="Anxiety" fill={SCALE_COLORS.anxiety} radius={[3, 3, 0, 0]} />
        <Bar dataKey="DPDR" fill={SCALE_COLORS.depersonalization} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ColorLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs mt-2">
      {Object.entries(GROUP_COLORS).map(([g, c]) => (
        <span key={g} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: c }} />
          {g}
        </span>
      ))}
    </div>
  );
}
