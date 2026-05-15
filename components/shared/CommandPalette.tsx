"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  FolderOpen,
  ClipboardCheck,
  Brain,
  Grid3X3,
  FileText,
  Users,
  FlaskConical,
  Settings,
  Target,
  ScrollText,
  Plus,
  ArrowRight,
} from "lucide-react";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const nav = useCallback(
    (href: string) => {
      router.push(href);
      setOpen(false);
      setQuery("");
    },
    [router]
  );

  const commands: Command[] = [
    {
      id: "dash",
      label: "Dashboard",
      icon: <LayoutDashboard size={14} />,
      category: "Navigate",
      action: () => nav("/"),
    },
    {
      id: "cases",
      label: "Cases",
      icon: <FolderOpen size={14} />,
      category: "Navigate",
      action: () => nav("/cases"),
    },
    {
      id: "checkins",
      label: "Check-ins",
      icon: <ClipboardCheck size={14} />,
      category: "Navigate",
      action: () => nav("/checkins"),
    },
    {
      id: "assessments",
      label: "Assessments",
      icon: <Brain size={14} />,
      category: "Navigate",
      action: () => nav("/assessments"),
    },
    {
      id: "grids",
      label: "Grids",
      icon: <Grid3X3 size={14} />,
      category: "Navigate",
      action: () => nav("/grids"),
    },
    {
      id: "reports",
      label: "Reports",
      icon: <FileText size={14} />,
      category: "Navigate",
      action: () => nav("/reports"),
    },
    {
      id: "supervision",
      label: "Supervision",
      icon: <Users size={14} />,
      category: "Navigate",
      action: () => nav("/supervision"),
    },
    {
      id: "research",
      label: "Research",
      icon: <FlaskConical size={14} />,
      category: "Navigate",
      action: () => nav("/research"),
    },
    {
      id: "goals",
      label: "Goals",
      icon: <Target size={14} />,
      category: "Navigate",
      action: () => nav("/goals"),
    },
    {
      id: "transcripts",
      label: "Transcripts",
      icon: <ScrollText size={14} />,
      category: "Navigate",
      action: () => nav("/transcripts"),
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={14} />,
      category: "Navigate",
      action: () => nav("/settings"),
    },
    {
      id: "new-case",
      label: "New Case",
      description: "Create a new clinical case",
      icon: <Plus size={14} />,
      category: "Create",
      action: () => nav("/cases?action=new"),
      keywords: ["create", "add"],
    },
    {
      id: "new-checkin",
      label: "New Check-in",
      description: "Log a daily check-in",
      icon: <Plus size={14} />,
      category: "Create",
      action: () => nav("/checkins?action=new"),
      keywords: ["create", "add", "daily"],
    },
    {
      id: "new-goal",
      label: "New Goal",
      description: "Add a therapeutic goal",
      icon: <Plus size={14} />,
      category: "Create",
      action: () => nav("/goals?action=new"),
      keywords: ["create", "add", "objective"],
    },
    {
      id: "new-transcript",
      label: "New Transcript",
      description: "Start a transcript session",
      icon: <Plus size={14} />,
      category: "Create",
      action: () => nav("/transcripts?action=new"),
      keywords: ["create", "add", "session"],
    },
  ];

  const filtered = query.trim()
    ? commands.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.label.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.keywords?.some((k) => k.includes(q))
        );
      })
    : commands;

  const grouped = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
        setSelected(0);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      }
      if (e.key === "Enter" && filtered[selected]) {
        filtered[selected].action();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, filtered, selected]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-start justify-center pt-[15vh] px-4 no-print"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden animate-fade-in"
        style={{
          backgroundColor: "var(--psych-card)",
          borderColor: "var(--psych-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4 py-3.5 border-b"
          style={{ borderColor: "var(--psych-border)" }}
        >
          <Search size={15} style={{ color: "var(--psych-muted)" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or jump to…"
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: "var(--psych-text)" }}
          />
          <kbd
            className="text-[10px] px-1.5 py-0.5 rounded-md border font-mono"
            style={{
              color: "var(--psych-muted)",
              borderColor: "var(--psych-border)",
              backgroundColor: "var(--psych-primary-light)",
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {Object.keys(grouped).length === 0 ? (
            <p className="text-center text-sm py-8" style={{ color: "var(--psych-muted)" }}>
              No results for &quot;{query}&quot;
            </p>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="mb-1">
                <p
                  className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: "var(--psych-muted)" }}
                >
                  {category}
                </p>
                {items.map((cmd) => {
                  const globalIndex = filtered.indexOf(cmd);
                  const isSelected = globalIndex === selected;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all"
                      style={{
                        backgroundColor: isSelected
                          ? "var(--psych-primary-light)"
                          : "transparent",
                        color: isSelected ? "var(--psych-primary)" : "var(--psych-text)",
                      }}
                      onMouseEnter={() => setSelected(globalIndex)}
                    >
                      <span style={{ color: isSelected ? "var(--psych-primary)" : "var(--psych-muted)" }}>
                        {cmd.icon}
                      </span>
                      <span className="flex-1 text-sm font-medium">{cmd.label}</span>
                      {cmd.description && (
                        <span className="text-xs" style={{ color: "var(--psych-muted)" }}>
                          {cmd.description}
                        </span>
                      )}
                      {isSelected && (
                        <ArrowRight size={12} style={{ color: "var(--psych-primary)" }} />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div
          className="px-4 py-2.5 border-t flex items-center gap-4 text-[10px]"
          style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}
        >
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
