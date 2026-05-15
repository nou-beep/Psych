"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Plus, FolderOpen, ClipboardCheck, Target, ScrollText, X } from "lucide-react";

const actions = [
  { label: "New Case", icon: <FolderOpen size={14} />, href: "/cases?action=new" },
  { label: "New Check-in", icon: <ClipboardCheck size={14} />, href: "/checkins?action=new" },
  { label: "New Goal", icon: <Target size={14} />, href: "/goals?action=new" },
  { label: "New Transcript", icon: <ScrollText size={14} />, href: "/transcripts?action=new" },
];

export function QuickAddButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="fixed bottom-8 right-8 z-50 no-print flex flex-col items-end gap-2">
      {/* Action items */}
      {open && (
        <div className="flex flex-col items-end gap-2 mb-1">
          {actions.map((action, i) => (
            <div
              key={action.href}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <Link
                href={action.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border shadow-lg text-sm font-medium transition-all hover:scale-105"
                style={{
                  backgroundColor: "var(--psych-card)",
                  borderColor: "var(--psych-border)",
                  color: "var(--psych-text)",
                  boxShadow: "var(--psych-shadow)",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ color: "var(--psych-primary)" }}>{action.icon}</span>
                {action.label}
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* FAB trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style={{
          backgroundColor: "var(--psych-primary)",
          color: "white",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
        title="Quick add"
      >
        <div
          style={{
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {open ? <X size={22} /> : <Plus size={22} />}
        </div>
      </button>
    </div>
  );
}
