"use client";
import { useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Minus,
  Heading2,
  Highlighter,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing…",
  minHeight = 160,
  className = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const tools = [
    { icon: <Bold size={13} />, cmd: "bold", title: "Bold" },
    { icon: <Italic size={13} />, cmd: "italic", title: "Italic" },
    { icon: <Underline size={13} />, cmd: "underline", title: "Underline" },
    { icon: <Highlighter size={13} />, cmd: "hiliteColor", val: "var(--psych-primary-light)", title: "Highlight" },
    null,
    { icon: <Heading2 size={13} />, cmd: "formatBlock", val: "h3", title: "Heading" },
    { icon: <Quote size={13} />, cmd: "formatBlock", val: "blockquote", title: "Quote" },
    null,
    { icon: <List size={13} />, cmd: "insertUnorderedList", title: "Bullet list" },
    { icon: <ListOrdered size={13} />, cmd: "insertOrderedList", title: "Numbered list" },
    { icon: <Minus size={13} />, cmd: "insertHorizontalRule", title: "Divider" },
  ];

  return (
    <div
      className={`rounded-2xl border overflow-hidden ${className}`}
      style={{ borderColor: "var(--psych-border)" }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-0.5 px-3 py-2 border-b flex-wrap"
        style={{
          backgroundColor: "var(--psych-sidebar)",
          borderColor: "var(--psych-border)",
        }}
      >
        {tools.map((tool, i) =>
          tool === null ? (
            <div
              key={i}
              className="w-px h-4 mx-1"
              style={{ backgroundColor: "var(--psych-border)" }}
            />
          ) : (
            <button
              key={tool.cmd + i}
              title={tool.title}
              onMouseDown={(e) => {
                e.preventDefault();
                exec(tool.cmd, tool.val);
              }}
              className="p-1.5 rounded-lg transition-all hover:scale-105"
              style={{
                color: "var(--psych-muted)",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "var(--psych-primary-light)";
                (e.currentTarget as HTMLElement).style.color =
                  "var(--psych-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "transparent";
                (e.currentTarget as HTMLElement).style.color =
                  "var(--psych-muted)";
              }}
            >
              {tool.icon}
            </button>
          )
        )}
      </div>

      {/* Editor area */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={() => {
            if (editorRef.current) onChange(editorRef.current.innerHTML);
          }}
          dangerouslySetInnerHTML={{ __html: value }}
          className="outline-none px-4 py-3 text-sm leading-relaxed rich-text"
          style={{
            minHeight,
            color: "var(--psych-text)",
            backgroundColor: "var(--psych-card)",
          }}
        />
        {!value && (
          <p
            className="absolute top-3 left-4 text-sm pointer-events-none select-none"
            style={{ color: "var(--psych-muted)" }}
          >
            {placeholder}
          </p>
        )}
      </div>
    </div>
  );
}
