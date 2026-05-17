import type { Metadata, Viewport } from "next";
import {
  Libre_Baskerville,
  IBM_Plex_Sans,
  IBM_Plex_Mono,
  Caveat,
} from "next/font/google";
import "./globals.css";

// Desk-theme typefaces. Variables surface as CSS custom properties so
// .desk-scope can reference them via var(--serif|--sans|--mono|--hand).
const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-desk-serif",
});
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-desk-sans",
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
  variable: "--font-desk-mono",
});
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-desk-hand",
});
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { AppProvider } from "@/contexts/AppContext";
import { ThesisProvider } from "@/contexts/ThesisContext";
import { ClinicalProvider } from "@/contexts/ClinicalContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ClientPortalProvider } from "@/contexts/ClientPortalContext";
import { PsyGraphProvider } from "@/contexts/PsyGraphContext";
import { WorkspaceModeProvider } from "@/contexts/WorkspaceModeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
import { ChromeGate } from "@/components/shared/ChromeGate";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { PWARegister } from "@/components/shared/PWARegister";
import { AccessibilityShell } from "@/components/shared/AccessibilityShell";

export const metadata: Metadata = {
  title: "Psych — Clinical Psychology Workspace",
  description:
    "A vibrant, whimsical workspace for psychology students, interns, therapists, researchers, and supervisors.",
  manifest: "/manifest.json",
  applicationName: "Psych",
  appleWebApp: {
    capable: true,
    title: "Psych",
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${libreBaskerville.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} ${caveat.variable}`}
    >
      <body>
        <ThemeProvider>
          <SettingsProvider>
          <AuthProvider>
          <AppProvider>
            <ThesisProvider>
            <ClinicalProvider>
            <ClientPortalProvider>
            <PsyGraphProvider>
            <WorkspaceModeProvider>
            <ToastProvider>
              <AccessibilityShell>
                <RequireAuth>
                  <ChromeGate>{children}</ChromeGate>
                </RequireAuth>
                <PWARegister />
              </AccessibilityShell>
            </ToastProvider>
            </WorkspaceModeProvider>
            </PsyGraphProvider>
            </ClientPortalProvider>
            </ClinicalProvider>
            </ThesisProvider>
          </AppProvider>
          </AuthProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
