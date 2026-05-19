"use client";
// Shared login screen used by both portals. The portal prop changes the
// styling, microcopy, and where to redirect on success.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { homePathFor, type Portal } from "@/lib/auth";

interface Props {
  portal: Portal;
}

export function LoginScreen({ portal }: Props) {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter an email and a password to continue.");
      return;
    }
    setError(null);
    setSubmitting(true);
    // Mock auth: any credentials work. We add a tiny delay so the
    // transition feels intentional rather than instant.
    setTimeout(() => {
      signIn(portal, email);
      router.push(homePathFor(portal));
    }, 350);
  }

  const palette = paletteFor(portal);

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        background: palette.pageBg,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <div className="cp-ambient" aria-hidden>
        <div
          className="cp-orb cp-orb-1"
          style={{ background: palette.orbA, opacity: 0.35 }}
        />
        <div
          className="cp-orb cp-orb-3"
          style={{ background: palette.orbB, opacity: 0.25 }}
        />
      </div>

      <form
        onSubmit={onSubmit}
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 380,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(180,120,170,0.2)",
          borderRadius: 22,
          padding: "1.75rem",
          boxShadow: "0 18px 50px rgba(120,90,160,0.16)",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${palette.accentBg}, ${palette.accentBgEnd})`,
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
            fontWeight: 600,
          }}
        >
          ✦
        </div>
        <h1
          style={{
            fontSize: "1.4rem",
            fontWeight: 600,
            color: "#1F1733",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {palette.title}
        </h1>
        <p
          style={{
            color: "#5C4870",
            fontSize: "0.86rem",
            marginTop: 6,
            lineHeight: 1.5,
          }}
        >
          {palette.subtitle}
        </p>

        <label
          htmlFor="email"
          style={{
            display: "block",
            fontSize: 12,
            color: "#5C4870",
            marginTop: 16,
            marginBottom: 4,
          }}
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={inputStyle()}
        />

        <label
          htmlFor="password"
          style={{
            display: "block",
            fontSize: 12,
            color: "#5C4870",
            marginTop: 10,
            marginBottom: 4,
          }}
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="•••••••"
          style={inputStyle()}
        />

        {error && (
          <div
            style={{
              marginTop: 10,
              padding: "0.5rem 0.7rem",
              borderRadius: 10,
              background: "#FEE2E2",
              color: "#991B1B",
              fontSize: 12,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: 16,
            width: "100%",
            padding: "0.7rem 1rem",
            borderRadius: 14,
            border: "none",
            background: palette.accent,
            color: "white",
            fontSize: "0.92rem",
            fontWeight: 500,
            cursor: submitting ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
          {submitting ? "Signing in…" : "Continue"}
          {!submitting && <ArrowRight size={14} />}
        </button>

        <p
          style={{
            marginTop: 14,
            fontSize: 11,
            color: "#7A6090",
            textAlign: "center",
          }}
        >
          Demo mode — any credentials sign you in.
        </p>

        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
          }}
        >
          <Link
            href="/"
            style={{ color: "#7A6090", textDecoration: "none" }}
          >
            ← Back to gateway
          </Link>
          <Link
            href={palette.otherHref}
            style={{ color: palette.accent, textDecoration: "none" }}
          >
            {palette.otherLabel} →
          </Link>
        </div>
      </form>
    </div>
  );
}

interface Palette {
  title: string;
  subtitle: string;
  pageBg: string;
  orbA: string;
  orbB: string;
  accent: string;
  accentBg: string;
  accentBgEnd: string;
  otherHref: string;
  otherLabel: string;
}

function paletteFor(portal: Portal): Palette {
  if (portal === "formation") {
    return {
      title: "Formation sign in",
      subtitle:
        "Continue to the academic & training workspace — thesis, internship, supervision.",
      pageBg:
        "linear-gradient(155deg, #ECE2F7 0%, #DCD0F0 100%)",
      orbA: "#B49AE2",
      orbB: "#C5B5DC",
      accent: "#5B36A8",
      accentBg: "#B49AE2",
      accentBgEnd: "#8E72CC",
      otherHref: "/login/therapist",
      otherLabel: "Therapist sign-in",
    };
  }
  if (portal === "client") {
    return {
      title: "Client sign in",
      subtitle: "A quieter companion for your therapy work.",
      pageBg: "linear-gradient(155deg, #F0E4F2 0%, #E2D9F0 100%)",
      orbA: "#C5B5DC",
      orbB: "#D8C4E8",
      accent: "#7C4FB3",
      accentBg: "#C7B2E0",
      accentBgEnd: "#D6A4D6",
      otherHref: "/login/therapist",
      otherLabel: "Therapist sign-in",
    };
  }
  // therapist
  return {
    title: "Therapist sign in",
    subtitle: "Continue to the clinical workspace.",
    pageBg: "linear-gradient(155deg, #FFF1F5 0%, #F4ECF7 100%)",
    orbA: "#F0B5C9",
    orbB: "#DBC0DA",
    accent: "#9F1239",
    accentBg: "#F9A8D4",
    accentBgEnd: "#D67B9E",
    otherHref: "/login/formation",
    otherLabel: "Formation sign-in",
  };
}

function inputStyle(): React.CSSProperties {
  return {
    width: "100%",
    padding: "0.6rem 0.75rem",
    borderRadius: 12,
    border: "1px solid rgba(180,120,170,0.22)",
    background: "rgba(255,255,255,0.85)",
    color: "#1F1733",
    fontSize: "0.92rem",
    outline: "none",
    fontFamily: "inherit",
  };
}
