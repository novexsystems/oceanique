/**
 * ============================================================
 * OCEANIQUE — BookingTable (Dashboard)
 * ============================================================
 * Sortable data table for the Bookings page with status badges
 * and per-row action buttons (View details, Confirm, Cancel).
 *
 * Props:
 *  - bookings        Rows to display (already filtered/sorted by page)
 *  - limit           Optional cap for overview widget usage
 *  - sortKey/sortDir Current sort state (controlled externally)
 *  - onSort          Column header click callback
 *  - onView          "View" button callback → opens detail drawer
 *  - onStatusChange  Confirm / Cancel action callback
 * ============================================================
 */

"use client";

import { ChevronUp, ChevronDown, ChevronsUpDown, Eye } from "lucide-react";
import type { Booking, BookingStatus } from "@/types/booking";

const charterBadge: Record<string, { label: string; cls: string }> = {
  hourly:     { label: "Hourly",    cls: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
  "half-day": { label: "Half-Day", cls: "text-sky-400    bg-sky-500/10    border-sky-500/20"    },
  "full-day": { label: "Full Day", cls: "text-teal-400   bg-teal-500/10   border-teal-500/20"   },
};

export type SortKey = "id" | "customerName" | "startDate" | "totalAmount" | "status";

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  pending:   { label: "Pending",   className: "bg-amber-500/15 text-amber-300 border border-amber-500/30" },
  confirmed: { label: "Confirmed", className: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" },
  completed: { label: "Completed", className: "bg-blue-500/15 text-blue-300 border border-blue-500/30" },
  cancelled: { label: "Cancelled", className: "bg-red-500/15 text-red-300 border border-red-500/30" },
  refunded:  { label: "Refunded",  className: "bg-purple-500/15 text-purple-300 border border-purple-500/30" },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

interface BookingTableProps {
  bookings: Booking[];
  limit?: number;
  sortKey?: SortKey;
  sortDir?: "asc" | "desc";
  onSort?: (key: SortKey) => void;
  onView?: (booking: Booking) => void;
  onStatusChange?: (id: string, status: BookingStatus) => void;
}

interface SortHeaderProps {
  label: string;
  colKey: SortKey;
  current?: SortKey;
  dir?: "asc" | "desc";
  onSort?: (key: SortKey) => void;
  align?: "left" | "right";
}

function SortHeader({ label, colKey, current, dir, onSort, align = "left" }: SortHeaderProps) {
  const active = current === colKey;
  return (
    <th
      onClick={() => onSort?.(colKey)}
      className={`text-muted-foreground text-xs tracking-[0.1em] uppercase font-medium py-3 pr-4 select-none ${
        onSort ? "cursor-pointer hover:text-foreground transition-colors" : ""
      } ${align === "right" ? "text-right" : "text-left"}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {onSort && (
          active ? (
            dir === "asc" ? <ChevronUp size={12} className="text-gold" /> : <ChevronDown size={12} className="text-gold" />
          ) : (
            <ChevronsUpDown size={12} className="opacity-30" />
          )
        )}
      </span>
    </th>
  );
}

export function BookingTable({
  bookings,
  limit,
  sortKey,
  sortDir,
  onSort,
  onView,
  onStatusChange,
}: BookingTableProps) {
  const rows = limit ? bookings.slice(0, limit) : bookings;
  const showActions = !!onView;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-body">
        <thead>
          <tr className="border-b border-border">
            <SortHeader label="Ref"    colKey="id"           current={sortKey} dir={sortDir} onSort={onSort} />
            <SortHeader label="Client" colKey="customerName" current={sortKey} dir={sortDir} onSort={onSort} />
            <th className="text-left text-muted-foreground text-xs tracking-[0.1em] uppercase font-medium py-3 pr-4">
              Vessel
            </th>
            <SortHeader label="Dates"  colKey="startDate"    current={sortKey} dir={sortDir} onSort={onSort} />
            <th className="text-center text-muted-foreground text-xs tracking-[0.1em] uppercase font-medium py-3 pr-4">
              Guests
            </th>
            <SortHeader label="Amount" colKey="totalAmount"  current={sortKey} dir={sortDir} onSort={onSort} align="right" />
            <SortHeader label="Status" colKey="status"       current={sortKey} dir={sortDir} onSort={onSort} />
            {showActions && (
              <th className="text-left text-muted-foreground text-xs tracking-[0.1em] uppercase font-medium py-3">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={showActions ? 8 : 7} className="py-12 text-center text-muted-foreground text-sm font-body">
                No bookings match your filters.
              </td>
            </tr>
          )}
          {rows.map((booking) => {
            const status = statusConfig[booking.status];
            return (
              <tr
                key={booking.id}
                className="border-b border-border/50 hover:bg-muted/20 transition-colors"
              >
                <td className="py-3.5 pr-4 text-muted-foreground font-mono text-xs">
                  {booking.id}
                </td>
                <td className="py-3.5 pr-4 text-foreground font-medium whitespace-nowrap">
                  {booking.customerName}
                </td>
                <td className="py-3.5 pr-4 text-muted-foreground">{booking.boatName}</td>
                <td className="py-3.5 pr-4 text-muted-foreground text-xs">
                  {booking.startDate === booking.endDate ? (
                    <span className="flex items-center gap-1.5 flex-wrap">
                      <span className="whitespace-nowrap">{fmt(booking.startDate)}</span>
                      {booking.charterType && booking.charterType !== "multi-day" && charterBadge[booking.charterType] && (
                        <span className={`text-[9px] font-body tracking-[0.08em] uppercase border px-1.5 py-0.5 rounded-sm whitespace-nowrap ${charterBadge[booking.charterType].cls}`}>
                          {booking.charterType === "hourly" && booking.hours ? `${booking.hours}h` : charterBadge[booking.charterType].label}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="whitespace-nowrap">{fmt(booking.startDate)} → {fmt(booking.endDate)}</span>
                  )}
                </td>
                <td className="py-3.5 pr-4 text-muted-foreground text-center text-xs">
                  {booking.guests}
                </td>
                <td className="py-3.5 pr-4 text-foreground text-right font-medium whitespace-nowrap">
                  ${booking.totalAmount.toLocaleString()}
                </td>
                <td className="py-3.5 pr-4">
                  <span className={`inline-block text-xs font-medium px-2 py-0.5 whitespace-nowrap ${status.className}`}>
                    {status.label}
                  </span>
                </td>
                {showActions && (
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onView?.(booking)}
                        className="flex items-center gap-1 text-[11px] font-body text-muted-foreground hover:text-foreground border border-border hover:border-border/80 px-2 py-1 transition-colors"
                      >
                        <Eye size={11} /> View
                      </button>
                      {booking.status === "pending" && (
                        <button
                          onClick={() => onStatusChange?.(booking.id, "confirmed")}
                          className="text-[11px] font-body text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/50 px-2 py-1 transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                      {booking.status === "confirmed" && (
                        <button
                          onClick={() => onStatusChange?.(booking.id, "completed")}
                          className="text-[11px] font-body text-blue-400 hover:text-blue-300 border border-blue-500/30 px-2 py-1 transition-colors"
                        >
                          Complete
                        </button>
                      )}
                      {(booking.status === "pending" || booking.status === "confirmed") && (
                        <button
                          onClick={() => onStatusChange?.(booking.id, "cancelled")}
                          className="text-[11px] font-body text-red-400 hover:text-red-300 border border-red-500/30 px-2 py-1 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
