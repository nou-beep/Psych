"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  ClipboardCheck,
  Brain,
  Grid3X3,
  FileText,
  Users,
  FlaskConical,
  Settings,
  Sparkles,
  Target,
  ScrollText,
  Command,
  GraduationCap,
  BookOpen,
  CalendarDays,
  BookMarked,
  Languages,
  Network,
  Mic,
  Zap,
  ShieldCheck,
  Database,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";

const navGroups = [
  {
    label: "Workspace",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/cases", label: "Cases", icon: FolderOpen },
      { href: "/checkins", label: "Check-ins", icon: ClipboardCheck },
      { href: "/goals", label: "Goals", icon: Target },
    ],
  },
  {
    label: "Clinical",
    items: [
      { href: "/reflect", label: "Reflections", icon: BookOpen },
      { href: "/planner", label: "Session Planner", icon: CalendarDays },
      { href: "/interventions", label: "Interventions", icon: Zap },
      { href: "/formulation", label: "Formulation", icon: Network },
      { href: "/assessments", label: "Assessments", icon: Brain },
      { href: "/grids", label: "Grids", icon: Grid3X3 },
      { href: "/reports", label: "Reports", icon: FileText },
      { href: "/supervision", label: "Supervision", icon: Users },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/workbook", label: "Workbook", icon: BookMarked },
      { href: "/dictionary", label: "Dictionary", icon: Languages },
      { href: "/audio", label: "Audio Notes", icon: Mic },
      { href: "/ethics", label: "Ethics & Consent", icon: ShieldCheck },
    ],
  },
  {
    label: "Research",
    items: [
      { href: "/transcripts", label: "Transcripts", icon: ScrollText },
      { href: "/research", label: "Research", icon: FlaskConical },
      { href: "/thesis", label: "Thesis Studio", icon: GraduationCap },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/client", label: "Client portal ✦", icon: Heart },
      { href: "/backup", label: "Backup & Export", icon: Database },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { activeCases, goals } = useApp();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const badges: Record<string, number | null> = {
    "/cases": activeCases.length,
    "/goals": goals.filter((g) => !g.isArchived && g.status === "in-progress").length || null,
  };

  return (
    <aside
      className="no-print hidden lg:flex flex-col w-60 min-h-screen fixed left-0 top-0 z-30 border-r overflow-hidden"
      style={{
        backgroundColor: "var(--psych-sidebar)",
        borderColor: "var(--psych-border)",
      }}
    >
      {/* Decorative orb */}
      <div
        className="orb orb-primary absolute -top-8 -left-8 w-32 h-32 decorative"
        style={{ opacity: 0.15 }}
      />

      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5 py-5 border-b relative"
        style={{ borderColor: "var(--psych-border)" }}
      >
        <div
          className="w-9 h-9 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, var(--psych-primary), var(--psych-accent))",
          }}
        >
          ✦
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="text-lg font-bold tracking-tight"
            style={{ color: "var(--psych-text)" }}
          >
            Psych
          </span>
          <Sparkles
            size={11}
            className="animate-sparkle"
            style={{ color: "var(--psych-primary)" }}
          />
        </div>
      </div>

      {/* Command palette hint */}
      <div className="px-3 pt-3 pb-1">
        <button
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all hover:scale-[1.01] border"
          style={{
            backgroundColor: "var(--psych-card)",
            borderColor: "var(--psych-border)",
            color: "var(--psych-muted)",
          }}
          onClick={() => {
            const evt = new KeyboardEvent("keydown", {
              key: "k",
              ctrlKey: true,
              bubbles: true,
            });
            window.dispatchEvent(evt);
          }}
        >
          <Command size={11} />
          <span className="flex-1 text-left">Quick search…</span>
          <kbd
            className="text-[9px] px-1 py-0.5 rounded border font-mono"
            style={{ borderColor: "var(--psych-border)" }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p
              className="px-3 mb-1 text-[9px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--psych-muted)", opacity: 0.6 }}
            >
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                const badge = badges[href];
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      "hover:scale-[1.01]"
                    )}
                    style={
                      active
                        ? {
                            backgroundColor: "var(--psych-sidebar-active)",
                            color: "var(--psych-sidebar-active-text)",
                          }
                        : { color: "var(--psych-muted)" }
                    }
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                          "var(--psych-primary-light)";
                        (e.currentTarget as HTMLElement).style.color = "var(--psych-text)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "var(--psych-muted)";
                      }
                    }}
                  >
                    <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                    <span className="flex-1">{label}</span>
                    {badge !== null && badge !== undefined && badge > 0 && (
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{
                          backgroundColor: active
                            ? "var(--psych-primary)"
                            : "var(--psych-primary-light)",
                          color: active ? "white" : "var(--psych-primary)",
                        }}
                      >
                        {badge}
                      </span>
                    )}
                    {active && !badge && (
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: "var(--psych-primary)" }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="px-5 py-4 border-t text-xs relative"
        style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}
      >
        <p className="font-medium" style={{ color: "var(--psych-text)" }}>Psych v2.0</p>
        <p className="mt-0.5 opacity-60">Local mode · All data saved</p>
      </div>
    </aside>
  );
}
