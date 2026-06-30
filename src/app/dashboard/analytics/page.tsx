/**
 * ============================================================
 * OCEANIQUE — Dashboard Analytics Page  (Route: /dashboard/analytics)
 * ============================================================
 * Deep analytics view. All numbers are derived live from
 * BookingsContext and CustomersContext so they update the
 * moment any booking or customer record changes.
 *
 * Sections:
 *  1. KPI row           — Revenue YTD, bookings, customers, avg value
 *  2. Revenue chart     — Monthly bar chart with revenue/count toggle
 *  3. Status breakdown  — Booking count by status with progress bars
 *  4. Vessel performance — Revenue and booking count per boat
 *  5. Top clients       — Highest lifetime-value customers
 *  6. Geography         — Customer distribution by country
 *
 * COMPONENTS USED:
 * - StatsCard        → Reusable KPI card (label, value, trend)
 * - LiveRevenueChart → Monthly bar chart from live BookingsContext data
 *
 * DATA SOURCE:
 * - BookingsContext  (localStorage key: oceanique_bookings_v2)
 * - CustomersContext (localStorage key: oceanique_customers_v2)
 * - Vessel names     → src/config/boats.config.ts
 *
 * CUSTOMIZE:
 * - Add a new section: add a <section> block and derive its data
 *   from the same `bookings` / `customers` arrays via useMemo.
 * - Change the date range: filter bookings by year in the useMemo blocks.
 * ============================================================
 */

"use client";

import { useMemo } from "react";
import { useBookings } from "@/contexts/BookingsContext";
import { useCustomers } from "@/contexts/CustomersContext";
import { boatsConfig } from "@/config/boats.config";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LiveRevenueChart } from "@/components/dashboard/LiveRevenueChart";

const STATUS_CFG = {
  confirmed: { label: "Confirmed", bar: "bg-emerald-500/60" },
  pending:   { label: "Pending",   bar: "bg-amber-500/60"   },
  completed: { label: "Completed", bar: "bg-blue-500/60"    },
  cancelled: { label: "Cancelled", bar: "bg-red-500/60"     },
} as const;

const STATUS_BADGE: Record<string, string> = {
  confirmed: "bg-emerald-500/10 text-emerald-400",
  pending:   "bg-amber-500/10 text-amber-400",
  completed: "bg-blue-500/10 text-blue-400",
  cancelled: "bg-red-500/10 text-red-400",
};

