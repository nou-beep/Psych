"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 no-print"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={cn(
          "w-full rounded-3xl border shadow-2xl animate-fade-in flex flex-col max-h-[90vh]",
          widths[size],
          className
        )}
        style={{
          backgroundColor: "var(--psych-card)",
          borderColor: "var(--psych-border)",
        }}
      >
        {(title || subtitle) && (
          <div
            className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b flex-shrink-0"
            style={{ borderColor: "var(--psych-border)" }}
          >
            <div>
              {title && (
                <h2
                  className="text-base font-semibold leading-tight"
                  style={{ color: "var(--psych-text)" }}
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs mt-0.5" style={{ color: "var(--psych-muted)" }}>
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 transition-all hover:scale-110"
              style={{
                color: "var(--psych-muted)",
                backgroundColor: "var(--psych-primary-light)",
              }}
            >
              <X size={15} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

interface ModalFooterProps {
  children: React.ReactNode;
}

export function ModalFooter({ children }: ModalFooterProps) {
  return (
    <div
      className="flex items-center justify-end gap-3 px-6 py-4 border-t flex-shrink-0"
      style={{ borderColor: "var(--psych-border)" }}
    >
      {children}
    </div>
  );
}

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return <div className={cn("px-6 py-5", className)}>{children}</div>;
}
