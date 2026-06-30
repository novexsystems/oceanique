/**
 * ============================================================
 * OCEANIQUE — AvailabilityCalendar (Dashboard)
 * ============================================================
 * Custom month-grid calendar with multi-day event bars,
 * per-vessel colour coding, month navigation, upcoming
 * charters sidebar, and a booking detail popup.
 *
 * Reads from the same localStorage key as the Bookings page
 * so status changes are reflected here automatically.
 * ============================================================
 */

"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, X, Anchor, Calendar, Users, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { boatsConfig } from "@/config/boats.config";
import { useBookings } from "@/contexts/BookingsContext";
import type { Booking, BookingStatus } from "@/types/booking";

/** One distinct colour per vessel */
const BOAT_COLORS: Record<string, string> = {
  "boat-001": "#C9A227",
  "boat-002": "#0D9488",
  "boat-003": "#818CF8",
  "boat-004": "#F43F5E",
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending:   "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded:  "Refunded",
};

const STATUS_CLS: Record<BookingStatus, string> = {
  pending:   "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  completed: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
  cancelled: "bg-red-500/15 text-red-300 border border-red-500/30",
  refunded:  "bg-purple-500/15 text-purple-300 border border-purple-500/30",
};

const DAYS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

/* ── Helpers ─────────────────────────────────────────────── */

function toMidnight(iso: string): Date {
  const d = new Date(iso); d.setHours(0,0,0,0); return d;
}
function todayMidnight(): Date {
  const d = new Date(); d.setHours(0,0,0,0); return d;
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}
function mondayOf(date: Date): Date {
  const d = new Date(date); d.setHours(0,0,0,0);
  const dow = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  return d;
}
/** Returns 42 days (6 rows × 7) for the calendar grid */
function calendarDays(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const start = mondayOf(first);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i); return d;
  });
}
function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}
function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day:"numeric", month:"short" });
}
function nightCount(start: string, end: string) {
  return Math.round((toMidnight(end).getTime() - toMidnight(start).getTime()) / 86_400_000);
}

/* ── Event layout ────────────────────────────────────────── */

interface EventSlot {
  booking: Booking;
  startCol:       number; // 0-6
  span:           number;
  row:            number; // 0,1,2 vertical stacking row
  continuesLeft:  boolean;
  continuesRight: boolean;
}

function layoutWeek(bookings: Booking[], week: Date[]): EventSlot[] {
  const wStart = week[0], wEnd = week[6];
  const relevant = bookings.filter(b => {
    if (b.status === "cancelled" || b.status === "refunded") return false;
    return toMidnight(b.startDate) <= wEnd && toMidnight(b.endDate) >= wStart;
  }).sort((a, b) => toMidnight(a.startDate).getTime() - toMidnight(b.startDate).getTime());

  const occupied: boolean[][] = Array.from({ length: 4 }, () => Array(7).fill(false));
  const slots: EventSlot[] = [];

  for (const booking of relevant) {
    const bs = toMidnight(booking.startDate);
    const be = toMidnight(booking.endDate);
    const continuesLeft  = bs < wStart;
    const continuesRight = be > wEnd;
    const effStart = continuesLeft  ? wStart : bs;
    const effEnd   = continuesRight ? wEnd   : be;

    const startCol = Math.round((effStart.getTime() - wStart.getTime()) / 86_400_000);
    const endCol   = Math.min(6, Math.round((effEnd.getTime() - wStart.getTime()) / 86_400_000));
    const span     = endCol - startCol + 1;

    let row = 0;
    for (let r = 0; r < 4; r++) {
      if (!occupied[r].slice(startCol, endCol + 1).some(Boolean)) { row = r; break; }
    }
    for (let c = startCol; c <= endCol; c++) occupied[row][c] = true;
    slots.push({ booking, startCol, span, row, continuesLeft, continuesRight });
  }
  return slots;
}

/* ── Component ───────────────────────────────────────────── */

