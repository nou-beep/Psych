import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { AppProvider } from "@/contexts/AppContext";
import { ThesisProvider } from "@/contexts/ThesisContext";
import { ClinicalProvider } from "@/contexts/ClinicalContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ClientPortalProvider } from "@/contexts/ClientPortalContext";
import { PsyGraphProvider } from "@/contexts/PsyGraphContext";
import { InternshipProvider } from "@/contexts/InternshipContext";
import { WorkspaceModeProvider } from "@/contexts/WorkspaceModeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { SessionMemoryProvider } from "@/contexts/SessionMemoryContext";
import { ThesisDatasetProvider } from "@/contexts/ThesisDatasetContext";
import { SeanceProvider } from "@/contexts/SeanceContext";
import { ToastProvider } from "@/components/ui/Toast";
import { ChromeGate } from "@/components/shared/ChromeGate";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { PWARegister } from "@/components/shared/PWARegister";
import { AccessibilityShell } from "@/components/shared/AccessibilityShell";

export const metadata: Metadata = {
  title: "Eyla — Bilingual Academic & Clinical Workspace",
  description:
    "An academic and clinical workspace for psychology students, interns, therapists, researchers, supervisors — bilingual (FR / EN).",
  manifest: "/manifest.json",
  applicationName: "Eyla",
  appleWebApp: {
    capable: true,
    title: "Eyla",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#F9A8D4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <LocaleProvider>
        <ThemeProvider>
          <SettingsProvider>
          <AuthProvider>
          <AppProvider>
            <ThesisProvider>
            <ThesisDatasetProvider>
            <ClinicalProvider>
            <ClientPortalProvider>
            <PsyGraphProvider>
            <InternshipProvider>
            <WorkspaceModeProvider>
            <SessionMemoryProvider>
            <SeanceProvider>
            <ToastProvider>
              <AccessibilityShell>
                <RequireAuth>
                  <ChromeGate>{children}</ChromeGate>
                </RequireAuth>
                <PWARegister />
              </AccessibilityShell>
            </ToastProvider>
            </SeanceProvider>
            </SessionMemoryProvider>
            </WorkspaceModeProvider>
            </InternshipProvider>
            </PsyGraphProvider>
            </ClientPortalProvider>
            </ClinicalProvider>
            </ThesisDatasetProvider>
            </ThesisProvider>
          </AppProvider>
          </AuthProvider>
          </SettingsProvider>
        </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
