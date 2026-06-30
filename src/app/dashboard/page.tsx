/**
 * ============================================================
 * OCEANIQUE — Dashboard Overview Page  (Route: /dashboard)
 * ============================================================
 * The main dashboard landing page after login. Shows a summary
 * of the most important KPIs, recent bookings, and the revenue
 * chart side by side.
 *
 * COMPONENTS USED:
 * - LiveKpiCards   → 4 KPI cards derived live from BookingsContext
 * - RecentBookings → Last 5 bookings from BookingsContext
 * - RevenueChart   → Monthly revenue bar chart (static seed data)
 *
 * DATA SOURCE:
 * - KPI cards + recent bookings → BookingsContext (localStorage)
 * - Revenue chart               → src/config/dashboard.config.ts
 *
 * CUSTOMIZE:
 * - To add/remove KPI cards: edit LiveKpiCards.tsx > the kpis array.
 * - To update static chart data: edit dashboard.config.ts > revenueChart.
 * ============================================================
 */

import { LiveKpiCards } from "@/components/dashboard/LiveKpiCards";
import { RecentBookings } from "@/components/dashboard/RecentBookings";
import { RevenueChart } from "@/components/dashboard/RevenueChart";


export default function DashboardOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="font-heading text-3xl text-foreground mb-1">Overview</h1>
        <p className="text-muted-foreground text-sm font-body">
          Welcome back — here&apos;s what&apos;s happening with your fleet today.
        </p>
      </div>

      {/* KPI cards row — driven by live booking data */}
      <LiveKpiCards />

      {/* Main content — recent bookings + revenue chart */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent bookings table — takes 2/3 width on xl */}
        <div className="xl:col-span-2">
          <RecentBookings limit={5} />
        </div>

        {/* Revenue chart — takes 1/3 width on xl */}
        <div className="xl:col-span-1">
          <RevenueChart />
        </div>
      </div>
    </div>
  );
}
