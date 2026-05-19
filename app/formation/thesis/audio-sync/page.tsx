"use client";
// Transcript + audio sync — upload an audio file, paste/upload a
// timestamped transcript, watch the active line highlight as audio
// plays. Click any line to seek the audio.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Upload,
  Play,
  Pause,
  RotateCcw,
  Scissors,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/Toast";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import {
  TRANSCRIPT_SYNC_STORAGE_KEY,
  excerptFromRange,
  formatTimestamp,
  lineIndexAt,
  newTranscriptDocument,
  type TranscriptDocument,
} from "@/lib/research/transcript-sync";

export default function AudioSyncPage() {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string | null>(null);
  const [doc, setDoc] = useState<TranscriptDocument | null>(null);
  const [rawInput, setRawInput] = useState("");
  const [title, setTitle] = useState("Transcript de séance");
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [loopStart] = useState<number | null>(null);
  const [loopEnd] = useState<number | null>(null);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = loadFromStorage<TranscriptDocument | null>(
        TRANSCRIPT_SYNC_STORAGE_KEY,
        null
      );
      if (stored) {
        setDoc(stored);
        setTitle(stored.title);
      }
    } catch {
      /* ignore */
    }
  }, []);

  function persist(next: TranscriptDocument) {
    setDoc(next);
    saveToStorage(TRANSCRIPT_SYNC_STORAGE_KEY, next);
  }

  function onAudioPicked(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    setAudioName(f.name);
    setAudioUrl(URL.createObjectURL(f));
  }

  function buildTranscript() {
    const next = newTranscriptDocument(title, rawInput, audioName ?? undefined);
    if (next.lines.length === 0) {
      toast("Aucune ligne reconnue dans le transcript.", "error");
      return;
    }
    persist(next);
    toast(`${next.lines.length} ligne(s) chargée(s).`, "success");
  }

  const activeIndex = useMemo(
    () => (doc ? lineIndexAt(doc.lines, currentTime) : -1),
    [doc, currentTime]
  );

  function seekTo(seconds: number) {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
  }

  function extractSelected() {
    if (!doc) return;
    if (selectionStart === null || selectionEnd === null) {
      toast("Sélectionner un intervalle de lignes d'abord.", "error");
      return;
    }
    const ex = excerptFromRange(doc.lines, selectionStart, selectionEnd);
    if (!ex) {
      toast("Sélection invalide.", "error");
      return;
    }
    navigator.clipboard.writeText(
      `[${formatTimestamp(ex.startSec)}–${formatTimestamp(ex.endSec)}]\n${ex.text}`
    );
    toast("Extrait copié dans le presse-papier.", "success");
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in" data-section="research">
      <PageHeader
        title="Transcript / audio sync"
        subtitle="Téléverser un audio + un transcript daté. Cliquer une ligne pour y sauter. Extraire des passages timestampés."
      />

      <div
        className="rounded-xl border p-3 mb-4 flex items-start gap-3"
        style={{
          background: "var(--psych-bg)",
          borderColor: "var(--psych-border)",
        }}
      >
        <AlertTriangle size={14} style={{ color: "var(--psych-accent)" }} />
        <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
          L&apos;audio n&apos;est gardé qu&apos;en mémoire pour la session courante.
          Anonymiser le transcript avant import. Aucune transcription
          automatique — coller le transcript timestampé existant.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Loader */}
        <SectionCard title="Audio + transcript" className="md:col-span-1">
          <div className="space-y-3">
            <div>
              <label
                className="text-[10px] uppercase tracking-wider"
                style={{ color: "var(--psych-muted)" }}
              >
                Fichier audio
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => onAudioPicked(e.target.files)}
                className="w-full text-xs mt-1"
              />
              {audioName && (
                <p
                  className="text-[10px] mt-1 truncate"
                  style={{ color: "var(--psych-muted)" }}
                >
                  {audioName}
                </p>
              )}
            </div>
            <div>
              <label
                className="text-[10px] uppercase tracking-wider"
                style={{ color: "var(--psych-muted)" }}
              >
                Titre du transcript
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label
                className="text-[10px] uppercase tracking-wider"
                style={{ color: "var(--psych-muted)" }}
              >
                Transcript (mm:ss, [mm:ss], WebVTT supportés)
              </label>
              <Textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder={`00:00 Thérapeute : Comment ça va ?\n00:05 Patient : Plus fatigué que d'habitude.\n00:15 Thérapeute : Pouvez-vous décrire la fatigue ?`}
                className="min-h-[160px] text-sm"
              />
            </div>
            <Button size="sm" onClick={buildTranscript}>
              <Upload size={12} /> Charger transcript
            </Button>
          </div>
        </SectionCard>

        {/* Player + transcript */}
        <div className="md:col-span-2 space-y-3">
          {audioUrl && (
            <SectionCard title="Lecteur audio">
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={(e) =>
                  setCurrentTime((e.currentTarget as HTMLAudioElement).currentTime)
                }
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onLoadedMetadata={(e) => {
                  const a = e.currentTarget as HTMLAudioElement;
                  if (doc) persist({ ...doc, durationSec: a.duration });
                }}
                controls
                className="w-full"
              />
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Button size="sm" variant="secondary" onClick={togglePlay}>
                  {playing ? <Pause size={11} /> : <Play size={11} />}{" "}
                  {playing ? "Pause" : "Play"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => seekTo(Math.max(0, currentTime - 5))}
                >
                  <RotateCcw size={11} /> -5s
                </Button>
                <label
                  className="text-xs flex items-center gap-1"
                  style={{ color: "var(--psych-muted)" }}
                >
                  Vitesse:
                  <select
                    value={speed}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setSpeed(v);
                      if (audioRef.current) audioRef.current.playbackRate = v;
                    }}
                    className="text-xs"
                  >
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                      <option key={s} value={s}>
                        {s}x
                      </option>
                    ))}
                  </select>
                </label>
                <span
                  className="text-[10px] ml-auto font-mono"
                  style={{ color: "var(--psych-muted)" }}
                >
                  {formatTimestamp(currentTime)}
                  {doc?.durationSec
                    ? ` / ${formatTimestamp(doc.durationSec)}`
                    : ""}
                </span>
                {loopStart !== null && loopEnd !== null && (
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--psych-primary)" }}
                  >
                    Loop {formatTimestamp(loopStart)}–{formatTimestamp(loopEnd)}
                  </span>
                )}
              </div>
            </SectionCard>
          )}

          <SectionCard
            title={doc ? doc.title : "Transcript"}
            description={
              doc
                ? `${doc.lines.length} ligne(s) · cliquer pour sauter, Shift-click pour sélectionner un intervalle.`
                : "Charger un transcript pour commencer."
            }
            headerAction={
              selectionStart !== null && selectionEnd !== null ? (
                <Button size="sm" variant="secondary" onClick={extractSelected}>
                  <Scissors size={11} /> Extraire ({Math.abs(
                    selectionEnd - selectionStart
                  ) + 1}{" "}
                  lignes)
                </Button>
              ) : undefined
            }
          >
            {doc ? (
              <div
                className="max-h-[420px] overflow-y-auto rounded-md border"
                style={{
                  borderColor: "var(--psych-border)",
                  backgroundColor: "var(--psych-bg)",
                }}
              >
                <ul className="text-sm divide-y" style={{ borderColor: "var(--psych-border)" }}>
                  {doc.lines.map((l, idx) => {
                    const active = idx === activeIndex;
                    const inSelection =
                      selectionStart !== null &&
                      selectionEnd !== null &&
                      idx >= Math.min(selectionStart, selectionEnd) &&
                      idx <= Math.max(selectionStart, selectionEnd);
                    return (
                      <li
                        key={l.id}
                        onClick={(e) => {
                          if (e.shiftKey) {
                            if (selectionStart === null) {
                              setSelectionStart(idx);
                              setSelectionEnd(idx);
                            } else {
                              setSelectionEnd(idx);
                            }
                          } else {
                            seekTo(l.start);
                            setSelectionStart(idx);
                            setSelectionEnd(idx);
                          }
                        }}
                        className="px-3 py-2 cursor-pointer"
                        style={{
                          backgroundColor: active
                            ? "var(--psych-primary-light)"
                            : inSelection
                            ? "rgba(152, 130, 192, 0.12)"
                            : "transparent",
                          color: "var(--psych-text)",
                        }}
                      >
                        <span
                          className="text-[10px] font-mono mr-2"
                          style={{ color: "var(--psych-muted)" }}
                        >
                          {formatTimestamp(l.start)}
                        </span>
                        {l.speaker && (
                          <strong className="mr-1">{l.speaker}:</strong>
                        )}
                        {l.text}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <p
                className="text-sm"
                style={{ color: "var(--psych-muted)" }}
              >
                Aucun transcript chargé.
              </p>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
