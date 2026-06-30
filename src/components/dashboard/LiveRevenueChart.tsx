"use client";

/**
 * ============================================================
 * OCEANIQUE — LiveRevenueChart
 * ============================================================
 * Monthly bar chart derived from live BookingsContext data.
 * Supports toggling between Revenue view and Bookings count.
 * Current month bar is highlighted in gold.
 * ============================================================
 */

import { useMemo, useState } from "react";
import { useBookings } from "@/contexts/BookingsContext";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const BAR_AREA_PX = 160;

export function LiveRevenueChart() {
  const { bookings } = useBookings();
  const [mode, setMode] = useState<"revenue" | "count">("revenue");

  const currentYear  = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const monthlyData = useMemo(() =>
    MONTHS.map((month, i) => {
      const mb = bookings.filter(b => {
        const d = new Date(b.startDate);
        return (
          d.getFullYear() === currentYear &&
          d.getMonth()    === i &&
          (b.status === "confirmed" || b.status === "completed")
        );
      });
      return {
        month,
        revenue: mb.reduce((s, b) => s + b.totalAmount, 0),
        count:   mb.length,
        isNow:   i === currentMonth,
        isPast:  i <= currentMonth,
      };
    }),
  [bookings, currentYear, currentMonth]);

  const values = mode === "revenue"
    ? monthlyData.map(d => d.revenue)
    : monthlyData.map(d => d.count);
  const maxVal = Math.max(...values, 1);

  const ytdRevenue  = monthlyData.slice(0, currentMonth + 1).reduce((s, d) => s + d.revenue, 0);
  const ytdBookings = monthlyData.slice(0, currentMonth + 1).reduce((s, d) => s + d.count, 0);
  const activeMonths = monthlyData.filter(d => d.isPast && d.revenue > 0);
  const avgRevenue  = activeMonths.length ? Math.round(ytdRevenue / activeMonths.length) : 0;
  const peakMonth   = monthlyData.reduce(
    (best, d) => d.revenue > best.revenue ? d : best,
    monthlyData[0]
  );

  return (
    <div className="bg-card border border-border rounded-sm p-6">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="font-heading text-xl text-foreground">Revenue Overview</h2>
          <p className="text-muted-foreground text-xs font-body mt-0.5">
            {currentYear} · confirmed &amp; completed only
          </p>
        </div>
        <div className="flex items-center gap-1">
          {(["revenue", "count"] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`text-[10px] font-body tracking-[0.1em] uppercase px-3 py-1.5 transition-colors ${
                mode === m
                  ? "bg-gold text-midnight font-semibold"
                  : "text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              {m === "revenue" ? "Revenue" : "Bookings"}
            </button>
          ))}
        </div>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-1.5" style={{ height: `${BAR_AREA_PX + 24}px` }}>
        {monthlyData.map((d, i) => {
          const val   = values[i];
          const barPx = val > 0 ? Math.max(Math.round((val / maxVal) * BAR_AREA_PX), 4) : 0;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end gap-1 group relative"
              style={{ height: `${BAR_AREA_PX + 24}px` }}
            >
              {val > 0 && (
                <span className="hidden group-hover:block absolute bottom-full mb-1 text-[10px] font-body text-gold whitespace-nowrap pointer-events-none z-10">
                  {mode === "revenue" ? `$${(val / 1000).toFixed(0)}k` : String(val)}
                </span>
              )}
              <div
                className={`w-full transition-all duration-500 ${
                  val === 0
                    ? "border-t border-dashed border-border/30"
                    : d.isNow
                      ? "bg-gold/40 border-t-2 border-gold"
                      : "bg-gold/20 border-t-2 border-gold/60 hover:bg-gold/30"
                }`}
                style={{ height: `${barPx}px` }}
              />
              <span className={`text-[10px] font-body leading-none ${
                val === 0 ? "text-muted-foreground/30" : d.isNow ? "text-gold" : "text-muted-foreground"
              }`}>
                {d.month}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
        {[
          { label: "Revenue YTD",  val: `$${ytdRevenue.toLocaleString()}` },
          { label: "Avg / Month",  val: `$${avgRevenue.toLocaleString()}` },
          { label: "Peak Month",   val: peakMonth.revenue > 0 ? peakMonth.month : "—" },
          { label: "Bookings YTD", val: String(ytdBookings) },
        ].map(s => (
          <div key={s.label}>
            <p className="text-muted-foreground text-[10px] font-body tracking-[0.1em] uppercase">{s.label}</p>
            <p className="text-foreground font-body font-semibold mt-0.5">{s.val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
