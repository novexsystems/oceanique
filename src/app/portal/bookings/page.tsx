/**
 * ============================================================
 * OCEANIQUE — My Bookings  (Route: /portal/bookings)
 * ============================================================
 * Lists all of the customer's bookings split into tabs:
 * Upcoming, Past, and Cancelled. Each card shows the boat,
 * dates, amount, status, and action links.
 *
 * Includes a 3-step modal for requesting a new charter.
 *
 * DATA SOURCE: src/config/portal.config.ts · boats.config.ts
 * ============================================================
 */

"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Anchor,
  CalendarDays,
  MapPin,
  Users,
  Download,
  FileText,
  ChevronRight,
  Plus,
  X,
  Clock,
  User,
  StickyNote,
  Ship,
  ChevronLeft,
  Check,
  AlertCircle,
  ArrowRight,
  Images,
} from "lucide-react";
import { portalConfig } from "@/config/portal.config";
import { boatsConfig } from "@/config/boats.config";
import type { Booking, BookingStatus, CharterType } from "@/types/booking";
import { BOOKINGS_STORAGE_KEY } from "@/contexts/BookingsContext";

const PORTAL_STORAGE_KEY = "oceanique_portal_bookings_v1";

const EASE = [0.25, 0.1, 0, 1] as [number, number, number, number];

type Tab = "upcoming" | "past" | "cancelled";

/* ── types ───────────────────────────────────────────────── */
interface PortalBooking {
  id: string;
  boatId: string;
  boatName: string;
  boatType: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: BookingStatus;
  guests: number;
  captain: string;
  basePort: string;
  itinerary: string;
  notes: string;
  invoiceId: string | null;
  contractId: string | null;
  charterType?: CharterType;
  hours?: number;
  _new?: true;
}

interface BookingForm {
  charterType: CharterType;
  vesselId: string;
  startDate: string;
  endDate: string;     // only used for multi-day
  hours: number;       // only used for hourly
  guests: number;
  specialRequests: string;
}

const FORM_INIT: BookingForm = {
  charterType: "multi-day",
  vesselId: "",
  startDate: "",
  endDate: "",
  hours: 4,
  guests: 2,
  specialRequests: "",
};

const CHARTER_TYPES: { key: CharterType; label: string; sub: string }[] = [
  { key: "hourly",    label: "Hourly",    sub: "Choose date & hours" },
  { key: "multi-day", label: "Multi-Day", sub: "Departure → return"   },
];

/* ── helpers ─────────────────────────────────────────────── */
const statusStyles: Record<string, string> = {
  confirmed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  pending:   "bg-amber-500/15  text-amber-400  border-amber-500/20",
  completed: "bg-blue-500/15   text-blue-400   border-blue-500/20",
  cancelled: "bg-red-500/15    text-red-400    border-red-500/20",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function nightCount(start: string, end: string) {
  return Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 86_400_000
  );
}

function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 86_400_000));
}

