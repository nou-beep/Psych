"use client";
// Thesis Writer — chapter editor with outline sidebar, autosave,
// inline TODO markers, draft snapshots.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  ChevronDown,
  ChevronRight,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import {
  CHAPTER_LABELS,
  CHAPTER_ORDER,
  THESIS_DOCUMENT_STORAGE_KEY,
  THESIS_SNAPSHOTS_STORAGE_KEY,
  addSection,
  emptyDocument,
  outline,
  removeSection,
  snapshotsFor,
  takeSnapshot,
  totalWordCount,
  updateSection,
  type ChapterId,
  type ThesisDocument,
  type ThesisSnapshot,
} from "@/lib/research/thesis-writer";
import {
  METHODOLOGY_SECTIONS,
  REAL_CHAPTER_OUTLINE,
  REAL_SEED_ACCEPTED_KEY,
  THESIS_FR_TITLE,
} from "@/lib/thesis/real-seed";
import { useRecordVisit } from "@/components/shared/useRecordVisit";
import { chapterTraces } from "@/lib/workspace/human-traces";

// Map the 10 real French chapter outline entries onto the writer's
// existing 8-chapter structure so the user can seed editable French
// sections without losing prior work.
const REAL_TO_WRITER_CHAPTER: Record<string, ChapterId> = {
  "intro-generale": "introduction",
  "ch1-depersonnalisation": "literature",
  "ch2-anxiete": "literature",
  "ch3-depression": "literature",
  "ch4-liens": "literature",
  "ch5-methodo": "methodology",
  "ch6-resultats": "results",
  "ch7-discussion": "discussion",
  "conclusion-generale": "conclusion",
  "bibliographie": "references",
};

