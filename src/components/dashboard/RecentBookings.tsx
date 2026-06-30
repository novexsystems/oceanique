/**
 * ============================================================
 * OCEANIQUE — RecentBookings (Dashboard Overview Widget)
 * ============================================================
 * A compact widget showing the 5 most recent bookings.
 * Reads from localStorage (same key as the Bookings page) so
 * any status changes made there are reflected here immediately
 * on next navigation, or in real-time via the storage event.
 * ============================================================
 */

"use client";

import { useMemo } from "react";
import { BookingTable } from "@/components/dashboard/BookingTable";
import { useBookings } from "@/contexts/BookingsContext";

interface RecentBookingsProps {
  /** Number of bookings to display (default: 5) */
  limit?: number;
}

export function RecentBookings({ limit = 5 }: RecentBookingsProps) {
  const { bookings } = useBookings();

  const recent = useMemo(() =>
    [...bookings]
      .sort((a, b) => b.startDate.localeCompare(a.startDate))
      .slice(0, limit),
  [bookings, limit]);

  return (
    <div className="bg-card border border-border rounded-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl text-foreground">Recent Bookings</h2>
        <a
          href="/dashboard/bookings"
          className="text-gold text-xs font-body tracking-[0.1em] uppercase hover:text-gold-light transition-colors"
        >
          View All →
        </a>
      </div>
      <BookingTable bookings={recent} limit={limit} />
    </div>
  );
}
