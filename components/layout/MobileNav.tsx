"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  ClipboardCheck,
  GraduationCap,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/cases", label: "Cases", icon: FolderOpen },
  { href: "/checkins", label: "Check-ins", icon: ClipboardCheck },
  { href: "/thesis", label: "Thesis", icon: GraduationCap },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t"
      style={{
        backgroundColor: "var(--psych-card)",
        borderColor: "var(--psych-border)",
      }}
    >
      <div className="flex items-center justify-around py-1.5 px-2">
        {mobileNavItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[52px]",
                active && "scale-105"
              )}
              style={active ? { color: "var(--psych-primary)" } : { color: "var(--psych-muted)" }}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
              {active && (
                <div
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: "var(--psych-primary)" }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
