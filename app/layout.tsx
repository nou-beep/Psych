import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { AppProvider } from "@/contexts/AppContext";
import { ThesisProvider } from "@/contexts/ThesisContext";
import { ClinicalProvider } from "@/contexts/ClinicalContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ClientPortalProvider } from "@/contexts/ClientPortalContext";
import { ToastProvider } from "@/components/ui/Toast";
import { ChromeGate } from "@/components/shared/ChromeGate";
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SettingsProvider>
          <AppProvider>
            <ThesisProvider>
            <ClinicalProvider>
            <ClientPortalProvider>
            <ToastProvider>
              <AccessibilityShell>
                <ChromeGate>{children}</ChromeGate>
                <PWARegister />
              </AccessibilityShell>
            </ToastProvider>
            </ClientPortalProvider>
            </ClinicalProvider>
            </ThesisProvider>
          </AppProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
