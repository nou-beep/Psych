"use client";
// Therapist thought-web editor — add typed nodes, drag them, connect
// them with typed links. Same data the client portal reads (when the
// node is marked shared) for visualization.

import { useMemo, useState } from "react";
import { Link2, Plus, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/AppContext";
import { usePsyGraph } from "@/contexts/PsyGraphContext";
import { ThoughtWeb } from "@/components/psy/ThoughtWeb";
import {
  KIND_LABELS,
  THERAPIST_ONLY_KINDS,
  CLIENT_AUTHORABLE_KINDS,
  type NodeKind,
} from "@/lib/psy/nodes";
import {
  LINK_TYPE_LABELS,
  type LinkType,
} from "@/lib/psy/links";

const ADDABLE_KINDS: NodeKind[] = [
  ...CLIENT_AUTHORABLE_KINDS,
  ...THERAPIST_ONLY_KINDS,
];

export default function ThoughtWebPage() {
  const { cases } = useApp();
  const {
    nodes,
    links,
    addNode,
    updateNode,
    deleteNode,
    addLink,
    deleteLink,
  } = usePsyGraph();

  const active = cases.filter((c) => !c.isArchived);
  const [caseId, setCaseId] = useState(active[0]?.id ?? "");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [linkingFromId, setLinkingFromId] = useState<string | null>(null);
  const [newKind, setNewKind] = useState<NodeKind>("thought");
  const [newLabel, setNewLabel] = useState("");
  const [newLinkType, setNewLinkType] = useState<LinkType>("causes");

  const caseNodes = useMemo(
    () => nodes.filter((n) => n.caseId === caseId),
    [nodes, caseId]
  );
  const caseLinks = useMemo(
    () => links.filter((l) => l.caseId === caseId),
    [links, caseId]
  );

  const selected = caseNodes.find((n) => n.id === selectedId) ?? null;

  function addNew() {
    if (!caseId || !newLabel.trim()) return;
    const n = addNode(caseId, newKind, {
      label: newLabel.trim(),
      meta: {
        authoredBy: "therapist",
        sharedWithTherapist: true,
        sharedWithClient: false,
        x: 0.35 + Math.random() * 0.3,
        y: 0.35 + Math.random() * 0.3,
      },
    });
    setSelectedId(n.id);
    setNewLabel("");
  }

  function handleNodeClick(id: string | null) {
    if (linkingFromId && id && id !== linkingFromId) {
      addLink(caseId, linkingFromId, id, { linkType: newLinkType });
      setLinkingFromId(null);
      setSelectedId(id);
      return;
    }
    setSelectedId(id);
  }

  function handleDrag(id: string, x: number, y: number) {
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    updateNode(id, { meta: { ...node.meta, x, y } });
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in" data-section="thesis">
      <PageHeader
        title="Thought web"
        subtitle="Interactive cognitive / emotional / relational mapping. Add typed nodes and connect them with link types that mean something."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div className="md:col-span-2">
          <Label className="text-xs">Case</Label>
          <Select value={caseId} onChange={(e) => setCaseId(e.target.value)}>
            <option value="">Choose a case…</option>
            {active.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.type}
              </option>
            ))}
          </Select>
        </div>
        <div className="text-xs flex items-end" style={{ color: "var(--psych-muted)" }}>
          {caseNodes.length} nodes · {caseLinks.length} links
        </div>
      </div>

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "1fr minmax(0, 320px)" }}
      >
        {/* Canvas */}
        <div>
          <ThoughtWeb
            nodes={caseNodes}
            links={caseLinks}
            selectedNodeId={selectedId}
            linkingFromId={linkingFromId}
            onSelect={handleNodeClick}
            onDragEnd={handleDrag}
            onLinkClick={(id) => deleteLink(id)}
          />
          {linkingFromId && (
            <div
              className="mt-2 text-xs flex items-center gap-2 p-2 rounded-lg"
              style={{
                background: "var(--psych-primary-light)",
                color: "var(--psych-accent)",
              }}
            >
              <Link2 size={13} />
              Click another node to link with{" "}
              <span className="font-mono">{newLinkType}</span>
              <button
                onClick={() => setLinkingFromId(null)}
                className="ml-auto"
                aria-label="Cancel linking"
              >
                <X size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="space-y-3">
          <SectionCard title="Add a node">
            <div className="space-y-2">
              <div>
                <Label className="text-xs">Kind</Label>
                <Select
                  value={newKind}
                  onChange={(e) => setNewKind(e.target.value as NodeKind)}
                >
                  {ADDABLE_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {KIND_LABELS[k]}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label className="text-xs">Label</Label>
                <Input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addNew();
                  }}
                  placeholder="e.g. 'argument with parent', 'shame'"
                />
              </div>
              <Button size="sm" onClick={addNew} disabled={!caseId || !newLabel.trim()}>
                <Plus size={13} /> Add node
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="Selected node">
            {!selected ? (
              <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
                Pick a node on the canvas to edit it, or start a link from it.
              </p>
            ) : (
              <div className="space-y-2">
                <div
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: "var(--psych-muted)" }}
                >
                  {KIND_LABELS[selected.kind]}
                </div>
                <Input
                  value={selected.label}
                  onChange={(e) => updateNode(selected.id, { label: e.target.value })}
                />
                <Textarea
                  value={selected.notes}
                  onChange={(e) => updateNode(selected.id, { notes: e.target.value })}
                  placeholder="Clinical observation, context, link to a session…"
                  className="text-sm min-h-[80px]"
                />
                <Input
                  value={selected.tags.join(", ")}
                  onChange={(e) =>
                    updateNode(selected.id, {
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="tags (comma-sep) — shame, abandonment…"
                />
                <label
                  className="text-xs inline-flex items-center gap-2"
                  style={{ color: "var(--psych-muted)" }}
                >
                  <input
                    type="checkbox"
                    checked={selected.meta?.sharedWithClient ?? false}
                    onChange={(e) =>
                      updateNode(selected.id, {
                        meta: {
                          ...selected.meta,
                          sharedWithClient: e.target.checked,
                        },
                      })
                    }
                  />
                  Visible to client
                </label>

                <div className="flex items-center gap-2 pt-1">
                  <Select
                    value={newLinkType}
                    onChange={(e) => setNewLinkType(e.target.value as LinkType)}
                    className="flex-1"
                  >
                    {(Object.keys(LINK_TYPE_LABELS) as LinkType[]).map((t) => (
                      <option key={t} value={t}>
                        link as {LINK_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </Select>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setLinkingFromId(selected.id)}
                  >
                    <Link2 size={13} /> Link
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    deleteNode(selected.id);
                    setSelectedId(null);
                  }}
                >
                  <Trash2 size={12} /> Delete node
                </Button>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Tips">
            <ul
              className="text-xs space-y-1"
              style={{ color: "var(--psych-muted)" }}
            >
              <li>· Drag nodes to reorganise the canvas.</li>
              <li>· Click a link to delete it.</li>
              <li>
                · &ldquo;Contradicts&rdquo; links render as dashed lines —
                useful for internal-conflict mapping.
              </li>
              <li>
                · Mark a node &ldquo;visible to client&rdquo; if you want the
                client portal to surface it.
              </li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
