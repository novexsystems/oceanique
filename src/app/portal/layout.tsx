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
import { SidebarProvider } from "@/contexts/SidebarContext";

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
     *
     * SidebarProvider: shared open/close state consumed by both
     * PortalSidebar (renders the drawer) and PortalTopBar (hamburger
     * button). Mirrors the exact setup used in DashboardLayout.
     */
    <DashboardThemeProvider>
      <SidebarProvider>
        <DashboardThemeWrapper>
          <PageLoader label="Guest Portal" />
          <PortalSidebar />
          <PortalTopBar />
          {/*
           * lg:pl-64  — offset for the fixed sidebar on desktop.
           * On mobile (< lg) the sidebar is a slide-in overlay so no
           * left offset is needed; padding collapses to p-4.
           */}
          <main className="lg:pl-64 pt-16 min-h-screen">
            <div className="p-4 lg:p-8">{children}</div>
          </main>
        </DashboardThemeWrapper>
      </SidebarProvider>
    </DashboardThemeProvider>
  );
}
