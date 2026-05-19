"use client";
// Compact EN / FR pill toggle. Sits in the sidebar footer, on the
// entry gateway, and on the login screen. Persists via LocaleContext,
// which writes through to localStorage; no page reload required —
// every component subscribed to useLocale() rerenders immediately.

import { useLocale } from "@/contexts/LocaleContext";
import type { Locale } from "@/lib/i18n";

interface Props {
  /** Visual size. `sm` for the sidebar footer, `md` for the gateway. */
  size?: "sm" | "md";
  /** Visual variant. `soft` for translucent backgrounds, `solid` for sidebar. */
  variant?: "soft" | "solid";
  className?: string;
}

const LABEL: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
};

export function LanguageToggle({
  size = "sm",
  variant = "soft",
  className = "",
}: Props) {
  const { locale, setLocale } = useLocale();

  const padding = size === "sm" ? "0.2rem" : "0.3rem";
  const fontSize = size === "sm" ? 11 : 12;
  const optionPadding =
    size === "sm" ? "0.15rem 0.45rem" : "0.25rem 0.6rem";

  const trackBg =
    variant === "soft"
      ? "rgba(255,255,255,0.55)"
      : "var(--psych-card)";
  const trackBorder =
    variant === "soft"
      ? "1px solid rgba(180,120,170,0.22)"
      : "1px solid var(--psych-border)";

  return (
    <div
      role="group"
      aria-label="Language"
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0,
        padding,
        background: trackBg,
        border: trackBorder,
        borderRadius: 999,
        fontSize,
        fontWeight: 500,
      }}
    >
      {(["en", "fr"] as const).map((opt) => {
        const active = locale === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => setLocale(opt)}
            aria-pressed={active}
            data-locale={opt}
            style={{
              all: "unset",
              cursor: active ? "default" : "pointer",
              padding: optionPadding,
              borderRadius: 999,
              background: active
                ? "linear-gradient(135deg, #B49AE2, #8E72CC)"
                : "transparent",
              color: active ? "white" : "var(--psych-muted, #7A6090)",
              transition: "background 0.18s ease, color 0.18s ease",
              letterSpacing: "0.04em",
            }}
          >
            {LABEL[opt]}
          </button>
        );
      })}
    </div>
  );
}
