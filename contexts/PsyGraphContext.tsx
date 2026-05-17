"use client";
// Psychological graph store — owns the unified nodes + links that
// drive the body-map, thought-web, threads, and session-recap surfaces.
// Persisted in localStorage; both portals read from this single source.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import {
  NODES_STORAGE_KEY,
  emptyNode as emptyNodeHelper,
  update as updateNodeHelper,
  type NodeKind,
  type PsyNode,
} from "@/lib/psy/nodes";
import {
  LINKS_STORAGE_KEY,
  emptyLink as emptyLinkHelper,
  pruneOrphans,
  type LinkType,
  type PsyLink,
} from "@/lib/psy/links";

interface PsyGraphContextType {
  nodes: PsyNode[];
  links: PsyLink[];

  addNode: (caseId: string, kind: NodeKind, overrides?: Partial<PsyNode>) => PsyNode;
  updateNode: (id: string, patch: Partial<PsyNode>) => void;
  deleteNode: (id: string) => void;

  addLink: (
    caseId: string,
    fromNodeId: string,
    toNodeId: string,
    overrides?: Partial<PsyLink>
  ) => PsyLink;
  updateLink: (id: string, patch: Partial<PsyLink>) => void;
  deleteLink: (id: string) => void;

  // Convenience: bulk replace (used by drag-to-position in the thought web)
  replaceNodes: (next: PsyNode[]) => void;
}

const PsyGraphContext = createContext<PsyGraphContextType | null>(null);

export function PsyGraphProvider({ children }: { children: ReactNode }) {
  const [nodes, setNodes] = useState<PsyNode[]>([]);
  const [links, setLinks] = useState<PsyLink[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const storedNodes = loadFromStorage<PsyNode[]>(NODES_STORAGE_KEY, []);
      const storedLinks = loadFromStorage<PsyLink[]>(LINKS_STORAGE_KEY, []);
      setNodes(Array.isArray(storedNodes) ? storedNodes : []);
      setLinks(Array.isArray(storedLinks) ? storedLinks : []);
    } catch {
      setNodes([]);
      setLinks([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveToStorage(NODES_STORAGE_KEY, nodes);
  }, [nodes, ready]);
  useEffect(() => {
    if (ready) saveToStorage(LINKS_STORAGE_KEY, links);
  }, [links, ready]);

  const addNode = useCallback(
    (caseId: string, kind: NodeKind, overrides: Partial<PsyNode> = {}) => {
      const n = emptyNodeHelper(caseId, kind, overrides);
      setNodes((prev) => [n, ...prev]);
      return n;
    },
    []
  );

  const updateNode = useCallback((id: string, patch: Partial<PsyNode>) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? updateNodeHelper(n, patch) : n))
    );
  }, []);

  const deleteNode = useCallback((id: string) => {
    setNodes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      // Prune orphan links pointing to the deleted node.
      const validIds = new Set(next.map((n) => n.id));
      setLinks((prevLinks) => pruneOrphans(prevLinks, validIds));
      return next;
    });
  }, []);

  const addLink = useCallback(
    (
      caseId: string,
      fromNodeId: string,
      toNodeId: string,
      overrides: Partial<PsyLink> = {}
    ) => {
      const l = emptyLinkHelper(caseId, fromNodeId, toNodeId, overrides);
      setLinks((prev) => [l, ...prev]);
      return l;
    },
    []
  );

  const updateLink = useCallback((id: string, patch: Partial<PsyLink>) => {
    setLinks((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, ...patch, updatedAt: new Date().toISOString() }
          : l
      )
    );
  }, []);

  const deleteLink = useCallback((id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const replaceNodes = useCallback((next: PsyNode[]) => {
    setNodes(next);
  }, []);

  const value = useMemo<PsyGraphContextType>(
    () => ({
      nodes,
      links,
      addNode,
      updateNode,
      deleteNode,
      addLink,
      updateLink,
      deleteLink,
      replaceNodes,
    }),
    [
      nodes,
      links,
      addNode,
      updateNode,
      deleteNode,
      addLink,
      updateLink,
      deleteLink,
      replaceNodes,
    ]
  );

  return (
    <PsyGraphContext.Provider value={value}>
      {children}
    </PsyGraphContext.Provider>
  );
}

export function usePsyGraph() {
  const ctx = useContext(PsyGraphContext);
  if (!ctx)
    throw new Error("usePsyGraph must be used inside PsyGraphProvider");
  return ctx;
}

// Re-export the constant link types so callers don't need a second import.
export type { LinkType, PsyNode, PsyLink, NodeKind };
