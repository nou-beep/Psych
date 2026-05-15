interface ProgressBarProps {
  value: number; // 0–100
  size?: "xs" | "sm" | "md";
  color?: string;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  size = "sm",
  color,
  showLabel = false,
  className = "",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  const heights: Record<string, string> = {
    xs: "h-1",
    sm: "h-1.5",
    md: "h-2.5",
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`w-full rounded-full overflow-hidden ${heights[size]}`}
        style={{ backgroundColor: "var(--psych-primary-light)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${clamped}%`,
            backgroundColor: color ?? "var(--psych-primary)",
          }}
        />
      </div>
      {showLabel && (
        <p className="text-[10px] mt-1" style={{ color: "var(--psych-muted)" }}>
          {clamped}%
        </p>
      )}
    </div>
  );
}
