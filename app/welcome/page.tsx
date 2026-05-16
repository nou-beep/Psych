"use client";
// Split-entry welcome page. Two glowing cards — pick a portal.
// Remembers the preference so subsequent visits can route directly,
// but always reachable to switch later.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sparkles, Stethoscope, Heart } from "lucide-react";
import {
  readPortalPreference,
  setPortalPreference,
} from "@/lib/client/portal-store";

export default function WelcomePage() {
  const router = useRouter();

  // Soft auto-redirect if a portal has been chosen before. The user
  // can still reach this page by typing /welcome — we don't trap them.
  useEffect(() => {
    const pref = readPortalPreference();
    if (pref === "client") {
      router.replace("/client");
    } else if (pref === "therapist") {
      router.replace("/");
    }
  }, [router]);

  function choose(pref: "therapist" | "client") {
    setPortalPreference(pref);
    router.push(pref === "client" ? "/client" : "/");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        background:
          "linear-gradient(135deg, #FBE9F0 0%, #EFE4F5 50%, #DDD5EE 100%)",
        overflow: "hidden",
      }}
    >
      {/* Ambient orbs */}
      <div className="cp-ambient" aria-hidden>
        <div className="cp-orb cp-orb-1" style={{ background: "#F2B5CB" }} />
        <div className="cp-orb cp-orb-2" style={{ background: "#C7B2E0" }} />
        <div className="cp-orb cp-orb-3" />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1100,
          margin: "0 auto",
          padding: "5rem 1.5rem 3rem",
        }}
      >
        <div className="cp-fade-in" style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "0.4rem 0.85rem",
              borderRadius: 999,
              background: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(180,120,170,0.25)",
              fontSize: 12,
              color: "#6B4970",
              marginBottom: 16,
            }}
          >
            <Sparkles size={12} /> Psych — a softer place to land
          </div>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 600,
              color: "#2A1F3D",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Welcome.
          </h1>
          <p
            style={{
              color: "#5C4870",
              fontSize: "1.05rem",
              marginTop: 12,
              maxWidth: 520,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.5,
            }}
          >
            Which kind of space are you stepping into today?
          </p>
        </div>

        <div
          className="cp-fade-in"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "1.5rem",
            animationDelay: "0.15s",
          }}
        >
          {/* Therapist card */}
          <button
            onClick={() => choose("therapist")}
            style={{
              all: "unset",
              cursor: "pointer",
              display: "block",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(252,232,240,0.85))",
              border: "1px solid rgba(180,90,140,0.18)",
              borderRadius: "1.5rem",
              padding: "2rem",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 12px 40px rgba(199, 125, 170, 0.18)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(-3px)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 18px 50px rgba(199, 125, 170, 0.28)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "none";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 12px 40px rgba(199, 125, 170, 0.18)";
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #F9A8D4, #D67B9E)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  flexShrink: 0,
                }}
              >
                <Stethoscope size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.35rem",
                    fontWeight: 600,
                    color: "#2A1F3D",
                  }}
                >
                  Therapist / Clinician
                </h2>
                <p
                  style={{
                    margin: "0.4rem 0 0",
                    color: "#5C4870",
                    fontSize: "0.95rem",
                    lineHeight: 1.55,
                  }}
                >
                  Cases, check-ins, formulations, assessments, reports,
                  supervision, thesis. Structured and professional.
                </p>
              </div>
            </div>
            <div
              style={{
                marginTop: "1.5rem",
                fontSize: "0.85rem",
                color: "#9F1239",
                fontWeight: 500,
              }}
            >
              Continue as therapist →
            </div>
          </button>

          {/* Client card */}
          <button
            onClick={() => choose("client")}
            style={{
              all: "unset",
              cursor: "pointer",
              display: "block",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(230,210,240,0.75))",
              border: "1px solid rgba(140,100,180,0.18)",
              borderRadius: "1.5rem",
              padding: "2rem",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 12px 40px rgba(140,110,200,0.22)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
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
                "0 12px 40px rgba(140,110,200,0.22)";
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background:
                    "linear-gradient(135deg, #C7B2E0 0%, #D6A4D6 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  flexShrink: 0,
                }}
              >
                <Heart size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.35rem",
                    fontWeight: 600,
                    color: "#2A1F3D",
                  }}
                >
                  Client space
                </h2>
                <p
                  style={{
                    margin: "0.4rem 0 0",
                    color: "#5C4870",
                    fontSize: "0.95rem",
                    lineHeight: 1.55,
                  }}
                >
                  A softer place to land. Emotional weather, gentle
                  check-ins, grounding tools, comfort objects, and guided
                  journeys. Move slowly.
                </p>
              </div>
            </div>
            <div
              style={{
                marginTop: "1.5rem",
                fontSize: "0.85rem",
                color: "#7C4FB3",
                fontWeight: 500,
              }}
            >
              Continue as client →
            </div>
          </button>
        </div>

        <p
          style={{
            marginTop: "2.5rem",
            textAlign: "center",
            fontSize: "0.8rem",
            color: "#7A6090",
          }}
        >
          You can switch any time.{" "}
          <Link
            href="/"
            style={{ color: "#9F1239", textDecoration: "underline" }}
          >
            Skip to workspace
          </Link>
        </p>
      </div>
    </div>
  );
}
