"use client";
// Legacy route — the entry gateway now lives at /. We keep /welcome as a
// soft redirect so older bookmarks still land somewhere sensible.

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WelcomeRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <p style={{ fontSize: 14, color: "#5C4870" }}>
        Taking you to the gateway…
      </p>
      <Link href="/" style={{ fontSize: 13, color: "#9F1239" }}>
        Continue manually →
      </Link>
    </div>
  );
}
