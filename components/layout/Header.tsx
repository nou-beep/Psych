"use client";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, Search, Command, X } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { WorkspaceModeMenu } from "@/components/shared/WorkspaceModeMenu";

const pageTitles: Record<string, string> = {
  "/therapist": "Dashboard",
  "/calendar": "Clinical calendar",
  "/quick-notes": "Quick notes",
  "/cases": "Cases",
  "/checkins": "Check-ins",
  "/assessments": "Assessments",
  "/assessments/library": "Assessment library",
  "/grids": "Grids",
  "/reports": "Reports",
  "/reports/builder": "Smart report builder",
  "/reports/daily": "Daily Report",
  "/reports/weekly": "Weekly Report",
  "/reports/monthly": "Monthly Report",
  "/reports/one-page": "One-Page Summary",
  "/reports/two-page": "Two-Page Summary",
  "/reports/assessment-grid": "Assessment Grid Report",
  "/reports/final-long": "Final Long Report",
  "/supervision": "Supervision",
  "/research": "Research",
  "/goals": "Goals",
  "/transcripts": "Transcripts",
  "/backup": "Backup & Export",
  "/settings": "Settings",
  "/clinical": "Clinical tools",
  "/clinical/interview": "Clinical interview",
  "/clinical/mse": "Mental Status Exam",
  "/clinical/longitudinal": "Longitudinal tracking",
  "/clinical/hypothesis": "Hypothesis workspace",
  "/clinical/interventions": "Intervention library",
  "/clinical/disorders": "Disorder reference",
  "/clinical/psychoeducation": "Psychoeducation",
  "/clinical/phrases": "Phrase library",
  "/clinical/search": "Clinical search",
  "/clinical/body-map": "Body map",
  "/clinical/thought-web": "Thought web",
  "/clinical/threads": "Threads",
  "/clinical/worksheets": "Worksheet library",
  "/clinical/templates": "Modèles cliniques",
  "/open-loops": "Open loops",
  "/research/quotes": "Quote bank",
  "/research/literature": "Literature desk",
  "/research/articles": "Article library",
  "/research/apa": "APA reference builder",
  "/research/audio-sync": "Audio + transcript sync",
  "/thesis/exports": "Thesis export packs",
  "/inbox": "Inbox",
  "/prep": "Session prep",
  "/thesis/writer": "Thesis writer",
  "/thesis/dashboard": "Thesis dashboard",
  "/thesis/import": "Import participant data",
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cases, goals, transcripts } = useApp();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function getTitle() {
    if (pageTitles[pathname]) return pageTitles[pathname];
    if (pathname.startsWith("/cases/")) return "Case Details";
    return "Psych";
  }

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [searchOpen]);

  const searchResults = query.trim()
    ? [
        ...cases
          .filter(
            (c) =>
              !c.isArchived &&
              (c.code.toLowerCase().includes(query.toLowerCase()) ||
                c.shortNote.toLowerCase().includes(query.toLowerCase()) ||
                c.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())))
          )
          .slice(0, 3)
          .map((c) => ({ label: c.code, sub: c.shortNote, href: `/cases/${c.id}`, type: "Case" })),
        ...goals
          .filter(
            (g) => !g.isArchived && g.title.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 2)
          .map((g) => ({ label: g.title, sub: g.category, href: "/goals", type: "Goal" })),
        ...transcripts
          .filter(
            (t) => !t.isArchived && t.title.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 2)
          .map((t) => ({ label: t.title, sub: "Transcript", href: "/transcripts", type: "Transcript" })),
      ]
    : [];

  return (
    <header
      className="no-print sticky top-0 z-20 flex items-center gap-3 px-5 py-3 border-b backdrop-blur-sm"
      style={{
        backgroundColor: "var(--psych-card)",
        borderColor: "var(--psych-border)",
      }}
    >
      {/* Mobile logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold"
          style={{ background: "linear-gradient(135deg, var(--psych-primary), var(--psych-accent))" }}
        >
          ✦
        </div>
        <span className="font-bold text-base" style={{ color: "var(--psych-text)" }}>
          Psych
        </span>
        <Sparkles size={11} style={{ color: "var(--psych-primary)" }} />
      </div>

      {/* Desktop title */}
      <h1
        className="hidden lg:block text-sm font-semibold flex-1"
        style={{ color: "var(--psych-text)" }}
      >
        {getTitle()}
      </h1>

      <div className="flex-1 lg:flex-none" />

      {/* Search */}
      <div className="relative">
        {searchOpen ? (
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--psych-muted)" }}
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cases, goals…"
              className="pl-8 pr-8 py-1.5 rounded-xl border text-xs outline-none w-52"
              style={{
                backgroundColor: "var(--psych-bg)",
                borderColor: "var(--psych-border)",
                color: "var(--psych-text)",
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearchOpen(false);
                  setQuery("");
                }
              }}
            />
            <button
              onClick={() => { setSearchOpen(false); setQuery(""); }}
              className="absolute right-2 top-1/2 -translate-y-1/2"
              style={{ color: "var(--psych-muted)" }}
            >
              <X size={11} />
            </button>

            {/* Results dropdown */}
            {searchResults.length > 0 && (
              <div
                className="absolute top-full mt-1 right-0 w-64 rounded-2xl border shadow-xl overflow-hidden z-50"
                style={{
                  backgroundColor: "var(--psych-card)",
                  borderColor: "var(--psych-border)",
                }}
              >
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      router.push(r.href);
                      setSearchOpen(false);
                      setQuery("");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs border-b last:border-b-0 transition-colors"
                    style={{ borderColor: "var(--psych-border)" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.backgroundColor =
                        "var(--psych-primary-light)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")
                    }
                  >
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
                      style={{
                        backgroundColor: "var(--psych-primary-light)",
                        color: "var(--psych-primary)",
                      }}
                    >
                      {r.type}
                    </span>
                    <div className="min-w-0">
                      <p
                        className="font-medium truncate"
                        style={{ color: "var(--psych-text)" }}
                      >
                        {r.label}
                      </p>
                      {r.sub && (
                        <p className="truncate" style={{ color: "var(--psych-muted)" }}>
                          {r.sub}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: "var(--psych-bg)",
              borderColor: "var(--psych-border)",
              color: "var(--psych-muted)",
            }}
          >
            <Search size={12} />
            <span className="hidden sm:inline">Search</span>
            <kbd
              className="hidden sm:inline text-[9px] px-1 py-0.5 rounded border ml-1 font-mono"
              style={{ borderColor: "var(--psych-border)" }}
            >
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* Command palette trigger */}
      <button
        className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs transition-all hover:scale-[1.02]"
        style={{
          backgroundColor: "var(--psych-bg)",
          borderColor: "var(--psych-border)",
          color: "var(--psych-muted)",
        }}
        onClick={() => {
          const evt = new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true });
          window.dispatchEvent(evt);
        }}
        title="Command Palette (Ctrl+K)"
      >
        <Command size={12} />
      </button>

      <WorkspaceModeMenu />
    </header>
  );
}
