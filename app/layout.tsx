import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { AppProvider } from "@/contexts/AppContext";
import { ToastProvider } from "@/components/ui/Toast";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { QuickAddButton } from "@/components/shared/QuickAddButton";

export const metadata: Metadata = {
  title: "Psych — Clinical Psychology Workspace",
  description:
    "A vibrant, whimsical workspace for psychology students, interns, therapists, researchers, and supervisors.",
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
          <AppProvider>
            <ToastProvider>
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
            </ToastProvider>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
