"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import {
  LogOut,
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
  Stethoscope,
  CalendarRange,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";

const navGroups = [
  {
    label: "Workspace",
    items: [
      { href: "/therapist", label: "Dashboard", icon: LayoutDashboard },
      { href: "/calendar", label: "Calendar", icon: CalendarRange },
      { href: "/quick-notes", label: "Quick notes", icon: StickyNote },
      { href: "/cases", label: "Cases", icon: FolderOpen },
      { href: "/checkins", label: "Check-ins", icon: ClipboardCheck },
      { href: "/goals", label: "Goals", icon: Target },
    ],
  },
  {
    label: "Clinical",
    items: [
      { href: "/clinical", label: "Clinical tools ✦", icon: Stethoscope },
      { href: "/clinical/body-map", label: "Body map", icon: Heart },
      { href: "/clinical/thought-web", label: "Thought web", icon: Network },
      { href: "/clinical/threads", label: "Threads", icon: Sparkles },
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

const SIDEBAR_GROUPS_STORAGE_KEY = "psych-sidebar-groups-v1";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeCases, goals } = useApp();
  const { session, signOut } = useAuth();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOpenGroups(
      loadFromStorage<Record<string, boolean>>(SIDEBAR_GROUPS_STORAGE_KEY, {})
    );
    setReady(true);
  }, []);

  function toggleGroup(label: string) {
    setOpenGroups((prev) => {
      const next = { ...prev, [label]: prev[label] === false };
      if (ready) saveToStorage(SIDEBAR_GROUPS_STORAGE_KEY, next);
      return next;
    });
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href === "/therapist") return pathname === "/therapist";
    return pathname.startsWith(href);
  }

  const badges: Record<string, number | null> = {
    "/cases": activeCases.length,
    "/goals": goals.filter((g) => !g.isArchived && g.status === "in-progress").length || null,
  };

  return (
    <aside
      className="no-print hidden lg:flex flex-col w-60 h-screen fixed left-0 top-0 z-30 border-r overflow-hidden"
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
      <div className="sidebar-scroll-host flex-1 min-h-0">
        <nav className="sidebar-scroll h-full px-3 py-2 overflow-y-auto space-y-4">
          {navGroups.map((group) => {
          const open = openGroups[group.label] !== false;
          return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className="flex items-center gap-1 w-full px-3 mb-1 text-[9px] font-semibold uppercase tracking-widest text-left"
              style={{ color: "var(--psych-muted)", opacity: 0.7 }}
              aria-expanded={open}
            >
              <svg
                width="9"
                height="9"
                viewBox="0 0 12 12"
                className="sidebar-group-caret"
                data-open={open}
                style={{ flexShrink: 0 }}
              >
                <path
                  d="M3 4l3 4 3-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {group.label}
            </button>
            {open && (
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
            )}
          </div>
          );
        })}
        </nav>
      </div>

      {/* Footer — session + sign out */}
      <div
        className="px-4 py-3 border-t relative text-xs"
        style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}
      >
        {session && (
          <div className="mb-2 truncate" style={{ color: "var(--psych-text)" }}>
            <span className="opacity-70">Signed in · </span>
            <span className="font-medium">{session.email}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              signOut();
              router.push("/");
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg border"
            style={{
              borderColor: "var(--psych-border)",
              color: "var(--psych-muted)",
            }}
            aria-label="Sign out"
          >
            <LogOut size={11} /> Sign out
          </button>
          <Link
            href="/"
            className="px-2 py-1 rounded-lg border"
            style={{
              borderColor: "var(--psych-border)",
              color: "var(--psych-muted)",
            }}
          >
            Switch portal
          </Link>
        </div>
      </div>
    </aside>
  );
}
