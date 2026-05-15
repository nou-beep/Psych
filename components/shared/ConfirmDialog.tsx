"use client";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  confirmVariant?: "danger" | "primary";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <ModalBody>
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              backgroundColor:
                confirmVariant === "danger" ? "#FEE2E2" : "var(--psych-primary-light)",
            }}
          >
            <AlertTriangle
              size={22}
              style={{
                color: confirmVariant === "danger" ? "#DC2626" : "var(--psych-primary)",
              }}
            />
          </div>
          <div>
            <h3 className="text-base font-semibold mb-1" style={{ color: "var(--psych-text)" }}>
              {title}
            </h3>
            <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
              {message}
            </p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant={confirmVariant === "danger" ? "outline" : "primary"}
          size="sm"
          onClick={onConfirm}
          disabled={loading}
          style={
            confirmVariant === "danger"
              ? {
                  backgroundColor: "#DC2626",
                  color: "white",
                  border: "none",
                }
              : {}
          }
        >
          {loading ? "…" : confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
