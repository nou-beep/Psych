"use client";
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 no-print">
        {toasts.map((t) => (
          <ToastBubble key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastBubble({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={15} style={{ color: "#10B981" }} />,
    error: <XCircle size={15} style={{ color: "#EF4444" }} />,
    warning: <AlertCircle size={15} style={{ color: "#F59E0B" }} />,
    info: <Info size={15} style={{ color: "#3B82F6" }} />,
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md"
      style={{
        backgroundColor: "var(--psych-card)",
        borderColor: "var(--psych-border)",
        minWidth: 260,
        maxWidth: 360,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.95)",
        transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        boxShadow: "var(--psych-shadow)",
      }}
    >
      {icons[item.type]}
      <span className="text-sm flex-1 leading-snug" style={{ color: "var(--psych-text)" }}>
        {item.message}
      </span>
      <button
        onClick={onDismiss}
        className="rounded-lg p-0.5 transition-opacity hover:opacity-50"
        style={{ color: "var(--psych-muted)" }}
      >
        <X size={13} />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
