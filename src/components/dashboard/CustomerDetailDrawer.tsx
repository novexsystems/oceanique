"use client";

/**
 * ============================================================
 * OCEANIQUE — CustomerDetailDrawer
 * ============================================================
 * Slide-in right panel showing the full CMS profile for a
 * customer: contact info, stats, preferred vessel, booking
 * history cross-reference, and internal notes.
 * ============================================================
 */

import { motion, AnimatePresence } from "framer-motion";
import {
  X, Mail, Phone, MapPin, Globe, Anchor,
  Calendar, DollarSign, Edit, Star, Hash,
} from "lucide-react";
import type { Customer } from "@/types/customer";
import { useBookings } from "@/contexts/BookingsContext";
import { useMemo } from "react";

const BOAT_NAMES: Record<string, string> = {
  "boat-001": "Azure Horizon",
  "boat-002": "Celeste",
  "boat-003": "Obsidian",
  "boat-004": "Pearl",
};
const BOAT_COLORS: Record<string, string> = {
  "boat-001": "#C9A227",
  "boat-002": "#0D9488",
  "boat-003": "#818CF8",
  "boat-004": "#F43F5E",
};
const STATUS_CLS: Record<string, string> = {
  pending:   "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  completed: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
  cancelled: "bg-red-500/15 text-red-300 border border-red-500/30",
  refunded:  "bg-purple-500/15 text-purple-300 border border-purple-500/30",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}
function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  onClose: () => void;
  onEdit:  (customer: Customer) => void;
}