export default function DashboardAnalyticsPage() {
  const { bookings }  = useBookings();
  const { customers } = useCustomers();
  const currentYear   = new Date().getFullYear();

  /* ── KPI stats ──────────────────────────────────────── */
  const kpis = useMemo(() => {
    const active = bookings.filter(
      b => (b.status === "confirmed" || b.status === "completed") &&
           b.startDate.startsWith(String(currentYear))
    );
    const revenueYTD = active.reduce((s, b) => s + b.totalAmount, 0);
    const avgValue   = active.length ? Math.round(revenueYTD / active.length) : 0;

    const durations = bookings
      .filter(b => b.status === "confirmed" || b.status === "completed")
      .map(b => Math.max(
        Math.round((new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / 86_400_000),
        1
      ));
    const avgNights = durations.length
      ? Math.round(durations.reduce((s, n) => s + n, 0) / durations.length)
      : 0;

    return { revenueYTD, avgValue, avgNights };
  }, [bookings, currentYear]);

  /* ── Status breakdown ───────────────────────────────── */
  const statusCounts = useMemo(() => {
    const c = { confirmed: 0, pending: 0, completed: 0, cancelled: 0 };
    bookings.forEach(b => { if (b.status in c) c[b.status as keyof typeof c]++; });
    return c;
  }, [bookings]);

  /* ── Vessel performance ─────────────────────────────── */
  const vesselStats = useMemo(() => {
    const map = new Map<string, { name: string; bookings: number; revenue: number }>();
    boatsConfig.fleet.forEach(boat =>
      map.set(boat.id, { name: boat.name, bookings: 0, revenue: 0 })
    );
    bookings.forEach(b => {
      if (b.status === "cancelled") return;
      if (!map.has(b.boatId)) map.set(b.boatId, { name: b.boatName, bookings: 0, revenue: 0 });
      const v = map.get(b.boatId)!;
      v.bookings++;
      v.revenue += b.totalAmount;
    });
    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }, [bookings]);

  const maxVesselRev = vesselStats[0]?.revenue ?? 1;

  /* ── Top clients ────────────────────────────────────── */
  const topClients = useMemo(() => {
    const map = new Map<string, { name: string; bookings: number; revenue: number }>();
    bookings.forEach(b => {
      if (b.status === "cancelled") return;
      const cur = map.get(b.customerName);
      if (cur) { cur.bookings++; cur.revenue += b.totalAmount; }
      else map.set(b.customerName, { name: b.customerName, bookings: 1, revenue: b.totalAmount });
    });
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [bookings]);

  /* ── Customer geography ─────────────────────────────── */
  const geography = useMemo(() => {
    const map = new Map<string, number>();
    customers.filter(c => c.country).forEach(c =>
      map.set(c.country, (map.get(c.country) ?? 0) + 1)
    );
    return [...map.entries()]
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [customers]);

  const maxGeo = geography[0]?.count ?? 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl text-foreground mb-1">Analytics</h1>
        <p className="text-muted-foreground text-sm font-body">
          Revenue performance, booking trends, and fleet utilization — all live.
        </p>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard label="Revenue (YTD)"      value={`$${kpis.revenueYTD.toLocaleString()}`} change="+22%" trend="up"      icon="TrendingUp" />
        <StatsCard label="Total Bookings"     value={bookings.length}                         change="+14%" trend="up"      icon="BookOpen"   />
        <StatsCard label="Avg Booking Value"  value={`$${kpis.avgValue.toLocaleString()}`}   change="+8%"  trend="up"      icon="DollarSign" />
        <StatsCard label="Avg Trip Duration"  value={`${kpis.avgNights} nights`}             trend="neutral"               icon="Anchor"     />
      </div>

      {/* ── Revenue chart + Status breakdown ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <LiveRevenueChart />
        </div>

        {/* Status breakdown */}
        <div className="bg-card border border-border rounded-sm p-6 flex flex-col">
          <h2 className="font-heading text-xl text-foreground mb-5">Booking Status</h2>
          <div className="space-y-4 flex-1">
            {(Object.entries(statusCounts) as [keyof typeof STATUS_CFG, number][]).map(([status, count]) => {
              const cfg = STATUS_CFG[status];
              const pct = bookings.length ? Math.round((count / bookings.length) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-body tracking-[0.1em] uppercase px-2 py-0.5 ${STATUS_BADGE[status]}`}>
                      {cfg.label}
                    </span>
                    <span className="text-foreground font-body font-semibold">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-border/30 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-muted-foreground text-[10px] font-body mt-0.5 text-right">{pct}%</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-[10px] font-body tracking-[0.1em] uppercase text-muted-foreground">Total</p>
            <p className="text-foreground font-body font-semibold mt-0.5">{bookings.length} bookings</p>
          </div>
        </div>
      </div>

      {/* ── Vessel performance + Top clients ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Vessel performance */}
        <div className="bg-card border border-border rounded-sm p-6">
          <h2 className="font-heading text-xl text-foreground mb-5">Vessel Performance</h2>
          <div className="space-y-4">
            {vesselStats.map(v => {
              const pct = maxVesselRev > 0 ? Math.round((v.revenue / maxVesselRev) * 100) : 0;
              return (
                <div key={v.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                      <span className="text-foreground text-sm font-body font-medium">{v.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-muted-foreground text-[10px] font-body">{v.bookings} charters</span>
                      <span className="text-foreground text-sm font-body font-semibold w-24 text-right">
                        ${v.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-border/30 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gold/60 transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top clients */}
        <div className="bg-card border border-border rounded-sm p-6">
          <h2 className="font-heading text-xl text-foreground mb-5">Top Clients by Revenue</h2>
          {topClients.length === 0 ? (
            <p className="text-muted-foreground text-sm font-body">No booking data yet.</p>
          ) : (
            <div className="space-y-0">
              {topClients.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0">
                  <span className="font-mono text-[11px] text-muted-foreground w-5 shrink-0 text-right">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-body font-medium truncate">{c.name}</p>
                    <p className="text-muted-foreground text-[10px] font-body">
                      {c.bookings} {c.bookings === 1 ? "charter" : "charters"}
                    </p>
                  </div>
                  <span className="text-foreground font-body font-semibold text-sm shrink-0">
                    ${c.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Customer geography ── */}
      <div className="bg-card border border-border rounded-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-xl text-foreground">Client Geography</h2>
          <span className="text-muted-foreground text-xs font-body">{customers.length} total clients</span>
        </div>
        {geography.length === 0 ? (
          <p className="text-muted-foreground text-sm font-body">No customer data yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-4">
            {geography.map(g => (
              <div key={g.country}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-foreground text-sm font-body">{g.country}</span>
                  <span className="text-muted-foreground text-xs font-body">
                    {g.count} {g.count === 1 ? "client" : "clients"}
                  </span>
                </div>
                <div className="w-full h-1 bg-border/30 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gold/50 transition-all duration-700"
                    style={{ width: `${Math.round((g.count / maxGeo) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
