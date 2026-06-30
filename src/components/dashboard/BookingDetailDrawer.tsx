/**
 * ============================================================
 * OCEANIQUE — BookingDetailDrawer (Dashboard)
 * ============================================================
 * Slide-in right panel that displays the full details of a
 * single booking record selected from the Bookings table.
 *
 * Shows: customer name, vessel, charter type, date range,
 * duration, guest count, total amount, notes, and current
 * status with a colour-coded badge.
 *
 * Includes inline status-change actions (Confirm / Cancel)
 * so the admin can update a booking without leaving the page.
 *
 * Props:
 *  - booking        The Booking to display, or null (drawer hidden)
 *  - onClose        Called when the × button or backdrop is clicked
 *  - onStatusChange Optional callback (id, newStatus) for status updates
 *
 * DATA SOURCE:
 * - Booking object passed from BookingsContext via the Bookings page.
 *   Any status change bubbles up via onStatusChange → BookingsContext
 *   → localStorage → notification bell.
 *
 * CUSTOMIZE:
 * - Add new info rows by extending the InfoRow section in the JSX.
 * - Adjust the drawer width by changing `max-w-md` on the panel div.
 * ============================================================
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Users, Anchor, DollarSign, FileText, Clock } from "lucide-react";
import type { Booking, BookingStatus } from "@/types/booking";

const charterTypeLabels: Record<string, string> = {
  hourly:     "Hourly",
  "half-day": "Half-Day",
  "full-day": "Full Day",
  "multi-day": "Multi-Day",
};

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  pending:   { label: "Pending",   className: "bg-amber-500/15 text-amber-300 border border-amber-500/30" },
  confirmed: { label: "Confirmed", className: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" },
  completed: { label: "Completed", className: "bg-blue-500/15 text-blue-300 border border-blue-500/30" },
  cancelled: { label: "Cancelled", className: "bg-red-500/15 text-red-300 border border-red-500/30" },
  refunded:  { label: "Refunded",  className: "bg-purple-500/15 text-purple-300 border border-purple-500/30" },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "long", year: "numeric",
  });
}

function nightsBetween(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.round(ms / 86_400_000);
}

function durationLabel(booking: Booking): string {
  switch (booking.charterType) {
    case "hourly":    return `${booking.hours ?? "?"} hour${(booking.hours ?? 0) !== 1 ? "s" : ""}`;
    case "half-day": return "Half-day";
    case "full-day": return "Full day";
    default: {
      const n = nightsBetween(booking.startDate, booking.endDate);
      return `${n} night${n !== 1 ? "s" : ""}`;
    }
  }
}

interface BookingDetailDrawerProps {
  booking: Booking | null;
  onClose: () => void;
  onStatusChange?: (id: string, status: BookingStatus) => void;
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-border/60 last:border-0">
      <span className="text-gold mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-muted-foreground text-[10px] font-body tracking-[0.15em] uppercase mb-0.5">{label}</p>
        <p className="text-foreground text-sm font-body">{value}</p>
      </div>
    </div>
  );
}

export function BookingDetailDrawer({ booking, onClose, onStatusChange }: BookingDetailDrawerProps) {
  const isOpen = !!booking;
  const status = booking ? statusConfig[booking.status] : null;
  const isSameDay = booking ? booking.startDate === booking.endDate : false;

  return (
    <AnimatePresence>
      {isOpen && booking && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0, 1] }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-gold text-[10px] font-body tracking-[0.25em] uppercase mb-1">
                    Booking Details
                  </p>
                  <h2 className="font-heading text-xl text-foreground leading-tight">
                    {booking.customerName}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-mono text-xs text-muted-foreground">{booking.id}</span>
                    <span className={`text-xs font-body font-medium px-2 py-0.5 ${status?.className}`}>
                      {status?.label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-2">
              <InfoRow
                icon={<Anchor size={14} />}
                label="Vessel"
                value={booking.boatName}
              />
              {booking.charterType && (
                <InfoRow
                  icon={<Clock size={14} />}
                  label="Charter Type"
                  value={
                    <span className="flex items-center gap-2">
                      {charterTypeLabels[booking.charterType] ?? booking.charterType}
                      <span className="text-muted-foreground text-xs">· {durationLabel(booking)}</span>
                    </span>
                  }
                />
              )}
              <InfoRow
                icon={<Calendar size={14} />}
                label={isSameDay ? "Charter Date" : "Charter Period"}
                value={
                  isSameDay ? (
                    <span>{fmt(booking.startDate)}</span>
                  ) : (
                    <span>
                      {fmt(booking.startDate)}
                      <span className="text-muted-foreground mx-2">→</span>
                      {fmt(booking.endDate)}
                      <span className="text-muted-foreground text-xs ml-2">({durationLabel(booking)})</span>
                    </span>
                  )
                }
              />
              <InfoRow
                icon={<Users size={14} />}
                label="Guests"
                value={`${booking.guests} guest${booking.guests !== 1 ? "s" : ""}`}
              />
              <InfoRow
                icon={<DollarSign size={14} />}
                label="Total Amount"
                value={
                  <span className="font-semibold text-foreground">
                    ${booking.totalAmount.toLocaleString()}{" "}
                    <span className="text-muted-foreground font-normal text-xs">USD</span>
                  </span>
                }
              />
              {booking.notes && (
                <InfoRow
                  icon={<FileText size={14} />}
                  label="Notes"
                  value={<span className="text-muted-foreground">{booking.notes}</span>}
                />
              )}
            </div>

            {/* Footer actions */}
            <div className="px-6 py-5 border-t border-border shrink-0 space-y-2">
              {booking.status === "pending" && (
                <button
                  onClick={() => { onStatusChange?.(booking.id, "confirmed"); onClose(); }}
                  className="w-full bg-emerald-600 text-white text-xs font-body font-semibold tracking-[0.15em] uppercase py-2.5 hover:bg-emerald-700 transition-colors"
                >
                  Confirm Booking
                </button>
              )}
              {booking.status === "confirmed" && (
                <button
                  onClick={() => { onStatusChange?.(booking.id, "completed"); onClose(); }}
                  className="w-full bg-blue-600 text-white text-xs font-body font-semibold tracking-[0.15em] uppercase py-2.5 hover:bg-blue-700 transition-colors"
                >
                  Mark as Completed
                </button>
              )}
              {(booking.status === "pending" || booking.status === "confirmed") && (
                <button
                  onClick={() => { onStatusChange?.(booking.id, "cancelled"); onClose(); }}
                  className="w-full bg-red-600 text-white text-xs font-body font-semibold tracking-[0.15em] uppercase py-2.5 hover:bg-red-700 transition-colors"
                >
                  Cancel Booking
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full text-muted-foreground border border-border text-xs font-body tracking-[0.15em] uppercase py-2.5 hover:text-foreground hover:border-border/80 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
