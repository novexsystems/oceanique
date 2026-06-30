/**
 * ============================================================
 * OCEANIQUE — RevenueChart (Dashboard Analytics)
 * ============================================================
 * A bar/line chart showing monthly revenue and booking counts.
 * Used on the Analytics dashboard page.
 *
 * DATA SOURCE:
 * - src/config/dashboard.config.ts (revenueChart)
 *
 * LIBRARY NOTE:
 * This component uses a lightweight bar chart built with pure
 * CSS/SVG to avoid adding a heavy charting library dependency.
 * When building out: consider replacing with Recharts or
 * Chart.js (both work well with Next.js + React).
 *
 * To install Recharts: npm install recharts
 * ============================================================
 *
 * TODO: Build out this component — see design spec.
 * Planned features:
 *  - Animated bar chart (Framer Motion or Recharts)
 *  - Toggle between Revenue and Bookings views
 *  - Tooltip on hover showing exact values
 *  - Responsive SVG or CSS-grid based bars
 */

"use client";

import { dashboardConfig } from "@/config/dashboard.config";

/** Fixed pixel height for the bar area (label row sits below this) */
const BAR_AREA_PX = 160;

export function RevenueChart() {
  const data = dashboardConfig.revenueChart;
  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <div className="bg-card border border-border rounded-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl text-foreground">Revenue Overview</h2>
        <span className="text-muted-foreground text-xs font-body">Year to Date</span>
      </div>

      {/* Bar chart — pixel heights so values render correctly regardless of flex context */}
      <div className="flex items-end gap-1.5" style={{ height: `${BAR_AREA_PX + 24}px` }}>
        {data.map((month, i) => {
          const barPx =
            maxRevenue > 0 && month.revenue > 0
              ? Math.max(Math.round((month.revenue / maxRevenue) * BAR_AREA_PX), 4)
              : 0;
          const isFuture = month.revenue === 0;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end gap-1 group"
              style={{ height: `${BAR_AREA_PX + 24}px` }}
            >
              {/* Tooltip on hover */}
              {!isFuture && (
                <span className="hidden group-hover:block absolute -translate-y-6 text-[10px] font-body text-gold whitespace-nowrap pointer-events-none z-10">
                  ${(month.revenue / 1000).toFixed(0)}k
                </span>
              )}

              {/* Bar */}
              <div
                className={`w-full transition-all duration-700 ${
                  isFuture
                    ? "border-t border-dashed border-border/40"
                    : "bg-gold/20 border-t-2 border-gold/70 hover:bg-gold/30"
                }`}
                style={{ height: `${barPx}px` }}
              />

              {/* Month label */}
              <span
                className={`text-[10px] font-body leading-none ${
                  isFuture ? "text-muted-foreground/30" : "text-muted-foreground"
                }`}
              >
                {month.month}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="flex gap-6 mt-4 pt-4 border-t border-border">
        <div>
          <p className="text-muted-foreground text-xs font-body">YTD Revenue</p>
          <p className="text-foreground font-body font-semibold">
            ${dashboardConfig.stats.totalRevenueYTD.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs font-body">Avg / Month</p>
          <p className="text-foreground font-body font-semibold">
            ${Math.round(
              data.filter((d) => d.revenue > 0).reduce((s, d) => s + d.revenue, 0) /
                Math.max(data.filter((d) => d.revenue > 0).length, 1)
            ).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs font-body">Peak Month</p>
          <p className="text-foreground font-body font-semibold">
            {data.reduce((best, d) => (d.revenue > best.revenue ? d : best), data[0]).month}
          </p>
        </div>
      </div>
    </div>
  );
}
