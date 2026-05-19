"use client";
// Entry Gateway — three-portal architecture. Formation (thesis +
// internship + research), Therapist (clinical casework), Client
// (assigned work + appointments). Always shown on first visit; if a
// session is already active we offer a "continue" path but never
// auto-bounce away.

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Stethoscope,
  Heart,
  GraduationCap,
  Sparkles,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { setPortalPreference } from "@/lib/client/portal-store";
import { homePathFor, loginPathFor, type Portal } from "@/lib/auth";

interface PortalCard {
  id: Portal;
  title: string;
  blurb: string;
  bullets: string[];
  cta: string;
  icon: typeof Stethoscope;
  iconGradient: string;
  cardGradient: string;
  border: string;
  shadow: string;
  shadowHover: string;
  accent: string;
}

const CARDS: PortalCard[] = [
  {
    id: "formation",
    title: "Formation Portal",
    blurb:
      "Thesis, internship, supervised practice, research, reports, tests and grids. The academic + clinical-training workspace.",
    bullets: [
      "Thesis Studio + Writer",
      "Internship Studio + grids",
      "Tests & assessment shells",
      "Supervision prep + exports",
    ],
    cta: "Continue as Trainee",
    icon: GraduationCap,
    iconGradient: "linear-gradient(135deg, #B49AE2, #8E72CC)",
    cardGradient:
      "linear-gradient(160deg, rgba(255,255,255,0.96), rgba(235,225,250,0.85))",
    border: "1px solid rgba(140,100,200,0.18)",
    shadow: "0 12px 40px rgba(140,110,200,0.18)",
    shadowHover: "0 18px 50px rgba(140,110,200,0.28)",
    accent: "#5B36A8",
  },
  {
    id: "therapist",
    title: "Therapist Portal",
    blurb:
      "Cases, structured interviews, MSE, formulations, longitudinal tracking, reports, supervision — built for documentation and clinical reasoning.",
    bullets: [
      "Cases + clinical tools",
      "Assessments + reports",
      "Sessions + calendar",
      "Worksheets + resources",
    ],
    cta: "Continue as Therapist",
    icon: Stethoscope,
    iconGradient: "linear-gradient(135deg, #F9A8D4, #D67B9E)",
    cardGradient:
      "linear-gradient(160deg, rgba(255,255,255,0.96), rgba(252,232,240,0.85))",
    border: "1px solid rgba(180,90,140,0.18)",
    shadow: "0 12px 40px rgba(199,125,170,0.18)",
    shadowHover: "0 18px 50px rgba(199,125,170,0.28)",
    accent: "#9F1239",
  },
  {
    id: "client",
    title: "Client Portal",
    blurb:
      "A clinically grounded companion for therapy work — assigned worksheets, assessments, appointments, reflections. Quieter, structured, lower cognitive load.",
    bullets: [
      "Assigned work + worksheets",
      "Assessments + reflections",
      "Calendar + reminders",
      "Resources + progress",
    ],
    cta: "Continue as Client",
    icon: Heart,
    iconGradient: "linear-gradient(135deg, #C7B2E0, #D6A4D6)",
    cardGradient:
      "linear-gradient(160deg, rgba(255,255,255,0.92), rgba(230,210,240,0.78))",
    border: "1px solid rgba(140,100,180,0.18)",
    shadow: "0 12px 40px rgba(140,110,200,0.2)",
    shadowHover: "0 18px 50px rgba(140,110,200,0.32)",
    accent: "#7C4FB3",
  },
];

export default function GatewayPage() {
  const router = useRouter();
  const { session, signOut } = useAuth();

  // Soft prefetch — no auto-redirect. The user must choose.
  useEffect(() => {
    router.prefetch("/login/formation");
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
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
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
            <Sparkles size={11} /> Eyla · Three-Portal Workspace
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
              maxWidth: 620,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.55,
            }}
          >
            Three workspaces, one platform. Formation is the academic and
            training workspace. Therapist is the professional clinical
            workspace. Client is the companion for assigned therapy work
            between sessions.
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => go(card.id)}
                data-portal={card.id}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  display: "block",
                  borderRadius: 24,
                  padding: "1.75rem",
                  background: card.cardGradient,
                  border: card.border,
                  boxShadow: card.shadow,
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  transition: "transform 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(-3px)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    card.shadowHover;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "none";
                  (e.currentTarget as HTMLElement).style.boxShadow = card.shadow;
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: card.iconGradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    marginBottom: 14,
                  }}
                >
                  <Icon size={22} />
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.3rem",
                    fontWeight: 600,
                    color: "#1F1733",
                  }}
                >
                  {card.title}
                </h2>
                <p
                  style={{
                    marginTop: 8,
                    color: "#5C4870",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                  }}
                >
                  {card.blurb}
                </p>
                <ul
                  style={{
                    marginTop: 12,
                    listStyle: "none",
                    padding: 0,
                    color: "#7A6090",
                    fontSize: "0.8rem",
                    lineHeight: 1.7,
                  }}
                >
                  {card.bullets.map((b) => (
                    <li key={b}>· {b}</li>
                  ))}
                </ul>
                <div
                  style={{
                    marginTop: 18,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.88rem",
                    fontWeight: 500,
                    color: card.accent,
                  }}
                >
                  {card.cta} <ArrowRight size={14} />
                </div>
              </button>
            );
          })}
        </div>

        <p
          style={{
            marginTop: "3rem",
            textAlign: "center",
            fontSize: "0.78rem",
            color: "#7A6090",
          }}
        >
          You can switch portals any time from the sidebar footer.
        </p>
      </div>
    </div>
  );
}
