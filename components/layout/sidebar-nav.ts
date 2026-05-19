// Sidebar navigation configs — one per portal. Kept in a plain module
// (no React imports) so it can be unit-tested without rendering. The
// icons are exported as lucide-react components and rendered by the
// Sidebar component.

import {
  LayoutDashboard,
  FolderOpen,
  ClipboardCheck,
  Brain,
  FileText,
  FlaskConical,
  Settings,
  ScrollText,
  GraduationCap,
  BookMarked,
  ShieldCheck,
  Database,
  Stethoscope,
  CalendarRange,
  AlertCircle,
  Layers,
  Briefcase,
  Grid3X3,
  UserCheck,
  Heart,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Portal } from "@/lib/auth";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// Formation Portal — academic & supervised practice. Thesis,
// internship, supervision, and the shared Tests & Grids area live
// under /formation/*. The clinical workspace (cases, assessments,
// reports, clinical tools) and general therapist navigation are
// intentionally absent.
export const FORMATION_NAV: NavGroup[] = [
  {
    label: "Home",
    items: [
      { href: "/formation", label: "Dashboard", icon: LayoutDashboard },
      { href: "/formation/calendar", label: "Calendar", icon: CalendarRange },
      { href: "/formation/open-work", label: "Open Work", icon: AlertCircle },
    ],
  },
  {
    label: "Thesis",
    items: [
      { href: "/formation/thesis", label: "Overview", icon: GraduationCap },
      { href: "/formation/thesis/writer", label: "Writer", icon: FileText },
      { href: "/formation/thesis/stats", label: "Dataset / Stats", icon: FlaskConical },
      { href: "/formation/thesis/literature", label: "Literature", icon: BookMarked },
      { href: "/formation/thesis/exports", label: "Exports", icon: Database },
    ],
  },
  {
    label: "Internship",
    items: [
      { href: "/formation/internship", label: "Overview", icon: Briefcase },
      { href: "/formation/internship/cases", label: "Cases", icon: FolderOpen },
      { href: "/formation/internship/tests-grids", label: "Tests & Grids", icon: Grid3X3 },
      { href: "/formation/internship/reports", label: "Reports", icon: ClipboardCheck },
      { href: "/formation/internship/supervision", label: "Supervision", icon: UserCheck },
    ],
  },
  {
    label: "Print / Materials",
    items: [
      { href: "/formation/materials/worksheets", label: "Worksheets", icon: ClipboardCheck },
      { href: "/formation/materials/transcripts", label: "Transcripts", icon: ScrollText },
      { href: "/formation/materials/resources", label: "Resources", icon: Layers },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/formation/settings", label: "Settings", icon: Settings },
    ],
  },
];

// Therapist Portal — clinical casework only. Thesis / Internship /
// Research live in Formation now; they are intentionally removed here.
export const THERAPIST_NAV: NavGroup[] = [
  {
    label: "Home",
    items: [
      { href: "/therapist", label: "Dashboard", icon: LayoutDashboard },
      { href: "/calendar", label: "Calendar", icon: CalendarRange },
      { href: "/inbox", label: "Inbox", icon: AlertCircle },
    ],
  },
  {
    label: "Clinical",
    items: [
      { href: "/cases", label: "Cases", icon: FolderOpen },
      { href: "/assessments", label: "Assessments", icon: Brain },
      { href: "/reports", label: "Reports", icon: FileText },
      { href: "/checkins", label: "Sessions", icon: ClipboardCheck },
      { href: "/clinical", label: "Clinical Tools", icon: Stethoscope },
    ],
  },
  {
    label: "Materials",
    items: [
      { href: "/clinical/worksheets", label: "Worksheets", icon: ClipboardCheck },
      { href: "/material", label: "Resources", icon: Layers },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/ethics", label: "Ethics", icon: ShieldCheck },
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/backup", label: "Backup", icon: Database },
    ],
  },
];

// Client Portal — simple, structured. Client work is its own subtree at
// /client/*; this nav stays short by design.
export const CLIENT_NAV: NavGroup[] = [
  {
    label: "Home",
    items: [
      { href: "/client", label: "Home", icon: Heart },
      { href: "/client/calendar", label: "Calendar", icon: CalendarRange },
      { href: "/client/assigned", label: "Assigned Work", icon: CheckCircle },
      { href: "/client/assessments", label: "Assessments", icon: Brain },
      { href: "/client/workbooks", label: "Worksheets", icon: ClipboardCheck },
      { href: "/client/resources", label: "Resources", icon: Layers },
      { href: "/client/notes", label: "Notes", icon: ScrollText },
      { href: "/client/progress", label: "Progress", icon: TrendingUp },
      { href: "/client/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function navForPortal(portal: Portal): NavGroup[] {
  if (portal === "formation") return FORMATION_NAV;
  if (portal === "client") return CLIENT_NAV;
  return THERAPIST_NAV;
}
