/**
 * ============================================================
 * OCEANIQUE — FleetSection
 * ============================================================
 * Tab-driven cinematic fleet showcase. Clicking a vessel tab
 * cross-fades the hero image (with a subtle scale-in) and
 * slides new content in via Framer Motion AnimatePresence.
 *
 * Layout:
 *  - Dark midnight background (contrasts white sections around it)
 *  - Horizontal tab bar with a sliding gold underline indicator
 *  - Ghost vessel number (faint, behind heading) for editorial feel
 *  - Left panel: type, status, large serif name, description,
 *    4-stat spec strip, feature checklist, price + Book CTA
 *  - Right panel: full-bleed hero image with gradient overlay
 *    and manufacturer chip in the corner
 *
 * DATA SOURCES:
 * - Boat data  → src/config/boats.config.ts (boatsConfig.fleet)
 * - Book CTA   → opens WebsiteBookingModal via useWebsiteBooking()
 * - Fleet link → src/config/site.config.ts (cta.secondary)
 *
 * CUSTOMIZE:
 * - Featured boats only (homepage): set `featured: true` in boats.config.ts.
 * - Show all (fleet page): pass showAll={true}.
 * - Spec strip labels: edit the `SPECS` builder inside FleetSection.
 * - Feature count shown: change `.slice(0, 6)` on boat.features.
 * ============================================================
 */

"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { boatsConfig } from "@/config/boats.config";
import { siteConfig } from "@/config/site.config";
import { useWebsiteBooking } from "@/contexts/WebsiteBookingContext";
import type { Boat } from "@/types/boat";

// ── Types ──────────────────────────────────────────────────────

interface FleetSectionProps {
  /** If true, renders all boats. Defaults to featured boats only. */
  showAll?: boolean;
}

// ── Constants ──────────────────────────────────────────────────

/** Shared easing curve matching the rest of the website. */
const EASE = [0.25, 0.1, 0, 1] as const;

/** Status badge colours on the dark panel. */
const STATUS_STYLES: Record<Boat["status"], string> = {
  available:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  booked:      "bg-amber-500/15   text-amber-400   border-amber-500/30",
  maintenance: "bg-red-500/15     text-red-400     border-red-500/30",
};

const STATUS_LABELS: Record<Boat["status"], string> = {
  available:   "Available",
  booked:      "Booked",
  maintenance: "Maintenance",
};

// ── Component ──────────────────────────────────────────────────