/* ── Booking detail drawer ───────────────────────────────── */
function BookingDrawer({
  booking,
  onClose,
}: {
  booking: PortalBooking;
  onClose: () => void;
}) {
  const relatedDocs = portalConfig.documents.filter(
    (d) => d.bookingId === booking.id
  );
  const nights = nightCount(booking.startDate, booking.endDate);
  const upcoming = booking.status === "confirmed" || booking.status === "pending";
  const days = upcoming ? daysUntil(booking.startDate) : null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-midnight/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      {/* Panel */}
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-sidebar border-l border-sidebar-border z-50 overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-sidebar border-b border-sidebar-border px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-gold text-[10px] tracking-[0.2em] uppercase font-body">{booking.id}</p>
            <h2 className="font-heading text-xl text-foreground">{booking.boatName}</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status + countdown */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-[10px] font-body tracking-[0.15em] uppercase px-2 py-0.5 border rounded-sm ${statusStyles[booking.status]}`}>
              {booking.status}
            </span>
            {days !== null && days > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
                <Clock size={12} className="text-gold/50" />
                {days} day{days !== 1 ? "s" : ""} until departure
              </span>
            )}
            {days === 0 && upcoming && (
              <span className="flex items-center gap-1.5 text-xs font-body text-emerald-400">
                <Clock size={12} /> Departing today
              </span>
            )}
          </div>

          {/* Key stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: CalendarDays, label: "Departure",  value: fmtDate(booking.startDate) },
              { icon: CalendarDays, label: "Return",     value: fmtDate(booking.endDate) },
              { icon: Anchor,       label: "Duration",   value: `${nights} night${nights !== 1 ? "s" : ""}` },
              { icon: MapPin,       label: "Base Port",  value: booking.basePort },
              { icon: Users,        label: "Guests",     value: String(booking.guests) },
              { icon: Ship,         label: "Vessel type",value: booking.boatType },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-background border border-border/40 rounded-sm px-3 py-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={11} className="text-gold/50" />
                  <p className="text-muted-foreground text-[10px] tracking-[0.1em] uppercase font-body">{label}</p>
                </div>
                <p className="text-foreground text-sm font-body">{value}</p>
              </div>
            ))}
          </div>

          {/* Captain */}
          <div className="flex items-center gap-3 p-4 border border-border/40 rounded-sm bg-background">
            <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
              <User size={14} className="text-gold/60" />
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] tracking-[0.1em] uppercase font-body">Captain</p>
              <p className="text-foreground text-sm font-body font-medium">{booking.captain}</p>
            </div>
          </div>

          {/* Itinerary */}
          {booking.itinerary && (
            <div>
              <p className="text-muted-foreground text-[10px] tracking-[0.15em] uppercase font-body mb-2">Itinerary</p>
              <p className="text-foreground text-sm font-body leading-relaxed bg-background border border-border/40 rounded-sm p-3">
                {booking.itinerary}
              </p>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <StickyNote size={11} className="text-gold/50" />
                <p className="text-muted-foreground text-[10px] tracking-[0.15em] uppercase font-body">Special Requests</p>
              </div>
              <p className="text-muted-foreground text-sm font-body italic bg-background border border-border/40 rounded-sm p-3">
                {booking.notes}
              </p>
            </div>
          )}

          {/* Charter fee */}
          <div className="flex items-center justify-between p-4 border border-gold/20 bg-gold/5 rounded-sm">
            <p className="text-muted-foreground text-sm font-body">Charter fee</p>
            <p className="font-heading text-2xl text-gold">${booking.totalAmount.toLocaleString()}</p>
          </div>

          {/* Documents */}
          {relatedDocs.length > 0 && (
            <div>
              <p className="text-muted-foreground text-[10px] tracking-[0.15em] uppercase font-body mb-3">Documents</p>
              <ul className="space-y-2">
                {relatedDocs.map((doc) => (
                  <li key={doc.id}
                    className="flex items-center justify-between p-3 border border-border/40 rounded-sm bg-background"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={13} className="text-gold/50 shrink-0" />
                      <span className="text-foreground text-xs font-body truncate">{doc.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className={`text-[9px] font-body tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-sm border ${
                        doc.status === "signed" || doc.status === "paid"
                          ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                          : "text-amber-400 border-amber-500/20 bg-amber-500/10"
                      }`}>{doc.status}</span>
                      <button className="text-muted-foreground hover:text-gold transition-colors">
                        <Download size={13} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pending action */}
          {booking.status === "pending" && (
            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-sm">
              <AlertCircle size={13} className="text-amber-400 mt-0.5 shrink-0" />
              <p className="text-amber-400 text-xs font-body">
                This booking is awaiting confirmation. Our team will contact you within 24 hours.
              </p>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}

/* ── New booking modal ───────────────────────────────────── */

/** Returns boatIds that have a confirmed/pending booking overlapping [start, end) */
function getBookedVesselIds(startDate: string, endDate: string): Set<string> {
  const blocked = new Set<string>();
  if (typeof window === "undefined") return blocked;
  try {
    const keys = [BOOKINGS_STORAGE_KEY, PORTAL_STORAGE_KEY];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const list = JSON.parse(raw) as Array<{ boatId: string; startDate: string; endDate: string; status: string }>;
      for (const b of list) {
        if (
          (b.status === "confirmed" || b.status === "pending") &&
          b.startDate < endDate &&
          b.endDate > startDate
        ) {
          blocked.add(b.boatId);
        }
      }
    }
  } catch {}
  return blocked;
}

/** For same-day charter types, return startDate + 1 day as the effective end */
function effectiveEnd(form: BookingForm): string {
  if (!form.startDate) return "";
  if (form.charterType === "multi-day") return form.endDate;
  const d = new Date(form.startDate);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function calcEstimate(vessel: { pricing: { perHour: number; perHalf: number; perDay: number } }, form: BookingForm, nights: number): number {
  switch (form.charterType) {
    case "hourly":    return vessel.pricing.perHour * form.hours;
    case "half-day": return vessel.pricing.perHalf;
    case "full-day": return vessel.pricing.perDay;
    case "multi-day": return vessel.pricing.perDay * Math.max(1, nights);
  }
}

function charterTypeLabel(t: CharterType): string {
  return CHARTER_TYPES.find((c) => c.key === t)?.label ?? t;
}

function NewBookingModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (booking: PortalBooking) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<BookingForm>(FORM_INIT);
  const [submitted, setSubmitted] = useState(false);
  const [photoVessel, setPhotoVessel] = useState<(typeof boatsConfig.fleet)[0] | null>(null);
  const [photoIdx, setPhotoIdx] = useState(0);

  const { customerProfile } = portalConfig;

  const nights = useMemo(() => {
    if (form.charterType !== "multi-day" || !form.startDate || !form.endDate) return 0;
    const n = nightCount(form.startDate, form.endDate);
    return n > 0 ? n : 0;
  }, [form.charterType, form.startDate, form.endDate]);

  /** Effective date range for availability check (same-day types get +1 day end) */
  const availCheckEnd = useMemo(() => effectiveEnd(form), [form]);

  /** Live availability set — recomputed when dates change */
  const bookedVesselIds = useMemo(() => {
    const end = availCheckEnd;
    if (!form.startDate || !end || form.startDate >= end) return new Set<string>();
    return getBookedVesselIds(form.startDate, end);
  }, [form.startDate, availCheckEnd]);

  const selectedVessel = useMemo(
    () => boatsConfig.fleet.find((b) => b.id === form.vesselId),
    [form.vesselId]
  );

  const estimate = selectedVessel ? calcEstimate(selectedVessel, form, nights) : 0;

  function set<K extends keyof BookingForm>(k: K, v: BookingForm[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  /** When charter type changes, reset dates/hours and clear vessel selection */
  function handleTypeChange(t: CharterType) {
    setForm((p) => ({ ...p, charterType: t, startDate: "", endDate: "", vesselId: "", hours: 4 }));
  }

  /** When dates change, clear any vessel that is now blocked */
  function handleDateChange(field: "startDate" | "endDate", value: string) {
    setForm((p) => {
      const next = { ...p, [field]: value };
      const newStart = field === "startDate" ? value : p.startDate;
      const newEnd   = field === "endDate"   ? value : p.endDate;
      const end = p.charterType === "multi-day" ? newEnd : (() => {
        if (!newStart) return "";
        const d = new Date(newStart); d.setDate(d.getDate() + 1);
        return d.toISOString().slice(0, 10);
      })();
      if (p.vesselId && newStart && end && newStart < end) {
        const blocked = getBookedVesselIds(newStart, end);
        if (blocked.has(p.vesselId)) return { ...next, vesselId: "" };
      }
      return next;
    });
  }

  function canAdvance() {
    if (step === 1) {
      if (!form.startDate || form.guests < 1) return false;
      if (form.charterType === "hourly") return form.hours >= 1;
      if (form.charterType === "multi-day") return !!form.endDate && nights > 0;
      return true; // half-day, full-day only need startDate
    }
    if (step === 2) return !!form.vesselId;
    return true;
  }

  function handleSubmit() {
    if (!selectedVessel) return;
    const id = `bk-${Date.now().toString().slice(-4)}`;
    const endDate = form.charterType === "multi-day" ? form.endDate : form.startDate;
    const notePrefix = form.charterType === "hourly"
      ? `[${charterTypeLabel(form.charterType)} · ${form.hours}h] `
      : form.charterType !== "multi-day"
      ? `[${charterTypeLabel(form.charterType)}] `
      : "";
    const newBooking: PortalBooking = {
      id,
      boatId: selectedVessel.id,
      boatName: selectedVessel.name,
      boatType: selectedVessel.type,
      startDate: form.startDate,
      endDate,
      totalAmount: estimate,
      status: "pending" as BookingStatus,
      guests: form.guests,
      captain: "To be assigned",
      basePort: selectedVessel.specifications.homePort,
      itinerary: "",
      notes: form.specialRequests.trim(),
      invoiceId: `INV-${id}`,
      contractId: null,
      charterType: form.charterType,
      hours: form.charterType === "hourly" ? form.hours : undefined,
      _new: true,
    };
    setSubmitted(true);
    setTimeout(() => {
      onSubmit(newBooking);
      onClose();
    }, 1800);
  }

  const LABEL = "block text-muted-foreground text-[10px] font-body tracking-[0.15em] uppercase mb-1.5";
  const INPUT  = "w-full bg-background border border-border text-foreground text-sm font-body px-3 py-2.5 focus:outline-none focus:border-gold/60 transition-colors placeholder:text-muted-foreground/40";

  const STEP_TITLES = ["Charter Details", "Choose Your Vessel", "Review & Confirm"];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-midnight/70 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 16 }}
        transition={{ duration: 0.25, ease: EASE }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-sidebar border border-sidebar-border rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-sidebar border-b border-sidebar-border px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-gold text-[10px] tracking-[0.2em] uppercase font-body mb-0.5">Step {step} of 3</p>
              <h2 className="font-heading text-xl text-foreground">{STEP_TITLES[step - 1]}</h2>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="px-6 pt-4 flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${s <= step ? "bg-gold" : "bg-border"}`} />
            ))}
          </div>

          <div className="p-6 space-y-6">

            {/* ── STEP 1: Charter type + date/duration + guests ── */}
            {step === 1 && (
              <div className="space-y-5">
                {/* Charter type selector */}
                <div>
                  <p className={LABEL}>Charter Type</p>
                  <div className="grid grid-cols-2 gap-3">
                    {CHARTER_TYPES.map((ct) => (
                      <button key={ct.key} type="button"
                        onClick={() => handleTypeChange(ct.key)}
                        className={`p-3 border rounded-sm text-center transition-colors ${
                          form.charterType === ct.key
                            ? "border-gold bg-gold/8 text-foreground"
                            : "border-border/50 text-muted-foreground hover:border-gold/40 hover:bg-sidebar-accent"
                        }`}
                      >
                        <p className="text-sm font-body font-semibold">{ct.label}</p>
                        <p className="text-[10px] font-body text-muted-foreground mt-0.5">{ct.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date inputs — always show, endDate only for multi-day */}
                <div className={`grid gap-4 ${form.charterType === "multi-day" ? "grid-cols-2" : "grid-cols-1"}`}>
                  <div>
                    <label className={LABEL}>
                      {form.charterType === "multi-day" ? "Departure Date" : "Charter Date"}
                    </label>
                    <input type="date" value={form.startDate}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => handleDateChange("startDate", e.target.value)}
                      className={INPUT} />
                  </div>
                  {form.charterType === "multi-day" && (
                    <div>
                      <label className={LABEL}>Return Date</label>
                      <input type="date" value={form.endDate}
                        min={form.startDate || new Date().toISOString().slice(0, 10)}
                        onChange={(e) => handleDateChange("endDate", e.target.value)}
                        className={INPUT} />
                    </div>
                  )}
                </div>

                {/* Hours — only for hourly */}
                {form.charterType === "hourly" && (
                  <div>
                    <label className={LABEL}>Number of hours (2 – 10)</label>
                    <input type="number" value={form.hours} min={2} max={10}
                      onChange={(e) => set("hours", Math.max(2, Math.min(10, Number(e.target.value))))}
                      className={INPUT} />
                  </div>
                )}

                {/* Guests */}
                <div>
                  <label className={LABEL}>Number of Guests</label>
                  <input type="number" value={form.guests} min={1} max={20}
                    onChange={(e) => set("guests", Math.max(1, Math.min(20, Number(e.target.value))))}
                    className={INPUT} />
                </div>

                {/* Duration pill */}
                {form.startDate && (
                  <div className="p-4 border border-gold/20 bg-gold/5 rounded-sm flex items-center justify-between">
                    <p className="text-muted-foreground text-sm font-body">
                      {charterTypeLabel(form.charterType)}
                      {form.charterType === "hourly" && ` · ${form.hours} hours`}
                      {form.charterType === "multi-day" && nights > 0 && ` · ${nights} night${nights !== 1 ? "s" : ""}`}
                    </p>
                    <p className="text-gold text-xs font-body">{fmtDate(form.startDate)}</p>
                  </div>
                )}

                {form.startDate && (
                  <p className="text-muted-foreground/60 text-[11px] font-body flex items-center gap-1.5">
                    <Check size={11} className="text-emerald-400" />
                    Real-time availability for these dates shown in the next step.
                  </p>
                )}
              </div>
            )}

            {/* ── STEP 2: Vessel selection with live availability ── */}
            {step === 2 && (
              <div className="space-y-3">
                <p className="text-muted-foreground text-xs font-body">
                  <span className="text-foreground">{charterTypeLabel(form.charterType)}</span>
                  {form.charterType === "hourly" && <span className="text-foreground"> · {form.hours}h</span>}
                  {form.charterType === "multi-day" && nights > 0 && <span className="text-foreground"> · {nights} night{nights !== 1 ? "s" : ""}</span>}
                  {" · "}{fmtDate(form.startDate)}
                  {form.charterType === "multi-day" && form.endDate && <> → {fmtDate(form.endDate)}</>}
                  {" · "}{form.guests} guests
                </p>

                {boatsConfig.fleet.map((vessel) => {
                  const isMaintenance  = vessel.status === "maintenance";
                  const isDateBooked   = bookedVesselIds.has(vessel.id);
                  const overCapacity   = form.guests > vessel.capacity.guests;
                  const canBook        = !isMaintenance && !isDateBooked && !overCapacity;
                  const isSelected     = form.vesselId === vessel.id;

                  const unavailableReason = isMaintenance
                    ? "Under maintenance — temporarily unavailable"
                    : isDateBooked
                    ? `Already booked for your selected dates`
                    : overCapacity
                    ? `Capacity exceeded — max ${vessel.capacity.guests} guests`
                    : null;

                  const badgeClass = isMaintenance
                    ? "text-red-400 border-red-500/20 bg-red-500/10"
                    : isDateBooked || overCapacity
                    ? "text-amber-400 border-amber-500/20 bg-amber-500/10"
                    : "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";

                  const badgeLabel = isMaintenance ? "Maintenance"
                    : isDateBooked ? "Unavailable"
                    : overCapacity ? "Over capacity"
                    : "Available";

                  return (
                    <button
                      key={vessel.id}
                      disabled={!canBook}
                      onClick={() => canBook && set("vesselId", vessel.id)}
                      className={`w-full text-left p-4 border rounded-sm transition-colors ${
                        !canBook
                          ? "border-border/30 opacity-55 cursor-not-allowed"
                          : isSelected
                          ? "border-gold bg-gold/5"
                          : "border-border/50 hover:border-gold/40 hover:bg-sidebar-accent"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="relative shrink-0 mt-0.5">
                            <div className={`w-16 h-12 rounded-sm overflow-hidden border ${canBook ? "border-gold/20" : "border-border/20 opacity-50"}`}>
                              <img
                                src={vessel.images.primary}
                                alt={vessel.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); setPhotoVessel(vessel); setPhotoIdx(0); }}
                              className="absolute -bottom-1.5 -right-1.5 flex items-center gap-0.5 bg-card border border-border text-muted-foreground hover:text-gold hover:border-gold/40 transition-colors px-1 py-0.5 rounded-sm text-[9px] font-body"
                            >
                              <Images size={9} /> Photos
                            </button>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-foreground text-sm font-body font-semibold">{vessel.name}</p>
                              {isSelected && <Check size={12} className="text-gold" />}
                              <span className={`text-[9px] font-body tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-sm border ${badgeClass}`}>
                                {badgeLabel}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-xs font-body">
                              {vessel.type} · {vessel.length} · Up to {vessel.capacity.guests} guests
                            </p>
                            <p className="text-muted-foreground/60 text-[11px] font-body mt-0.5">{vessel.specifications.homePort}</p>
                            {unavailableReason && (
                              <p className="text-muted-foreground/50 text-[11px] font-body mt-1 italic">{unavailableReason}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-sm font-body font-semibold ${canBook ? "text-gold" : "text-muted-foreground/40"}`}>
                            ${(form.charterType === "hourly" ? vessel.pricing.perHour : form.charterType === "half-day" ? vessel.pricing.perHalf : vessel.pricing.perDay).toLocaleString()}
                          </p>
                          <p className="text-muted-foreground text-[10px] font-body">
                            {form.charterType === "hourly" ? "/ hr" : form.charterType === "half-day" ? "/ half" : "/ day"}
                          </p>
                          {canBook && (
                            <p className="text-gold/60 text-[10px] font-body mt-0.5">
                              ~${calcEstimate(vessel, form, nights).toLocaleString()} {
                                form.charterType === "hourly" ? `(${form.hours}h)`
                                : form.charterType === "half-day" ? "(half-day)"
                                : form.charterType === "full-day" ? "(full day)"
                                : `(${nights}n)`
                              }
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {vessel.features.slice(0, 4).map((f: string) => (
                          <span key={f} className="text-[10px] font-body text-muted-foreground/60 border border-border/30 px-2 py-0.5 rounded-sm">{f}</span>
                        ))}
                        {vessel.features.length > 4 && (
                          <span className="text-[10px] font-body text-muted-foreground/40">+{vessel.features.length - 4} more</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── STEP 3: Special requests + Review ── */}
            {step === 3 && selectedVessel && !submitted && (
              <div className="space-y-5">
                {/* Special requests */}
                <div>
                  <label className={LABEL}>Special Requests <span className="text-muted-foreground/40 normal-case">(optional)</span></label>
                  <textarea
                    value={form.specialRequests}
                    onChange={(e) => set("specialRequests", e.target.value)}
                    rows={3}
                    placeholder={customerProfile.specialRequests}
                    className={`${INPUT} resize-none`}
                  />
                  <p className="text-muted-foreground/50 text-[10px] font-body mt-1">
                    Dietary requirements, celebrations, preferred itinerary, etc.
                  </p>
                </div>

                {/* Booking summary */}
                <div className="space-y-0 border border-border/40 rounded-sm overflow-hidden">
                  {([
                    { label: "Charter Type", value: charterTypeLabel(form.charterType) },
                    ...(form.charterType === "hourly"
                      ? [{ label: "Duration", value: `${form.hours} hour${form.hours !== 1 ? "s" : ""}` }]
                      : form.charterType === "multi-day"
                      ? [{ label: "Duration", value: `${nights} night${nights !== 1 ? "s" : ""}` }]
                      : []),
                    { label: form.charterType === "multi-day" ? "Departure" : "Date", value: fmtDate(form.startDate) },
                    ...(form.charterType === "multi-day" && form.endDate
                      ? [{ label: "Return", value: fmtDate(form.endDate) }]
                      : []),
                    { label: "Guests",    value: String(form.guests) },
                    { label: "Vessel",    value: selectedVessel.name },
                    { label: "Base Port", value: selectedVessel.specifications.homePort },
                  ] as { label: string; value: string }[]).map(({ label, value }, i) => (
                    <div key={label} className={`flex items-center justify-between px-4 py-2.5 ${i % 2 === 0 ? "bg-background" : "bg-sidebar-accent/30"}`}>
                      <p className="text-muted-foreground text-sm font-body">{label}</p>
                      <p className="text-foreground text-sm font-body font-medium">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Customer info */}
                <div className="p-4 border border-border/40 rounded-sm bg-background space-y-0.5">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-[0.1em] font-body mb-2">Booking for</p>
                  <p className="text-foreground text-sm font-body font-medium">{customerProfile.firstName} {customerProfile.lastName}</p>
                  <p className="text-muted-foreground text-xs font-body">{customerProfile.email}</p>
                  <p className="text-muted-foreground text-xs font-body">{customerProfile.phone}</p>
                </div>

                {/* Estimate */}
                <div className="p-4 border border-gold/20 bg-gold/5 rounded-sm">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-muted-foreground text-xs font-body">
                      {form.charterType === "hourly"
                        ? `${form.hours}h × $${selectedVessel.pricing.perHour.toLocaleString()}/hr`
                        : form.charterType === "half-day"
                        ? `Half-day rate`
                        : form.charterType === "full-day"
                        ? `Full-day rate`
                        : `${nights} night${nights !== 1 ? "s" : ""} × $${selectedVessel.pricing.perDay.toLocaleString()}/day`}
                    </p>
                    <p className="font-heading text-2xl text-gold">${estimate.toLocaleString()}</p>
                  </div>
                  <p className="text-muted-foreground/50 text-[10px] font-body">
                    Deposit due: ${Math.round(estimate * selectedVessel.pricing.depositPercent / 100).toLocaleString()} ({selectedVessel.pricing.depositPercent}%) · Fuel & provisioning billed separately.
                  </p>
                </div>

                <p className="text-muted-foreground/50 text-[11px] font-body">
                  By submitting you acknowledge this is a charter enquiry. Our team will confirm availability and issue a contract within 48 hours.
                </p>
              </div>
            )}

            {/* Submitted */}
            {submitted && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
                  <Check size={22} className="text-emerald-400" />
                </div>
                <h3 className="font-heading text-xl text-foreground mb-1">Request Submitted</h3>
                <p className="text-muted-foreground text-sm font-body">Our team will confirm your charter within 48 hours.</p>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          {!submitted && (
            <div className="sticky bottom-0 bg-sidebar border-t border-sidebar-border px-6 py-4 flex items-center justify-between">
              {step > 1 ? (
                <button onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                  className="flex items-center gap-1.5 text-xs font-body tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronLeft size={13} /> Back
                </button>
              ) : <span />}

              {step < 3 ? (
                <button disabled={!canAdvance()}
                  onClick={() => setStep((s) => (s + 1) as 2 | 3)}
                  className="flex items-center gap-1.5 bg-gold text-midnight text-xs font-body font-semibold tracking-[0.15em] uppercase px-6 py-2.5 hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  Continue <ArrowRight size={13} />
                </button>
              ) : (
                <button onClick={handleSubmit}
                  className="flex items-center gap-1.5 bg-gold text-midnight text-xs font-body font-semibold tracking-[0.15em] uppercase px-6 py-2.5 hover:bg-gold-light transition-colors">
                  Submit Request <Check size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Photo lightbox ── */}
      <AnimatePresence>
        {photoVessel && (() => {
          const photos = [photoVessel.images.primary, ...photoVessel.images.gallery].filter(Boolean);
          const total  = photos.length;
          const prev   = () => setPhotoIdx((i) => (i - 1 + total) % total);
          const next   = () => setPhotoIdx((i) => (i + 1) % total);
          return (
            <>
              <motion.div
                key="lb-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/90 z-[60]"
                onClick={() => setPhotoVessel(null)}
              />
              <motion.div
                key="lb-panel"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[60] flex flex-col pointer-events-none"
              >
                {/* Header */}
                <div className="pointer-events-auto flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-gold text-[10px] font-body tracking-[0.2em] uppercase mb-0.5">Gallery</p>
                    <h3 className="font-heading text-lg text-white leading-tight">{photoVessel.name}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/40 text-xs font-body">{photoIdx + 1} / {total}</span>
                    <button
                      onClick={() => setPhotoVessel(null)}
                      className="text-white/60 hover:text-white transition-colors p-1"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Main image + arrows */}
                <div className="pointer-events-auto flex-1 flex items-center justify-center px-16 py-4 relative min-h-0">
                  <button
                    onClick={prev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white bg-black/40 hover:bg-black/70 transition-colors p-2 rounded-full"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <img
                    key={photos[photoIdx]}
                    src={photos[photoIdx]}
                    alt={`${photoVessel.name} — photo ${photoIdx + 1}`}
                    className="max-h-full max-w-full object-contain rounded-sm select-none"
                  />
                  <button
                    onClick={next}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white bg-black/40 hover:bg-black/70 transition-colors p-2 rounded-full"
                  >
                    <ChevronRight size={22} />
                  </button>
                </div>

                {/* Thumbnail strip */}
                {total > 1 && (
                  <div className="pointer-events-auto flex items-center justify-center gap-2 px-6 py-4 overflow-x-auto">
                    {photos.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIdx(i)}
                        className={`w-14 h-10 rounded-sm overflow-hidden border-2 shrink-0 transition-all ${
                          i === photoIdx ? "border-gold opacity-100" : "border-transparent opacity-40 hover:opacity-70"
                        }`}
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Caption */}
                <div className="pointer-events-auto pb-6 text-center">
                  <p className="text-white/30 text-[11px] font-body">{photoVessel.type} · {photoVessel.length} · {photoVessel.specifications.homePort}</p>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </>
  );
}

/* ── persistence helpers ────────────────────────────────── */

/**
 * Loads all portal bookings, merging three sources in priority order:
 *
 *  1. Portal-created bookings from PORTAL_STORAGE_KEY (new charters
 *     submitted by the customer via the booking modal).
 *  2. Static seed bookings from portalConfig.bookings (mock data for
 *     pre-existing charters shown on first load).
 *  3. Status overrides from BOOKINGS_STORAGE_KEY (the admin dashboard
 *     store) — applied LAST so that any status change the admin makes
 *     (e.g. pending → confirmed) is always visible to the customer.
 *
 * PRODUCTION NOTE:
 *  Replace localStorage reads with a single GET /api/bookings?customerId=…
 *  endpoint that returns the unified list with the latest statuses.
 */
function loadPortalBookings(): PortalBooking[] {
  const base: PortalBooking[] = portalConfig.bookings.map((b) => ({ ...b }));
  if (typeof window === "undefined") return base;

  /*
   * Step 1 — Build a status-override map from the admin booking store.
   * When the admin changes a booking status (e.g. pending → confirmed),
   * the change is written to BOOKINGS_STORAGE_KEY. Reading it here ensures
   * the customer always sees the status the admin has set.
   */
  const adminStatusMap = new Map<string, BookingStatus>();
  try {
    const adminRaw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (adminRaw) {
      (JSON.parse(adminRaw) as Array<{ id: string; status: BookingStatus }>)
        .forEach((b) => adminStatusMap.set(b.id, b.status));
    }
  } catch { /* localStorage unavailable — status overrides are skipped */ }

  /* Step 2 — Merge portal-created bookings on top of the static seed. */
  let allBookings: PortalBooking[] = base;
  try {
    const raw = localStorage.getItem(PORTAL_STORAGE_KEY);
    if (raw) {
      const extra = JSON.parse(raw) as PortalBooking[];
      const baseIds = new Set(base.map((b) => b.id));
      /* Portal-created bookings appear first (most recently created). */
      allBookings = [...extra.filter((b) => !baseIds.has(b.id)), ...base];
    }
  } catch { /* localStorage unavailable — fall back to static data */ }

  /*
   * Step 3 — Apply admin status overrides.
   * Admin status always takes precedence over the locally stored portal
   * status because the admin is the authoritative source of truth.
   */
  return allBookings.map((b) => {
    const adminStatus = adminStatusMap.get(b.id);
    return adminStatus !== undefined ? { ...b, status: adminStatus } : b;
  });
}

function savePortalBooking(b: PortalBooking) {
  try {
    const raw = localStorage.getItem(PORTAL_STORAGE_KEY);
    const existing: PortalBooking[] = raw ? JSON.parse(raw) : [];
    if (!existing.find((x) => x.id === b.id)) {
      localStorage.setItem(PORTAL_STORAGE_KEY, JSON.stringify([b, ...existing]));
    }
  } catch {}
}

function syncToAdminDashboard(b: PortalBooking) {
  try {
    const { customerProfile } = portalConfig;
    const adminBooking: Booking = {
      id: b.id,
      customerName: `${customerProfile.firstName} ${customerProfile.lastName}`,
      boatId: b.boatId,
      boatName: b.boatName,
      startDate: b.startDate,
      endDate: b.endDate,
      totalAmount: b.totalAmount,
      status: b.status,
      guests: b.guests,
      notes: b.notes || undefined,
      charterType: b.charterType,
      hours: b.hours,
    };
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    const existing: Booking[] = raw ? JSON.parse(raw) : [];
    if (!existing.find((x) => x.id === adminBooking.id)) {
      localStorage.setItem(
        BOOKINGS_STORAGE_KEY,
        JSON.stringify([adminBooking, ...existing])
      );
    }
  } catch {}
}

/* ── Main page ───────────────────────────────────────────── */
export default function PortalBookingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");
  const [bookings, setBookings] = useState<PortalBooking[]>(loadPortalBookings);
  const [drawerBooking, setDrawerBooking] = useState<PortalBooking | null>(null);
  const [showModal, setShowModal] = useState(false);

  /* Re-hydrate from localStorage on mount (handles SSR mismatch). */
  useEffect(() => {
    setBookings(loadPortalBookings());
  }, []);

  /*
   * Cross-tab / cross-window status sync.
   * When the admin updates a booking status in the dashboard (even in a
   * different browser tab), the `storage` event fires here and we
   * immediately re-load so the customer sees the change without refreshing.
   */
  useEffect(() => {
    function handleAdminUpdate(e: StorageEvent) {
      if (e.key === BOOKINGS_STORAGE_KEY) {
        setBookings(loadPortalBookings());
      }
    }
    window.addEventListener("storage", handleAdminUpdate);
    return () => window.removeEventListener("storage", handleAdminUpdate);
  }, []);

  const tabs: { key: Tab; label: string }[] = [
    { key: "upcoming",  label: "Upcoming" },
    { key: "past",      label: "Past Voyages" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const filtered = {
    upcoming:  bookings.filter((b) => b.status === "confirmed" || b.status === "pending"),
    past:      bookings.filter((b) => b.status === "completed"),
    cancelled: bookings.filter((b) => b.status === "cancelled"),
  };

  const current = filtered[activeTab];

  /* Summary stats */
  const totalSpent = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const totalNights = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + nightCount(b.startDate, b.endDate), 0);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-3xl text-foreground mb-1">My Bookings</h1>
          <p className="text-muted-foreground text-sm font-body">
            All your charter bookings — past, present, and future.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gold text-midnight text-xs font-body font-semibold tracking-[0.15em] uppercase px-5 py-2.5 hover:bg-gold-light transition-colors shrink-0"
        >
          <Plus size={13} /> Book a Charter
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Upcoming",        value: filtered.upcoming.length,  color: "text-emerald-400" },
          { label: "Past Voyages",    value: filtered.past.length,      color: "text-blue-400" },
          { label: "Total Nights",    value: totalNights,               color: "text-purple-400" },
          { label: "Total Spent",     value: `$${totalSpent.toLocaleString()}`, color: "text-gold" },
        ].map((s) => (
          <div key={s.label} className="bg-sidebar border border-sidebar-border rounded-sm px-4 py-3">
            <p className="text-muted-foreground text-[10px] tracking-[0.1em] uppercase font-body mb-1">{s.label}</p>
            <p className={`font-heading text-xl ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-sidebar-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative px-4 py-3 text-sm font-body transition-colors duration-150 ${
              activeTab === tab.key ? "text-gold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-sidebar-accent text-muted-foreground font-body">
              {filtered[tab.key].length}
            </span>
            {activeTab === tab.key && (
              <motion.div
                layoutId="booking-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-px bg-gold"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Booking cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="space-y-4"
        >
          {current.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-sidebar-border rounded-sm">
              <Anchor size={32} className="text-muted-foreground/20 mb-3" />
              <p className="text-muted-foreground text-sm font-body">No {activeTab} bookings.</p>
              {activeTab === "upcoming" && (
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-4 flex items-center gap-1.5 text-gold text-xs font-body tracking-[0.1em] uppercase hover:text-gold-light transition-colors"
                >
                  <Plus size={12} /> Book your next charter
                </button>
              )}
            </div>
          )}

          {current.map((booking, i) => {
            const nights = nightCount(booking.startDate, booking.endDate);
            const upcoming = booking.status === "confirmed" || booking.status === "pending";
            const days = upcoming ? daysUntil(booking.startDate) : null;

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06, ease: EASE }}
                className={`bg-sidebar border rounded-sm p-6 hover:border-gold/20 transition-colors duration-200 ${
                  booking._new ? "border-gold/30" : "border-sidebar-border"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-[10px] font-body tracking-[0.15em] uppercase px-2 py-0.5 border rounded-sm ${statusStyles[booking.status]}`}>
                        {booking.status}
                      </span>
                      <span className="text-muted-foreground/50 text-xs font-body">{booking.id}</span>
                      {booking._new && (
                        <span className="text-[10px] font-body tracking-[0.1em] uppercase text-gold/70 border border-gold/30 px-1.5 py-0.5 rounded-sm">
                          New
                        </span>
                      )}
                      {days !== null && days <= 14 && days > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-body text-amber-400">
                          <Clock size={10} /> {days}d to departure
                        </span>
                      )}
                      {days === 0 && upcoming && (
                        <span className="flex items-center gap-1 text-[10px] font-body text-emerald-400">
                          <Clock size={10} /> Today
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading text-xl text-foreground mb-0.5">{booking.boatName}</h3>
                    <p className="text-muted-foreground/60 text-sm font-body mb-4">{booking.boatType}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                        <CalendarDays size={13} className="text-gold/50 shrink-0" />
                        <span>{fmtDate(booking.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                        <Anchor size={13} className="text-gold/50 shrink-0" />
                        <span>{nights} night{nights !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                        <MapPin size={13} className="text-gold/50 shrink-0" />
                        <span>{booking.basePort}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                        <Users size={13} className="text-gold/50 shrink-0" />
                        <span>{booking.guests} guests</span>
                      </div>
                    </div>

                    {booking.captain && booking.captain !== "To be assigned" && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <User size={11} className="text-gold/40" />
                        <p className="text-muted-foreground/50 text-xs font-body">{booking.captain}</p>
                      </div>
                    )}

                    {booking.itinerary && (
                      <p className="mt-2 text-xs font-body text-muted-foreground/50 italic">
                        {booking.itinerary}
                      </p>
                    )}
                  </div>

                  {/* Right — amount + actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-muted-foreground/50 text-[10px] tracking-[0.1em] uppercase font-body">Charter fee</p>
                      <p className="font-heading text-xl text-foreground">
                        ${booking.totalAmount.toLocaleString()}
                      </p>
                      {upcoming && days !== null && (
                        <p className="text-muted-foreground/40 text-[11px] font-body">{days}d away</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {booking.invoiceId && (
                        <button
                          aria-label="Download invoice"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-body tracking-[0.1em] uppercase border border-sidebar-border text-muted-foreground hover:text-foreground hover:border-gold/30 transition-colors"
                        >
                          <Download size={12} /> Invoice
                        </button>
                      )}
                      <button
                        onClick={() => setDrawerBooking(booking)}
                        aria-label="View booking details"
                        className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-body tracking-[0.1em] uppercase bg-gold/10 border border-gold/20 text-gold hover:bg-gold/20 transition-colors"
                      >
                        Details <ChevronRight size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Booking detail drawer */}
      <AnimatePresence>
        {drawerBooking && (
          <BookingDrawer
            booking={drawerBooking}
            onClose={() => setDrawerBooking(null)}
          />
        )}
      </AnimatePresence>

      {/* New booking modal */}
      <AnimatePresence>
        {showModal && (
          <NewBookingModal
            onClose={() => setShowModal(false)}
            onSubmit={(b) => {
              savePortalBooking(b);
              syncToAdminDashboard(b);
              setBookings(loadPortalBookings());
              setActiveTab("upcoming");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
