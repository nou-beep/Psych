"use client";
// Floating quick-capture button. Triggers from a global keyboard shortcut
// (Ctrl/Cmd + Shift + .) and a small button in the corner. Renders a
// modal where the user picks a kind, types body, tags it, and (optionally)
// links it to the case/participant/chapter in current context.
//
// The captured note lands in the Inbox at /inbox. No "AI" / wellness
// fluff — this is a margin-scribble system.

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Pin, Sparkles, X } from "lucide-react";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/Toast";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import {
  CAPTURE_KIND_LABELS,
  CAPTURE_KINDS,
  QUICK_CAPTURE_STORAGE_KEY,
  newCapture,
  type CaptureColor,
  type CaptureKind,
  type CaptureNote,
} from "@/lib/workspace/quick-capture";

const COLOR_SWATCHES: Array<{
  value: CaptureColor;
  label: string;
  bg: string;
  fg: string;
}> = [
  { value: "default", label: "Plain", bg: "var(--psych-card)", fg: "var(--psych-text)" },
  { value: "amber", label: "Amber", bg: "#FEF3C7", fg: "#92400E" },
  { value: "rose", label: "Rose", bg: "#FFE4E6", fg: "#9F1239" },
  { value: "violet", label: "Violet", bg: "#EDE9FE", fg: "#5B21B6" },
  { value: "teal", label: "Teal", bg: "#CCFBF1", fg: "#115E59" },
  { value: "slate", label: "Slate", bg: "#E2E8F0", fg: "#1E293B" },
];

export function QuickCapture() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<CaptureKind>("observation");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [color, setColor] = useState<CaptureColor>("default");
  const [pinned, setPinned] = useState(false);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === ".") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 40);
    } else {
      // reset on close
      setBody("");
      setTags("");
      setColor("default");
      setPinned(false);
      setKind("observation");
    }
  }, [open]);

  function save() {
    const text = body.trim();
    if (!text) {
      toast("Capture vide — rien à enregistrer.", "error");
      return;
    }
    const list = loadFromStorage<CaptureNote[]>(QUICK_CAPTURE_STORAGE_KEY, []);
    const next = [
      newCapture({
        body: text,
        kind,
        tags: tags.split(/[,#]+/).map((t) => t.trim()).filter(Boolean),
        color,
        pinned,
        source: pathname ?? undefined,
      }),
      ...(Array.isArray(list) ? list : []),
    ];
    saveToStorage(QUICK_CAPTURE_STORAGE_KEY, next);
    toast("Capturé dans l'inbox.", "success");
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="no-print fixed bottom-24 right-8 z-40 flex items-center gap-1.5 px-3 py-2 rounded-2xl border shadow-md transition-all hover:scale-[1.03]"
        title="Quick capture (Ctrl+Shift+.)"
        style={{
          backgroundColor: "var(--psych-card)",
          borderColor: "var(--psych-border)",
          color: "var(--psych-text)",
        }}
      >
        <Sparkles size={12} style={{ color: "var(--psych-primary)" }} />
        <span className="text-xs">Capture</span>
        <kbd
          className="text-[9px] px-1 py-0.5 rounded border ml-1 font-mono"
          style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}
        >
          ⌘⇧.
        </kbd>
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Quick capture"
        subtitle="Garder une trace avant que ça s'échappe."
        size="md"
      >
        <ModalBody className="space-y-3">
          <div className="flex items-center gap-2">
            <label
              className="text-[10px] uppercase tracking-wider"
              style={{ color: "var(--psych-muted)" }}
            >
              Type
            </label>
            <Select
              value={kind}
              onChange={(e) => setKind(e.target.value as CaptureKind)}
              className="text-xs"
            >
              {CAPTURE_KINDS.map((k) => (
                <option key={k} value={k}>
                  {CAPTURE_KIND_LABELS[k]}
                </option>
              ))}
            </Select>
            <button
              onClick={() => setPinned((p) => !p)}
              className="ml-auto rounded-md p-1.5 border transition-all"
              title={pinned ? "Détacher" : "Épingler"}
              style={{
                borderColor: pinned ? "var(--psych-primary)" : "var(--psych-border)",
                color: pinned ? "var(--psych-primary)" : "var(--psych-muted)",
                backgroundColor: pinned
                  ? "var(--psych-primary-light)"
                  : "transparent",
              }}
            >
              <Pin size={12} />
            </button>
          </div>

          <Textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Une observation, une hypothèse, une citation qui vient de surgir…"
            className="min-h-[140px]"
            style={{
              backgroundColor:
                COLOR_SWATCHES.find((s) => s.value === color)?.bg,
              color: COLOR_SWATCHES.find((s) => s.value === color)?.fg,
            }}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                save();
              }
            }}
          />

          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (séparer par , ou #)"
            className="text-xs"
          />

          <div className="flex items-center gap-1.5">
            <span
              className="text-[10px] uppercase tracking-wider mr-1"
              style={{ color: "var(--psych-muted)" }}
            >
              Couleur
            </span>
            {COLOR_SWATCHES.map((s) => (
              <button
                key={s.value}
                onClick={() => setColor(s.value)}
                aria-label={s.label}
                className="w-5 h-5 rounded-full border transition-all"
                style={{
                  backgroundColor: s.bg,
                  borderColor:
                    color === s.value ? "var(--psych-primary)" : "var(--psych-border)",
                  borderWidth: color === s.value ? 2 : 1,
                }}
              />
            ))}
          </div>

          <p
            className="text-[10px] italic"
            style={{ color: "var(--psych-muted)" }}
          >
            Source : {pathname ?? "—"} · ⌘+Enter pour enregistrer
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            <X size={12} /> Annuler
          </Button>
          <Button size="sm" onClick={save}>
            Capturer
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
