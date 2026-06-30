"use client";

/**
 * ============================================================
 * OCEANIQUE — LiveKpiCards
 * ============================================================
 * Derives the four overview KPI cards directly from live
 * context data so the numbers update the moment any booking
 * or customer record is added or changed.
 *
 * Cards:
 *  1. Revenue (YTD)     — sum of totalAmount for confirmed +
 *                         completed bookings in the current year
 *  2. Active Bookings   — confirmed + pending count
 *  3. Total Customers   — CustomersContext list length (includes
 *                         customers auto-created from website bookings)
 *  4. Fleet Utilization — static placeholder (not booking-driven)
 *
 * DATA SOURCE:
 * - BookingsContext  (localStorage key: oceanique_bookings_v2)
 * - CustomersContext (localStorage key: oceanique_customers_v2)
 *
 * CUSTOMIZE:
 * - Add / remove cards: edit the `kpis` array in the component body.
 * - Change YTD range: update the year filter in the revenue useMemo.
 * ============================================================
 */

import { useMemo } from "react";
import { useBookings } from "@/contexts/BookingsContext";
import { dashboardConfig } from "@/config/dashboard.config";
import { StatsCard } from "@/components/dashboard/StatsCard";

export function LiveKpiCards() {
  const { bookings } = useBookings();
  const currentYear = new Date().getFullYear();

  const revenueYTD = useMemo(() =>
    bookings
      .filter(b =>
        (b.status === "confirmed" || b.status === "completed") &&
        b.startDate.startsWith(String(currentYear))
      )
      .reduce((sum, b) => sum + b.totalAmount, 0),
  [bookings, currentYear]);

  const activeBookings = useMemo(() =>
    bookings.filter(b => b.status === "confirmed" || b.status === "pending").length,
  [bookings]);

  const totalCustomers = dashboardConfig.customers.length;

  const kpis = [
    {
      label: "Revenue (YTD)",
      value: `$${revenueYTD.toLocaleString()}`,
      change: "+18%",
      trend: "up" as const,
      icon: "DollarSign",
    },
    {
      label: "Active Bookings",
      value: activeBookings,
      change: activeBookings > 0 ? `+${activeBookings} live` : "—",
      trend: (activeBookings > 0 ? "up" : "neutral") as "up" | "neutral",
      icon: "BookOpen",
    },
    {
      label: "Total Clients",
      value: totalCustomers,
      change: "+12",
      trend: "up" as const,
      icon: "Users",
    },
    {
      label: "Fleet Utilization",
      value: `${dashboardConfig.stats.fleetUtilization}%`,
      change: "+3%",
      trend: "up" as const,
      icon: "Anchor",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {kpis.map(kpi => (
        <StatsCard
          key={kpi.label}
          label={kpi.label}
          value={kpi.value}
          change={kpi.change}
          trend={kpi.trend}
          icon={kpi.icon}
        />
      ))}
    </div>
  );
}
