/**
 * ============================================================
 * OCEANIQUE — Dashboard Customers Page  (Route: /dashboard/customers)
 * ============================================================
 * Full CMS-style customer directory: search, sortable columns,
 * per-row detail drawer, and add/edit modal.
 *
 * COMPONENTS USED:
 * - CustomerTable        → Sortable customer rows with VIP badge
 * - CustomerDetailDrawer → Slide-in panel showing full profile,
 *                          booking history, and internal notes
 * - CustomerFormModal    → Add / edit customer modal
 *
 * DATA SOURCE:
 * - CustomersContext (localStorage key: oceanique_customers_v2)
 *   Seeded from src/config/dashboard.config.ts on first load.
 *   On mount, syncFromBookings() ensures every booking customer
 *   has a matching record (handles website bookings and legacy data).
 *   Website bookings additionally write full contact info
 *   (email, phone, address) directly via WebsiteBookingModal.
 *
 * CUSTOMIZE:
 * - Add columns: extend CustomerTable and CustomerSortKey.
 * - Change page size: pass a `limit` prop to CustomerTable.
 * - Customer fields: extend src/types/customer.ts + CustomerFormModal.
 * ============================================================
 */

"use client";

import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { CustomerTable, type CustomerSortKey } from "@/components/dashboard/CustomerTable";
import { CustomerDetailDrawer } from "@/components/dashboard/CustomerDetailDrawer";
import { CustomerFormModal } from "@/components/dashboard/CustomerFormModal";
import { useCustomers } from "@/contexts/CustomersContext";
import { useBookings } from "@/contexts/BookingsContext";
import type { Customer } from "@/types/customer";
import type { Booking } from "@/types/booking";

export default function DashboardCustomersPage() {
  const { bookings } = useBookings();
  const { customers, setCustomers, syncFromBookings } = useCustomers();

  /* On load (and whenever bookings change), ensure every booking customer
   * has a corresponding record in the customers list. Handles legacy bookings
   * that were added before the customer-info form fields existed. */
  useEffect(() => {
    syncFromBookings(bookings);
  }, [bookings]); // eslint-disable-line react-hooks/exhaustive-deps

  const [search,     setSearch]     = useState("");
  const [sortKey,    setSortKey]     = useState<CustomerSortKey>("customerNumber");
  const [sortDir,    setSortDir]     = useState<"asc"|"desc">("asc");
  const [selected,   setSelected]   = useState<Customer | null>(null);
  const [formOpen,   setFormOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState<Customer | null>(null);

  /* Enrich every customer record with stats derived from live bookings */
  const enrichedCustomers = useMemo(() =>
    customers.map(c => {
      const fullName = `${c.firstName} ${c.lastName}`;
      const cBookings = bookings.filter(
        (b: Booking) => b.customerName === fullName &&
             b.status !== "cancelled" &&
             b.status !== "refunded"
      );
      if (cBookings.length === 0) return c;
      const sorted = [...cBookings].sort((a: Booking, b: Booking) => b.startDate.localeCompare(a.startDate));
      return {
        ...c,
        totalBookings: cBookings.length,
        totalSpent:    cBookings.reduce((s: number, b: Booking) => s + b.totalAmount, 0),
        lastBooking:   sorted[0].startDate,
      };
    }),
  [customers, bookings]);

  function handleSort(key: CustomerSortKey) {
    if (key === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  function openAdd() {
    setEditTarget(null);
    setFormOpen(true);
  }
  function openEdit(c: Customer) {
    setEditTarget(c);
    setSelected(null);
    setFormOpen(true);
  }
  function handleSave(c: Customer) {
    setCustomers((prev: Customer[]) => {
      const idx = prev.findIndex((x: Customer) => x.id === c.id);
      return idx >= 0 ? prev.map((x: Customer) => x.id === c.id ? c : x) : [...prev, c];
    });
    setFormOpen(false);
    if (editTarget) setSelected(c);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return enrichedCustomers;
    return enrichedCustomers.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      (c.city ?? "").toLowerCase().includes(q) ||
      `#${String(c.customerNumber ?? "").padStart(3, "0")}`.includes(q) ||
      String(c.customerNumber ?? "").includes(q)
    );
  }, [enrichedCustomers, search]);

  const vipCount = enrichedCustomers.filter(c => c.vip).length;
  const nextCustomerNumber = customers.reduce((max, c) => Math.max(max, c.customerNumber ?? 0), 0) + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-3xl text-foreground mb-1">Customers</h1>
          <p className="text-muted-foreground text-sm font-body">
            {customers.length} total clients · {vipCount} VIP members
          </p>
        </div>
        <button
          onClick={openAdd}
          className="bg-gold text-midnight text-xs font-body font-semibold tracking-[0.15em] uppercase px-5 py-2.5 hover:bg-gold-light transition-colors shrink-0"
        >
          + Add Client
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, country…"
          className="w-full pl-9 pr-4 py-2 text-sm font-body bg-card border border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-gold transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-sm p-6">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm font-body text-center py-8">No clients match your search.</p>
        ) : (
          <CustomerTable
            customers={filtered}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
            onView={setSelected}
          />
        )}
      </div>

      {/* Detail drawer */}
      <CustomerDetailDrawer
        customer={selected}
        onClose={() => setSelected(null)}
        onEdit={openEdit}
      />

      {/* Add / Edit modal */}
      <CustomerFormModal
        open={formOpen}
        initial={editTarget}
        nextCustomerNumber={nextCustomerNumber}
        onSave={handleSave}
        onClose={() => setFormOpen(false)}
      />
    </div>
  );
}
