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
  /** Static label (kept for fallback). */
  label: string;
  /** Optional i18n key — components prefer this when present. */
  labelKey?: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  /** Optional i18n key for the group label. */
  labelKey?: string;
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
    labelKey: "sidebar.groups.home",
    items: [
      { href: "/formation", label: "Dashboard", labelKey: "sidebar.items.dashboard", icon: LayoutDashboard },
      { href: "/formation/calendar", label: "Calendar", labelKey: "sidebar.items.calendar", icon: CalendarRange },
      { href: "/formation/open-work", label: "Open Work", labelKey: "sidebar.items.openWork", icon: AlertCircle },
    ],
  },
  {
    label: "Thesis",
    labelKey: "sidebar.groups.thesis",
    items: [
      { href: "/formation/thesis", label: "Overview", labelKey: "sidebar.items.thesisOverview", icon: GraduationCap },
      { href: "/formation/thesis/writer", label: "Writer", labelKey: "sidebar.items.thesisWriter", icon: FileText },
      { href: "/formation/memoire/analyse", label: "Data Analysis", labelKey: "analysis.nav", icon: FlaskConical },
      { href: "/formation/thesis/literature", label: "Literature", labelKey: "sidebar.items.thesisLiterature", icon: BookMarked },
      { href: "/formation/thesis/exports", label: "Exports", labelKey: "sidebar.items.thesisExports", icon: Database },
    ],
  },
  {
    label: "Internship",
    labelKey: "sidebar.groups.internship",
    items: [
      { href: "/formation/internship", label: "Overview", labelKey: "sidebar.items.internshipOverview", icon: Briefcase },
      { href: "/formation/internship/cases", label: "Cases", labelKey: "sidebar.items.internshipCases", icon: FolderOpen },
      { href: "/formation/internship/tests-grids", label: "Tests & Grids", labelKey: "sidebar.items.testsGrids", icon: Grid3X3 },
      { href: "/formation/internship/reports", label: "Reports", labelKey: "sidebar.items.reports", icon: ClipboardCheck },
      { href: "/formation/internship/supervision", label: "Supervision", labelKey: "sidebar.items.supervision", icon: UserCheck },
    ],
  },
  {
    label: "Print / Materials",
    labelKey: "sidebar.groups.printMaterials",
    items: [
      { href: "/formation/materials/worksheets", label: "Worksheets", labelKey: "sidebar.items.worksheets", icon: ClipboardCheck },
      { href: "/formation/materials/transcripts", label: "Transcripts", labelKey: "sidebar.items.transcripts", icon: ScrollText },
      { href: "/formation/materials/resources", label: "Resources", labelKey: "sidebar.items.resources", icon: Layers },
    ],
  },
  {
    label: "System",
    labelKey: "sidebar.groups.system",
    items: [
      { href: "/formation/settings", label: "Settings", labelKey: "sidebar.items.settings", icon: Settings },
    ],
  },
];

// Therapist Portal — clinical casework only. Thesis / Internship /
// Research live in Formation now; they are intentionally removed here.
export const THERAPIST_NAV: NavGroup[] = [
  {
    label: "Home",
    labelKey: "sidebar.groups.home",
    items: [
      { href: "/therapist", label: "Dashboard", labelKey: "sidebar.items.dashboard", icon: LayoutDashboard },
      { href: "/calendar", label: "Calendar", labelKey: "sidebar.items.calendar", icon: CalendarRange },
      { href: "/inbox", label: "Inbox", labelKey: "sidebar.items.inbox", icon: AlertCircle },
    ],
  },
  {
    label: "Clinical",
    labelKey: "sidebar.groups.clinical",
    items: [
      { href: "/cases", label: "Cases", labelKey: "sidebar.items.cases", icon: FolderOpen },
      { href: "/assessments", label: "Assessments", labelKey: "sidebar.items.assessments", icon: Brain },
      { href: "/reports", label: "Reports", labelKey: "sidebar.items.reports", icon: FileText },
      { href: "/checkins", label: "Sessions", labelKey: "sidebar.items.sessions", icon: ClipboardCheck },
      { href: "/clinical", label: "Clinical Tools", labelKey: "sidebar.items.clinicalTools", icon: Stethoscope },
    ],
  },
  {
    label: "Materials",
    labelKey: "sidebar.groups.materials",
    items: [
      { href: "/clinical/worksheets", label: "Worksheets", labelKey: "sidebar.items.worksheets", icon: ClipboardCheck },
      { href: "/material", label: "Resources", labelKey: "sidebar.items.resources", icon: Layers },
    ],
  },
  {
    label: "Admin",
    labelKey: "sidebar.groups.admin",
    items: [
      { href: "/ethics", label: "Ethics", labelKey: "sidebar.items.ethics", icon: ShieldCheck },
      { href: "/settings", label: "Settings", labelKey: "sidebar.items.settings", icon: Settings },
      { href: "/backup", label: "Backup", labelKey: "sidebar.items.backup", icon: Database },
    ],
  },
];

// Client Portal — simple, structured. Client work is its own subtree at
// /client/*; this nav stays short by design.
export const CLIENT_NAV: NavGroup[] = [
  {
    label: "Home",
    labelKey: "sidebar.groups.home",
    items: [
      { href: "/client", label: "Home", labelKey: "sidebar.items.home", icon: Heart },
      { href: "/client/calendar", label: "Calendar", labelKey: "sidebar.items.calendar", icon: CalendarRange },
      { href: "/client/assigned", label: "Assigned Work", labelKey: "sidebar.items.assigned", icon: CheckCircle },
      { href: "/client/assessments", label: "Assessments", labelKey: "sidebar.items.assessments", icon: Brain },
      { href: "/client/workbooks", label: "Worksheets", labelKey: "sidebar.items.worksheets", icon: ClipboardCheck },
      { href: "/client/resources", label: "Resources", labelKey: "sidebar.items.resources", icon: Layers },
      { href: "/client/notes", label: "Notes", labelKey: "sidebar.items.notes", icon: ScrollText },
      { href: "/client/progress", label: "Progress", labelKey: "sidebar.items.progress", icon: TrendingUp },
      { href: "/client/settings", label: "Settings", labelKey: "sidebar.items.settings", icon: Settings },
    ],
  },
];

export function navForPortal(portal: Portal): NavGroup[] {
  if (portal === "formation") return FORMATION_NAV;
  if (portal === "client") return CLIENT_NAV;
  return THERAPIST_NAV;
}
