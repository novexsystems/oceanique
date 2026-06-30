/**
 * ============================================================
 * OCEANIQUE — Dashboard Layout  (Route: /dashboard/*)
 * ============================================================
 * Shared layout for all dashboard pages. Applies the dark theme,
 * renders the sidebar and top bar, and offsets page content.
 *
 * The `dark` class on the wrapper div activates the CSS dark
 * theme variables defined in globals.css.
 *
 * GUARD NOTE:
 * This is a template (no backend), so there is no server-side
 * auth guard here. When integrating a real auth provider, add
 * middleware (src/middleware.ts) to protect /dashboard/* routes.
 *
 * CUSTOMIZE:
 * - To change sidebar width: update `w-64` in DashboardSidebar
 *   and `pl-64` on the content wrapper below.
 * - To change top bar height: update `h-16` in DashboardTopBar
 *   and `pt-16` on the content wrapper below.
 * ============================================================
 */

import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { DashboardThemeProvider } from "@/contexts/DashboardThemeContext";
import { DashboardThemeWrapper } from "@/components/layout/DashboardThemeWrapper";
import { PageLoader } from "@/components/common/PageLoader";
import { BookingsProvider } from "@/contexts/BookingsContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { CustomersProvider } from "@/contexts/CustomersContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /*
     * DashboardThemeProvider holds the light/dark state (default: light).
     * DashboardThemeWrapper applies the `dark` CSS class conditionally.
     * Toggle is exposed via useDashboardTheme() in DashboardTopBar.
     */
    <DashboardThemeProvider>
      <BookingsProvider>
      <CustomersProvider>
      <SidebarProvider>
      <DashboardThemeWrapper>
        <PageLoader label="Admin Dashboard" />
        {/* Fixed left sidebar */}
        <DashboardSidebar />

        {/* Fixed top bar */}
        <DashboardTopBar />

        {/* Scrollable main content area */}
        <main className="lg:pl-64 pt-16 min-h-screen">
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </DashboardThemeWrapper>
      </SidebarProvider>
      </CustomersProvider>
      </BookingsProvider>
    </DashboardThemeProvider>
  );
}
