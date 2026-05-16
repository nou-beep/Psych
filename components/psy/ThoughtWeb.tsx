"use client";
// Thought web canvas — draggable nodes + typed links. Pure SVG. The
// caller passes the nodes + links and CRUD handlers; this component
// keeps a small bit of drag state but never owns the data.

import { useRef, useState } from "react";
import type { PsyLink, PsyNode } from "@/lib/psy/nodes";
import { KIND_LABELS } from "@/lib/psy/nodes";

const KIND_COLOURS: Record<string, string> = {
  thought: "#6B7AA0",
  emotion: "#C77DAA",
  "body-sensation": "#9882C0",
  situation: "#7E7A6E",
  memory: "#8B4A66",
  person: "#3D5C3D",
  behavior: "#B07A4F",
  defense: "#9B4D3A",
  distortion: "#A4756A",
  role: "#8A6E5D",
  thread: "#9F1239",
  conflict: "#8B4A66",
};

const LINK_STROKES: Record<string, string> = {
  causes: "#9F1239",
  follows: "#6B7AA0",
  "related-to": "#94A3B8",
  contradicts: "#9B4D3A",
  "recurs-with": "#B07A4F",
  "defends-against": "#8B4A66",
  expresses: "#7E7A6E",
};

interface Props {
  nodes: PsyNode[];
  links: PsyLink[];
  selectedNodeId?: string | null;
  linkingFromId?: string | null;
  onSelect?: (nodeId: string | null) => void;
  onDragEnd?: (nodeId: string, x: number, y: number) => void;
  onLinkClick?: (linkId: string) => void;
  // Read-only mode (e.g. client preview).
  readOnly?: boolean;
}

const CANVAS_W = 800;
const CANVAS_H = 520;

export function ThoughtWeb({
  nodes,
  links,
  selectedNodeId,
  linkingFromId,
  onSelect,
  onDragEnd,
  onLinkClick,
  readOnly = false,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number } | null>(
    null
  );
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  function toLocal(e: { clientX: number; clientY: number }) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_H;
    return { x, y };
  }

  function onPointerDown(node: PsyNode, e: React.PointerEvent) {
    if (readOnly) return;
    e.stopPropagation();
    onSelect?.(node.id);
    if (linkingFromId) return;
    const local = toLocal(e);
    const nx = (node.meta?.x ?? 0.5) * CANVAS_W;
    const ny = (node.meta?.y ?? 0.5) * CANVAS_H;
    setDrag({ id: node.id, dx: local.x - nx, dy: local.y - ny });
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const local = toLocal(e);
    if (linkingFromId) setHoverPos(local);
    if (!drag) return;
    const x = (local.x - drag.dx) / CANVAS_W;
    const y = (local.y - drag.dy) / CANVAS_H;
    onDragEnd?.(drag.id, Math.max(0.04, Math.min(0.96, x)), Math.max(0.04, Math.min(0.96, y)));
  }

  function onPointerUp(e: React.PointerEvent) {
    if (drag) (e.target as Element).releasePointerCapture?.(e.pointerId);
    setDrag(null);
  }

  function bgClick() {
    if (linkingFromId) return;
    onSelect?.(null);
  }

  const nodePos = (n: PsyNode) => ({
    x: (n.meta?.x ?? 0.5) * CANVAS_W,
    y: (n.meta?.y ?? 0.5) * CANVAS_H,
  });

  const fromForGhost =
    linkingFromId && nodes.find((n) => n.id === linkingFromId);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      width="100%"
      height="100%"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={bgClick}
      style={{
        background: "var(--psych-card, white)",
        border: "1px solid var(--psych-border, #e5e7eb)",
        borderRadius: 16,
        cursor: linkingFromId ? "crosshair" : "default",
        touchAction: "none",
        minHeight: 480,
      }}
      role="img"
      aria-label="Thought web"
    >
      <defs>
        <pattern
          id="web-grid"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="20" cy="20" r="1" fill="rgba(0,0,0,0.05)" />
        </pattern>
        <marker
          id="arrow-causes"
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" fill={LINK_STROKES.causes} />
        </marker>
      </defs>
      <rect width={CANVAS_W} height={CANVAS_H} fill="url(#web-grid)" />

      {/* Links */}
      {links.map((l) => {
        const from = nodes.find((n) => n.id === l.fromNodeId);
        const to = nodes.find((n) => n.id === l.toNodeId);
        if (!from || !to) return null;
        const a = nodePos(from);
        const b = nodePos(to);
        const stroke = LINK_STROKES[l.linkType] ?? "#94A3B8";
        const isContradiction = l.linkType === "contradicts";
        return (
          <g
            key={l.id}
            style={{ cursor: readOnly ? "default" : "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              if (!readOnly) onLinkClick?.(l.id);
            }}
          >
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={stroke}
              strokeWidth={1 + l.strength * 0.6}
              strokeOpacity={0.55}
              strokeDasharray={isContradiction ? "6 4" : undefined}
              markerEnd={l.linkType === "causes" ? "url(#arrow-causes)" : undefined}
            />
            <text
              x={(a.x + b.x) / 2}
              y={(a.y + b.y) / 2 - 4}
              textAnchor="middle"
              fontSize="10"
              fill={stroke}
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              {l.linkType.replace("-", " ")}
            </text>
          </g>
        );
      })}

      {/* Ghost link while linking */}
      {fromForGhost && hoverPos && (
        <line
          x1={nodePos(fromForGhost).x}
          y1={nodePos(fromForGhost).y}
          x2={hoverPos.x}
          y2={hoverPos.y}
          stroke="#94A3B8"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
      )}

      {/* Nodes */}
      {nodes.map((n) => {
        const p = nodePos(n);
        const colour = KIND_COLOURS[n.kind] ?? "#94A3B8";
        const isSelected = n.id === selectedNodeId;
        const isLinkSource = n.id === linkingFromId;
        const label = n.label || KIND_LABELS[n.kind];
        const w = Math.min(160, Math.max(64, label.length * 7 + 18));
        return (
          <g
            key={n.id}
            transform={`translate(${p.x - w / 2}, ${p.y - 20})`}
            onPointerDown={(e) => onPointerDown(n, e)}
            style={{ cursor: readOnly ? "default" : "grab" }}
          >
            <rect
              width={w}
              height={40}
              rx={14}
              fill={colour}
              fillOpacity={isSelected ? 0.95 : 0.85}
              stroke={isLinkSource ? "#9F1239" : isSelected ? "white" : "rgba(0,0,0,0.15)"}
              strokeWidth={isLinkSource ? 3 : isSelected ? 2 : 1}
            />
            <text
              x={w / 2}
              y={17}
              textAnchor="middle"
              fontSize="9"
              fill="white"
              fillOpacity={0.75}
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              {KIND_LABELS[n.kind].toLowerCase()}
            </text>
            <text
              x={w / 2}
              y={31}
              textAnchor="middle"
              fontSize="12"
              fontWeight={600}
              fill="white"
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              {label.length > 22 ? label.slice(0, 21) + "…" : label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
