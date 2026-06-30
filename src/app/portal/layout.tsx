/**
 * ============================================================
 * OCEANIQUE — Portal Layout  (Route: /portal/*)
 * ============================================================
 * Shared layout for all customer portal pages. Uses the same
 * dark theme and sidebar + top-bar shell as the admin dashboard
 * but with portal-specific navigation components.
 *
 * GUARD NOTE:
 * This is a template (no backend). Add middleware or a client-
 * side guard to restrict /portal/* to `role === "customer"`.
 *
 * CUSTOMIZE:
 * - Sidebar width: update `w-64` in PortalSidebar + `pl-64` below.
 * - Top-bar height: update `h-16` in PortalTopBar + `pt-16` below.
 * ============================================================
 */

import { PortalSidebar } from "@/components/layout/PortalSidebar";
import { PortalTopBar } from "@/components/layout/PortalTopBar";
import { PageLoader } from "@/components/common/PageLoader";
import { DashboardThemeProvider } from "@/contexts/DashboardThemeContext";
import { DashboardThemeWrapper } from "@/components/layout/DashboardThemeWrapper";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /*
     * Reuses DashboardThemeProvider/Wrapper so the portal shares the
     * same light/dark preference (oceanique_dash_theme in localStorage).
     * Default is light; toggle is exposed in PortalTopBar.
     */
    <DashboardThemeProvider>
      <DashboardThemeWrapper>
        <PageLoader label="Guest Portal" />
        <PortalSidebar />
        <PortalTopBar />
        <main className="pl-64 pt-16 min-h-screen">
          <div className="p-8">{children}</div>
        </main>
      </DashboardThemeWrapper>
    </DashboardThemeProvider>
  );
}