export function FleetSection({ showAll = false }: FleetSectionProps) {
  /* Always show the full fleet — maintenance vessels remain visible with their status badge. */
  const boats = boatsConfig.fleet;

  const [activeIdx,  setActiveIdx]  = useState(0);
  /** Toggles the pricing display between daily and hourly rates. */
  const [priceMode,  setPriceMode]  = useState<"day" | "hour">("day");
  const { open } = useWebsiteBooking();

  /** Ref on the inner content wrapper — gates the heading / tab-bar entrance animation. */
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView   = useInView(sectionRef, { once: true, margin: "-80px" });

  /** Guard: never render with an empty fleet. */
  const boat = boats[activeIdx] ?? boats[0];
  if (!boat) return null;

  /** Maintenance vessels cannot be booked; booked vessels can still be reserved for future dates. */
  const canBook = boat.status !== "maintenance";

  /**
   * Maps the price-mode toggle to the corresponding CharterType so the
   * booking modal opens with the correct charter type already selected:
   *  "hour" → "hourly"   (per-hour charter)
   *  "day"  → "multi-day" (daily / overnight charter)
   */
  const charterTypeForMode = priceMode === "hour" ? "hourly" : "multi-day";

  /** Four data-points rendered in the spec strip. */
  const specs = [
    { label: "Length",    value: boat.length },
    { label: "Guests",    value: String(boat.capacity.guests) },
    { label: "Top Speed", value: boat.specifications.maxSpeed },
    { label: "Home Port", value: boat.specifications.homePort },
  ];

  return (
    <section className="bg-white py-24 lg:py-32 overflow-hidden">
      <div ref={sectionRef} className="max-w-7xl mx-auto px-6">

        {/* ── Section heading ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: EASE }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14"
        >
          <div>
            <p className="text-gold text-[10px] font-body font-medium tracking-[0.35em] uppercase mb-3">
              Our Fleet
            </p>
            <h2 className="font-heading text-4xl lg:text-5xl text-midnight leading-tight">
              Vessels of Distinction
            </h2>
          </div>
          <p className="text-silver-dark text-sm font-body leading-relaxed max-w-xs text-right hidden sm:block">
            Select a vessel below to explore its specifications, amenities, and pricing.
          </p>
        </motion.div>

        {/* ── Tab bar ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          className="relative flex items-end border-b border-silver/40 mb-12 overflow-x-auto gap-0"
        >
          {boats.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setActiveIdx(i)}
              aria-selected={activeIdx === i}
              className={`relative flex flex-col items-start pb-5 pr-10 pt-2 shrink-0 transition-colors duration-300 ${
                activeIdx === i ? "text-midnight" : "text-silver-dark/50 hover:text-midnight/60"
              }`}
            >
              {/* Vessel number */}
              <span className="text-[10px] font-body font-medium tracking-[0.3em] text-gold/60 mb-1.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              {/* Vessel name */}
              <span className="font-body text-sm font-semibold tracking-[0.04em]">
                {b.name}
              </span>
              {/* Vessel type */}
              <span className="text-[10px] font-body text-silver-dark/50 tracking-[0.1em] mt-0.5">
                {b.type}
              </span>
              {/* Animated gold underline — shared layoutId slides between tabs */}
              {activeIdx === i && (
                <motion.div
                  layoutId="fleet-tab-indicator"
                  className="absolute bottom-0 left-0 right-10 h-px bg-gold"
                  transition={{ duration: 0.35, ease: EASE }}
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* ── Main content grid ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

          {/* ── Left: vessel info ── */}
          <div className="lg:col-span-5 lg:pr-14 flex flex-col justify-center order-2 lg:order-1 mt-10 lg:mt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={boat.id}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.42, ease: EASE }}
                className="relative"
              >
                {/* Ghost vessel number — editorial background detail */}
                <div
                  aria-hidden="true"
                  className="absolute -top-10 -left-3 select-none pointer-events-none overflow-hidden"
                >
                  <span className="font-heading text-[10rem] leading-none text-midnight/[0.04] font-bold tabular-nums">
                    {String(activeIdx + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Type eyebrow + status badge */}
                <div className="flex items-center gap-3 mb-5 relative z-10">
                  <p className="text-gold text-[10px] font-body font-medium tracking-[0.3em] uppercase">
                    {boat.type}
                  </p>
                  <span
                    className={`text-[9px] font-body font-medium tracking-[0.15em] uppercase px-2.5 py-0.5 border ${STATUS_STYLES[boat.status]}`}
                  >
                    {STATUS_LABELS[boat.status]}
                  </span>
                </div>

                {/* Vessel name */}
                <h3 className="relative z-10 font-heading text-5xl lg:text-6xl text-midnight leading-[1.05] mb-6">
                  {boat.name}
                </h3>

                {/* Description */}
                <p className="text-silver-dark text-sm font-body leading-relaxed mb-8">
                  {boat.description}
                </p>

                {/* ── Spec strip ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-midnight/[0.08] border border-silver/40 mb-8">
                  {specs.map(({ label, value }) => (
                    <div key={label} className="bg-white px-4 py-3.5">
                      <p className="text-[9px] font-body text-silver-dark/70 tracking-[0.2em] uppercase mb-1.5">
                        {label}
                      </p>
                      <p className="text-midnight text-sm font-body font-medium leading-tight">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ── Feature checklist (first 6) ── */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 mb-10">
                  {boat.features.slice(0, 6).map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                        <Check size={9} className="text-gold" strokeWidth={3} />
                      </div>
                      <span className="text-silver-dark text-xs font-body leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* ── Price + CTA ── */}
                <div className="flex items-start gap-6 flex-wrap">

                  {/* Pricing block with day / hour toggle */}
                  <div>
                    {/* Toggle pills */}
                    <div className="flex items-center gap-1 mb-2">
                      <button
                        onClick={() => setPriceMode("day")}
                        className={`px-2.5 py-0.5 text-[9px] font-body font-medium tracking-[0.15em] uppercase border transition-colors duration-150 ${
                          priceMode === "day"
                            ? "bg-midnight text-white border-midnight"
                            : "text-silver-dark border-silver/60 hover:border-midnight/40"
                        }`}
                      >
                        Per Day
                      </button>
                      <button
                        onClick={() => setPriceMode("hour")}
                        className={`px-2.5 py-0.5 text-[9px] font-body font-medium tracking-[0.15em] uppercase border transition-colors duration-150 ${
                          priceMode === "hour"
                            ? "bg-midnight text-white border-midnight"
                            : "text-silver-dark border-silver/60 hover:border-midnight/40"
                        }`}
                      >
                        Per Hour
                      </button>
                    </div>

                    {/* Price display — animates on toggle change */}
                    <p className="text-[9px] font-body text-silver-dark/70 tracking-[0.2em] uppercase mb-0.5">
                      From
                    </p>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={priceMode}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: EASE }}
                        className="font-heading text-3xl text-midnight"
                      >
                        {priceMode === "day"
                          ? `$${boat.pricing.perDay.toLocaleString()}`
                          : `$${boat.pricing.perHour.toLocaleString()}`}
                        <span className="text-sm text-silver-dark font-body font-light ml-1">
                          {priceMode === "day" ? "/day" : "/hr"}
                        </span>
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  {/* CTA — disabled when under maintenance */}
                  <div className="flex flex-col gap-1.5 self-end">
                    <button
                      onClick={() => open(boat.id, charterTypeForMode)}
                      disabled={!canBook}
                      className={`flex items-center gap-2 px-6 py-3.5 text-[11px] font-body font-semibold tracking-[0.15em] uppercase transition-colors duration-200 ${
                        canBook
                          ? "bg-gold text-midnight hover:bg-gold-light cursor-pointer"
                          : "bg-silver/40 text-silver-dark cursor-not-allowed"
                      }`}
                    >
                      {canBook ? "Book This Vessel" : "Under Maintenance"}
                      {canBook && <ArrowRight size={13} />}
                    </button>
                    {!canBook && (
                      <p className="text-[9px] font-body text-silver-dark/60 tracking-[0.1em]">
                        This vessel is temporarily unavailable.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Right: hero image ── */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative w-full aspect-[4/3] lg:aspect-[16/11] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`img-${boat.id}`}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className="absolute inset-0"
                >
                  <Image
                    src={boat.images.primary}
                    alt={boat.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    priority={activeIdx === 0}
                  />
                  {/* Left-edge gradient: softly bleeds image into the white text panel on desktop */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/55 via-transparent to-transparent hidden lg:block" />
                  {/* Bottom gradient: fades image into white section on mobile (stacked layout) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent lg:hidden" />
                </motion.div>
              </AnimatePresence>

              {/* Manufacturer / model chip — bottom-right corner */}
              <div className="absolute bottom-4 right-5 z-10 text-right">
                <p className="text-white/60 text-[10px] font-body tracking-[0.15em] uppercase">
                  {boat.manufacturer}
                </p>
                <p className="text-white/40 text-[10px] font-body">
                  {boat.model} · {boat.year}
                </p>
              </div>

              {/* Thin gold top-right accent line */}
              <div className="absolute top-0 right-0 w-16 h-px bg-gold/40" />
              <div className="absolute top-0 right-0 w-px h-16 bg-gold/40" />
            </div>
          </div>
        </div>

        {/* ── Homepage CTA ─────────────────────────────────────── */}
        {!showAll && (
          <div className="mt-16 flex items-center gap-8">
            <div className="h-px flex-1 bg-silver/40" />
            <Link
              href="/fleet"
              aria-label={siteConfig.cta.secondary.ariaLabel}
              className="flex items-center gap-2 text-silver-dark text-[11px] font-body font-medium tracking-[0.25em] uppercase hover:text-gold transition-colors duration-200"
            >
              {siteConfig.cta.secondary.text}
              <ArrowRight size={12} />
            </Link>
            <div className="h-px flex-1 bg-silver/40" />
          </div>
        )}

      </div>
    </section>
  );
}
