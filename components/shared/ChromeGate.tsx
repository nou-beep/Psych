"use client";
// Decides whether to render the therapist chrome (Sidebar / Header /
// MobileNav / CommandPalette / QuickAddButton) for the current route.
// Routes under `/client` and `/welcome` get their own immersive layout
// instead — these pages render their own chrome internally.

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { QuickAddButton } from "@/components/shared/QuickAddButton";
import { QuickCapture } from "@/components/shared/QuickCapture";
import { WorkspaceModeShell } from "@/components/shared/WorkspaceModeShell";

function isImmersiveRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  // The new gateway lives at /. Login and the legacy /welcome are also
  // chrome-less so they can render edge-to-edge.
  if (pathname === "/") return true;
  if (pathname === "/welcome") return true;
  if (pathname.startsWith("/login/")) return true;
  if (pathname === "/client" || pathname.startsWith("/client/")) return true;
  return false;
}

export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = isImmersiveRoute(pathname);

  if (immersive) {
    // Immersive routes (welcome + client portal) take over the page —
    // no therapist sidebar/header. They render their own chrome.
    return <>{children}</>;
  }

  // Therapist workspace — original layout chrome, wrapped so workspace
  // mode classes can collapse the sidebar / dim the chrome on demand.
  return (
    <WorkspaceModeShell>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-60 min-h-screen">
          <Header />
          <main className="flex-1 px-4 py-6 md:px-6 lg:px-8 pb-28 lg:pb-10">
            {children}
          </main>
        </div>
        <MobileNav />
      </div>
      <CommandPalette />
      <QuickAddButton />
      <QuickCapture />
    </WorkspaceModeShell>
  );
}
