"use client";
// Layout shell for every client portal page. Applies the chosen theme,
// renders ambient orbs, the bottom nav pill, the floating crisis button,
// and (if active) the aftercare overlay. Pages render their content
// inside this shell.

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Library,
  ClipboardList,
  LineChart,
  BookOpen,
  Mail,
  CalendarRange,
  CheckCircle,
  Settings as SettingsIcon,
} from "lucide-react";
import { useClientPortal } from "@/contexts/ClientPortalContext";
import { AftercareOverlay } from "@/components/client/AftercareOverlay";
import { CrisisOverlay } from "@/components/client/CrisisOverlay";

// Simpler client nav per the three-portal architecture: structured,
// lower cognitive load, no wellness-app drift. Deep routes (body map,
// threads, grounding, reflections) remain accessible via Home and
// deep links — they just don't crowd the always-visible nav.
const NAV_ITEMS = [
  { href: "/client", label: "Home", icon: Home },
  { href: "/client/calendar", label: "Calendar", icon: CalendarRange },
  { href: "/client/assigned", label: "Assigned", icon: CheckCircle },
  { href: "/client/assessments", label: "Assessments", icon: ClipboardList },
  { href: "/client/workbooks", label: "Worksheets", icon: Library },
  { href: "/client/resources", label: "Resources", icon: BookOpen },
  { href: "/client/notes", label: "Notes", icon: Mail },
  { href: "/client/progress", label: "Progress", icon: LineChart },
  { href: "/client/settings", label: "Settings", icon: SettingsIcon },
];

export function ClientShell({
  children,
  title,
  microcopy,
}: {
  children: React.ReactNode;
  title?: string;
  microcopy?: string;
}) {
  const pathname = usePathname();
  const { theme, lowEnergyMode, crisisModeActive, activateCrisis } =
    useClientPortal();

  const shellClasses = [
    "cp-shell",
    lowEnergyMode ? "cp-low-energy" : "",
    crisisModeActive ? "cp-crisis" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClasses} data-client-theme={theme}>
      {/* Ambient layer */}
      <div className="cp-ambient" aria-hidden>
        <div className="cp-orb cp-orb-1" />
        <div className="cp-orb cp-orb-2" />
        <div className="cp-orb cp-orb-3" />
      </div>

      {/* Crisis button — always available, except inside crisis mode */}
      {!crisisModeActive && (
        <button
          className="cp-crisis-btn"
          onClick={() => activateCrisis()}
          aria-label="Activate calming mode"
        >
          I&rsquo;m overwhelmed
        </button>
      )}

      <div className="cp-content">
        {title && (
          <header className="cp-fade-in" style={{ marginBottom: "1.5rem" }}>
            <h1 className="cp-title">{title}</h1>
            {microcopy && (
              <p className="cp-microcopy" style={{ marginTop: 6 }}>
                {microcopy}
              </p>
            )}
          </header>
        )}
        {children}
      </div>

      {/* Bottom nav pill */}
      {!crisisModeActive && (
        <nav className="cp-nav" aria-label="Client portal navigation">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/client"
                ? pathname === "/client"
                : pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="cp-nav-item"
                data-active={active}
                aria-label={item.label}
              >
                <Icon size={16} />
              </Link>
            );
          })}
        </nav>
      )}

      <AftercareOverlay />
      <CrisisOverlay />
    </div>
  );
}
