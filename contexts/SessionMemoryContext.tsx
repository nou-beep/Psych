"use client";
// SessionMemoryContext — holds the working-memory list as React state
// and persists every change to localStorage. Components that need to
// pin a fragment call `pin()` directly; the memory rail subscribes
// via `useSessionMemory()`.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  addMemoryItem,
  archiveMemoryItem,
  loadMemoryItems,
  newMemoryItem,
  patchMemoryItem,
  removeMemoryItem,
  restoreMemoryItem,
  saveMemoryItems,
  toggleMemoryColor,
  type MemoryColor,
  type MemoryItem,
  type MemoryKind,
  type MemorySource,
} from "@/lib/clinical/session-memory";

interface PinInput {
  sessionId: string;
  kind: MemoryKind;
  body: string;
  source?: MemorySource;
  tags?: string[];
  color?: MemoryColor;
}

interface SessionMemoryContextValue {
  items: MemoryItem[];
  ready: boolean;
  pin: (input: PinInput) => MemoryItem;
  patch: (id: string, patch: Partial<MemoryItem>) => void;
  remove: (id: string) => void;
  archive: (id: string) => void;
  restore: (id: string) => void;
  setColor: (id: string, color: MemoryColor) => void;
}

const SessionMemoryContext = createContext<SessionMemoryContextValue | null>(
  null
);

export function SessionMemoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(loadMemoryItems());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveMemoryItems(items);
  }, [items, ready]);

  const pin = useCallback((input: PinInput): MemoryItem => {
    const item = newMemoryItem(input);
    setItems((prev) => addMemoryItem(prev, item));
    return item;
  }, []);

  const patch = useCallback((id: string, p: Partial<MemoryItem>) => {
    setItems((prev) => patchMemoryItem(prev, id, p));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => removeMemoryItem(prev, id));
  }, []);

  const archive = useCallback((id: string) => {
    setItems((prev) => archiveMemoryItem(prev, id));
  }, []);

  const restore = useCallback((id: string) => {
    setItems((prev) => restoreMemoryItem(prev, id));
  }, []);

  const setColor = useCallback((id: string, color: MemoryColor) => {
    setItems((prev) => toggleMemoryColor(prev, id, color));
  }, []);

  const value = useMemo<SessionMemoryContextValue>(
    () => ({ items, ready, pin, patch, remove, archive, restore, setColor }),
    [items, ready, pin, patch, remove, archive, restore, setColor]
  );

  return (
    <SessionMemoryContext.Provider value={value}>
      {children}
    </SessionMemoryContext.Provider>
  );
}

export function useSessionMemory(): SessionMemoryContextValue {
  const ctx = useContext(SessionMemoryContext);
  if (!ctx)
    throw new Error(
      "useSessionMemory must be used inside SessionMemoryProvider"
    );
  return ctx;
}
