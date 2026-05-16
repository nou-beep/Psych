"use client";
// Clinical Calendar — day / week / month views with overdue + today
// load widgets. Events stored in localStorage.

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/Modal";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import {
  CALENDAR_STORAGE_KEY,
  CATEGORY_META,
  calendarLoad,
  emptyEvent,
  endOfWeekISO,
  expandRecurrences,
  isOverdue,
  startOfWeekISO,
  type CalendarCategory,
  type CalendarEvent,
  type Recurrence,
} from "@/lib/clinical/calendar";
import { CalendarBoard } from "@/components/clinical/CalendarBoard";

type View = "day" | "week" | "month";

function shiftDate(date: string, days: number): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

function shiftMonth(date: string, months: number): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().split("T")[0];
}

export default function CalendarPage() {
  const { cases } = useApp();
  const { toast } = useToast();
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<View>("week");
  const [anchor, setAnchor] = useState(today);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    setEvents(loadFromStorage<CalendarEvent[]>(CALENDAR_STORAGE_KEY, []));
  }, []);

  function persist(next: CalendarEvent[]) {
    setEvents(next);
    saveToStorage(CALENDAR_STORAGE_KEY, next);
  }

  function openNew(prefill?: Partial<CalendarEvent>) {
    setEditing(emptyEvent({ date: anchor, ...prefill }));
  }

  function saveEvent() {
    if (!editing) return;
    if (!editing.title.trim()) {
      toast("Add a title", "warning");
      return;
    }
    const exists = events.some((e) => e.id === editing.id);
    const next = exists
      ? events.map((e) => (e.id === editing.id ? editing : e))
      : [editing, ...events];
    persist(next);
    setEditing(null);
    toast("Saved", "success");
  }

  function deleteEvent(id: string) {
    persist(events.filter((e) => e.id !== id));
    setEditing(null);
  }

  function toggleDone(ev: CalendarEvent) {
    persist(events.map((e) => (e.id === ev.id ? { ...e, done: !e.done } : e)));
  }

  const load = useMemo(() => calendarLoad(events, today), [events, today]);

  // For day view, render an agenda for the anchor date.
  const dayOccurrences = useMemo(
    () => expandRecurrences(events, anchor, anchor),
    [events, anchor]
  );

  // Overdue items
  const overdue = useMemo(
    () =>
      events
        .filter((e) => isOverdue(e, today))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [events, today]
  );

  return (
    <div className="max-w-6xl mx-auto animate-fade-in" data-section="calendar">
      <PageHeader
        title="Clinical calendar"
        subtitle="Sessions, supervision, deadlines, follow-ups — colour-coded by category"
        action={
          <div className="flex gap-2">
            <Button onClick={() => openNew()} size="sm">
              <Plus size={13} /> Add event
            </Button>
            <Button
              onClick={() => window.print()}
              variant="secondary"
              size="sm"
            >
              <Printer size={13} /> Print
            </Button>
          </div>
        }
      />

      {/* Load widgets */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 print:hidden"
      >
        <LoadWidget label="Today" value={load.todayCount} accent="#9882C0" />
        <LoadWidget label="This week" value={load.weekCount} accent="#6E8A7B" />
        <LoadWidget label="Pending tasks" value={load.pendingTaskCount} accent="#B07A4F" />
        <LoadWidget
          label="Overdue"
          value={load.overdueCount}
          accent={load.overdueCount > 0 ? "#9B4D3A" : "#94A3B8"}
        />
      </div>

      {/* View controls */}
      <div
        className="flex items-center justify-between gap-3 mb-3 print:hidden"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setAnchor(
                view === "month"
                  ? shiftMonth(anchor, -1)
                  : shiftDate(anchor, view === "week" ? -7 : -1)
              )
            }
            className="p-1.5 rounded-lg border alive-hover"
            style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}
            aria-label="Previous"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setAnchor(today)}
            className="text-xs px-2.5 py-1.5 rounded-lg border alive-hover"
            style={{
              borderColor: "var(--psych-border)",
              color: "var(--psych-muted)",
            }}
          >
            Today
          </button>
          <button
            onClick={() =>
              setAnchor(
                view === "month"
                  ? shiftMonth(anchor, 1)
                  : shiftDate(anchor, view === "week" ? 7 : 1)
              )
            }
            className="p-1.5 rounded-lg border alive-hover"
            style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}
            aria-label="Next"
          >
            <ChevronRight size={14} />
          </button>
          <span
            className="text-sm font-medium ml-2"
            style={{ color: "var(--psych-text)" }}
          >
            {formatAnchor(anchor, view)}
          </span>
        </div>
        <div className="flex gap-1">
          {(["day", "week", "month"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="text-xs px-2.5 py-1.5 rounded-lg border"
              style={{
                borderColor:
                  view === v ? "var(--section-accent, var(--psych-primary))" : "var(--psych-border)",
                background: view === v ? "var(--section-tint, var(--psych-primary-light))" : "transparent",
                color: "var(--psych-text)",
              }}
            >
              {v[0].toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Views */}
      {view === "day" ? (
        <DayAgenda
          date={anchor}
          occurrences={dayOccurrences}
          onSelect={(e) => setEditing({ ...e })}
          onToggleDone={toggleDone}
          onAdd={(d) => openNew({ date: d })}
        />
      ) : (
        <CalendarBoard
          events={events}
          view={view}
          anchor={anchor}
          onSelectDate={(d) => openNew({ date: d })}
          onSelectEvent={(e) => setEditing({ ...e })}
        />
      )}

      {/* Overdue list */}
      {overdue.length > 0 && (
        <SectionCard
          title={`Overdue (${overdue.length})`}
          description="Past, undone, non-recurring items"
          className="mt-5"
        >
          <ul className="space-y-2">
            {overdue.map((e) => {
              const meta = CATEGORY_META[e.category];
              return (
                <li
                  key={e.id}
                  className="flex items-center gap-3 p-2 rounded-lg border alive-hover"
                  style={{ borderColor: "var(--psych-border)" }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: meta.color }}
                  />
                  <span
                    className="text-xs font-mono"
                    style={{ color: "var(--psych-muted)" }}
                  >
                    {e.date}
                  </span>
                  <span className="text-sm flex-1" style={{ color: "var(--psych-text)" }}>
                    {e.title || meta.label}
                  </span>
                  <button
                    onClick={() => toggleDone(e)}
                    className="text-[11px] px-2 py-0.5 rounded-full border"
                    style={{
                      borderColor: "var(--psych-border)",
                      color: "var(--psych-muted)",
                    }}
                  >
                    Mark done
                  </button>
                  <button
                    onClick={() => setEditing({ ...e })}
                    className="text-[11px]"
                    style={{ color: "var(--psych-primary)" }}
                  >
                    Edit
                  </button>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      )}

      {/* Edit modal */}
      {editing && (
        <Modal
          open={Boolean(editing)}
          onClose={() => setEditing(null)}
          title={events.some((e) => e.id === editing.id) ? "Edit event" : "New event"}
          size="md"
        >
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <Label htmlFor="ev-title">Title</Label>
                <Input
                  id="ev-title"
                  value={editing.title}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                  placeholder="e.g. Session — CASE-001"
                />
              </div>
              <div>
                <Label htmlFor="ev-cat">Category</Label>
                <Select
                  id="ev-cat"
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      category: e.target.value as CalendarCategory,
                    })
                  }
                >
                  {(Object.keys(CATEGORY_META) as CalendarCategory[]).map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_META[c].label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="ev-case">Linked case</Label>
                <Select
                  id="ev-case"
                  value={editing.caseId ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      caseId: e.target.value || undefined,
                    })
                  }
                >
                  <option value="">(none)</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.type}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="ev-date">Date</Label>
                <Input
                  id="ev-date"
                  type="date"
                  value={editing.date}
                  onChange={(e) =>
                    setEditing({ ...editing, date: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="ev-start">Start</Label>
                  <Input
                    id="ev-start"
                    type="time"
                    value={editing.startTime ?? ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        startTime: e.target.value || undefined,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="ev-end">End</Label>
                  <Input
                    id="ev-end"
                    type="time"
                    value={editing.endTime ?? ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        endTime: e.target.value || undefined,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="ev-rec">Recurrence</Label>
                <Select
                  id="ev-rec"
                  value={editing.recurrence}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      recurrence: e.target.value as Recurrence,
                    })
                  }
                >
                  <option value="none">No repeat</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              </div>
              {editing.recurrence !== "none" && (
                <div>
                  <Label htmlFor="ev-until">Until (optional)</Label>
                  <Input
                    id="ev-until"
                    type="date"
                    value={editing.recurrenceUntil ?? ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        recurrenceUntil: e.target.value || undefined,
                      })
                    }
                  />
                </div>
              )}
              <div className="md:col-span-2">
                <Label htmlFor="ev-notes">Notes</Label>
                <Textarea
                  id="ev-notes"
                  value={editing.notes ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, notes: e.target.value })
                  }
                  className="min-h-[80px]"
                />
              </div>
              <label className="md:col-span-2 inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.done}
                  onChange={(e) =>
                    setEditing({ ...editing, done: e.target.checked })
                  }
                />
                Mark as done
              </label>
            </div>
          </ModalBody>
          <ModalFooter>
            {events.some((e) => e.id === editing.id) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteEvent(editing.id)}
              >
                <Trash2 size={12} /> Delete
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={saveEvent}>
              Save
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

function formatAnchor(anchor: string, view: View): string {
  const d = new Date(anchor + "T00:00:00Z");
  if (view === "month") {
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", timeZone: "UTC" });
  }
  if (view === "week") {
    const start = startOfWeekISO(anchor);
    const end = endOfWeekISO(anchor);
    return `${start} → ${end}`;
  }
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function LoadWidget({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div
      className="alive-hover"
      style={{
        padding: "0.85rem 1rem",
        borderRadius: 14,
        border: "1px solid var(--psych-border)",
        background: "var(--psych-card)",
        borderLeft: `4px solid ${accent}`,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--psych-muted)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "1.5rem",
          fontWeight: 600,
          color: "var(--psych-text)",
          marginTop: 2,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function DayAgenda({
  date,
  occurrences,
  onSelect,
  onToggleDone,
  onAdd,
}: {
  date: string;
  occurrences: Array<CalendarEvent & { occurrenceDate: string }>;
  onSelect: (e: CalendarEvent) => void;
  onToggleDone: (e: CalendarEvent) => void;
  onAdd: (date: string) => void;
}) {
  return (
    <SectionCard
      title={`Day agenda · ${date}`}
      action={
        <Button size="sm" variant="secondary" onClick={() => onAdd(date)}>
          <Plus size={13} /> Add
        </Button>
      }
    >
      {occurrences.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
          Nothing on this day.
        </p>
      ) : (
        <ul className="space-y-2">
          {occurrences.map((occ) => {
            const meta = CATEGORY_META[occ.category];
            return (
              <li
                key={`${occ.id}-${occ.occurrenceDate}`}
                className="flex items-center gap-3 p-3 rounded-xl border alive-hover"
                style={{
                  borderColor: "var(--psych-border)",
                  borderLeft: `4px solid ${meta.color}`,
                  background: "var(--psych-card)",
                }}
              >
                <span
                  className="text-xs font-mono w-16"
                  style={{ color: "var(--psych-muted)" }}
                >
                  {occ.startTime ?? "—"}
                </span>
                <div className="flex-1">
                  <div
                    className="text-sm font-medium"
                    style={{
                      color: "var(--psych-text)",
                      textDecoration: occ.done ? "line-through" : "none",
                    }}
                  >
                    {occ.title || meta.label}
                  </div>
                  <div className="text-xs" style={{ color: "var(--psych-muted)" }}>
                    {meta.label}
                    {occ.recurrence !== "none" ? ` · ${occ.recurrence}` : ""}
                  </div>
                </div>
                <button
                  onClick={() => onToggleDone(occ)}
                  className="text-[11px] px-2 py-0.5 rounded-full border"
                  style={{
                    borderColor: "var(--psych-border)",
                    color: occ.done ? "var(--psych-accent)" : "var(--psych-muted)",
                    background: occ.done ? "var(--psych-primary-light)" : "transparent",
                  }}
                >
                  {occ.done ? "Done" : "Mark done"}
                </button>
                <button
                  onClick={() => onSelect(occ)}
                  className="text-[11px]"
                  style={{ color: "var(--psych-primary)" }}
                >
                  Edit
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
