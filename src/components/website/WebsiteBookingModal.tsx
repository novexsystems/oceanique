/**
 * ============================================================
 * OCEANIQUE — WebsiteBookingModal
 * ============================================================
 * Four-step charter booking enquiry form launched from the
 * public website. Mirrors the portal booking flow so the
 * experience is consistent across all entry points.
 *
 * STEPS:
 *  1. Charter Details  — type (multi-day / hourly), dates, guest count, notes
 *  2. Choose Vessel    — availability-aware grid with per-vessel detail view
 *                        (photo carousel, specs, amenities, select CTA)
 *  3. Your Details     — name, email, phone, full billing address
 *                        (street, city, postal code, country)
 *  4. Confirm          — summary, account choice, legal checkboxes, submit
 *  ✓  Success          — booking reference + upsell / portal deeplink
 *
 * DATA FLOW:
 *  - Availability  → reads BOOKINGS_STORAGE_KEY + PORTAL_STORAGE_KEY
 *  - On submit     → always writes to BOOKINGS_STORAGE_KEY (admin bookings)
 *                    always writes to CUSTOMERS_STORAGE_KEY (admin customers,
 *                    upsert by full name: creates new record or enriches
 *                    empty fields on an existing one)
 *                    additionally writes to PORTAL_STORAGE_KEY when the
 *                    user creates or signs into an account
 *
 * ACCOUNT OPTIONS (step 4):
 *  - Guest         → booking saved to admin only; upsell shown on success
 *  - Sign In       → mock auth; booking also saved to portal storage
 *  - Create Acct   → mock create; booking also saved to portal storage
 *
 * CUSTOMISE:
 *  - Charter types:    edit CHARTER_TYPES array (only hourly + multi-day supported).
 *  - Legal link hrefs: update the <Link> elements in the legal section.
 *  - Loyalty copy:     edit the upsell banner text in the success screen.
 *  - Auth:             replace the mock login/create blocks with real API calls.
 *  - Availability:     replace getBookedVesselIds() with GET /api/availability.
 * ============================================================
 */

"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronLeft, ArrowRight, Check,
  Users, Star, LogIn, UserPlus, UserCheck,
  Shield, ChevronRight, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { boatsConfig } from "@/config/boats.config";
import { dashboardConfig } from "@/config/dashboard.config";
import { BOOKINGS_STORAGE_KEY } from "@/contexts/BookingsContext";
import { CUSTOMERS_STORAGE_KEY } from "@/contexts/CustomersContext";
import type { Booking, CharterType } from "@/types/booking";
import type { Boat } from "@/types/boat";
import type { Customer } from "@/types/customer";

/** localStorage key used by the customer portal for its bookings. */
const PORTAL_STORAGE_KEY = "oceanique_portal_bookings_v1";

/** Shared cubic-bezier easing for all motion transitions. */
const EASE = [0.25, 0.1, 0, 1] as const;

// ── Types ──────────────────────────────────────────────────────────────────────

/** Which step of the 4-step form is currently visible. */
type Step = 1 | 2 | 3 | 4;

/**
 * How the user wants to handle their Oceanique account.
 * This determines whether the booking is also synced to the portal.
 */
type AccountMode = "guest" | "login" | "create";

/** Complete state of the booking enquiry form across all 4 steps. */
interface FormData {
  // ── Step 1: Charter Details
  charterType: CharterType;
  startDate:   string;
  endDate:     string;   // multi-day only
  hours:       number;   // hourly only
  guests:      number;
  notes:       string;
  // ── Step 2: Vessel
  vesselId:    string;
  // ── Step 3: Personal Details
  firstName:   string;
  lastName:    string;
  email:       string;
  phone:       string;
  address:     string;   // street address
  city:        string;
  postalCode:  string;
  country:     string;
  // ── Step 4: Account & Legal
  accountMode:     AccountMode;
  loginEmail:      string;
  loginPassword:   string;
  createEmail:     string;
  createPassword:  string;
  acceptTerms:     boolean;
  acceptPrivacy:   boolean;
  acceptMarketing: boolean;
}

/** Blank form state used when the modal first opens. */
const FORM_INIT: FormData = {
  charterType: "multi-day",
  startDate:   "",
  endDate:     "",
  hours:       4,
  guests:      2,
  notes:       "",
  vesselId:    "",
  firstName:   "",
  lastName:    "",
  email:       "",
  phone:       "",
  address:     "",
  city:        "",
  postalCode:  "",
  country:     "",
  accountMode:     "guest",
  loginEmail:      "",
  loginPassword:   "",
  createEmail:     "",
  createPassword:  "",
  acceptTerms:     false,
  acceptPrivacy:   false,
  acceptMarketing: false,
};

// ── Charter type options ───────────────────────────────────────────────────────

/**
 * The two available charter duration modes.
 * The user picks one in step 1; the date inputs and price estimate adapt.
 */
const CHARTER_TYPES: { key: CharterType; label: string; sub: string }[] = [
  { key: "multi-day", label: "Multi-Day", sub: "Departure → return date" },
  { key: "hourly",    label: "Hourly",    sub: "Choose your duration"   },
];

/** Human-readable label for each step used in the progress indicator. */
const STEP_LABELS = ["Charter Details", "Choose Vessel", "Your Details", "Confirm"] as const;

// ── Helper functions ───────────────────────────────────────────────────────────

/**
 * Returns the effective booking end date used for availability overlap checks.
 * Single-day charter types occupy the full calendar day, so their end date
 * is set to startDate + 1 day to represent the closed interval correctly.
 *
 * @param charterType - The currently selected charter duration type.
 * @param startDate   - ISO date string (YYYY-MM-DD).
 * @param endDate     - ISO date string; only meaningful for "multi-day".
 */
function effectiveEnd(charterType: CharterType, startDate: string, endDate: string): string {
  if (!startDate) return "";
  if (charterType === "multi-day") return endDate;
  const d = new Date(startDate);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Reads both booking stores and returns a Set of boatIds that have a
 * confirmed or pending booking overlapping [startDate, endDate).
 *
 * Data sources (in priority order):
 *  1. BOOKINGS_STORAGE_KEY — localStorage (written by dashboard mutations)
 *  2. dashboardConfig.recentBookings — seed fallback used when localStorage
 *     is still empty (BookingsContext skips its first-render write).
 *  3. PORTAL_STORAGE_KEY — customer-portal bookings
 *
 * PRODUCTION: replace with GET /api/availability?start=&end= API call.
 */
function getBookedVesselIds(startDate: string, endDate: string): Set<string> {
  const blocked = new Set<string>();
  if (typeof window === "undefined") return blocked;
  try {
    /* Admin store — fall back to seed data when localStorage is empty */
    const adminRaw  = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    const adminList = adminRaw
      ? (JSON.parse(adminRaw) as Booking[])
      : (dashboardConfig.recentBookings as Booking[]);

    /* Portal store — only real submissions, no seed fallback needed */
    const portalRaw  = localStorage.getItem(PORTAL_STORAGE_KEY);
    const portalList = portalRaw ? (JSON.parse(portalRaw) as Booking[]) : [];

    for (const b of [...adminList, ...portalList]) {
      if (
        (b.status === "confirmed" || b.status === "pending") &&
        b.startDate < endDate &&
        b.endDate   > startDate
      ) {
        blocked.add(b.boatId);
      }
    }
  } catch { /* localStorage unavailable — treat all vessels as available */ }
  return blocked;
}

/**
 * Reads booking stores and returns every booked date range with confirmed
 * or pending status, optionally filtered to a single vessel.
 *
 * Data sources mirror getBookedVesselIds:
 *  1. BOOKINGS_STORAGE_KEY (localStorage) → dashboardConfig seed fallback
 *  2. PORTAL_STORAGE_KEY   (localStorage, no seed fallback)
 *
 * Used to populate the DateAvailabilityCalendar so it reflects the same
 * booking data the admin dashboard shows.
 */
function getBookedRanges(vesselId?: string): Array<{ start: string; end: string }> {
  if (typeof window === "undefined") return [];
  const out: Array<{ start: string; end: string }> = [];
  try {
    /* Admin store — fall back to seed data when localStorage is empty */
    const adminRaw  = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    const adminList = adminRaw
      ? (JSON.parse(adminRaw) as Booking[])
      : (dashboardConfig.recentBookings as Booking[]);

    /* Portal store — real submissions only */
    const portalRaw  = localStorage.getItem(PORTAL_STORAGE_KEY);
    const portalList = portalRaw ? (JSON.parse(portalRaw) as Booking[]) : [];

    for (const b of [...adminList, ...portalList]) {
      if (b.status !== "confirmed" && b.status !== "pending") continue;
      if (vesselId && b.boatId !== vesselId) continue;
      out.push({ start: b.startDate, end: b.endDate });
    }
  } catch { /* localStorage unavailable — return empty */ }
  return out;
}

/**
 * Returns the number of nights between two ISO date strings.
 * Returns 0 if either string is missing or the range is invalid.
 */
function nightCount(start: string, end: string): number {
  if (!start || !end) return 0;
  return Math.max(
    0,
    Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000),
  );
}