export function AvailabilityCalendar() {
  const { bookings } = useBookings();

  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  const [selected, setSelected] = useState<Booking | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const today  = useMemo(() => todayMidnight(), []);
  const year   = currentDate.getFullYear();
  const month  = currentDate.getMonth();
  const days   = useMemo(() => calendarDays(year, month), [year, month]);
  const weeks  = useMemo(() => chunk(days, 7), [days]);

  /* Only show bookings that START in or before the displayed month;
     this prevents next-month events from appearing on the overflow rows
     at the bottom of the 6-week grid. */
  const visibleBookings = useMemo(() =>
    bookings.filter(b => {
      const s = toMidnight(b.startDate);
      return s.getFullYear() < year || (s.getFullYear() === year && s.getMonth() <= month);
    }),
  [bookings, year, month]);

  const upcoming = useMemo(() =>
    [...bookings]
      .filter(b => b.status !== "cancelled" && b.status !== "refunded" && toMidnight(b.startDate) >= today)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, 8),
  [bookings, today]);

  function prevMonth() { setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)); }
  function nextMonth() { setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)); }
  function goToday()   { setCurrentDate(new Date()); }

  /* ── Render ── */
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_288px] gap-6 items-start">

      {/* ── Main calendar ── */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-xl text-foreground">
              {MONTHS[month]}{" "}
              <span className="text-muted-foreground font-body text-base font-normal">{year}</span>
            </h2>
            <button
              onClick={goToday}
              className="text-[11px] font-body text-muted-foreground border border-border px-2.5 py-1 hover:text-foreground transition-colors"
            >
              Today
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-1.5 text-muted-foreground hover:text-foreground border border-border transition-colors">
              <ChevronLeft size={15} />
            </button>
            <button onClick={nextMonth} className="p-1.5 text-muted-foreground hover:text-foreground border border-border transition-colors">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {DAYS.map((d, i) => (
            <div key={d} className={`py-2 text-center text-[10px] font-body tracking-[0.15em] uppercase ${i >= 5 ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => {
          const slots = layoutWeek(visibleBookings, week);
          const maxRow = slots.reduce((m, s) => Math.max(m, s.row), -1);
          const rowH = 36 + (maxRow + 1) * 24 + 8;

          return (
            <div
              key={wi}
              className="relative border-b border-border/60 last:border-0"
              style={{ minHeight: `${Math.max(rowH, 72)}px` }}
            >
              {/* Day cells */}
              <div className="grid grid-cols-7 h-full">
                {week.map((day, di) => {
                  const inMonth  = day.getMonth() === month;
                  const isToday  = isSameDay(day, today);
                  const isWeekend = di >= 5;
                  return (
                    <div
                      key={di}
                      className={`border-r border-border/40 last:border-0 pt-1.5 pl-1.5 ${
                        !inMonth ? "opacity-25" : ""
                      } ${isWeekend ? "bg-muted/10" : ""}`}
                    >
                      <span className={`
                        text-[11px] font-body inline-flex items-center justify-center w-5 h-5
                        ${isToday
                          ? "bg-gold text-midnight font-semibold rounded-full"
                          : inMonth ? "text-muted-foreground" : "text-muted-foreground/40"
                        }
                      `}>
                        {day.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Event bars */}
              <div className="absolute inset-x-0 pointer-events-none" style={{ top: "30px" }}>
                {slots.map((slot, si) => {
                  const color = BOAT_COLORS[slot.booking.boatId] ?? "#6B7280";
                  const top  = slot.row * 24;
                  const left = `calc(${(slot.startCol / 7) * 100}% + ${slot.continuesLeft ? 0 : 2}px)`;
                  const width = `calc(${(slot.span / 7) * 100}% - ${(slot.continuesLeft ? 0 : 2) + (slot.continuesRight ? 0 : 2)}px)`;

                  return (
                    <button
                      key={si}
                      onClick={() => setSelected(slot.booking)}
                      onMouseEnter={() => setHoveredId(slot.booking.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className="absolute pointer-events-auto active:scale-[0.99] transition-all"
                      style={{ top, left, width, height: "20px" }}
                    >
                      <div
                        className="h-full flex items-center px-1.5 overflow-hidden text-[10px] font-body font-medium transition-all duration-150"
                        style={{
                          backgroundColor: hoveredId === slot.booking.id ? color + "44" : color + "22",
                          outline: hoveredId === slot.booking.id ? `1.5px solid ${color}` : "none",
                          outlineOffset: "-1px",
                          borderLeft: slot.continuesLeft ? "none" : `2.5px solid ${color}`,
                          borderRadius: slot.continuesLeft
                            ? (slot.continuesRight ? "0" : "0 2px 2px 0")
                            : (slot.continuesRight ? "2px 0 0 2px" : "2px"),
                          color,
                        }}
                      >
                        {!slot.continuesLeft && (
                          <span className="truncate leading-none">
                            {slot.booking.boatName}
                            <span className="opacity-75 ml-1">· {slot.booking.customerName}</span>
                            <span className="opacity-50 ml-1">· {STATUS_LABELS[slot.booking.status]}</span>
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="px-6 py-3 border-t border-border flex flex-wrap gap-x-5 gap-y-2">
          {boatsConfig.fleet.map(boat => (
            <div key={boat.id} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: BOAT_COLORS[boat.id] ?? "#6B7280" }} />
              <span className="text-xs font-body text-muted-foreground">{boat.name}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="w-2.5 h-2.5 rounded-sm bg-muted/40 border border-dashed border-border" />
            <span className="text-xs font-body text-muted-foreground/50">Cancelled / Refunded hidden</span>
          </div>
        </div>
      </div>

      {/* ── Upcoming charters sidebar ── */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <p className="text-gold text-[10px] font-body tracking-[0.2em] uppercase mb-0.5">Schedule</p>
          <h3 className="font-heading text-base text-foreground">Upcoming Charters</h3>
        </div>

        {upcoming.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-muted-foreground text-xs font-body">No upcoming charters scheduled.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {upcoming.map(b => {
              const color = BOAT_COLORS[b.boatId] ?? "#6B7280";
              const nights = nightCount(b.startDate, b.endDate);
              return (
                <button
                  key={b.id}
                  onClick={() => setSelected(b)}
                  onMouseEnter={() => setHoveredId(b.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`w-full px-5 py-3.5 text-left transition-colors ${
                    hoveredId === b.id ? "bg-muted/30" : "hover:bg-muted/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-0.5 self-stretch rounded-full shrink-0 mt-0.5" style={{ backgroundColor: color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-xs font-body font-semibold truncate leading-snug">
                        {b.customerName}
                      </p>
                      <p className="text-[10px] font-body font-medium mt-0.5" style={{ color }}>
                        {b.boatName}
                      </p>
                      <p className="text-muted-foreground text-[10px] font-body mt-0.5">
                        {fmtShort(b.startDate)} → {fmtShort(b.endDate)}
                        <span className="text-muted-foreground/50 ml-1">· {nights}n</span>
                      </p>
                    </div>
                    <span className={`text-[10px] font-body px-1.5 py-0.5 mt-0.5 shrink-0 ${STATUS_CLS[b.status]}`}>
                      {STATUS_LABELS[b.status]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Booking detail popup ── */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              key="cal-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setSelected(null)}
            />
            <motion.div
              key="cal-popup"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="w-full max-w-sm bg-card border border-border rounded-sm shadow-2xl pointer-events-auto"
                onClick={e => e.stopPropagation()}
              >
                {/* Popup header */}
                <div
                  className="px-5 py-4 border-b border-border flex items-start justify-between gap-3"
                  style={{ borderTop: `3px solid ${BOAT_COLORS[selected.boatId] ?? "#6B7280"}` }}
                >
                  <div>
                    <p className="text-[10px] font-body tracking-[0.2em] uppercase font-medium mb-0.5"
                       style={{ color: BOAT_COLORS[selected.boatId] ?? "#6B7280" }}>
                      {selected.boatName}
                    </p>
                    <h3 className="font-heading text-lg text-foreground leading-tight">{selected.customerName}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-mono text-[10px] text-muted-foreground">{selected.id}</span>
                      <span className={`text-[10px] font-body px-1.5 py-0.5 ${STATUS_CLS[selected.status]}`}>
                        {STATUS_LABELS[selected.status]}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0">
                    <X size={16} />
                  </button>
                </div>

                {/* Popup body */}
                <div className="px-5 py-4 space-y-3">
                  {[
                    { icon: <Anchor size={13} />,    label: "Vessel",  val: selected.boatName },
                    { icon: <Calendar size={13} />,  label: "Charter", val: `${fmtShort(selected.startDate)} → ${fmtShort(selected.endDate)} · ${nightCount(selected.startDate, selected.endDate)} nights` },
                    { icon: <Users size={13} />,      label: "Guests",  val: `${selected.guests} guests` },
                    { icon: <DollarSign size={13} />, label: "Total",   val: `$${selected.totalAmount.toLocaleString()} USD` },
                  ].map(row => (
                    <div key={row.label} className="flex items-start gap-3">
                      <span className="text-gold mt-0.5 shrink-0">{row.icon}</span>
                      <div>
                        <p className="text-muted-foreground text-[10px] font-body tracking-[0.12em] uppercase">{row.label}</p>
                        <p className="text-foreground text-sm font-body">{row.val}</p>
                      </div>
                    </div>
                  ))}
                  {selected.notes && (
                    <p className="text-muted-foreground text-xs font-body border-t border-border pt-3 leading-relaxed">
                      {selected.notes}
                    </p>
                  )}
                </div>

                <div className="px-5 pb-5">
                  <a
                    href="/dashboard/bookings"
                    className="block text-center text-[11px] font-body tracking-[0.15em] uppercase text-muted-foreground border border-border py-2 hover:text-foreground hover:border-border/80 transition-colors"
                  >
                    Manage in Bookings →
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
