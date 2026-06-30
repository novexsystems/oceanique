/**
 * ============================================================
 * OCEANIQUE — BookingFormModal (Dashboard)
 * ============================================================
 * Modal dialog for creating a new booking or editing an
 * existing one from the admin Bookings page.
 *
 * Features:
 *  - Charter type selector (Hourly / Multi-Day)
 *  - Dynamic vessel dropdown from boatsConfig.fleet
 *  - Auto-calculated total amount (based on vessel pricing
 *    and selected duration)
 *  - Customer info fields (name, email, phone, country)
 *  - Status selector and notes textarea
 *
 * Props:
 *  - open              Whether the modal is visible
 *  - initial           Existing Booking to edit, or null for new
 *  - onSave            Called with the completed Booking + customer info
 *  - onClose           Called when the modal should close
 *
 * DATA SOURCE:
 * - Vessel list → src/config/boats.config.ts (fleet)
 * - On save: bubbles up to BookingsContext → localStorage
 *            and addOrUpdateFromBooking in CustomersContext
 *
 * CUSTOMIZE:
 * - Add new status options: extend the STATUSES array.
 * - Add new charter types: extend CHARTER_TYPES + calcAmount().
 * - Add new form fields: extend FormData interface + JSX below.
 * ============================================================
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { boatsConfig } from "@/config/boats.config";
import type { Booking, BookingStatus, CharterType } from "@/types/booking";
import type { BookingCustomerInfo } from "@/contexts/CustomersContext";

const CHARTER_TYPES: { key: CharterType; label: string; sub: string }[] = [
  { key: "hourly",     label: "Hourly",    sub: "Choose date & hours"  },
  { key: "multi-day", label: "Multi-Day", sub: "Departure → return"    },
];

const STATUSES: { value: BookingStatus; label: string }[] = [
  { value: "pending",   label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

interface FormData {
  customerName:    string;
  customerEmail:   string;
  customerPhone:   string;
  customerCountry: string;
  charterType: CharterType;
  hours:     string;
  boatId:    string;
  startDate: string;
  endDate:   string;
  guests:    string;
  status:    BookingStatus;
  notes:     string;
}

const today = new Date().toISOString().slice(0, 10);

const empty: FormData = {
  customerName:    "",
  customerEmail:   "",
  customerPhone:   "",
  customerCountry: "",
  charterType: "multi-day",
  hours:     "4",
  boatId:    boatsConfig.fleet[0]?.id ?? "",
  startDate: today,
  endDate:   today,
  guests:    "2",
  status:    "pending",
  notes:     "",
};

function calcAmount(boatId: string, charterType: CharterType, start: string, end: string, hours: number): number {
  const boat = boatsConfig.fleet.find((b) => b.id === boatId);
  if (!boat) return 0;
  switch (charterType) {
    case "hourly":    return boat.pricing.perHour * Math.max(1, hours);
    case "half-day": return boat.pricing.perHalf;
    case "full-day": return boat.pricing.perDay;
    case "multi-day": {
      const nights = Math.max(
        1,
        Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000)
      );
      return boat.pricing.perDay * nights;
    }
  }
}

/** Generates a chronological booking reference: bk-YYXX (year + padded sequence) */
function generateBookingId(existingCount: number): string {
  const yy  = new Date().getFullYear().toString().slice(-2);
  const seq = String(existingCount + 1).padStart(2, "0");
  return `bk-${yy}${seq}`;
}

export interface BookingFormModalProps {
  isOpen:         boolean;
  onClose:        () => void;
  bookingsCount:  number;
  onSave: (booking: Booking, customerInfo: BookingCustomerInfo) => void;
}

