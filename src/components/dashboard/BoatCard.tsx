/**
 * ============================================================
 * OCEANIQUE — BoatCard (Dashboard)
 * ============================================================
 * A card component for the dashboard Fleet page.
 * Displays boat image, name, type, status badge, capacity,
 * pricing, and action buttons (Edit / View / Toggle status).
 *
 * Props:
 *  - boat  A full Boat object from boats.config.ts
 *
 * Usage:
 *   <BoatCard boat={boatsConfig.fleet[0]} />
 * ============================================================
 *
 * TODO: Build out this component — see design spec.
 * Planned features:
 *  - Boat image with status badge overlay
 *  - Edit modal / slide-over panel
 *  - Status toggle (available ↔ maintenance)
 *  - Feature chips list
 */

import Image from "next/image";
import type { Boat, BoatStatus } from "@/types/boat";

/** Maps boat status to a display label and color class */
const statusConfig: Record<BoatStatus, { label: string; className: string }> = {
  available: {
    label: "Available",
    className: "bg-emerald-950/80 text-emerald-300 border-emerald-500/40",
  },
  booked: {
    label: "Booked",
    className: "bg-amber-950/80 text-amber-300 border-amber-500/40",
  },
  maintenance: {
    label: "Maintenance",
    className: "bg-red-950/80 text-red-300 border-red-500/40",
  },
};

interface BoatCardProps {
  boat: Boat;
  /** Override the displayed status (e.g. derived from bookings for a date range) */
  effectiveStatus?: BoatStatus;
  /** Date range this status is computed for, shown as a sub-label */
  conflictDates?: string;
  onEdit?: () => void;
  /** Toggle between available and booked (not available for maintenance) */
  onToggleStatus?: (id: string, next: BoatStatus) => void;
}

export function BoatCard({
  boat,
  effectiveStatus,
  conflictDates,
  onEdit,
  onToggleStatus,
}: BoatCardProps) {
  const displayStatus = effectiveStatus ?? boat.status;
  const status = statusConfig[displayStatus];

  function handleToggle() {
    if (!onToggleStatus || displayStatus === "maintenance") return;
    onToggleStatus(boat.id, displayStatus === "available" ? "booked" : "available");
  }

  return (
    <div className="bg-card border border-border rounded-sm overflow-hidden">
      {/* Image area */}
      <div className="aspect-[16/9] bg-muted relative overflow-hidden">
        <Image
          src={boat.images.primary}
          alt={boat.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Status badge */}
        <span className={`absolute top-3 right-3 border text-xs font-body font-medium px-2 py-0.5 backdrop-blur-sm ${status.className}`}>
          {status.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-gold text-xs tracking-[0.15em] uppercase font-body mb-1">{boat.type}</p>
        <h3 className="font-heading text-xl text-foreground mb-1">{boat.name}</h3>
        <p className="text-muted-foreground text-xs font-body mb-1">
          {boat.length} · {boat.capacity.guests} guests · {boat.year}
        </p>
        {conflictDates && (
          <p className="text-amber-400/80 text-[10px] font-body mb-3 italic">{conflictDates}</p>
        )}

        {/* Pricing grid */}
        <div className="grid grid-cols-3 gap-px border border-border/40 rounded-sm overflow-hidden mt-3 mb-4">
          {[
            { label: "/ hr",       value: boat.pricing.perHour },
            { label: "/ half-day", value: boat.pricing.perHalf },
            { label: "/ day",      value: boat.pricing.perDay  },
          ].map(({ label, value }) => (
            <div key={label} className="bg-sidebar-accent/40 px-2.5 py-2 text-center">
              <p className="text-gold text-xs font-body font-semibold">
                ${value.toLocaleString()}
              </p>
              <p className="text-muted-foreground/60 text-[10px] font-body">{label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          {onToggleStatus && displayStatus !== "maintenance" ? (
            <button
              onClick={handleToggle}
              className={`text-[10px] font-body tracking-[0.1em] uppercase border px-2.5 py-1 transition-colors ${
                displayStatus === "available"
                  ? "text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                  : "text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
              }`}
            >
              {displayStatus === "available" ? "Mark Booked" : "Mark Available"}
            </button>
          ) : <span />}
          <button
            onClick={onEdit}
            className="text-gold text-xs font-body border border-gold/30 px-3 py-1 hover:bg-gold/10 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
