// Root layout — wraps every page with the theme provider, sidebar, header,
// and mobile navigation. The main content area adjusts for the sidebar on desktop.

import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";

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
          <div className="flex min-h-screen">
            {/* Desktop sidebar (fixed, 240px wide) */}
            <Sidebar />

            {/* Main content area — offset by sidebar width on desktop */}
            <div className="flex-1 flex flex-col lg:ml-60 min-h-screen">
              <Header />

              {/* Page content */}
              <main className="flex-1 px-4 py-6 md:px-6 lg:px-8 pb-24 lg:pb-8">
                {children}
              </main>
            </div>

            {/* Mobile bottom navigation */}
            <MobileNav />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