/**
 * Calculates the estimated charter cost for a given vessel, type, and duration.
 * Only "multi-day" and "hourly" are supported; all other values return 0.
 */
function calcEstimate(
  vessel: (typeof boatsConfig.fleet)[0],
  charterType: CharterType,
  hours: number,
  nights: number,
): number {
  if (charterType === "hourly")    return vessel.pricing.perHour * Math.max(1, hours);
  if (charterType === "multi-day") return vessel.pricing.perDay  * Math.max(1, nights);
  return 0;
}

/** Formats an ISO date string as "15 July 2026". */
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// ── Availability calendar ──────────────────────────────────────────────────────

/**
 * Read-only mini calendar shown in step 1 below the date inputs.
 *
 * Colour coding:
 *  - Gold solid   : selected date / range endpoints
 *  - Gold tint    : dates inside a multi-day selected range
 *  - Red tint     : already booked (confirmed or pending booking)
 *  - Gold ring    : today
 *  - Muted        : past dates (non-interactive)
 *
 * In vessel mode (vesselId provided) only that vessel's bookings are shown.
 * In generic mode (no vesselId) all bookings across every vessel are shown,
 * giving the user a sense of high-demand periods even before picking a yacht.
 */
function DateAvailabilityCalendar({
  vesselId,
  vesselName,
  selectedStart,
  selectedEnd,
  charterType,
}: {
  vesselId?:     string;
  vesselName?:   string;
  selectedStart: string;
  selectedEnd:   string;
  charterType:   CharterType;
}) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const [calYear,  setCalYear]  = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth()); // 0-indexed

  /** Booked ranges — refreshed whenever the target vessel changes. */
  const bookedRanges = useMemo(() => getBookedRanges(vesselId), [vesselId]);

  /** True if the given ISO date falls within any booked range. */
  function isDateBooked(d: string): boolean {
    return bookedRanges.some((r) => d >= r.start && d < r.end);
  }

  /** True if the given ISO date falls within the user's current selection. */
  function isInSelection(d: string): boolean {
    if (!selectedStart) return false;
    const end = charterType === "multi-day" && selectedEnd ? selectedEnd : selectedStart;
    return d >= selectedStart && d <= end;
  }

  /** Navigate to the previous calendar month. */
  function prevMonth() {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
  }

  /** Navigate to the next calendar month. */
  function nextMonth() {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
  }

  /* Build the day grid: leading nulls pad the first week to align with Sun. */
  const firstOfMonth = new Date(calYear, calMonth, 1);
  const daysInMonth  = new Date(calYear, calMonth + 1, 0).getDate();
  const leadingNulls = firstOfMonth.getDay(); // 0 = Sunday

  /** ISO date strings for every day in the current view month. */
  const dayCells: Array<string | null> = [
    ...Array<null>(leadingNulls).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      return `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }),
  ];

  const monthLabel = firstOfMonth.toLocaleDateString("en-GB", {
    month: "long", year: "numeric",
  });

  return (
    <div className="bg-sidebar/60 border border-border/30 p-4">

      {/* ── Caption ── */}
      <p className="text-muted-foreground/40 text-[9px] font-body tracking-[0.2em] uppercase mb-3">
        {vesselId && vesselName
          ? `${vesselName} — availability`
          : "Fleet availability overview"}
      </p>

      {/* ── Month navigation ── */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          aria-label="Previous month"
          className="text-muted-foreground/50 hover:text-foreground transition-colors p-0.5"
        >
          <ChevronLeft size={13} />
        </button>
        <p className="text-foreground text-xs font-body font-semibold">{monthLabel}</p>
        <button
          onClick={nextMonth}
          aria-label="Next month"
          className="text-muted-foreground/50 hover:text-foreground transition-colors p-0.5"
        >
          <ChevronRight size={13} />
        </button>
      </div>

      {/* ── Day-of-week headers ── */}
      <div className="grid grid-cols-7 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <p key={d} className="text-center text-[9px] font-body text-muted-foreground/25 py-0.5">
            {d}
          </p>
        ))}
      </div>

      {/* ── Day cells ── */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {dayCells.map((dateStr, i) => {
          if (!dateStr) return <div key={`empty-${i}`} />;

          const isPast    = dateStr < todayStr;
          const booked    = !isPast && isDateBooked(dateStr);
          const inRange   = isInSelection(dateStr);
          const isStart   = dateStr === selectedStart;
          const isEnd     = charterType === "multi-day" && dateStr === selectedEnd;
          const isToday   = dateStr === todayStr;
          const dayNum    = new Date(dateStr + "T12:00:00").getDate();

          return (
            <div
              key={dateStr}
              title={
                isPast   ? "Past date"
                : booked ? "Already booked"
                : "Available"
              }
              className={`
                relative flex items-center justify-center text-[10px] font-body py-[5px] select-none
                ${(isStart || isEnd)
                    ? "bg-gold text-midnight font-semibold"
                : inRange && !isPast
                    ? "bg-gold/20 text-foreground/80"
                : booked
                    ? "bg-red-950/55 text-red-400/70"
                : isPast
                    ? "text-muted-foreground/18"
                    : "text-foreground/60"}
                ${isToday && !inRange && !booked ? "ring-1 ring-inset ring-gold/40" : ""}
              `}
            >
              {dayNum}
            </div>
          );
        })}
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-border/20 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-gold shrink-0" />
          <span className="text-[9px] font-body text-muted-foreground/45">Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-red-950/55 border border-red-500/25 shrink-0" />
          <span className="text-[9px] font-body text-muted-foreground/45">
            {vesselId ? "Booked" : "Booking exists"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 ring-1 ring-gold/40 shrink-0" />
          <span className="text-[9px] font-body text-muted-foreground/45">Today</span>
        </div>
      </div>
    </div>
  );
}

// ── Step progress indicator ────────────────────────────────────────────────────

/**
 * Labels for the standard 4-step generic booking flow.
 * When vesselMode is true, a separate 3-step label set is used instead.
 */
const VESSEL_STEP_LABELS = ["Charter Details", "Your Details", "Confirm"] as const;

/**
 * Horizontal step indicator shown in the modal header.
 * Completed steps show a gold tick; the active step has a gold ring;
 * future steps are dimmed. A connecting line bridges consecutive steps.
 *
 * In vesselMode the vessel-selection step is omitted, showing only
 * 3 steps: Charter Details → Your Details → Confirm.
 * The internal step numbers (1, 3, 4) are mapped to display numbers (1, 2, 3).
 */
function StepIndicator({ step, vesselMode = false }: { step: Step; vesselMode?: boolean }) {
  const labels = vesselMode ? VESSEL_STEP_LABELS : STEP_LABELS;

  /* Map internal step to 0-based display index */
  const displayIdx = vesselMode
    ? step === 1 ? 0 : step === 3 ? 1 : 2
    : step - 1;

  return (
    <div className="flex items-center flex-1">
      {labels.map((label, i) => {
        const done   = displayIdx > i;
        const active = displayIdx === i;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center shrink-0">
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-body font-semibold border transition-colors
                ${done   ? "bg-gold border-gold text-midnight"
                : active ? "border-gold text-gold bg-gold/10"
                :          "border-border/40 text-muted-foreground/35"}
              `}>
                {done ? <Check size={10} strokeWidth={3} /> : i + 1}
              </div>
              <span className={`
                text-[9px] font-body tracking-[0.06em] uppercase mt-1 whitespace-nowrap hidden sm:block
                ${active ? "text-gold" : done ? "text-muted-foreground/60" : "text-muted-foreground/25"}
              `}>
                {label}
              </span>
            </div>
            {/* Connector line */}
            {i < labels.length - 1 && (
              <div className={`flex-1 h-px mx-2 mb-4 sm:mb-0 ${done ? "bg-gold/40" : "bg-border/25"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Shared input class strings ─────────────────────────────────────────────────

const INPUT = "w-full bg-background border border-border text-foreground text-sm font-body px-3 py-2.5 focus:outline-none focus:border-gold/60 transition-colors placeholder:text-muted-foreground/40";
const LABEL = "block text-muted-foreground text-[10px] font-body tracking-[0.15em] uppercase mb-1.5";

// ── Main component ─────────────────────────────────────────────────────────────

interface WebsiteBookingModalProps {
  /** Whether the modal is currently visible. Controlled by WebsiteBookingContext. */
  isOpen:           boolean;
  /** Called when the user clicks Close or the backdrop. */
  onClose:          () => void;
  /**
   * Optional vessel ID to pre-select in step 2 when the modal opens.
   * Set by WebsiteBookingContext when the user clicks "Book This Vessel"
   * on a specific vessel card. The user can still change the selection.
   */
  initialVesselId?:    string;
  /**
   * Optional charter type to pre-set in step 1 when the modal opens.
   * Mirrors the price mode the user selected in the fleet section
   * ("hourly" when viewing per-hour rate, "multi-day" for per-day).
   */
  initialCharterType?: CharterType;
}

export function WebsiteBookingModal({ isOpen, onClose, initialVesselId, initialCharterType }: WebsiteBookingModalProps) {
  const [step,       setStep]       = useState<Step>(1);
  const [form,       setForm]       = useState<FormData>(FORM_INIT);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [authError,  setAuthError]  = useState("");

  /**
   * The vessel whose detail view is currently open within step 2.
   * null = the vessel grid is shown.
   */
  const [detailVessel, setDetailVessel] = useState<Boat | null>(null);
  /** Zero-based index of the active photo in the vessel detail carousel. */
  const [galleryIdx,   setGalleryIdx]   = useState(0);

  /* ── Reset the whole form whenever the modal opens ── */
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      /* Apply vessel pre-selection and/or charter type from the fleet section. */
      setForm({
        ...FORM_INIT,
        vesselId:    initialVesselId    ?? FORM_INIT.vesselId,
        charterType: initialCharterType ?? FORM_INIT.charterType,
      });
      setSubmitted(false);
      setBookingRef("");
      setAuthError("");
      setSubmitting(false);
      setDetailVessel(null);
      setGalleryIdx(0);
    }
  }, [isOpen]);

  /* ── Prevent background scroll while modal is open ── */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  /* ── Close on Escape key ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  /* ── Derived values ── */

  /** The vessel object currently selected in step 2 (undefined if none). */
  const selectedVessel = useMemo(
    () => boatsConfig.fleet.find((b) => b.id === form.vesselId),
    [form.vesselId],
  );

  /**
   * True when the modal was opened with a specific vessel pre-selected
   * (i.e. the user clicked "Book This Vessel" on the fleet section).
   * In this mode step 2 (vessel selection) is skipped and a vessel
   * banner is shown above the step content instead.
   */
  const vesselMode = !!initialVesselId && !!selectedVessel;

  /**
   * Number of nights for multi-day charters.
   * Zero for all other charter types.
   */
  const nights = useMemo(
    () => form.charterType === "multi-day" ? nightCount(form.startDate, form.endDate) : 0,
    [form.charterType, form.startDate, form.endDate],
  );

  /** Estimated charter fee in USD based on vessel pricing and duration. */
  const estimate = useMemo(
    () => selectedVessel
      ? calcEstimate(selectedVessel, form.charterType, form.hours, nights)
      : 0,
    [selectedVessel, form.charterType, form.hours, nights],
  );

  /**
   * Set of boatIds that are blocked for the user's chosen dates.
   * Recomputed whenever dates or charter type change.
   */
  const bookedIds = useMemo(() => {
    const end = effectiveEnd(form.charterType, form.startDate, form.endDate);
    if (!form.startDate || !end || form.startDate >= end) return new Set<string>();
    return getBookedVesselIds(form.startDate, end);
  }, [form.charterType, form.startDate, form.endDate]);

  /**
   * Availability of the pre-selected vessel for the currently entered dates.
   * Only meaningful in vessel mode.
   *  null  = dates not yet fully entered
   *  true  = vessel is free for those dates
   *  false = vessel is already booked or under maintenance
   */
  const isVesselAvailableForDates = useMemo((): boolean | null => {
    if (!vesselMode || !selectedVessel || !form.startDate) return null;
    if (selectedVessel.status === "maintenance") return false;
    const end = effectiveEnd(form.charterType, form.startDate, form.endDate);
    if (!end || form.startDate >= end) return null;
    return !bookedIds.has(selectedVessel.id);
  }, [vesselMode, selectedVessel, form.startDate, form.endDate, form.charterType, bookedIds]);

  /* ── Form helpers ── */

  /** Typed setter — updates a single form field immutably. */
  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /**
   * Handles charter type changes.
   * Always resets date fields and hours because availability and pricing
   * need to be re-evaluated for the new type.
   * In vessel mode the vesselId is preserved — the user is already committed
   * to a specific yacht and is only switching the rate unit (hourly ↔ daily).
   * In generic mode vesselId is cleared so the user re-selects in step 2.
   */
  function handleTypeChange(t: CharterType) {
    setForm((prev) => ({
      ...prev,
      charterType: t,
      startDate:   "",
      endDate:     "",
      vesselId:    vesselMode ? prev.vesselId : "",
      hours:       4,
    }));
  }

  /* ── Validation ── */

  /** Returns true if the user has provided enough data to advance from the current step. */
  function canAdvance(): boolean {
    if (step === 1) {
      if (!form.startDate || form.guests < 1) return false;
      if (form.charterType === "multi-day") return !!form.endDate && nights > 0;
      if (form.charterType === "hourly")    return form.hours >= 1;
      return false;
    }
    if (step === 2) return !!form.vesselId;
    if (step === 3) {
      return !!(form.firstName.trim() && form.lastName.trim() && form.email.trim()
        && form.address.trim() && form.city.trim() && form.postalCode.trim() && form.country.trim());
    }
    return false;
  }

  /**
   * Returns true when all mandatory fields for step 4 are filled.
   * Both legal checkboxes are always required.
   * Login and create-account modes additionally require their credential fields.
   */
  function canSubmit(): boolean {
    if (!form.acceptTerms || !form.acceptPrivacy) return false;
    if (form.accountMode === "login")  return !!(form.loginEmail.trim()  && form.loginPassword.trim());
    if (form.accountMode === "create") return !!(form.createEmail.trim() && form.createPassword.trim());
    return true; // guest mode — legal checkboxes are sufficient
  }

  /* ── Submit ── */

  /**
   * Persists the booking to localStorage and shows the success screen.
   *
   * Write sequence:
   *  1. BOOKINGS_STORAGE_KEY  — always; admin dashboard picks it up immediately.
   *  2. CUSTOMERS_STORAGE_KEY — always; upserts the customer record:
   *       - If a record with the same full name exists: fills in any empty
   *         fields (email, phone, country, city, address) without overwriting.
   *       - Otherwise: creates a new Customer record with all collected data.
   *  3. PORTAL_STORAGE_KEY    — only when accountMode is "login" or "create";
   *       the customer portal booking list shows the booking under "Upcoming".
   *
   * PRODUCTION: replace localStorage writes with POST /api/bookings and
   * POST /api/customers; add JWT / session handling for login/create flows.
   */
  async function handleSubmit() {
    if (!selectedVessel) return;
    setSubmitting(true);
    setAuthError("");

    const id      = `bk-${Date.now().toString().slice(-4)}`;
    const endDate = form.charterType === "multi-day" ? form.endDate : form.startDate;

    /* Build the admin-compatible Booking record. */
    const typeLabel = CHARTER_TYPES.find((c) => c.key === form.charterType)?.label ?? "";
    const notePrefix = form.charterType !== "multi-day" ? `[${typeLabel}] ` : "";
    const rawNotes   = form.notes.trim();
    /*
     * Prepend the customer's address so it appears in the admin booking record.
     * Format: "[Address: {street}, {city}, {country}]" on the first line,
     * followed by any user-provided special requests.
     */
    const addressLine = `[Address: ${form.address.trim()}, ${form.city.trim()}, ${form.postalCode.trim()}, ${form.country.trim()}]`;
    const notesValue  = [addressLine, notePrefix.trim(), rawNotes].filter(Boolean).join(" ") || undefined;

    const adminBooking: Booking = {
      id,
      customerName: `${form.firstName} ${form.lastName}`,
      boatId:       selectedVessel.id,
      boatName:     selectedVessel.name,
      startDate:    form.startDate,
      endDate,
      totalAmount:  estimate,
      status:       "pending",
      guests:       form.guests,
      notes:        notesValue,
      charterType:  form.charterType,
      hours:        form.charterType === "hourly" ? form.hours : undefined,
    };

    try {
      /* ── Write to admin store (always) ── */
      const adminRaw  = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      const adminList: Booking[] = adminRaw ? JSON.parse(adminRaw) : [];
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify([adminBooking, ...adminList]));

      /* ── Upsert customer in admin customers store (always) ──
       * Creates a new customer record or enriches an existing one
       * (matched by full name) with the contact info from this booking.
       * Uses the same localStorage key as CustomersContext so the
       * admin dashboard picks it up on next load or via storage event.
       */
      const rawCusts = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
      const custs: Customer[] = rawCusts
        ? (JSON.parse(rawCusts) as Customer[])
        : (dashboardConfig.customers as Customer[]);

      const fullName = `${form.firstName} ${form.lastName}`;
      const match    = custs.find(
        (c) => `${c.firstName} ${c.lastName}`.toLowerCase() === fullName.toLowerCase(),
      );

      let updatedCusts: Customer[];
      if (match) {
        /* Enrich only fields that are currently empty */
        const patch: Partial<Customer> = {};
        if (!match.email   && form.email)   patch.email   = form.email;
        if (!match.phone   && form.phone)   patch.phone   = form.phone;
        if (!match.country && form.country) patch.country = form.country;
        if (!match.city    && form.city)    patch.city    = form.city;
        if (!match.address && form.address) patch.address = `${form.address.trim()}, ${form.postalCode.trim()}`;
        updatedCusts = custs.map((c) => (c.id === match.id ? { ...c, ...patch } : c));
      } else {
        /* Create a full customer record from the booking form data */
        const maxNum     = custs.reduce((m, c) => Math.max(m, c.customerNumber ?? 0), 0);
        const today      = new Date().toISOString().slice(0, 10);
        const newCustomer: Customer = {
          id:             `cust-web-${Date.now().toString().slice(-8)}`,
          customerNumber: maxNum + 1,
          firstName:      form.firstName,
          lastName:       form.lastName,
          email:          form.email,
          phone:          form.phone,
          country:        form.country,
          city:           form.city,
          address:        `${form.address.trim()}, ${form.postalCode.trim()}`,
          totalBookings:  1,
          totalSpent:     estimate,
          vip:            false,
          joinedDate:     today,
          lastBooking:    form.startDate,
        };
        updatedCusts = [...custs, newCustomer];
      }
      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updatedCusts));

      /* ── Write to portal store (account modes only) ── */
      if (form.accountMode !== "guest") {
        const portalBooking = {
          ...adminBooking,
          boatType:   selectedVessel.type,
          captain:    "To be assigned",
          basePort:   selectedVessel.specifications.homePort,
          itinerary:  "",
          invoiceId:  `INV-${id}`,
          contractId: null,
        };
        const portalRaw  = localStorage.getItem(PORTAL_STORAGE_KEY);
        const portalList = portalRaw ? JSON.parse(portalRaw) : [];
        localStorage.setItem(PORTAL_STORAGE_KEY, JSON.stringify([portalBooking, ...portalList]));
      }
    } catch { /* localStorage write failed — submission still proceeds */ }

    /* Brief pause to make the loading state feel intentional. */
    await new Promise((r) => setTimeout(r, 700));
    setBookingRef(id.toUpperCase());
    setSubmitting(false);
    setSubmitted(true);
  }

  /* ── Step content renderers ── */

  /** Step 1: Charter type selector, date/hour inputs, guest counter, notes. */
  function renderStep1() {
    return (
      <div className="space-y-6 px-6 py-6">
        {/* Charter type */}
        <div>
          <p className={LABEL}>Charter Type</p>
          {/* Two-column grid: Multi-Day | Hourly */}
          <div className="grid grid-cols-2 gap-3">
            {CHARTER_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => handleTypeChange(t.key)}
                className={`p-3 border text-left transition-colors ${
                  form.charterType === t.key
                    ? "border-gold bg-gold/10 text-foreground"
                    : "border-border/50 text-muted-foreground hover:border-gold/30 hover:text-foreground"
                }`}
              >
                <p className="text-xs font-body font-semibold">{t.label}</p>
                <p className="text-[10px] font-body text-muted-foreground/60 mt-0.5 leading-tight">{t.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Date / duration inputs (adapt to charter type) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>
              {form.charterType === "multi-day" ? "Departure Date" : "Date"} *
            </label>
            <input
              type="date"
              value={form.startDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => set("startDate", e.target.value)}
              className={INPUT}
            />
          </div>

          {/* Multi-day → return date */}
          {form.charterType === "multi-day" && (
            <div>
              <label className={LABEL}>Return Date *</label>
              <input
                type="date"
                value={form.endDate}
                min={form.startDate || new Date().toISOString().slice(0, 10)}
                onChange={(e) => set("endDate", e.target.value)}
                className={INPUT}
              />
            </div>
          )}

          {/* Hourly → duration stepper */}
          {form.charterType === "hourly" && (
            <div>
              <label className={LABEL}>Duration *</label>
              <div className="flex items-center border border-border bg-background">
                <button
                  onClick={() => set("hours", Math.max(1, form.hours - 1))}
                  className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground border-r border-border transition-colors text-lg"
                >−</button>
                <span className="flex-1 text-center text-foreground text-sm font-body">
                  {form.hours} hour{form.hours !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={() => set("hours", Math.min(12, form.hours + 1))}
                  className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground border-l border-border transition-colors text-lg"
                >+</button>
              </div>
            </div>
          )}
        </div>

        {/* Night count hint for multi-day */}
        {form.charterType === "multi-day" && form.startDate && form.endDate && nights > 0 && (
          <p className="text-gold text-xs font-body -mt-2">
            {nights} night{nights !== 1 ? "s" : ""} selected
          </p>
        )}

        {/* ── Availability indicator (vessel mode only) ── */}
        {/* Shows once dates are entered whether the pre-selected vessel is free */}
        {vesselMode && isVesselAvailableForDates !== null && (
          <div className={`flex items-center gap-2 text-xs font-body px-3 py-2.5 border -mt-2 ${
            isVesselAvailableForDates
              ? "bg-emerald-500/8 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/8 border-red-500/20 text-red-400"
          }`}>
            {isVesselAvailableForDates ? (
              <><Check size={12} strokeWidth={2.5} className="shrink-0" />
                <span><strong>{selectedVessel?.name}</strong> is available for your selected dates.</span>
              </>
            ) : (
              <><AlertCircle size={12} className="shrink-0" />
                <span><strong>{selectedVessel?.name}</strong> is not available for these dates — please select different dates.</span>
              </>
            )}
          </div>
        )}

        {/* ── Availability calendar ── */}
        {/* Visual month grid showing booked dates so the user can pick
            free periods without guessing. Vessel mode shows only that
            vessel's bookings; generic mode shows all-fleet activity. */}
        <DateAvailabilityCalendar
          vesselId={vesselMode ? selectedVessel?.id : undefined}
          vesselName={selectedVessel?.name}
          selectedStart={form.startDate}
          selectedEnd={form.endDate}
          charterType={form.charterType}
        />

        {/* Guest counter */}
        <div>
          <label className={LABEL}>Number of Guests *</label>
          <div className="flex items-center border border-border bg-background w-44">
            <button
              onClick={() => set("guests", Math.max(1, form.guests - 1))}
              className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground border-r border-border transition-colors text-lg"
            >−</button>
            <span className="flex-1 text-center text-foreground text-sm font-body flex items-center justify-center gap-1.5">
              <Users size={12} className="text-gold/50" aria-hidden />
              {form.guests} guest{form.guests !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => set("guests", form.guests + 1)}
              className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground border-l border-border transition-colors text-lg"
            >+</button>
          </div>
        </div>

        {/* Special requests */}
        <div>
          <label className={LABEL}>Special Requests <span className="normal-case tracking-normal opacity-60">(optional)</span></label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            placeholder="Dietary requirements, special occasions, preferred itinerary, celebrations…"
            className={`${INPUT} resize-none`}
          />
        </div>
      </div>
    );
  }

  /**
   * Full detail view for one vessel, shown inside step 2 when the user
   * clicks "Details" on a card. Includes:
   *  - Photo carousel with prev/next arrows, photo counter, thumbnail strip
   *  - Availability badge, estimated price
   *  - Full description, specification table, amenity chips
   *  - "Select This Vessel" CTA (returns to grid on select)
   */
  function renderVesselDetail() {
    if (!detailVessel) return null;

    /** Primary image first, followed by any gallery shots. */
    const photos       = [detailVessel.images.primary, ...(detailVessel.images.gallery ?? [])].filter(Boolean);
    const total        = photos.length;
    const isSelected   = form.vesselId === detailVessel.id;
    const booked       = bookedIds.has(detailVessel.id) || detailVessel.status === "maintenance";
    const overCapacity = detailVessel.capacity.guests < form.guests;
    const unavailable  = booked || overCapacity;
    const priceEst     = calcEstimate(detailVessel, form.charterType, form.hours, nights);

    return (
      <div>
        {/* ── Back link ── */}
        <div className="px-6 pt-5 pb-3">
          <button
            onClick={() => setDetailVessel(null)}
            className="flex items-center gap-1.5 text-xs font-body uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={12} /> Back to Fleet
          </button>
        </div>

        {/* ── Photo carousel ── */}
        <div className="aspect-[16/9] relative overflow-hidden bg-muted/10">
          <img
            key={photos[galleryIdx]}
            src={photos[galleryIdx]}
            alt={`${detailVessel.name} — photo ${galleryIdx + 1}`}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Vessel name / model overlay */}
          <div className="absolute bottom-4 left-5">
            <p className="text-gold text-[10px] font-body tracking-[0.2em] uppercase mb-0.5">{detailVessel.type}</p>
            <h3 className="font-heading text-2xl text-white leading-tight">{detailVessel.name}</h3>
            <p className="text-white/55 text-xs font-body mt-0.5">
              {detailVessel.manufacturer} {detailVessel.model} · {detailVessel.year}
            </p>
          </div>

          {/* Photo counter badge */}
          {total > 1 && (
            <div className="absolute top-3 right-3 bg-black/55 backdrop-blur-sm border border-white/10 text-white text-[10px] font-body px-2 py-0.5">
              {galleryIdx + 1} / {total}
            </div>
          )}

          {/* Prev / Next arrows */}
          {total > 1 && (
            <>
              <button
                onClick={() => setGalleryIdx((i) => (i - 1 + total) % total)}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm border border-white/10 text-white p-1.5 hover:bg-black/75 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setGalleryIdx((i) => (i + 1) % total)}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm border border-white/10 text-white p-1.5 hover:bg-black/75 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </>
          )}
        </div>

        {/* ── Thumbnail strip ── */}
        {total > 1 && (
          <div className="flex gap-1.5 px-6 py-3 overflow-x-auto border-b border-sidebar-border bg-sidebar/60">
            {photos.map((src, i) => (
              <button
                key={i}
                onClick={() => setGalleryIdx(i)}
                aria-label={`Photo ${i + 1}`}
                className={`w-14 h-9 shrink-0 border-2 overflow-hidden transition-all ${
                  i === galleryIdx
                    ? "border-gold opacity-100"
                    : "border-transparent opacity-35 hover:opacity-65"
                }`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* ── Detail body ── */}
        <div className="px-6 py-5 space-y-5">

          {/* Availability badge + estimated price */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {unavailable ? (
                <span className="text-xs font-body font-medium px-2 py-0.5 border bg-red-950/80 text-red-300 border-red-500/40">
                  {overCapacity ? "Exceeds capacity" : "Unavailable"}
                </span>
              ) : (
                <span className="text-xs font-body font-medium px-2 py-0.5 border bg-emerald-950/80 text-emerald-300 border-emerald-500/40">
                  Available
                </span>
              )}
              {detailVessel.featured && (
                <span className="text-xs font-body font-medium px-2 py-0.5 border bg-black/50 text-gold border-gold/40 flex items-center gap-1">
                  <Star size={9} fill="currentColor" aria-hidden /> Featured
                </span>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-muted-foreground/40 font-body uppercase tracking-[0.1em] mb-0.5">Estimated</p>
              <p className="font-heading text-xl text-gold">
                ${priceEst.toLocaleString()}
                {form.charterType === "hourly" && (
                  <span className="text-xs text-muted-foreground font-body font-normal"> /hr</span>
                )}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm font-body leading-relaxed">
            {detailVessel.description}
          </p>

          {/* Key specifications — 2-column grid */}
          <div>
            <p className="text-[10px] text-muted-foreground font-body tracking-[0.15em] uppercase mb-2">Specifications</p>
            <div className="grid grid-cols-2 gap-x-6">
              {([
                { label: "Day Guests",     val: String(detailVessel.capacity.guests) },
                { label: "Length",         val: detailVessel.length },
                { label: "Max Speed",      val: detailVessel.specifications.maxSpeed },
                { label: "Cruising Speed", val: detailVessel.specifications.cruisingSpeed },
                { label: "Engines",        val: detailVessel.specifications.engines },
                { label: "Home Port",      val: detailVessel.specifications.homePort },
              ] as { label: string; val: string }[]).map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-border/20">
                  <p className="text-muted-foreground/60 text-xs font-body">{label}</p>
                  <p className="text-foreground text-xs font-body font-medium">{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities & features chips */}
          <div>
            <p className="text-[10px] text-muted-foreground font-body tracking-[0.15em] uppercase mb-2">Amenities &amp; Features</p>
            <div className="flex flex-wrap gap-1.5">
              {detailVessel.features.map((f) => (
                <span key={f} className="text-[10px] font-body text-muted-foreground/70 border border-border/30 px-2 py-0.5">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Select / already-selected CTA */}
          <button
            disabled={unavailable}
            onClick={() => { set("vesselId", detailVessel.id); setDetailVessel(null); }}
            className={`w-full py-3 text-xs font-body font-semibold tracking-[0.15em] uppercase transition-colors flex items-center justify-center gap-2 ${
              isSelected
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 cursor-default"
                : unavailable
                ? "bg-muted/20 border border-border/20 text-muted-foreground/40 cursor-not-allowed"
                : "bg-gold text-midnight hover:bg-gold-light"
            }`}
          >
            {isSelected
              ? <><Check size={13} strokeWidth={3} /> Vessel Selected</>
              : "Select This Vessel"}
          </button>
        </div>
      </div>
    );
  }

  /**
   * Step 2: Vessel picker.
   *
   * Has two internal modes toggled by `detailVessel`:
   *  - Grid mode   (detailVessel === null) — 2-column card grid, each card has a
   *    "Details →" link that switches to detail mode without selecting the vessel.
   *  - Detail mode (detailVessel !== null) — full photo carousel + specs + CTA.
   *    "Back to Fleet" returns to grid mode.
   *
   * Animated with AnimatePresence so the two modes slide in opposite directions.
   */
  function renderStep2() {
    return (
      <AnimatePresence mode="wait">
        {detailVessel ? (
          /* ── Detail view: slides in from the right ── */
          <motion.div
            key={`detail-${detailVessel.id}`}
            initial={{ opacity: 0, x: 20  }}
            animate={{ opacity: 1, x: 0   }}
            exit={{    opacity: 0, x: 20  }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            {renderVesselDetail()}
          </motion.div>
        ) : (
          /* ── Fleet grid: slides in from the left when returning ── */
          <motion.div
            key="vessel-grid"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0   }}
            exit={{    opacity: 0, x: -16 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            <div className="space-y-4 px-6 py-6">

              {/* ── Date / availability summary bar ── */}
              {form.startDate ? (() => {
                /* Count how many vessels are free for the chosen dates */
                const availableCount = boatsConfig.fleet.filter(
                  (b) => !bookedIds.has(b.id) && b.status !== "maintenance" && b.capacity.guests >= form.guests,
                ).length;
                const endDisplay =
                  form.charterType === "multi-day" && form.endDate
                    ? ` → ${fmtDate(form.endDate)}`
                    : form.charterType === "hourly"
                    ? ` · ${form.hours} hour${form.hours !== 1 ? "s" : ""}`
                    : "";
                return (
                  <div className="flex items-center justify-between gap-3 bg-gold/5 border border-gold/15 px-4 py-2.5 -mx-0">
                    <div>
                      <p className="text-gold text-[9px] font-body tracking-[0.2em] uppercase mb-0.5">Selected Dates</p>
                      <p className="text-foreground text-xs font-body font-medium">
                        {fmtDate(form.startDate)}{endDisplay}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-muted-foreground/40 text-[9px] font-body tracking-[0.12em] uppercase mb-0.5">Available</p>
                      <p className={`text-sm font-body font-semibold ${
                        availableCount > 0 ? "text-emerald-400" : "text-red-400"
                      }`}>
                        {availableCount} of {boatsConfig.fleet.length} vessels
                      </p>
                    </div>
                  </div>
                );
              })() : (
                /* No dates entered yet — nudge the user */
                <div className="flex items-center gap-2.5 bg-sidebar border border-border/40 px-4 py-2.5 text-muted-foreground/50">
                  <AlertCircle size={13} className="shrink-0 text-gold/40" />
                  <p className="text-xs font-body">
                    Go back to <span className="text-foreground/70">Step 1</span> and enter your charter dates to see live vessel availability.
                  </p>
                </div>
              )}

              <p className="text-muted-foreground/50 text-[10px] font-body">
                Click a card to select a vessel, or{" "}
                <span className="text-muted-foreground/80">Details</span>{" "}
                to see full photos and specifications.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {boatsConfig.fleet.map((boat) => {
                  const booked       = bookedIds.has(boat.id) || boat.status === "maintenance";
                  const overCapacity = boat.capacity.guests < form.guests;
                  const unavailable  = booked || overCapacity;
                  const selected     = form.vesselId === boat.id;
                  const priceEst     = calcEstimate(boat, form.charterType, form.hours, nights);

                  return (
                    /*
                     * The card is a <div> rather than a <button> because it contains
                     * two interactive children: the photo (selects the vessel) and the
                     * "Details" link (opens the detail view). Nesting buttons is invalid HTML.
                     */
                    <div
                      key={boat.id}
                      className={`relative border overflow-hidden transition-all ${
                        selected      ? "border-gold ring-1 ring-gold/30"
                        : unavailable ? "border-border/20 opacity-40"
                        : "border-border/50 hover:border-gold/30"
                      }`}
                    >
                      {/* Vessel photo — clicking selects the vessel */}
                      <button
                        disabled={unavailable}
                        onClick={() => set("vesselId", boat.id)}
                        className="block w-full text-left disabled:cursor-not-allowed"
                        aria-label={`Select ${boat.name}`}
                      >
                        <div className="aspect-[16/9] relative overflow-hidden bg-muted/10">
                          <img
                            src={boat.images.primary}
                            alt={boat.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                          {/* Selected tick */}
                          {selected && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-gold rounded-full flex items-center justify-center">
                              <Check size={10} className="text-midnight" strokeWidth={3} />
                            </div>
                          )}

                          {/* Unavailable overlay */}
                          {unavailable && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white/70 text-[10px] font-body tracking-[0.15em] uppercase">
                                {overCapacity ? "Exceeds capacity" : "Unavailable"}
                              </span>
                            </div>
                          )}

                          {/* Featured badge */}
                          {boat.featured && !unavailable && (
                            <span className="absolute top-2 left-2 text-[9px] font-body font-medium px-1.5 py-0.5 border bg-black/60 text-gold border-gold/40 backdrop-blur-sm flex items-center gap-1">
                              <Star size={8} fill="currentColor" aria-hidden /> Featured
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Vessel info row */}
                      <div className="px-3 pt-2.5 pb-1">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <p className="text-gold text-[9px] tracking-[0.2em] uppercase font-body">{boat.type}</p>
                          {/* Inline availability badge — only shown once dates are entered */}
                          {form.startDate && (
                            <span className={`text-[9px] font-body font-medium px-1.5 py-px border shrink-0 ${
                              boat.status === "maintenance"
                                ? "bg-amber-950/60 text-amber-400 border-amber-500/30"
                                : overCapacity
                                ? "bg-red-950/60 text-red-400 border-red-500/30"
                                : bookedIds.has(boat.id)
                                ? "bg-red-950/60 text-red-400 border-red-500/30"
                                : "bg-emerald-950/60 text-emerald-400 border-emerald-500/30"
                            }`}>
                              {boat.status === "maintenance"
                                ? "Maintenance"
                                : overCapacity
                                ? "Over capacity"
                                : bookedIds.has(boat.id)
                                ? "Booked"
                                : "Available"}
                            </span>
                          )}
                        </div>
                        <p className="font-heading text-base text-foreground leading-tight">{boat.name}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <p className="text-muted-foreground text-[10px] font-body flex items-center gap-1">
                            <Users size={9} className="text-gold/50" aria-hidden />
                            Up to {boat.capacity.guests} guests
                          </p>
                          {/* Show estimated price only when dates are set, otherwise show base rate */}
                          <p className="font-heading text-sm text-gold">
                            {form.startDate
                              ? `$${priceEst.toLocaleString()}`
                              : `$${(form.charterType === "hourly" ? boat.pricing.perHour : boat.pricing.perDay).toLocaleString()}${
                                  form.charterType === "hourly" ? "/hr" : "/day"
                                }`}
                          </p>
                        </div>
                      </div>

                      {/* "Details →" — opens detail view without selecting the vessel */}
                      <div className="px-3 pb-3 flex justify-end">
                        <button
                          onClick={() => { setDetailVessel(boat); setGalleryIdx(0); }}
                          className="flex items-center gap-0.5 text-[10px] font-body text-muted-foreground/45 hover:text-gold transition-colors"
                        >
                          Details <ChevronRight size={9} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  /** Step 3: Personal contact details and billing address. */
  function renderStep3() {
    return (
      <div className="space-y-4 px-6 py-6">

        {/* ── Name ── */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>First Name *</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              placeholder="Alexander"
              className={INPUT}
              autoComplete="given-name"
            />
          </div>
          <div>
            <label className={LABEL}>Last Name *</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              placeholder="Dupont"
              className={INPUT}
              autoComplete="family-name"
            />
          </div>
        </div>

        {/* ── Contact ── */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Email Address *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@example.com"
              className={INPUT}
              autoComplete="email"
            />
          </div>
          <div>
            <label className={LABEL}>Phone <span className="normal-case tracking-normal opacity-60">(optional)</span></label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+1 555 000 0000"
              className={INPUT}
              autoComplete="tel"
            />
          </div>
        </div>

        {/* ── Address ── */}
        <div
          className="pt-2 border-t border-border/30"
        >
          <p className="text-[10px] text-muted-foreground/50 font-body tracking-[0.12em] uppercase mb-3">Billing Address</p>
          <div className="space-y-3">
            <div>
              <label className={LABEL}>Street Address *</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="14 Rue de la Paix"
                className={INPUT}
                autoComplete="street-address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>City *</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Monaco"
                  className={INPUT}
                  autoComplete="address-level2"
                />
              </div>
              <div>
                <label className={LABEL}>Postal Code *</label>
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => set("postalCode", e.target.value)}
                  placeholder="98000"
                  className={INPUT}
                  autoComplete="postal-code"
                />
              </div>
            </div>
            <div>
              <label className={LABEL}>Country *</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                placeholder="France"
                className={INPUT}
                autoComplete="country-name"
              />
            </div>
          </div>
        </div>

        <p className="text-muted-foreground/40 text-[10px] font-body">
          * Required. Your details are used only to process this booking enquiry and will not be shared with third parties.
        </p>
      </div>
    );
  }

  /**
   * Step 4: Booking summary, account choice (guest / login / create),
   * optional auth credential fields, and mandatory legal checkboxes.
   */
  function renderStep4() {
    /* Precomputed summary values to keep the JSX clean. */
    const typeLabel = CHARTER_TYPES.find((c) => c.key === form.charterType)?.label ?? "";
    const typeLine  = form.charterType === "multi-day"
      ? `${typeLabel} · ${nights} night${nights !== 1 ? "s" : ""}`
      : form.charterType === "hourly"
      ? `${typeLabel} · ${form.hours}h`
      : typeLabel;

    const summaryRows: { label: string; value: string }[] = [
      { label: "Vessel",    value: selectedVessel?.name ?? "—" },
      { label: "Type",      value: typeLine },
      { label: "Departure", value: form.startDate ? fmtDate(form.startDate) : "—" },
      ...(form.charterType === "multi-day" && form.endDate
        ? [{ label: "Return", value: fmtDate(form.endDate) }]
        : []),
      { label: "Guests",    value: `${form.guests} guest${form.guests !== 1 ? "s" : ""}` },
      { label: "Contact",   value: `${form.firstName} ${form.lastName} · ${form.email}` },
    ];

    return (
      <div className="space-y-6 px-6 py-6">

        {/* ── Booking summary card ── */}
        <div className="border border-border/50 overflow-hidden">
          <p className="text-muted-foreground/50 text-[9px] font-body tracking-[0.25em] uppercase px-4 py-2.5 border-b border-border/30 bg-sidebar/50">
            Booking Summary
          </p>
          {summaryRows.map(({ label, value }, i) => (
            <div
              key={label}
              className={`flex items-start justify-between px-4 py-2 gap-4 ${i % 2 === 0 ? "bg-background/20" : ""}`}
            >
              <p className="text-muted-foreground text-xs font-body shrink-0">{label}</p>
              <p className="text-foreground text-xs font-body font-medium text-right">{value}</p>
            </div>
          ))}
          {/* Estimated fee highlight row */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gold/20 bg-gold/5">
            <div>
              <p className="text-muted-foreground text-xs font-body">Estimated charter fee</p>
              <p className="text-muted-foreground/40 text-[10px] font-body mt-0.5">
                Deposit: ${Math.round(estimate * (selectedVessel?.pricing.depositPercent ?? 30) / 100).toLocaleString()} · fuel &amp; provisioning billed separately
              </p>
            </div>
            <p className="font-heading text-2xl text-gold">${estimate.toLocaleString()}</p>
          </div>
        </div>

        {/* ── Account choice ── */}
        <div>
          <p className={LABEL}>How would you like to proceed?</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {([
              { mode: "guest"  as AccountMode, Icon: UserCheck, label: "Guest",          sub: "No account needed"   },
              { mode: "login"  as AccountMode, Icon: LogIn,     label: "Sign In",        sub: "Existing account"    },
              { mode: "create" as AccountMode, Icon: UserPlus,  label: "Create Account", sub: "New to Oceanique"    },
            ]).map(({ mode, Icon, label, sub }) => (
              <button
                key={mode}
                onClick={() => { set("accountMode", mode); setAuthError(""); }}
                className={`p-3 border text-center transition-colors ${
                  form.accountMode === mode
                    ? "border-gold bg-gold/10 text-foreground"
                    : "border-border/50 text-muted-foreground hover:border-gold/30"
                }`}
              >
                <Icon
                  size={16}
                  aria-hidden
                  className={`mx-auto mb-1.5 ${form.accountMode === mode ? "text-gold" : "text-muted-foreground/40"}`}
                />
                <p className="text-[11px] font-body font-semibold leading-tight">{label}</p>
                <p className="text-[9px] font-body text-muted-foreground/55 mt-0.5">{sub}</p>
              </button>
            ))}
          </div>

          {/* Guest upsell banner */}
          <AnimatePresence mode="wait">
            {form.accountMode === "guest" && (
              <motion.div
                key="guest-banner"
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="bg-gold/5 border border-gold/20 p-3.5 mb-4"
              >
                <p className="text-gold text-[11px] font-body font-semibold mb-1.5">
                  Create a free account after booking to:
                </p>
                <ul className="text-muted-foreground text-xs font-body space-y-0.5">
                  <li>· Track your booking status &amp; request changes online</li>
                  <li>· Earn loyalty points on every charter voyage</li>
                  <li>· Access exclusive member rates &amp; priority concierge support</li>
                </ul>
              </motion.div>
            )}

            {/* Sign-in credential fields */}
            {form.accountMode === "login" && (
              <motion.div
                key="login-fields"
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="space-y-3 mb-4"
              >
                <input
                  type="email"
                  value={form.loginEmail}
                  onChange={(e) => set("loginEmail", e.target.value)}
                  placeholder="Email address"
                  className={INPUT}
                  autoComplete="email"
                />
                <input
                  type="password"
                  value={form.loginPassword}
                  onChange={(e) => set("loginPassword", e.target.value)}
                  placeholder="Password"
                  className={INPUT}
                  autoComplete="current-password"
                />
              </motion.div>
            )}

            {/* Create-account credential fields */}
            {form.accountMode === "create" && (
              <motion.div
                key="create-fields"
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="space-y-3 mb-4"
              >
                <input
                  type="email"
                  value={form.createEmail}
                  onChange={(e) => set("createEmail", e.target.value)}
                  placeholder="Email address"
                  className={INPUT}
                  autoComplete="email"
                />
                <input
                  type="password"
                  value={form.createPassword}
                  onChange={(e) => set("createPassword", e.target.value)}
                  placeholder="Create a password"
                  className={INPUT}
                  autoComplete="new-password"
                />
                <p className="text-muted-foreground/40 text-[10px] font-body">
                  Your booking will be automatically linked to this account.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Auth error */}
          {authError && (
            <div className="flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/20 mb-4">
              <AlertCircle size={12} className="text-red-400 shrink-0" aria-hidden />
              <p className="text-red-400 text-xs font-body">{authError}</p>
            </div>
          )}
        </div>

        {/* ── Legal checkboxes ── */}
        <div className="space-y-3 pt-4 border-t border-border/30">
          <p className="text-muted-foreground/50 text-[10px] font-body tracking-[0.12em] uppercase flex items-center gap-1.5">
            <Shield size={11} aria-hidden /> Legal &amp; Consent
          </p>

          {([
            {
              key: "acceptTerms"     as const,
              label: "I accept the",
              link: { text: "Terms & Conditions", href: "/terms" },
              required: true,
            },
            {
              key: "acceptPrivacy"   as const,
              label: "I have read and agree to the",
              link: { text: "Privacy Policy", href: "/privacy" },
              required: true,
            },
            {
              key: "acceptMarketing" as const,
              label: "I'd like to receive news about exclusive offers and events",
              link: null,
              required: false,
            },
          ] as const).map(({ key, label, link, required }) => (
            <label key={key} className="flex items-start gap-2.5 cursor-pointer group">
              {/* Custom checkbox */}
              <button
                role="checkbox"
                aria-checked={form[key]}
                onClick={() => set(key, !form[key])}
                className={`mt-0.5 w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${
                  form[key] ? "bg-gold border-gold" : "border-border group-hover:border-gold/50"
                }`}
              >
                {form[key] && <Check size={9} className="text-midnight" strokeWidth={3} />}
              </button>
              {/* Label text */}
              <span className="text-sm font-body text-muted-foreground leading-snug">
                {label}{" "}
                {link && (
                  <Link href={link.href} className="text-gold hover:text-gold-light underline underline-offset-2 transition-colors">
                    {link.text}
                  </Link>
                )}
                {required && <span className="text-gold ml-0.5">*</span>}
              </span>
            </label>
          ))}
          <p className="text-muted-foreground/35 text-[10px] font-body pt-1">
            * Required to submit your enquiry. Your data is processed in accordance with our Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  /** Success screen shown after the booking has been submitted. */
  function renderSuccess() {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center px-6 py-14"
      >
        {/* Check icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-5">
          <Check size={24} className="text-emerald-400" />
        </div>

        <p className="text-gold text-[10px] tracking-[0.3em] uppercase font-body mb-2">Request Submitted</p>
        <h3 className="font-heading text-3xl text-foreground mb-3">Your Enquiry Is With Us</h3>
        <p className="text-muted-foreground text-sm font-body mb-6 max-w-sm leading-relaxed">
          Our concierge team will contact you within 24 hours to confirm availability,
          arrange your contract, and collect the deposit.
        </p>

        {/* Reference number */}
        <div className="bg-sidebar border border-sidebar-border px-6 py-3 mb-8">
          <p className="text-muted-foreground/40 text-[10px] font-body tracking-[0.25em] uppercase mb-0.5">Booking Reference</p>
          <p className="font-heading text-xl text-gold">{bookingRef}</p>
        </div>

        {/* Guest upsell — only shown when no account was chosen */}
        {form.accountMode === "guest" && (
          <div className="w-full max-w-sm bg-gold/5 border border-gold/20 p-4 mb-7 text-left">
            <p className="text-gold text-xs font-body font-semibold mb-1.5">
              Manage your booking online — create a free account
            </p>
            <p className="text-muted-foreground text-xs font-body leading-relaxed mb-3">
              Track status, earn loyalty points, and get priority concierge support
              by creating a free Oceanique member account.
            </p>
            <Link
              href="/portal"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-body font-semibold tracking-[0.12em] uppercase text-midnight bg-gold px-4 py-2 hover:bg-gold-light transition-colors"
            >
              Create Account <ChevronRight size={11} />
            </Link>
          </div>
        )}

        {/* CTA row */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-border text-sm font-body text-muted-foreground hover:text-foreground hover:border-gold/30 transition-colors"
          >
            Close
          </button>
          <Link
            href="/portal/bookings"
            onClick={onClose}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-gold/10 border border-gold/20 text-gold text-sm font-body hover:bg-gold/20 transition-colors"
          >
            View in Portal <ChevronRight size={13} />
          </Link>
        </div>
      </motion.div>
    );
  }

  /* ── Render ── */

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="wb-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[60]"
            onClick={submitted ? onClose : undefined}
          />

          {/* ── Modal panel ── */}
          <motion.div
            key="wb-modal"
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-sidebar border border-sidebar-border shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >

              {/* ── Header: step indicator + close ── */}
              <div className="flex items-center gap-4 px-5 py-4 border-b border-sidebar-border shrink-0">
                {submitted ? (
                  /* On success, show brand name instead of step dots */
                  <div className="flex-1">
                    <p className="text-gold text-[10px] tracking-[0.3em] uppercase font-body">OCEANIQUE</p>
                    <p className="text-muted-foreground/50 text-[10px] font-body mt-0.5">Charter Enquiry</p>
                  </div>
                ) : (
                  <StepIndicator step={step} vesselMode={vesselMode} />
                )}
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0"
                  aria-label="Close booking form"
                >
                  <X size={18} />
                </button>
              </div>

              {/* ── Vessel banner (vessel mode only) ── */}
              {/* Shows the pre-selected vessel above the step content so the user
                  always knows which yacht they are booking. */}
              {vesselMode && selectedVessel && !submitted && (
                <div className="px-5 pt-4 pb-0 shrink-0">
                  <div className="flex items-center gap-3 bg-gold/5 border border-gold/15 px-4 py-3">
                    {/* Vessel thumbnail */}
                    <div className="w-16 h-11 shrink-0 overflow-hidden bg-muted/20">
                      <img
                        src={selectedVessel.images.primary}
                        alt={selectedVessel.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Vessel name + type */}
                    <div className="flex-1 min-w-0">
                      <p className="text-gold text-[9px] font-body tracking-[0.2em] uppercase mb-0.5">
                        {selectedVessel.type}
                      </p>
                      <p className="font-heading text-lg text-foreground leading-tight truncate">
                        {selectedVessel.name}
                      </p>
                      <p className="text-muted-foreground/40 text-[10px] font-body">
                        {selectedVessel.manufacturer} · {selectedVessel.length} · {selectedVessel.capacity.guests} guests
                      </p>
                    </div>
                    {/* Rate — mirrors the charter type selected in the fleet section toggle */}
                    <div className="text-right shrink-0">
                      <p className="text-muted-foreground/40 text-[9px] font-body tracking-[0.12em] uppercase">From</p>
                      <p className="text-foreground text-sm font-body font-semibold">
                        {form.charterType === "hourly"
                          ? `$${selectedVessel.pricing.perHour.toLocaleString()}`
                          : `$${selectedVessel.pricing.perDay.toLocaleString()}`}
                        <span className="text-muted-foreground/40 text-[10px] font-body font-normal">
                          {form.charterType === "hourly" ? "/hr" : "/day"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step title (hidden on success) ── */}
              {!submitted && (() => {
                /* In vessel mode map internal step to display number and label */
                const displayNum = vesselMode
                  ? step === 1 ? 1 : step === 3 ? 2 : 3
                  : step;
                const totalSteps = vesselMode ? 3 : 4;
                const label = vesselMode
                  ? VESSEL_STEP_LABELS[displayNum - 1]
                  : STEP_LABELS[step - 1];
                return (
                  <div className="px-6 pt-5 pb-1 shrink-0">
                    <p className="text-gold text-[10px] tracking-[0.25em] uppercase font-body mb-0.5">
                      Step {displayNum} of {totalSteps}
                    </p>
                    <h2 className="font-heading text-2xl text-foreground">{label}</h2>
                  </div>
                );
              })()}

              {/* ── Scrollable step body ── */}
              <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={submitted ? "success" : step}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0  }}
                    exit={{    opacity: 0, x: -12 }}
                    transition={{ duration: 0.18, ease: EASE }}
                  >
                    {submitted  ? renderSuccess() :
                     step === 1 ? renderStep1()   :
                     step === 2 ? renderStep2()   :
                     step === 3 ? renderStep3()   :
                                  renderStep4()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* ── Footer: back + continue/submit (hidden on success) ── */}
              {!submitted && (
                <div className="shrink-0 border-t border-sidebar-border px-6 py-4 flex items-center justify-between bg-sidebar">
                  {/* Back button */}
                  {step > 1 ? (
                    <button
                      onClick={() => {
                        /* In vessel mode skip step 2 going backwards */
                        if (vesselMode && step === 3) setStep(1);
                        else setStep((s) => (s - 1) as Step);
                      }}
                      className="flex items-center gap-1.5 text-xs font-body tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronLeft size={13} /> Back
                    </button>
                  ) : <span />}

                  {/* Continue / Submit */}
                  {step < 4 ? (
                    <button
                      disabled={!canAdvance()}
                      onClick={() => {
                        /* In vessel mode skip step 2 going forwards */
                        if (vesselMode && step === 1) setStep(3);
                        else setStep((s) => (s + 1) as Step);
                      }}
                      className="flex items-center gap-2 bg-gold text-midnight text-xs font-body font-semibold tracking-[0.15em] uppercase px-7 py-2.5 hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Continue <ArrowRight size={13} />
                    </button>
                  ) : (
                    <button
                      disabled={!canSubmit() || submitting}
                      onClick={handleSubmit}
                      className="flex items-center gap-2 bg-gold text-midnight text-xs font-body font-semibold tracking-[0.15em] uppercase px-7 py-2.5 hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Submitting…" : "Submit Enquiry"} <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
