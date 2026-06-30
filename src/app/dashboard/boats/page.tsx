/**
 * ============================================================
 * OCEANIQUE — Dashboard Fleet Page  (Route: /dashboard/boats)
 * ============================================================
 * Manage the yacht fleet: view all vessels, their status,
 * specs, and pricing. Add/edit boats via the BoatCard actions.
 *
 * Features:
 *  - Date-range availability filter (derived from live bookings)
 *  - Status filter tabs (All / Available / Booked / Maintenance)
 *  - Quick status toggle (available ↔ booked) per card
 *  - Manual status overrides persisted to localStorage
 * ============================================================
 */

"use client";

import { useState, useMemo } from "react";
import { boatsConfig } from "@/config/boats.config";
import { BoatCard } from "@/components/dashboard/BoatCard";
import { BoatFormModal } from "@/components/dashboard/BoatFormModal";
import { useBookings } from "@/contexts/BookingsContext";
import type { Boat, BoatStatus } from "@/types/boat";
import { CalendarDays, X } from "lucide-react";

const FLEET_STATUS_KEY = "oceanique_fleet_status_v1";

type StatusFilter = "all" | BoatStatus;

function loadStatusOverrides(): Record<string, BoatStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(FLEET_STATUS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveStatusOverride(id: string, status: BoatStatus) {
  try {
    const overrides = loadStatusOverrides();
    overrides[id] = status;
    localStorage.setItem(FLEET_STATUS_KEY, JSON.stringify(overrides));
  } catch {}
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** True if two date ranges overlap */
function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && aEnd > bStart;
}

export default function DashboardBoatsPage() {
  const { bookings } = useBookings();

  const [fleet, setFleet] = useState<Boat[]>(() =>
    boatsConfig.fleet.map((b) => {
      const overrides = loadStatusOverrides();
      return overrides[b.id] ? { ...b, status: overrides[b.id] } : { ...b };
    })
  );

  const [modalOpen, setModalOpen]     = useState(false);
  const [editingBoat, setEditingBoat] = useState<Boat | undefined>(undefined);
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd]     = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  /** For each vessel, compute effective status for the selected date range */
  const effectiveStatuses = useMemo(() => {
    const result: Record<string, { status: BoatStatus; conflictDates?: string }> = {};
    for (const boat of fleet) {
      if (boat.status === "maintenance") {
        result[boat.id] = { status: "maintenance" };
        continue;
      }
      if (filterStart && filterEnd && filterStart < filterEnd) {
        const conflict = bookings.find(
          (bk) =>
            bk.boatId === boat.id &&
            (bk.status === "confirmed" || bk.status === "pending") &&
            overlaps(bk.startDate, bk.endDate, filterStart, filterEnd)
        );
        if (conflict) {
          result[boat.id] = {
            status: "booked",
            conflictDates: `Booked ${fmtDate(conflict.startDate)} – ${fmtDate(conflict.endDate)}`,
          };
          continue;
        }
      }
      result[boat.id] = { status: boat.status };
    }
    return result;
  }, [fleet, bookings, filterStart, filterEnd]);

  /** Summary counts use effective statuses */
  const counts = useMemo(() => {
    const c = { available: 0, booked: 0, maintenance: 0 };
    for (const v of Object.values(effectiveStatuses)) c[v.status]++;
    return c;
  }, [effectiveStatuses]);

  const filtered = useMemo(() =>
    fleet.filter((b) => {
      if (statusFilter === "all") return true;
      return effectiveStatuses[b.id]?.status === statusFilter;
    }),
    [fleet, effectiveStatuses, statusFilter]
  );

  const isDateFiltered = !!(filterStart && filterEnd && filterStart < filterEnd);

  function openAdd() { setEditingBoat(undefined); setModalOpen(true); }
  function openEdit(boat: Boat) { setEditingBoat(boat); setModalOpen(true); }

  function handleSave(saved: Boat) {
    setFleet((prev) =>
      prev.some((b) => b.id === saved.id)
        ? prev.map((b) => (b.id === saved.id ? saved : b))
        : [...prev, saved]
    );
  }

  function handleToggleStatus(id: string, next: BoatStatus) {
    setFleet((prev) => prev.map((b) => b.id === id ? { ...b, status: next } : b));
    saveStatusOverride(id, next);
  }

  function clearDateFilter() { setFilterStart(""); setFilterEnd(""); }

  const INPUT = "bg-background border border-border text-foreground text-sm font-body px-3 py-2 focus:outline-none focus:border-gold/60 transition-colors";

  const STATUS_TABS: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all",         label: "All",         count: fleet.length },
    { key: "available",   label: "Available",   count: counts.available },
    { key: "booked",      label: "Booked",      count: counts.booked },
    { key: "maintenance", label: "Maintenance", count: counts.maintenance },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-3xl text-foreground mb-1">Fleet</h1>
          <p className="text-muted-foreground text-sm font-body">
            {fleet.length} vessels · {counts.available} available · {counts.booked} booked · {counts.maintenance} in maintenance
            {isDateFiltered && (
              <span className="text-gold ml-1">
                · filtered for {fmtDate(filterStart)} – {fmtDate(filterEnd)}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="bg-gold text-midnight text-xs font-body font-semibold tracking-[0.15em] uppercase px-5 py-2.5 hover:bg-gold-light transition-colors"
        >
          + Add Vessel
        </button>
      </div>

      {/* Date availability filter */}
      <div className="flex items-end gap-3 flex-wrap p-4 border border-border/50 rounded-sm bg-card">
        <div>
          <p className="text-muted-foreground text-[10px] tracking-[0.15em] uppercase font-body mb-1.5 flex items-center gap-1.5">
            <CalendarDays size={11} /> Check availability for dates
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <input type="date" value={filterStart}
              onChange={(e) => setFilterStart(e.target.value)}
              className={INPUT} />
            <span className="text-muted-foreground text-sm font-body">→</span>
            <input type="date" value={filterEnd}
              min={filterStart}
              onChange={(e) => setFilterEnd(e.target.value)}
              className={INPUT} />
            {isDateFiltered && (
              <button onClick={clearDateFilter}
                className="flex items-center gap-1 text-xs font-body text-muted-foreground hover:text-foreground transition-colors border border-border/50 px-2.5 py-2">
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>
        {isDateFiltered && (
          <div className="flex gap-3">
            <div className="text-center">
              <p className="text-emerald-400 font-heading text-xl">{counts.available}</p>
              <p className="text-muted-foreground text-[10px] font-body uppercase tracking-[0.1em]">Available</p>
            </div>
            <div className="text-center">
              <p className="text-amber-400 font-heading text-xl">{counts.booked}</p>
              <p className="text-muted-foreground text-[10px] font-body uppercase tracking-[0.1em]">Booked</p>
            </div>
            <div className="text-center">
              <p className="text-red-400 font-heading text-xl">{counts.maintenance}</p>
              <p className="text-muted-foreground text-[10px] font-body uppercase tracking-[0.1em]">Maintenance</p>
            </div>
          </div>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {STATUS_TABS.map((tab) => (
          <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
            className={`relative px-4 py-2.5 text-sm font-body transition-colors ${
              statusFilter === tab.key ? "text-gold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-sidebar-accent text-muted-foreground font-body">
              {tab.count}
            </span>
            {statusFilter === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-gold" />
            )}
          </button>
        ))}
      </div>

      {/* Fleet grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-border rounded-sm text-center">
          <p className="text-muted-foreground text-sm font-body">
            No vessels match the selected filter{isDateFiltered ? " for these dates" : ""}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((boat) => (
            <BoatCard
              key={boat.id}
              boat={boat}
              effectiveStatus={effectiveStatuses[boat.id]?.status}
              conflictDates={effectiveStatuses[boat.id]?.conflictDates}
              onEdit={() => openEdit(boat)}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      <BoatFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        boat={editingBoat}
      />
    </div>
  );
}
