"use client";
// Client-side route guard. Redirects to the appropriate login page if
// the user isn't signed in for the portal that owns the current route.
//
// Renders nothing while `ready` is false (avoids a redirect flash on
// first paint).

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  isPublicRoute,
  loginPathFor,
  portalForRoute,
} from "@/lib/auth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!pathname) return;
    if (isPublicRoute(pathname)) return;
    const portal = portalForRoute(pathname);
    if (!portal) return;
    if (!session) {
      router.replace(loginPathFor(portal));
      return;
    }
    if (session.portal !== portal) {
      // User is signed in but exploring the other portal — bounce to
      // that portal's login.
      router.replace(loginPathFor(portal));
    }
  }, [ready, pathname, session, router]);

  return <>{children}</>;
}
