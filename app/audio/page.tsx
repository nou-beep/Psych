"use client";
import { useState, useRef, useCallback } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useClinical } from "@/contexts/ClinicalContext";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import { type AudioNote } from "@/lib/clinical-data";
import {
  Mic, MicOff, Play, Square, Trash2, Plus, Clock, Tag, Bookmark,
  FileText, Search, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function AudioPage() {
  const { audioNotes, addAudioNote, updateAudioNote, deleteAudioNote } = useClinical();
  const { cases } = useApp();
  const { toast } = useToast();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [newName, setNewName] = useState("Voice note");
  const [newLinkedType, setNewLinkedType] = useState<"case" | "general" | "supervision">("general");
  const [newLinkedId, setNewLinkedId] = useState("");
  const [search, setSearch] = useState("");
  const [editingTranscript, setEditingTranscript] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const activeCases = cases.filter((c) => !c.isArchived);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      setTranscript("");
      setRecordingSeconds(0);

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        audioBlobRef.current = blob;
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start(200);

      timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);

      // Speech recognition
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const rec = new SR();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";
        rec.onresult = (event) => {
          let final = "";
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) final += event.results[i][0].transcript + " ";
          }
          if (final) setTranscript((prev) => prev + final);
        };
        rec.onerror = () => {};
        rec.start();
        recognitionRef.current = rec;
      }

      setIsRecording(true);
    } catch {
      toast("Microphone access denied or unavailable", "error");
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch { /* ignore */ } }
    setIsRecording(false);
  }, []);

  function saveNote() {
    if (!audioBlobRef.current && !transcript.trim()) {
      toast("Nothing to save — record first", "error"); return;
    }
    addAudioNote({
      name: newName,
      durationSeconds: recordingSeconds,
      transcript: transcript.trim(),
      linkedType: newLinkedType,
      linkedId: newLinkedId,
    });
    audioBlobRef.current = null;
    setTranscript("");
    setRecordingSeconds(0);
    setNewName("Voice note");
    setNewLinkedId("");
    toast("Audio note saved", "success");
  }

  function startEditTranscript(note: AudioNote) {
    setEditingTranscript(note.id);
    setEditText(note.transcript);
  }

  function saveTranscript(id: string) {
    updateAudioNote(id, { transcript: editText });
    setEditingTranscript(null);
    toast("Transcript updated", "success");
  }

  const filtered = audioNotes.filter((n) => {
    const q = search.toLowerCase();
    return !q || n.name.toLowerCase().includes(q) || n.transcript.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Audio Notes"
        subtitle={`${audioNotes.length} note${audioNotes.length !== 1 ? "s" : ""} · browser recording + live transcription`}
      />

      {/* Recorder */}
      <div className="rounded-2xl border p-5 space-y-4" style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
        <h3 className="font-semibold" style={{ color: "var(--psych-text)" }}>Record a note</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Note name</label>
            <input className="w-full rounded-xl px-3 py-2 text-sm border"
              style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
              value={newName} onChange={(e) => setNewName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Link to</label>
            <select className="w-full rounded-xl px-3 py-2 text-sm border"
              style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
              value={newLinkedType} onChange={(e) => setNewLinkedType(e.target.value as "case" | "general" | "supervision")}>
              <option value="general">General</option>
              <option value="case">Case</option>
              <option value="supervision">Supervision</option>
            </select>
          </div>
          {newLinkedType === "case" && (
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Case</label>
              <select className="w-full rounded-xl px-3 py-2 text-sm border"
                style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                value={newLinkedId} onChange={(e) => setNewLinkedId(e.target.value)}>
                <option value="">Select case…</option>
                {activeCases.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.label}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Recording controls */}
        <div className="flex items-center gap-4">
          {!isRecording ? (
            <button onClick={startRecording}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium"
              style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
              <Mic size={16} /> Start Recording
            </button>
          ) : (
            <button onClick={stopRecording}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium animate-pulse"
              style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
              <Square size={16} /> Stop ({formatDuration(recordingSeconds)})
            </button>
          )}
          {!isRecording && (transcript || audioBlobRef.current) && (
            <button onClick={saveNote}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium"
              style={{ background: "linear-gradient(135deg, var(--psych-primary), var(--psych-accent))" }}>
              <Plus size={16} /> Save Note
            </button>
          )}
          {isRecording && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-mono" style={{ color: "var(--psych-text)" }}>{formatDuration(recordingSeconds)}</span>
              <span className="text-xs" style={{ color: "var(--psych-muted)" }}>Recording…</span>
            </div>
          )}
        </div>

        {/* Live transcript */}
        {(isRecording || transcript) && (
          <div className="rounded-xl border p-3 min-h-[80px]"
            style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--psych-muted)" }}>
              {isRecording ? "Live transcript" : "Transcript preview"}
            </p>
            <p className="text-sm" style={{ color: "var(--psych-text)" }}>
              {transcript || <span style={{ color: "var(--psych-muted)", opacity: 0.6 }}>Listening…</span>}
            </p>
          </div>
        )}

        <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
          Live transcription requires Chrome or Edge. Audio is recorded in-browser — nothing is sent to any server.
        </p>
      </div>

      {/* Search */}
      <div className="no-print flex items-center gap-2 rounded-xl px-3 py-2 border"
        style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
        <Search size={14} style={{ color: "var(--psych-muted)" }} />
        <input placeholder="Search notes and transcripts…" className="bg-transparent flex-1 outline-none text-sm"
          style={{ color: "var(--psych-text)" }} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Notes list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--psych-muted)" }}>
          <Mic size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No audio notes yet</p>
          <p className="text-sm mt-1 opacity-70">Press Start Recording to capture your first note</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((note) => {
            const linkedCase = cases.find((c) => c.id === note.linkedId);
            const isEditingThis = editingTranscript === note.id;
            return (
              <div key={note.id} className="rounded-2xl border p-4"
                style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "var(--psych-primary-light)" }}>
                    <Mic size={16} style={{ color: "var(--psych-primary)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm" style={{ color: "var(--psych-text)" }}>{note.name}</span>
                      {note.durationSeconds > 0 && (
                        <span className="flex items-center gap-0.5 text-xs" style={{ color: "var(--psych-muted)" }}>
                          <Clock size={10} /> {formatDuration(note.durationSeconds)}
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full border capitalize"
                        style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>{note.linkedType}</span>
                      {linkedCase && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: "var(--psych-primary-light)", color: "var(--psych-primary)" }}>
                          {linkedCase.code}
                        </span>
                      )}
                      <span className="text-xs" style={{ color: "var(--psych-muted)" }}>
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {note.transcript ? (
                      isEditingThis ? (
                        <div>
                          <textarea rows={4} className="w-full rounded-xl px-3 py-2 text-sm border resize-none"
                            style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                            value={editText} onChange={(e) => setEditText(e.target.value)} />
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => saveTranscript(note.id)}
                              className="text-xs px-3 py-1 rounded-lg text-white"
                              style={{ backgroundColor: "var(--psych-primary)" }}>Save</button>
                            <button onClick={() => setEditingTranscript(null)}
                              className="text-xs px-3 py-1 rounded-lg border"
                              style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm line-clamp-3 mt-1" style={{ color: "var(--psych-text)" }}>{note.transcript}</p>
                      )
                    ) : (
                      <p className="text-sm italic mt-1" style={{ color: "var(--psych-muted)" }}>No transcript</p>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => { updateAudioNote(note.id, { isFavorite: !note.isFavorite }); }}
                      className="p-1.5 rounded-lg"
                      style={{ color: note.isFavorite ? "#f59e0b" : "var(--psych-muted)" }}>
                      <Bookmark size={13} fill={note.isFavorite ? "#f59e0b" : "none"} />
                    </button>
                    <button onClick={() => startEditTranscript(note)} className="p-1.5 rounded-lg"
                      style={{ color: "var(--psych-muted)" }}><FileText size={13} /></button>
                    <button onClick={() => { deleteAudioNote(note.id); toast("Note deleted", "success"); }}
                      className="p-1.5 rounded-lg" style={{ color: "var(--psych-muted)" }}><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
