/**
 * ============================================================
 * OCEANIQUE — ClientProviders
 * ============================================================
 * Thin "use client" wrapper that mounts all global client-side
 * React context providers exactly once at the app root.
 *
 * WHY THIS EXISTS:
 *  The root layout (app/layout.tsx) is a React Server Component.
 *  Context providers must be client components. Rather than
 *  converting the root layout to "use client" (which would force
 *  every page to be a client bundle), we delegate provider
 *  mounting to this wrapper.
 *
 * CURRENT PROVIDERS (innermost → outermost render order):
 *  - AvatarProvider           — shared profile picture state, persisted in
 *    localStorage so it is visible in both /portal/* and
 *    /dashboard/* without a backend round-trip.
 *  - WebsiteBookingProvider   — manages open/close state for the website
 *    charter booking modal and renders the modal at z-[60] so it
 *    appears above all page content and the website navigation.
 *
 * TO ADD MORE PROVIDERS:
 *  Import and nest them inside the return below. Keep providers
 *  that affect the full app here; layout-scoped providers (e.g.
 *  DashboardThemeProvider) belong in their own layout files.
 * ============================================================
 */

"use client";

import { type ReactNode } from "react";
import { AvatarProvider } from "@/contexts/AvatarContext";
import { WebsiteBookingProvider } from "@/contexts/WebsiteBookingContext";

/**
 * Mounts all root-level client-side providers.
 * Rendered inside <body> in app/layout.tsx.
 */
export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <WebsiteBookingProvider>
      <AvatarProvider>
        {children}
      </AvatarProvider>
    </WebsiteBookingProvider>
  );
}