export function BookingFormModal({ isOpen, onClose, bookingsCount, onSave }: BookingFormModalProps) {
  const [form, setForm] = useState<FormData>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (isOpen) { setForm(empty); setErrors({}); }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  function set<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => { const n = { ...p }; delete n[key]; return n; });
  }

  function validate() {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.customerName.trim()) e.customerName = "Required";
    if (!form.startDate) e.startDate = "Required";
    if (form.charterType === "hourly") {
      if (!form.hours || isNaN(+form.hours) || +form.hours < 1) e.hours = "Min 1 hour";
    }
    if (form.charterType === "multi-day") {
      if (!form.endDate) e.endDate = "Required";
      else if (form.endDate <= form.startDate) e.endDate = "Must be after start date";
    }
    if (!form.guests || isNaN(+form.guests) || +form.guests < 1) e.guests = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const boat = boatsConfig.fleet.find((b) => b.id === form.boatId);
    const hours = parseInt(form.hours) || 4;
    const endDate = form.charterType === "multi-day" ? form.endDate : form.startDate;
    const amount  = calcAmount(form.boatId, form.charterType, form.startDate, endDate, hours);
    const booking: Booking = {
      id:           generateBookingId(bookingsCount),
      customerName: form.customerName,
      boatId:       form.boatId,
      boatName:     boat?.name ?? "",
      startDate:    form.startDate,
      endDate,
      totalAmount:  amount,
      status:       form.status,
      guests:       parseInt(form.guests),
      notes:        form.notes || undefined,
      charterType:  form.charterType,
      hours:        form.charterType === "hourly" ? hours : undefined,
    };
    const customerInfo: BookingCustomerInfo = {
      email:   form.customerEmail   || undefined,
      phone:   form.customerPhone   || undefined,
      country: form.customerCountry || undefined,
    };
    onSave(booking, customerInfo);
    onClose();
  }

  const hours  = parseInt(form.hours) || 4;
  const amount = useMemo(
    () => calcAmount(form.boatId, form.charterType, form.startDate, form.endDate, hours),
    [form.boatId, form.charterType, form.startDate, form.endDate, hours]
  );

  const selectedBoat = useMemo(
    () => boatsConfig.fleet.find((b) => b.id === form.boatId),
    [form.boatId]
  );

  const rateLabel = form.charterType === "hourly" ? `$${selectedBoat?.pricing.perHour.toLocaleString()}/hr × ${hours}h`
    : form.charterType === "half-day" ? `$${selectedBoat?.pricing.perHalf.toLocaleString()} half-day rate`
    : form.charterType === "full-day"  ? `$${selectedBoat?.pricing.perDay.toLocaleString()} full-day rate`
    : (() => {
        const n = Math.max(1, Math.round((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / 86_400_000));
        return `$${selectedBoat?.pricing.perDay.toLocaleString()}/day × ${n} night${n !== 1 ? "s" : ""}`;
      })();

  const inputCls =
    "w-full bg-background border border-border text-foreground text-xs font-body px-3 py-2.5 placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/60 transition-colors";
  const labelCls =
    "block text-muted-foreground text-[10px] font-body tracking-[0.15em] uppercase mb-1.5";
  const errCls = "text-red-400 text-[10px] font-body mt-1";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="bfm-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            key="bfm-modal"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-lg bg-card border border-border rounded-sm shadow-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <div>
                  <p className="text-gold text-[10px] font-body tracking-[0.25em] uppercase mb-0.5">New Booking</p>
                  <h2 className="font-heading text-xl text-foreground">Create Reservation</h2>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* ── Client section ── */}
                <div>
                  <p className="text-gold text-[10px] font-body tracking-[0.2em] uppercase mb-3">Client Details</p>
                  <div className="space-y-3">
                    <div>
                      <label className={labelCls}>Full Name *</label>
                      <input
                        type="text"
                        value={form.customerName}
                        onChange={(e) => set("customerName", e.target.value)}
                        placeholder="e.g. Melanie Weber"
                        className={inputCls}
                      />
                      {errors.customerName && <p className={errCls}>{errors.customerName}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Email</label>
                        <input
                          type="email"
                          value={form.customerEmail}
                          onChange={(e) => set("customerEmail", e.target.value)}
                          placeholder="m.weber@example.com"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Phone</label>
                        <input
                          type="tel"
                          value={form.customerPhone}
                          onChange={(e) => set("customerPhone", e.target.value)}
                          placeholder="+49 172 …"
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Country</label>
                      <input
                        type="text"
                        value={form.customerCountry}
                        onChange={(e) => set("customerCountry", e.target.value)}
                        placeholder="Germany"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/50" />

                {/* Charter Type */}
                <div>
                  <label className={labelCls}>Charter Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {CHARTER_TYPES.map((ct) => (
                      <button key={ct.key} type="button"
                        onClick={() => {
                          set("charterType", ct.key);
                          if (ct.key !== "multi-day") set("endDate", form.startDate);
                        }}
                        className={`p-2 border rounded-sm text-center transition-colors ${
                          form.charterType === ct.key
                            ? "border-gold bg-gold/10 text-foreground"
                            : "border-border/60 text-muted-foreground hover:border-gold/40"
                        }`}
                      >
                        <p className="text-xs font-body font-semibold">{ct.label}</p>
                        <p className="text-[9px] font-body text-muted-foreground mt-0.5">{ct.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vessel + Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Vessel</label>
                    <select
                      value={form.boatId}
                      onChange={(e) => set("boatId", e.target.value)}
                      className={inputCls}
                    >
                      {boatsConfig.fleet.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => set("status", e.target.value as BookingStatus)}
                      className={inputCls}
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dates — end date only for multi-day */}
                <div className={`grid gap-4 ${form.charterType === "multi-day" ? "grid-cols-2" : "grid-cols-1"}`}>
                  <div>
                    <label className={labelCls}>
                      {form.charterType === "multi-day" ? "Departure Date" : "Charter Date"}
                    </label>
                    <input type="date" value={form.startDate}
                      onChange={(e) => {
                        set("startDate", e.target.value);
                        if (form.charterType !== "multi-day") set("endDate", e.target.value);
                      }}
                      className={inputCls}
                    />
                    {errors.startDate && <p className={errCls}>{errors.startDate}</p>}
                  </div>
                  {form.charterType === "multi-day" && (
                    <div>
                      <label className={labelCls}>Return Date</label>
                      <input type="date" value={form.endDate}
                        min={form.startDate}
                        onChange={(e) => set("endDate", e.target.value)}
                        className={inputCls}
                      />
                      {errors.endDate && <p className={errCls}>{errors.endDate}</p>}
                    </div>
                  )}
                </div>

                {/* Hours (hourly only) */}
                {form.charterType === "hourly" && (
                  <div>
                    <label className={labelCls}>Number of hours (1 – 10)</label>
                    <input type="number" value={form.hours} min={1} max={10}
                      onChange={(e) => set("hours", String(Math.max(1, Math.min(10, parseInt(e.target.value) || 1))))}
                      className={inputCls}
                    />
                    {errors.hours && <p className={errCls}>{errors.hours}</p>}
                  </div>
                )}

                {/* Guests + Estimate */}
                <div className="grid grid-cols-2 gap-4 items-start">
                  <div>
                    <label className={labelCls}>Number of Guests</label>
                    <input type="number" value={form.guests} min={1}
                      onChange={(e) => set("guests", e.target.value)}
                      className={inputCls}
                    />
                    {errors.guests && <p className={errCls}>{errors.guests}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Estimated Total</label>
                    <div className="border border-border bg-muted/20 px-3 py-2.5 text-foreground font-body font-semibold text-sm">
                      ${amount.toLocaleString()} <span className="text-muted-foreground font-normal text-xs">USD</span>
                    </div>
                    <p className="text-muted-foreground text-[10px] font-body mt-1">{rateLabel}</p>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className={labelCls}>Internal Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Special requests, preferences, or instructions..."
                    rows={3}
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-border">
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground text-xs font-body tracking-[0.15em] uppercase px-5 py-2.5 border border-border hover:border-border/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-gold text-midnight text-xs font-body font-semibold tracking-[0.2em] uppercase px-6 py-2.5 hover:bg-gold-light transition-colors"
                >
                  Create Booking
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
