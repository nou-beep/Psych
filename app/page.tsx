"use client";
// Entry Gateway — full-screen split-entry between the Therapist Portal
// and the Client Portal. Always shown on first visit; if a session is
// already active we offer a "continue" path but never auto-bounce away
// (the user asked: do NOT automatically open the therapist dashboard).

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Stethoscope,
  Heart,
  Sparkles,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { setPortalPreference } from "@/lib/client/portal-store";
import { homePathFor, loginPathFor, type Portal } from "@/lib/auth";

export default function GatewayPage() {
  const router = useRouter();
  const { session, signOut } = useAuth();

  // Soft prefetch — no auto-redirect. The user must choose.
  useEffect(() => {
    router.prefetch("/login/therapist");
    router.prefetch("/login/client");
  }, [router]);

  function go(portal: Portal) {
    setPortalPreference(portal);
    if (session?.portal === portal) {
      router.push(homePathFor(portal));
    } else {
      router.push(loginPathFor(portal));
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        background:
          "linear-gradient(155deg, #FFF1F5 0%, #F4ECF7 45%, #E6E2F2 100%)",
        overflow: "hidden",
      }}
    >
      {/* Subtle ambient orbs — soft but professional */}
      <div className="cp-ambient" aria-hidden>
        <div
          className="cp-orb cp-orb-1"
          style={{ background: "#F0B5C9", opacity: 0.35 }}
        />
        <div
          className="cp-orb cp-orb-2"
          style={{ background: "#C5B5DC", opacity: 0.3 }}
        />
        <div
          className="cp-orb cp-orb-3"
          style={{ background: "#DBD0E8", opacity: 0.22 }}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1200,
          margin: "0 auto",
          padding: "4rem 1.5rem 3rem",
        }}
      >
        {/* Brand line */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "0.4rem 0.85rem",
              borderRadius: 999,
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(180,120,170,0.22)",
              fontSize: 11,
              color: "#6B4970",
              marginBottom: 18,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <Sparkles size={11} /> Psych · Clinical Workspace
          </div>
          <h1
            style={{
              fontSize: "clamp(2rem, 4.5vw, 2.75rem)",
              fontWeight: 600,
              color: "#1F1733",
              letterSpacing: "-0.02em",
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            Choose your portal.
          </h1>
          <p
            style={{
              color: "#5C4870",
              fontSize: "1rem",
              marginTop: 12,
              maxWidth: 540,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.55,
            }}
          >
            Psych is a dual-space platform. The therapist workspace is built
            for documentation and clinical reasoning. The client space is a
            quieter companion for the work between sessions.
          </p>

          {session && (
            <div
              style={{
                marginTop: 18,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "0.4rem 0.85rem",
                borderRadius: 999,
                background: "rgba(255,255,255,0.75)",
                border: "1px solid rgba(180,120,170,0.22)",
                fontSize: 12,
                color: "#5C4870",
              }}
            >
              Signed in as <strong>{session.email}</strong> · portal{" "}
              <strong>{session.portal}</strong>
              <button
                onClick={signOut}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  color: "#9F1239",
                  fontSize: 12,
                  textDecoration: "underline",
                }}
              >
                <LogOut size={11} /> Sign out
              </button>
            </div>
          )}
        </div>

        {/* Two portal cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {/* Therapist card */}
          <button
            onClick={() => go("therapist")}
            style={{
              all: "unset",
              cursor: "pointer",
              display: "block",
              borderRadius: 24,
              padding: "2rem",
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.96), rgba(252,232,240,0.85))",
              border: "1px solid rgba(180,90,140,0.18)",
              boxShadow: "0 12px 40px rgba(199,125,170,0.18)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              transition: "transform 0.3s, box-shadow 0.3s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(-3px)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 18px 50px rgba(199,125,170,0.28)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "none";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 12px 40px rgba(199,125,170,0.18)";
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background:
                  "linear-gradient(135deg, #F9A8D4, #D67B9E)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                marginBottom: 16,
              }}
            >
              <Stethoscope size={22} />
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: "1.4rem",
                fontWeight: 600,
                color: "#1F1733",
              }}
            >
              Therapist Portal
            </h2>
            <p
              style={{
                marginTop: 8,
                color: "#5C4870",
                fontSize: "0.95rem",
                lineHeight: 1.6,
              }}
            >
              Cases, structured interviews, MSE, formulations, longitudinal
              tracking, hypotheses, reports, and supervision — built for
              documentation and clinical reasoning.
            </p>
            <ul
              style={{
                marginTop: 12,
                listStyle: "none",
                padding: 0,
                color: "#7A6090",
                fontSize: "0.82rem",
                lineHeight: 1.7,
              }}
            >
              <li>· Structured documentation</li>
              <li>· Standardised assessments</li>
              <li>· Clinical hypothesis workspace</li>
              <li>· Supervision & research</li>
            </ul>
            <div
              style={{
                marginTop: 20,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "#9F1239",
              }}
            >
              Continue as Therapist <ArrowRight size={14} />
            </div>
          </button>

          {/* Client card */}
          <button
            onClick={() => go("client")}
            style={{
              all: "unset",
              cursor: "pointer",
              display: "block",
              borderRadius: 24,
              padding: "2rem",
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.92), rgba(230,210,240,0.78))",
              border: "1px solid rgba(140,100,180,0.18)",
              boxShadow: "0 12px 40px rgba(140,110,200,0.2)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              transition: "transform 0.3s, box-shadow 0.3s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(-3px)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 18px 50px rgba(140,110,200,0.32)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "none";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 12px 40px rgba(140,110,200,0.2)";
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: "linear-gradient(135deg, #C7B2E0, #D6A4D6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                marginBottom: 16,
              }}
            >
              <Heart size={22} />
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: "1.4rem",
                fontWeight: 600,
                color: "#1F1733",
              }}
            >
              Client Portal
            </h2>
            <p
              style={{
                marginTop: 8,
                color: "#5C4870",
                fontSize: "0.95rem",
                lineHeight: 1.6,
              }}
            >
              A clinically grounded companion for therapy work — assigned
              workbooks, structured reflections, symptom tracking, and
              grounding tools. Quieter, calmer, focused.
            </p>
            <ul
              style={{
                marginTop: 12,
                listStyle: "none",
                padding: 0,
                color: "#7A6090",
                fontSize: "0.82rem",
                lineHeight: 1.7,
              }}
            >
              <li>· Therapist-assigned work</li>
              <li>· Structured reflections</li>
              <li>· Symptom monitoring</li>
              <li>· Grounding & psychoeducation</li>
            </ul>
            <div
              style={{
                marginTop: 20,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "#7C4FB3",
              }}
            >
              Continue as Client <ArrowRight size={14} />
            </div>
          </button>
        </div>

        <p
          style={{
            marginTop: "3rem",
            textAlign: "center",
            fontSize: "0.78rem",
            color: "#7A6090",
          }}
        >
          You can switch portals any time from Settings.
        </p>
      </div>
    </div>
  );
}
