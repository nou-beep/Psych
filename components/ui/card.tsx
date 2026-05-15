// Card components — themed card container with header, content, and footer sections.
import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

function Card({ className, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border shadow-sm", className)}
      style={{
        backgroundColor: "var(--psych-card)",
        borderColor: "var(--psych-border)",
        boxShadow: "var(--psych-shadow)",
        ...style,
      }}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1 px-5 pt-5 pb-3", className)}
      {...props}
    />
  );
}

function CardTitle({ className, style, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold leading-tight", className)}
      style={{ color: "var(--psych-text)", ...style }}
      {...props}
    />
  );
}

function CardDescription({ className, style, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm", className)}
      style={{ color: "var(--psych-muted)", ...style }}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-5 pb-4", className)} {...props} />
  );
}

function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center px-5 pt-3 pb-4 border-t gap-2", className)}
      style={{ borderColor: "var(--psych-border)" }}
      {...props}
    />
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
