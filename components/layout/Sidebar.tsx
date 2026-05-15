"use client";

// Sidebar — desktop navigation. Hidden on mobile (use MobileNav instead).
// Shows the Psych logo, nav links with icons, and the active route highlighted.

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
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cases", label: "Cases", icon: FolderOpen },
  { href: "/checkins", label: "Check-ins", icon: ClipboardCheck },
  { href: "/assessments", label: "Assessments", icon: Brain },
  { href: "/grids", label: "Grids", icon: Grid3X3 },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/supervision", label: "Supervision", icon: Users },
  { href: "/research", label: "Research", icon: FlaskConical },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="no-print hidden lg:flex flex-col w-60 min-h-screen fixed left-0 top-0 z-30 border-r"
      style={{
        backgroundColor: "var(--psych-sidebar)",
        borderColor: "var(--psych-border)",
      }}
    >
      {/* Logo / App name */}
      <div
        className="flex items-center gap-2.5 px-5 py-5 border-b"
        style={{ borderColor: "var(--psych-border)" }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm"
          style={{ backgroundColor: "var(--psych-primary)" }}
        >
          P
        </div>
        <div className="flex items-center gap-1">
          <span
            className="text-lg font-bold tracking-tight"
            style={{ color: "var(--psych-text)" }}
          >
            Psych
          </span>
          <Sparkles
            size={12}
            className="animate-sparkle"
            style={{ color: "var(--psych-primary)" }}
          />
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
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
                  : {
                      color: "var(--psych-muted)",
                    }
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
              <Icon
                size={18}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span>{label}</span>
              {active && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "var(--psych-primary)" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer note */}
      <div
        className="px-5 py-4 border-t text-xs"
        style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}
      >
        <p className="font-medium">Psych v1.0</p>
        <p className="mt-0.5 opacity-70">Mock data — demo mode</p>
      </div>
    </aside>
  );
}
