/**
 * ============================================================
 * OCEANIQUE — Dashboard Bookings Page  (Route: /dashboard/bookings)
 * ============================================================
 * Full bookings management page with search, status filter tabs,
 * sortable columns, row actions, detail drawer, and new-booking modal.
 *
 * COMPONENTS USED:
 * - BookingTable        → Sortable, filterable booking rows
 * - BookingDetailDrawer → Slide-in panel for full booking view + status change
 * - BookingFormModal    → Add / edit booking modal with auto-price calc
 * - ConfirmDialog       → Reusable confirmation prompt for destructive actions
 *
 * DATA SOURCE:
 * - BookingsContext (localStorage key: oceanique_bookings_v2)
 *   Seeded from src/config/dashboard.config.ts on first load.
 *   All mutations (add, status change, delete) are persisted immediately.
 *   Customer records are kept in sync via CustomersContext.
 *
 * CUSTOMIZE:
 * - Status tabs: edit STATUS_TABS array.
 * - Default sort: change the sortKey / sortDir initial state.
 * - Page size: pass a `limit` prop to BookingTable.
 * ============================================================
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { Search } from "lucide-react";
import { BookingTable, type SortKey } from "@/components/dashboard/BookingTable";
import { BookingDetailDrawer } from "@/components/dashboard/BookingDetailDrawer";
import { BookingFormModal } from "@/components/dashboard/BookingFormModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useBookings } from "@/contexts/BookingsContext";
import { useCustomers } from "@/contexts/CustomersContext";
import type { BookingCustomerInfo } from "@/contexts/CustomersContext";
import type { Booking, BookingStatus } from "@/types/booking";

type StatusFilter = "all" | BookingStatus;

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "confirmed", label: "Confirmed" },
  { key: "pending",   label: "Pending" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "refunded",  label: "Refunded" },
];

function sortBookings(bookings: Booking[], key: SortKey, dir: "asc" | "desc") {
  return [...bookings].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "id":            cmp = a.id.localeCompare(b.id); break;
      case "customerName":  cmp = a.customerName.localeCompare(b.customerName); break;
      case "startDate":     cmp = a.startDate.localeCompare(b.startDate); break;
      case "totalAmount":   cmp = a.totalAmount - b.totalAmount; break;
      case "status":        cmp = a.status.localeCompare(b.status); break;
    }
    return dir === "asc" ? cmp : -cmp;
  });
}

type PendingAction = {
  id: string;
  newStatus: BookingStatus;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClassName: string;
};

const ACTION_CONFIG: Record<string, Omit<PendingAction, "id" | "newStatus">> = {
  confirmed: {
    title: "Confirm Booking?",
    message: "This will mark the booking as confirmed. The client will be notified.",
    confirmLabel: "Yes, Confirm",
    confirmClassName: "bg-emerald-700 text-white hover:bg-emerald-600",
  },
  completed: {
    title: "Mark as Completed?",
    message: "This will close the charter and mark it as successfully completed.",
    confirmLabel: "Mark Complete",
    confirmClassName: "bg-blue-700 text-white hover:bg-blue-600",
  },
  cancelled: {
    title: "Cancel Booking?",
    message: "Are you sure you want to cancel this booking? This action cannot be undone.",
    confirmLabel: "Yes, Cancel",
    confirmClassName: "bg-red-700 text-white hover:bg-red-600",
  },
};

export default function DashboardBookingsPage() {
  const { bookings, setBookings } = useBookings();
  const { addOrUpdateFromBooking } = useCustomers();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("startDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  /* Immediately apply the status change (called after user confirms) */
  const applyStatusChange = useCallback((id: string, status: BookingStatus) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    setSelectedBooking((b) => (b?.id === id ? { ...b, status } : b));
  }, []);

  /* Gate every status change through the confirmation dialog */
  function requestStatusChange(id: string, status: BookingStatus) {
    const cfg = ACTION_CONFIG[status];
    if (!cfg) { applyStatusChange(id, status); return; }
    setPendingAction({ id, newStatus: status, ...cfg });
  }

  function handleNewBooking(booking: Booking, customerInfo: BookingCustomerInfo) {
    setBookings((prev) => [booking, ...prev]);
    addOrUpdateFromBooking(booking.customerName, customerInfo);
  }

  const filtered = useMemo(() => {
    let list = bookings;
    if (statusFilter !== "all") list = list.filter((b) => b.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.customerName.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          b.boatName.toLowerCase().includes(q)
      );
    }
    return sortBookings(list, sortKey, sortDir);
  }, [bookings, statusFilter, search, sortKey, sortDir]);

  const counts = useMemo(() => ({
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    pending:   bookings.filter((b) => b.status === "pending").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  }), [bookings]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-3xl text-foreground mb-1">Bookings</h1>
          <p className="text-muted-foreground text-sm font-body">
            {bookings.length} total &middot; {counts.confirmed} confirmed &middot;{" "}
            {counts.pending} pending &middot; {counts.completed} completed
          </p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="bg-gold text-midnight text-xs font-body font-semibold tracking-[0.15em] uppercase px-5 py-2.5 hover:bg-gold-light transition-colors"
        >
          + New Booking
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client, ref, vessel…"
            className="w-full bg-card border border-border text-foreground text-xs font-body pl-8 pr-3 py-2.5 placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/60 transition-colors"
          />
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`text-[11px] font-body tracking-[0.1em] uppercase px-3 py-2 whitespace-nowrap transition-colors ${
                statusFilter === tab.key
                  ? "bg-gold text-midnight font-semibold"
                  : "text-muted-foreground hover:text-foreground border border-border hover:border-border/80"
              }`}
            >
              {tab.label}
              {tab.key !== "all" && counts[tab.key as keyof typeof counts] != null && (
                <span className="ml-1.5 opacity-60">
                  {counts[tab.key as keyof typeof counts]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-sm p-6">
        <BookingTable
          bookings={filtered}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          onView={setSelectedBooking}
          onStatusChange={requestStatusChange}
        />
      </div>

      {/* Detail drawer */}
      <BookingDetailDrawer
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onStatusChange={requestStatusChange}
      />

      {/* New booking modal */}
      <BookingFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        bookingsCount={bookings.length}
        onSave={handleNewBooking}
      />

      {/* Confirmation dialog */}
      <ConfirmDialog
        isOpen={!!pendingAction}
        title={pendingAction?.title ?? ""}
        message={pendingAction?.message ?? ""}
        confirmLabel={pendingAction?.confirmLabel}
        confirmClassName={pendingAction?.confirmClassName}
        onConfirm={() => {
          if (pendingAction) applyStatusChange(pendingAction.id, pendingAction.newStatus);
          setPendingAction(null);
        }}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}
