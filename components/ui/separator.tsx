// Separator — horizontal divider line.
import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }) {
  return (
    <div
      className={cn(
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      style={{ backgroundColor: "var(--psych-border)" }}
      role="separator"
      {...props}
    />
  );
}

export { Separator };