export function CustomerDetailDrawer({ customer, onClose, onEdit }: CustomerDetailDrawerProps) {
  const { bookings } = useBookings();

  /* All bookings for this customer — used for derived stats */
  const allCustomerBookings = useMemo(() => {
    if (!customer) return [];
    const fullName = `${customer.firstName} ${customer.lastName}`;
    return bookings.filter(b => b.customerName === fullName);
  }, [customer, bookings]);

  /* Stats derived from live bookings (excludes cancelled / refunded) */
  const derivedStats = useMemo(() => {
    const active = allCustomerBookings.filter(
      b => b.status !== "cancelled" && b.status !== "refunded"
    );
    const sorted = [...active].sort((a, b) => b.startDate.localeCompare(a.startDate));
    return {
      totalBookings: active.length > 0 ? active.length : (customer?.totalBookings ?? 0),
      totalSpent:    active.length > 0
        ? active.reduce((s, b) => s + b.totalAmount, 0)
        : (customer?.totalSpent ?? 0),
      lastBooking:   sorted[0]?.startDate ?? customer?.lastBooking,
    };
  }, [allCustomerBookings, customer]);

  /* Last 5 for the history section (all statuses) */
  const recentBookings = useMemo(() =>
    [...allCustomerBookings]
      .sort((a, b) => b.startDate.localeCompare(a.startDate))
      .slice(0, 5),
  [allCustomerBookings]);

  return (
    <AnimatePresence>
      {customer && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cust-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            key="cust-drawer"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col"
          >
            {/* ── Header ── */}
            <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4 flex-shrink-0">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold font-heading font-semibold text-sm">
                    {customer.firstName[0]}{customer.lastName[0]}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-heading text-xl text-foreground leading-tight">
                      {customer.firstName} {customer.lastName}
                    </h2>
                    {customer.vip && (
                      <span className="bg-gold/10 text-gold border border-gold/20 text-[10px] font-body px-2 py-0.5 tracking-[0.1em] uppercase flex items-center gap-1">
                        <Star size={9} className="fill-gold" />VIP
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {customer.customerNumber != null && (
                      <span className="font-mono text-[11px] text-gold/80">
                        #{String(customer.customerNumber).padStart(3, "0")}
                      </span>
                    )}
                    <span className="font-mono text-[11px] text-muted-foreground">{customer.id}</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0 mt-0.5">
                <X size={18} />
              </button>
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto">

              {/* Stats 2×2 grid */}
              <div className="grid grid-cols-2 border-b border-border divide-x divide-border">
                {[
                  { label: "Bookings",    val: String(derivedStats.totalBookings), icon: <Hash size={13} /> },
                  { label: "Lifetime",    val: `$${derivedStats.totalSpent.toLocaleString()}`, icon: <DollarSign size={13} /> },
                  { label: "Member Since",val: fmt(customer.joinedDate), icon: <Calendar size={13} /> },
                  { label: "Last Charter",val: derivedStats.lastBooking ? fmt(derivedStats.lastBooking) : "—", icon: <Anchor size={13} /> },
                ].map((s, i) => (
                  <div key={s.label} className={`px-5 py-4 ${i >= 2 ? "border-t border-border" : ""}`}>
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                      <span className="text-gold">{s.icon}</span>
                      <p className="text-[10px] font-body tracking-[0.15em] uppercase">{s.label}</p>
                    </div>
                    <p className="text-foreground font-body font-semibold text-sm leading-snug">{s.val}</p>
                  </div>
                ))}
              </div>

              {/* Contact */}
              <div className="px-6 py-5 border-b border-border space-y-3.5">
                <p className="text-gold text-[10px] font-body tracking-[0.2em] uppercase">Contact</p>
                {[
                  { icon: <Mail size={13} />,  label: "Email",   val: customer.email,   href: `mailto:${customer.email}` },
                  { icon: <Phone size={13} />, label: "Phone",   val: customer.phone,   href: `tel:${customer.phone}` },
                  { icon: <Globe size={13} />, label: "Country", val: customer.country, href: undefined },
                  ...(customer.city    ? [{ icon: <MapPin size={13} />, label: "City",    val: customer.city,    href: undefined }] : []),
                  ...(customer.address ? [{ icon: <MapPin size={13} />, label: "Address", val: customer.address, href: undefined }] : []),
                ].map(row => (
                  <div key={row.label} className="flex items-start gap-3">
                    <span className="text-gold mt-0.5 shrink-0">{row.icon}</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-body tracking-[0.1em] uppercase text-muted-foreground">{row.label}</p>
                      {row.href ? (
                        <a href={row.href} className="text-foreground text-sm font-body hover:text-gold transition-colors truncate block">
                          {row.val}
                        </a>
                      ) : (
                        <p className="text-foreground text-sm font-body">{row.val}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Preferred vessel */}
              {customer.preferredBoat && (
                <div className="px-6 py-5 border-b border-border">
                  <p className="text-gold text-[10px] font-body tracking-[0.2em] uppercase mb-3">Preferred Vessel</p>
                  <div className="flex items-center gap-3">
                    <span className="w-1 h-8 rounded-full" style={{ backgroundColor: BOAT_COLORS[customer.preferredBoat] ?? "#6B7280" }} />
                    <p className="text-foreground text-sm font-body font-medium">
                      {BOAT_NAMES[customer.preferredBoat] ?? customer.preferredBoat}
                    </p>
                  </div>
                </div>
              )}

              {/* Booking history */}
              {recentBookings.length > 0 && (
                <div className="px-6 py-5 border-b border-border">
                  <p className="text-gold text-[10px] font-body tracking-[0.2em] uppercase mb-3">Booking History</p>
                  <div className="space-y-2">
                    {recentBookings.map(b => (
                      <div key={b.id} className="flex items-center justify-between gap-3 py-2 border-b border-border/40 last:border-0">
                        <div className="min-w-0">
                          <p className="text-foreground text-xs font-body font-medium truncate">{b.boatName}</p>
                          <p className="text-muted-foreground text-[10px] font-body mt-0.5">
                            {fmtShort(b.startDate)} → {fmtShort(b.endDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-foreground text-xs font-body">${b.totalAmount.toLocaleString()}</span>
                          <span className={`text-[10px] font-body px-1.5 py-0.5 ${STATUS_CLS[b.status] ?? ""}`}>
                            {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {customer.notes && (
                <div className="px-6 py-5">
                  <p className="text-gold text-[10px] font-body tracking-[0.2em] uppercase mb-2">Internal Notes</p>
                  <p className="text-muted-foreground text-sm font-body leading-relaxed">{customer.notes}</p>
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="px-6 py-4 border-t border-border flex gap-3 flex-shrink-0">
              <button
                onClick={() => onEdit(customer)}
                className="flex-1 bg-gold text-midnight text-xs font-body font-semibold tracking-[0.15em] uppercase py-2.5 hover:bg-gold-light transition-colors flex items-center justify-center gap-2"
              >
                <Edit size={13} /> Edit Customer
              </button>
              <button
                onClick={onClose}
                className="px-5 text-xs font-body text-muted-foreground border border-border hover:text-foreground transition-colors"
              >
                Close
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