export default function ThesisWriterPage() {
  const [doc, setDoc] = useState<ThesisDocument | null>(null);
  const [snapshots, setSnapshots] = useState<ThesisSnapshot[]>([]);
  const [activeChapter, setActiveChapter] = useState<ChapterId>("introduction");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<ChapterId, boolean>>(
    () =>
      Object.fromEntries(CHAPTER_ORDER.map((c) => [c, true])) as Record<
        ChapterId,
        boolean
      >
  );
  const [showSnapshotInput, setShowSnapshotInput] = useState(false);
  const [snapshotLabel, setSnapshotLabel] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const stored = loadFromStorage<ThesisDocument | null>(
        THESIS_DOCUMENT_STORAGE_KEY,
        null
      );
      const snaps = loadFromStorage<ThesisSnapshot[]>(
        THESIS_SNAPSHOTS_STORAGE_KEY,
        []
      );
      const d = stored ?? emptyDocument();
      setDoc(d);
      setSnapshots(Array.isArray(snaps) ? snaps : []);
      // Default active section: first section of intro, if any.
      const firstSection = d.chapters.introduction.sections[0];
      if (firstSection) setActiveSectionId(firstSection.id);
    } catch {
      setDoc(emptyDocument());
    }
  }, []);

  // Record a visit and pin the active chapter as the resume hint so
  // the dashboard can offer "continue where you left off".
  useRecordVisit({
    id: doc?.id ?? "",
    kind: "thesis-chapter",
    label: doc?.title ?? "Thesis",
    href: "/thesis/writer",
    resumeHint: doc ? CHAPTER_LABELS[activeChapter] : undefined,
    disabled: !doc,
  });

  // Autosave (debounced).
  useEffect(() => {
    if (!doc) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveToStorage(THESIS_DOCUMENT_STORAGE_KEY, doc);
    }, 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [doc]);

  function persistSnapshots(next: ThesisSnapshot[]) {
    setSnapshots(next);
    saveToStorage(THESIS_SNAPSHOTS_STORAGE_KEY, next);
  }

  function onAddSection(chapter: ChapterId) {
    if (!doc) return;
    const next = addSection(doc, chapter, "New section");
    setDoc(next);
    const newest =
      next.chapters[chapter].sections[
        next.chapters[chapter].sections.length - 1
      ];
    setActiveChapter(chapter);
    setActiveSectionId(newest.id);
  }

  function onRemoveSection(chapter: ChapterId, sectionId: string) {
    if (!doc) return;
    const next = removeSection(doc, chapter, sectionId);
    setDoc(next);
    if (activeSectionId === sectionId) setActiveSectionId(null);
  }

  function patchActive(
    patch: Partial<{
      heading: string;
      body: string;
      sideNote: string;
      draft: boolean;
    }>
  ) {
    if (!doc || !activeSectionId) return;
    setDoc(updateSection(doc, activeChapter, activeSectionId, patch));
  }

  function snapshot() {
    if (!doc) return;
    const label = snapshotLabel.trim() || `Snapshot · ${new Date().toLocaleString()}`;
    persistSnapshots([takeSnapshot(doc, label), ...snapshots]);
    setSnapshotLabel("");
    setShowSnapshotInput(false);
  }

  function restoreSnapshot(snap: ThesisSnapshot) {
    if (!doc) return;
    if (!confirm(`Restore "${snap.label}"? Current draft will be replaced.`)) return;
    setDoc(snap.document);
    setActiveChapter("introduction");
    setActiveSectionId(
      snap.document.chapters.introduction.sections[0]?.id ?? null
    );
  }

  function deleteSnapshot(id: string) {
    persistSnapshots(snapshots.filter((s) => s.id !== id));
  }

  function seedFromRealOutline() {
    if (!doc) return;
    if (
      !confirm(
        "Pré-remplir la structure avec les 10 chapitres réels (Introduction générale → Bibliographie) ? Le contenu existant est conservé, des sections françaises sont ajoutées."
      )
    ) {
      return;
    }
    let next: ThesisDocument = { ...doc, title: THESIS_FR_TITLE };
    for (const real of REAL_CHAPTER_OUTLINE) {
      const target = REAL_TO_WRITER_CHAPTER[real.id];
      if (!target) continue;
      next = addSection(next, target, real.label);
      // For the methodology chapter, also seed the 10 sub-sections.
      if (real.id === "ch5-methodo") {
        for (const s of METHODOLOGY_SECTIONS) {
          next = addSection(next, target, `Méthodologie — ${s}`);
        }
      }
    }
    setDoc(next);
    saveToStorage(REAL_SEED_ACCEPTED_KEY, true);
    setRealSeedAccepted(true);
  }

  const [realSeedAccepted, setRealSeedAccepted] = useState(false);
  useEffect(() => {
    setRealSeedAccepted(
      loadFromStorage<boolean>(REAL_SEED_ACCEPTED_KEY, false)
    );
  }, [doc?.id]);

  const outlineEntries = useMemo(
    () => (doc ? outline(doc) : []),
    [doc]
  );

  const activeSection = useMemo(() => {
    if (!doc || !activeSectionId) return null;
    return (
      doc.chapters[activeChapter].sections.find(
        (s) => s.id === activeSectionId
      ) ?? null
    );
  }, [doc, activeChapter, activeSectionId]);

  if (!doc) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-sm text-center" style={{ color: "var(--psych-muted)" }}>
        Loading writer…
      </div>
    );
  }

  return (
    <div
      className="max-w-7xl mx-auto animate-fade-in"
      data-section="thesis"
    >
      <PageHeader
        title="Thesis writer"
        subtitle={
          <>
            <Input
              value={doc.title}
              onChange={(e) => setDoc({ ...doc, title: e.target.value })}
              className="text-base font-medium"
              style={{ width: 360 }}
            />
          </>
        }
        action={
          <div className="flex items-center gap-2">
            <span
              className="text-xs"
              style={{ color: "var(--psych-muted)" }}
            >
              {totalWordCount(doc)} words · autosaved
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowSnapshotInput((s) => !s)}
            >
              <Camera size={12} /> Snapshot
            </Button>
          </div>
        }
      />

      {!realSeedAccepted && (
        <div
          className="rounded-xl border p-3 mb-3 flex items-start gap-3"
          style={{
            background: "var(--psych-primary-light)",
            borderColor: "var(--psych-border)",
          }}
        >
          <div className="flex-1 text-xs" style={{ color: "var(--psych-text)" }}>
            <div className="font-semibold mb-0.5">
              Structure réelle disponible
            </div>
            <div style={{ color: "var(--psych-muted)" }}>
              Pré-remplir avec les 10 chapitres français (Mrini, 2025-2026) et
              les 10 sections de méthodologie. Le titre du document sera mis à
              jour. Le contenu existant n&apos;est pas écrasé.
            </div>
          </div>
          <Button size="sm" onClick={seedFromRealOutline}>
            Pré-remplir
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              saveToStorage(REAL_SEED_ACCEPTED_KEY, true);
              setRealSeedAccepted(true);
            }}
          >
            Ignorer
          </Button>
        </div>
      )}

      {showSnapshotInput && (
        <div
          className="rounded-xl border p-3 mb-3 flex items-center gap-2"
          style={{
            background: "var(--psych-card)",
            borderColor: "var(--psych-border)",
          }}
        >
          <Input
            value={snapshotLabel}
            onChange={(e) => setSnapshotLabel(e.target.value)}
            placeholder="Label (e.g. before revisions)"
            className="flex-1"
          />
          <Button size="sm" onClick={snapshot}>
            Take snapshot
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowSnapshotInput(false)}
          >
            Cancel
          </Button>
        </div>
      )}

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "minmax(0, 240px) 1fr minmax(0, 220px)" }}
      >
        {/* Outline */}
        <div className="space-y-2 print:hidden">
          <div
            className="text-[10px] font-semibold uppercase tracking-wider mb-1"
            style={{ color: "var(--psych-muted)" }}
          >
            Outline
          </div>
          <nav
            className="rounded-xl border p-2 sidebar-scroll overflow-y-auto"
            style={{
              borderColor: "var(--psych-border)",
              background: "var(--psych-card)",
              maxHeight: 560,
            }}
          >
            {outlineEntries.map((entry) => {
              const isOpen = expanded[entry.chapterId];
              const traces = chapterTraces({
                wordCount: entry.wordCount,
                sectionCount: entry.sections.length,
                draftSectionCount: entry.sections.filter((s) => s.draft).length,
                unresolvedMarkerCount: entry.sections.reduce(
                  (a, s) => a + s.unresolvedMarkerCount,
                  0
                ),
                linkedQuoteCount: 0,
                linkedReferenceCount: 0,
              });
              return (
                <div key={entry.chapterId} className="mb-1">
                  <button
                    onClick={() =>
                      setExpanded((prev) => ({
                        ...prev,
                        [entry.chapterId]: !prev[entry.chapterId],
                      }))
                    }
                    className="flex items-center gap-1 w-full text-left text-xs font-semibold"
                    style={{ color: "var(--psych-text)" }}
                  >
                    {isOpen ? (
                      <ChevronDown size={11} />
                    ) : (
                      <ChevronRight size={11} />
                    )}
                    <span className="flex-1">{entry.chapterLabel}</span>
                    <span
                      className="text-[10px] inline-flex items-center gap-0.5"
                      title={`${traces.state} · ${traces.hint}`}
                    >
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          aria-hidden="true"
                          className="w-1 h-1 rounded-full"
                          style={{
                            backgroundColor:
                              i <
                              (traces.state === "near-complete"
                                ? 4
                                : traces.state === "in-revision"
                                ? 3
                                : traces.state === "drafted"
                                ? 2
                                : traces.state === "outlined"
                                ? 1
                                : 0)
                                ? "var(--psych-primary)"
                                : "var(--psych-border)",
                          }}
                        />
                      ))}
                    </span>
                    <span
                      className="text-[10px]"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      {entry.wordCount}w
                    </span>
                  </button>
                  {isOpen && (
                    <div className="ml-3 mt-1 space-y-0.5">
                      {entry.sections.map((s) => {
                        const isActive =
                          activeSectionId === s.id &&
                          activeChapter === entry.chapterId;
                        return (
                          <button
                            key={s.id}
                            onClick={() => {
                              setActiveChapter(entry.chapterId);
                              setActiveSectionId(s.id);
                            }}
                            className="flex items-center gap-1 w-full text-left text-xs px-2 py-1 rounded-md"
                            style={{
                              background: isActive
                                ? "var(--psych-primary-light)"
                                : "transparent",
                              color: isActive
                                ? "var(--psych-accent)"
                                : "var(--psych-text)",
                            }}
                          >
                            <span className="flex-1 truncate">
                              {s.heading}
                            </span>
                            {s.draft && (
                              <span
                                className="text-[9px]"
                                style={{ color: "var(--psych-muted)" }}
                              >
                                draft
                              </span>
                            )}
                            {s.unresolvedMarkerCount > 0 && (
                              <span
                                className="text-[9px] px-1 rounded-full"
                                style={{
                                  background: "#FEE2E2",
                                  color: "#9B4D3A",
                                }}
                                title={`${s.unresolvedMarkerCount} unresolved marker(s)`}
                              >
                                {s.unresolvedMarkerCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => onAddSection(entry.chapterId)}
                        className="flex items-center gap-1 text-[10px] ml-1 mt-0.5"
                        style={{ color: "var(--psych-primary)" }}
                      >
                        <Plus size={9} /> add section
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Editor */}
        <div className="paper-card" data-state={activeSection?.draft ? "draft" : undefined} style={{ minHeight: 560 }}>
          {!activeSection ? (
            <div
              className="text-center py-12 text-sm"
              style={{ color: "var(--psych-muted)" }}
            >
              <FileText size={20} className="mx-auto mb-2 opacity-60" />
              Pick a section from the outline, or add one to start.
            </div>
          ) : (
            <>
              <div
                className="text-[10px] uppercase tracking-wider mb-1"
                style={{ color: "var(--psych-muted)" }}
              >
                {CHAPTER_LABELS[activeChapter]}
              </div>
              <input
                value={activeSection.heading}
                onChange={(e) => patchActive({ heading: e.target.value })}
                className="w-full bg-transparent outline-none"
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: "var(--psych-text)",
                  marginBottom: 12,
                }}
              />
              <textarea
                value={activeSection.body}
                onChange={(e) => patchActive({ body: e.target.value })}
                placeholder="Write here. Use [needs citation] or [tk] to flag unresolved markers — they show up in the outline."
                className="w-full bg-transparent outline-none"
                style={{
                  minHeight: 360,
                  border: "none",
                  resize: "vertical",
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: "var(--psych-text)",
                  fontFamily:
                    "Georgia, 'Iowan Old Style', 'Apple Garamond', serif",
                }}
              />

              <div
                className="flex items-center gap-3 mt-3 pt-3"
                style={{ borderTop: "1px dashed var(--psych-border)" }}
              >
                <label
                  className="text-xs inline-flex items-center gap-2"
                  style={{ color: "var(--psych-muted)" }}
                >
                  <input
                    type="checkbox"
                    checked={!activeSection.draft}
                    onChange={(e) => patchActive({ draft: !e.target.checked })}
                  />
                  Promoted out of draft
                </label>
                <span
                  className="text-[10px]"
                  style={{ color: "var(--psych-muted)" }}
                >
                  Updated {activeSection.updatedAt.split("T")[0]}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto"
                  onClick={() =>
                    onRemoveSection(activeChapter, activeSection.id)
                  }
                >
                  <Trash2 size={12} /> Delete section
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Side margin (notes + snapshots) */}
        <div className="space-y-3 print:hidden">
          {activeSection && (
            <SectionCard
              title="Side note"
              description="Lives in the margin alongside this section."
            >
              <Textarea
                value={activeSection.sideNote ?? ""}
                onChange={(e) => patchActive({ sideNote: e.target.value })}
                placeholder="Margin notes — interpretation hints, citations to chase…"
                className="min-h-[120px] text-sm"
              />
            </SectionCard>
          )}

          <SectionCard
            title="Snapshots"
            description="Frozen checkpoints"
          >
            {snapshotsFor(snapshots, doc.id).length === 0 ? (
              <p
                className="text-xs"
                style={{ color: "var(--psych-muted)" }}
              >
                No snapshots yet.
              </p>
            ) : (
              <ul className="space-y-1">
                {snapshotsFor(snapshots, doc.id).map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-2 text-xs p-1.5 rounded-md alive-hover"
                    style={{
                      background: "var(--psych-bg)",
                    }}
                  >
                    <span className="flex-1 truncate" style={{ color: "var(--psych-text)" }}>
                      {s.label}
                    </span>
                    <button
                      onClick={() => restoreSnapshot(s)}
                      style={{ color: "var(--psych-primary)" }}
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => deleteSnapshot(s.id)}
                      style={{ color: "var(--psych-muted)" }}
                      aria-label="Delete snapshot"
                    >
                      <Trash2 size={10} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
