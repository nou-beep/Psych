"use client";

// PrintButton — triggers the browser's print dialog.
// This button is hidden when printing (no-print class).

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrintButtonProps {
  label?: string;
  variant?: "primary" | "secondary" | "outline";
}

export function PrintButton({ label = "Print", variant = "outline" }: PrintButtonProps) {
  return (
    <Button
      variant={variant}
      size="sm"
      onClick={() => window.print()}
      className="no-print gap-2"
    >
      <Printer size={14} />
      {label}
    </Button>
  );
}
