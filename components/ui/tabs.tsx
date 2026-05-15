"use client";

// Tabs — accessible tab navigation with React state.
// Usage: wrap content in <Tabs> with a list of tab labels and panel contents.

import { createContext, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue>({
  activeTab: "",
  setActiveTab: () => {},
});

function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}) {
  const [internalActive, setInternalActive] = useState(defaultValue ?? "");
  const activeTab = value ?? internalActive;
  const setActiveTab = (v: string) => {
    setInternalActive(v);
    onValueChange?.(v);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 flex-wrap p-1 rounded-xl overflow-x-auto",
        className
      )}
      style={{ backgroundColor: "var(--psych-primary-light)" }}
      role="tablist"
    >
      {children}
    </div>
  );
}

function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={cn(
        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
        "focus:outline-none focus-visible:ring-2",
        className
      )}
      style={
        isActive
          ? {
              backgroundColor: "var(--psych-card)",
              color: "var(--psych-primary)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }
          : {
              backgroundColor: "transparent",
              color: "var(--psych-muted)",
            }
      }
    >
      {children}
    </button>
  );
}

function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;
  return (
    <div role="tabpanel" className={cn("mt-4 animate-fade-in", className)}>
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
