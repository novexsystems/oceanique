/**
 * ============================================================
 * OCEANIQUE — Explore Fleet  (Route: /portal/fleet)
 * ============================================================
 * Displays the full yacht fleet available to the customer.
 * Each vessel card shows a real photo, key specs, a 3-tier
 * pricing summary (hourly / half-day / full-day), and top
 * amenities. Two interactive layers sit on top of the grid:
 *
 *  1. Detail Drawer  — right-side slide-in panel with the
 *     vessel's full specs, capacity, pricing, and features.
 *     Opened via "View Details" on any card.
 *
 *  2. Photo Lightbox — full-screen image gallery with prev /
 *     next arrows, thumbnail strip, and keyboard navigation.
 *     Opened independently of the drawer so browsing photos
 *     from a card does NOT auto-open the detail drawer.
 *
 * DATA SOURCE : src/config/boats.config.ts
 * NAVIGATION  : "Book Charter" → /portal/bookings
 *               "View Details" → opens inline drawer
 *
 * CUSTOMIZE:
 * - Add/edit vessels in boatsConfig.fleet (boats.config.ts).
 * - Pricing tiers come from boat.pricing.{perHour, perHalf, perDay}.
 * - To add new filter types, update the BoatType union in types/boat.ts.
 * ============================================================
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Ruler, ChevronRight, SlidersHorizontal,
  X, ChevronLeft, Images, MapPin, Zap, Star,
} from "lucide-react";
import Link from "next/link";
import { boatsConfig } from "@/config/boats.config";
import type { Boat, BoatType } from "@/types/boat";

/** Cubic-bezier easing shared by all Framer Motion transitions on this page. */
const EASE = [0.25, 0.1, 0, 1] as [number, number, number, number];

/**
 * Maps each BoatStatus value to a human-readable label and Tailwind
 * colour classes for the status badge.
 *
 * Style mirrors the admin BoatCard (dark frosted-glass overlay with
 * `backdrop-blur-sm`) so both views feel visually consistent.
 * Dark backgrounds work well over images regardless of portal theme.
 */
const statusConfig: Record<string, { label: string; cls: string }> = {
  available:   { label: "Available",   cls: "bg-emerald-950/80 text-emerald-300 border-emerald-500/40" },
  booked:      { label: "Booked",      cls: "bg-amber-950/80   text-amber-300   border-amber-500/40"   },
  maintenance: { label: "Maintenance", cls: "bg-red-950/80     text-red-300     border-red-500/40"     },
};

/**
 * The type filter the customer can select.
 * "All" shows the full fleet; any BoatType value narrows the grid
 * to vessels of that category (e.g. "Motor Yacht", "Catamaran").
 */
type FilterType = "All" | BoatType;

export default function PortalFleetPage() {
  /** Currently active vessel-type filter. Defaults to showing all vessels. */
  const [filter, setFilter]             = useState<FilterType>("All");

  /**
   * The vessel whose detail drawer is open.
   * null  → drawer is closed.
   * Boat  → drawer slides in from the right.
   *
   * NOTE: This is intentionally separate from lightboxBoat so that
   * opening photos directly from a card does NOT open the drawer.
   */
  const [detailBoat, setDetailBoat]     = useState<Boat | null>(null);

  /**
   * The vessel whose photo gallery lightbox is open.
   * null  → lightbox is closed.
   * Boat  → full-screen lightbox is shown at z-[60].
   *
   * Can be set independently of detailBoat, or set to detailBoat
   * when the customer clicks "Gallery" inside the detail drawer.
   */
  const [lightboxBoat, setLightboxBoat] = useState<Boat | null>(null);

  /** Zero-based index of the currently visible photo inside the lightbox. */
  const [photoIdx, setPhotoIdx]         = useState(0);

  /**
   * Derive the unique list of vessel types from the fleet config,
   * prepending "All" so the first pill always resets the filter.
   * Uses a Set to deduplicate, then casts back to BoatType[].
   */
  const types: FilterType[] = [
    "All",
    ...([...new Set(boatsConfig.fleet.map((b) => b.type))] as BoatType[]),
  ];

  /**
   * Pre-compute the vessel count for each filter type so the
   * filter pills can show "(n)" without recalculating on every render.
   */
  const counts = Object.fromEntries(
    types.map((t) => [t, t === "All" ? boatsConfig.fleet.length : boatsConfig.fleet.filter((b) => b.type === t).length])
  );

  /** The subset of the fleet currently visible in the grid, based on the active filter. */
  const boats = filter === "All"
    ? boatsConfig.fleet
    : boatsConfig.fleet.filter((b) => b.type === filter);

  /**
   * Global keyboard handler for the lightbox and detail drawer.
   *
   * Priority order:
   *  1. If the lightbox is open → Esc closes it, ← / → navigates photos.
   *  2. If only the drawer is open → Esc closes it.
   *
   * The effect is re-registered whenever lightboxBoat or detailBoat
   * changes so the photo array and state setters stay current.
   */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightboxBoat) {
        const photos = [lightboxBoat.images.primary, ...lightboxBoat.images.gallery];
        if (e.key === "Escape")      { setLightboxBoat(null); }
        if (e.key === "ArrowLeft")   setPhotoIdx((i) => (i - 1 + photos.length) % photos.length);
        if (e.key === "ArrowRight")  setPhotoIdx((i) => (i + 1) % photos.length);
      } else if (detailBoat) {
        if (e.key === "Escape") setDetailBoat(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [detailBoat, lightboxBoat]);

  /**
   * Opens the detail drawer for a given vessel.
   * Resets the photo index to 0 so the primary image is shown
   * if the customer later opens the gallery from inside the drawer.
   */
  function openDetail(boat: Boat) { setDetailBoat(boat); setPhotoIdx(0); }

  /**
   * Opens the photo lightbox for a given vessel WITHOUT opening the
   * detail drawer. This is intentional — clicking "N photos" on a
   * card should show photos only, not force the drawer open.
   *
   * @param boat - The vessel whose images to display.
   * @param idx  - Starting photo index (default 0 = primary image).
   */
  function openLightbox(boat: Boat, idx = 0) { setLightboxBoat(boat); setPhotoIdx(idx); }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
        <p className="text-gold text-[10px] font-body tracking-[0.25em] uppercase mb-2">Our Fleet</p>
        <h1 className="font-heading text-3xl text-foreground mb-1">Explore Our Vessels</h1>
        <p className="text-muted-foreground text-sm font-body">
          {boatsConfig.fleet.length} vessels · browse the collection and request your next charter.
        </p>
      </motion.div>

      {/* Filter bar */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08, ease: EASE }}
        className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal size={13} className="text-muted-foreground/50 shrink-0" aria-hidden />
        {types.map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-4 py-1.5 text-xs font-body tracking-[0.15em] uppercase border transition-colors ${
              filter === t ? "bg-gold text-midnight border-gold font-semibold" : "border-sidebar-border text-muted-foreground hover:border-gold/30 hover:text-foreground"
            }`}>
            {t}<span className={`ml-1.5 ${filter === t ? "opacity-70" : "opacity-40"}`}>({counts[t]})</span>
          </button>
        ))}
      </motion.div>

      {/* ── Fleet grid: responsive 1/2/3 column, staggered entrance animation ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {boats.map((boat, i) => {
          /** Resolved status label + badge colour classes for this vessel. */
          const status  = statusConfig[boat.status];
          /** Only "available" vessels allow booking; others grey-out the CTA. */
          const canBook = boat.status === "available";
          /** Full photo array: primary image first, then the gallery. */
          const photos  = [boat.images.primary, ...boat.images.gallery];

          return (
            <motion.div key={boat.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: EASE }}
              className="bg-sidebar border border-sidebar-border rounded-sm overflow-hidden hover:border-gold/30 transition-colors group flex flex-col">

              {/* Hero image (16:9) — static, no zoom animation */}
              <div className="aspect-[16/9] relative overflow-hidden flex-shrink-0 bg-muted/10">
                {/* Vessel primary photo */}
                <img src={boat.images.primary} alt={boat.name}
                  className="absolute inset-0 w-full h-full object-cover" />

                {/* Bottom-to-top gradient overlay — keeps badge and port text legible */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {/* Top-left: availability badge + optional Featured badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  {/* Status badge — dark frosted glass, mirrors admin BoatCard */}
                  <span className={`text-xs font-body font-medium px-2 py-0.5 border backdrop-blur-sm ${status.cls}`}>
                    {status.label}
                  </span>
                  {boat.featured && (
                    <span className="text-xs font-body font-medium px-2 py-0.5 border bg-black/60 text-gold border-gold/40 backdrop-blur-sm flex items-center gap-1">
                      <Star size={9} fill="currentColor" /> Featured
                    </span>
                  )}
                </div>

                {/* Photos button — opens lightbox only, not the drawer */}
                <button onClick={(e) => { e.stopPropagation(); openLightbox(boat); }}
                  className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/55 hover:bg-black/75 border border-white/10 text-white text-[10px] font-body px-2 py-1 rounded-sm transition-colors backdrop-blur-sm">
                  <Images size={10} /> {photos.length} photos
                </button>

                {/* Home port */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white/55 text-[10px] font-body">
                  <MapPin size={9} />{boat.specifications.homePort}
                </div>
              </div>

              {/* Card body — flex-col so CTAs are always pinned to the bottom */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-gold text-[10px] tracking-[0.25em] uppercase font-body mb-0.5">{boat.type}</p>
                    <h3 className="font-heading text-xl text-foreground leading-tight">{boat.name}</h3>
                  </div>
                  <p className="text-muted-foreground text-[11px] font-body shrink-0 mt-1">{boat.year}</p>
                </div>

                <p className="text-muted-foreground text-xs font-body mb-4 leading-relaxed line-clamp-2 flex-1">
                  {boat.description}
                </p>

                {/* At-a-glance specs: max guests · length · top speed */}
                <div className="flex items-center gap-4 mb-3 text-xs font-body text-muted-foreground">
                  <span className="flex items-center gap-1"><Users size={11} className="text-gold/50" />{boat.capacity.guests} guests</span>
                  <span className="flex items-center gap-1"><Ruler size={11} className="text-gold/50" />{boat.length}</span>
                  <span className="flex items-center gap-1"><Zap size={11} className="text-gold/50" />{boat.specifications.maxSpeed}</span>
                </div>

                {/* Top 3 amenity chips — full list is in the detail drawer */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {boat.features.slice(0, 3).map((f) => (
                    <span key={f} className="text-[10px] font-body text-muted-foreground/60 border border-border/30 px-2 py-0.5 rounded-sm">{f}</span>
                  ))}
                  {boat.features.length > 3 && (
                    <span className="text-[10px] font-body text-muted-foreground/40">+{boat.features.length - 3} more</span>
                  )}
                </div>

                {/* 3-tier pricing row: hourly / half-day / full-day rates */}
                <div className="grid grid-cols-3 gap-2 py-3 border-t border-sidebar-border mb-4">
                  {([
                    { label: "/ hr",   val: boat.pricing.perHour },
                    { label: "/ half", val: boat.pricing.perHalf },
                    { label: "/ day",  val: boat.pricing.perDay  },
                  ] as const).map(({ label, val }) => (
                    <div key={label} className="text-center">
                      <p className="font-heading text-sm text-foreground">${val.toLocaleString()}</p>
                      <p className="text-[9px] text-muted-foreground/50 font-body tracking-[0.08em]">{label}</p>
                    </div>
                  ))}
                </div>

                {/* CTAs: "View Details" opens drawer; "Book Charter" navigates to /portal/bookings */}
                <div className="flex items-center gap-2 mt-auto">
                  <button onClick={() => openDetail(boat)}
                    className="flex-1 py-2 text-[11px] font-body tracking-[0.12em] uppercase border border-sidebar-border text-muted-foreground hover:border-gold/30 hover:text-foreground transition-colors">
                    View Details
                  </button>
                  <Link href="/portal/bookings"
                    className={`flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-body tracking-[0.12em] uppercase transition-colors ${
                      canBook
                        ? "bg-gold/10 border border-gold/20 text-gold hover:bg-gold/20"
                        : "border border-border/30 text-muted-foreground/35 pointer-events-none"
                    }`}>
                    Book Charter <ChevronRight size={10} />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Detail drawer: right slide-in panel with full vessel profile ── */}
      <AnimatePresence>
        {detailBoat && (
          <>
            <motion.div key="detail-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setDetailBoat(null)} />

            <motion.div key="detail-drawer"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: EASE }}
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-card border-l border-border z-50 flex flex-col shadow-2xl">

              {/* Drawer hero image with gradient overlay, Gallery + Close buttons */}
              <div className="relative aspect-[16/9] shrink-0 overflow-hidden bg-muted/20">
                <img src={detailBoat.images.primary} alt={detailBoat.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button onClick={() => { setPhotoIdx(0); setLightboxBoat(detailBoat); }}
                    className="flex items-center gap-1.5 bg-black/55 border border-white/10 text-white text-[10px] font-body px-2.5 py-1.5 rounded-sm hover:bg-black/75 transition-colors backdrop-blur-sm">
                    <Images size={11} /> Gallery
                  </button>
                  <button onClick={() => setDetailBoat(null)}
                    className="bg-black/55 border border-white/10 text-white p-1.5 rounded-sm hover:bg-black/75 transition-colors backdrop-blur-sm">
                    <X size={16} />
                  </button>
                </div>
                <div className="absolute bottom-4 left-5">
                  <p className="text-gold text-[10px] font-body tracking-[0.2em] uppercase mb-0.5">{detailBoat.type}</p>
                  <h2 className="font-heading text-2xl text-white leading-tight">{detailBoat.name}</h2>
                  <p className="text-white/55 text-xs font-body mt-0.5">{detailBoat.manufacturer} {detailBoat.model} · {detailBoat.year}</p>
                </div>
              </div>

              {/* Scrollable body — all content except the sticky footer CTA */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Status badge + starting hourly rate */}
                <div className="flex items-center justify-between">
                  {/* In-drawer badge — same colour set, readable on any background */}
                  <span className={`text-xs font-body font-medium px-2.5 py-1 border ${statusConfig[detailBoat.status].cls}`}>
                    {statusConfig[detailBoat.status].label}
                  </span>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground/50 font-body tracking-[0.1em] uppercase mb-0.5">From</p>
                    <p className="font-heading text-xl text-gold">
                      ${detailBoat.pricing.perHour.toLocaleString()}
                      <span className="text-xs text-muted-foreground font-body font-normal">/hr</span>
                    </p>
                  </div>
                </div>

                {/* Full vessel description */}
                <p className="text-muted-foreground text-sm font-body leading-relaxed">{detailBoat.description}</p>

                {/* Complete pricing: hourly / half-day / full-day with deposit note */}
                <div>
                  <p className="text-[10px] text-muted-foreground font-body tracking-[0.15em] uppercase mb-3">Pricing</p>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { label: "Hourly",   val: detailBoat.pricing.perHour, unit: "per hour"   },
                      { label: "Half-Day", val: detailBoat.pricing.perHalf, unit: "AM or PM"   },
                      { label: "Full Day", val: detailBoat.pricing.perDay,  unit: "all day"    },
                    ] as const).map(({ label, val, unit }) => (
                      <div key={label} className="border border-border/50 p-3 text-center rounded-sm">
                        <p className="text-[10px] text-muted-foreground font-body tracking-[0.1em] uppercase mb-1">{label}</p>
                        <p className="font-heading text-base text-foreground">${val.toLocaleString()}</p>
                        <p className="text-[9px] text-muted-foreground/50 font-body">{unit}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-muted-foreground/40 text-[10px] font-body mt-2">
                    {detailBoat.pricing.depositPercent}% deposit required · fuel & provisioning billed separately.
                  </p>
                </div>

                {/* Capacity: day guests / overnight guests / crew */}
                <div>
                  <p className="text-[10px] text-muted-foreground font-body tracking-[0.15em] uppercase mb-3">Capacity</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Day Guests", val: detailBoat.capacity.guests },
                      { label: "Overnight",  val: detailBoat.capacity.overnight },
                      { label: "Crew",       val: detailBoat.capacity.crew },
                    ].map(({ label, val }) => (
                      <div key={label} className="border border-border/50 p-3 text-center rounded-sm">
                        <p className="font-heading text-lg text-foreground">{val}</p>
                        <p className="text-[10px] text-muted-foreground/60 font-body">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical spec table (length, beam, speeds, engines, port) */}
                <div>
                  <p className="text-[10px] text-muted-foreground font-body tracking-[0.15em] uppercase mb-3">Specifications</p>
                  <div className="space-y-0">
                    {[
                      { label: "Length",          val: detailBoat.length },
                      { label: "Beam",            val: detailBoat.beam },
                      { label: "Max Speed",       val: detailBoat.specifications.maxSpeed },
                      { label: "Cruising Speed",  val: detailBoat.specifications.cruisingSpeed },
                      { label: "Engines",         val: detailBoat.specifications.engines },
                      { label: "Fuel Capacity",   val: detailBoat.specifications.fuelCapacity },
                      { label: "Home Port",       val: detailBoat.specifications.homePort },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                        <p className="text-muted-foreground text-xs font-body">{label}</p>
                        <p className="text-foreground text-xs font-body font-medium">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full amenities and features list */}
                <div>
                  <p className="text-[10px] text-muted-foreground font-body tracking-[0.15em] uppercase mb-3">Amenities &amp; Features</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detailBoat.features.map((f) => (
                      <span key={f} className="text-[11px] font-body text-muted-foreground border border-border/40 px-2.5 py-1 rounded-sm">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sticky footer: Book CTA — always visible at the bottom of the drawer */}
              <div className="shrink-0 bg-card border-t border-border p-5">
                <Link href="/portal/bookings"
                  className={`w-full flex items-center justify-center gap-2 py-3 text-xs font-body font-semibold tracking-[0.15em] uppercase transition-colors ${
                    detailBoat.status === "available"
                      ? "bg-gold text-midnight hover:bg-gold-light"
                      : "bg-muted/20 text-muted-foreground/50 pointer-events-none"
                  }`}>
                  {detailBoat.status === "available" ? "Book This Vessel" : "Currently Unavailable"}
                  <ChevronRight size={13} />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Photo lightbox: full-screen gallery at z-[60], above the drawer ── */}
      <AnimatePresence>
        {lightboxBoat && (() => {
          /** Primary + gallery images with falsy paths removed. */
          const photos    = [lightboxBoat.images.primary, ...lightboxBoat.images.gallery].filter(Boolean);
          const total     = photos.length;
          /** Go to previous photo, wrapping from index 0 back to the last. */
          const prevPhoto = () => setPhotoIdx((i) => (i - 1 + total) % total);
          /** Go to next photo, wrapping from the last index back to 0. */
          const nextPhoto = () => setPhotoIdx((i) => (i + 1) % total);
          return (
            <>
              <motion.div key="lb-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/92 z-[60]"
                onClick={() => setLightboxBoat(null)} />

              <motion.div key="lb-panel"
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[60] flex flex-col pointer-events-none">

                <div className="pointer-events-auto flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-gold text-[10px] font-body tracking-[0.2em] uppercase mb-0.5">Gallery</p>
                    <h3 className="font-heading text-lg text-white">{lightboxBoat.name}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/40 text-xs font-body">{photoIdx + 1} / {total}</span>
                    <button onClick={() => setLightboxBoat(null)} className="text-white/60 hover:text-white transition-colors p-1">
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="pointer-events-auto flex-1 flex items-center justify-center px-16 py-4 relative min-h-0">
                  <button onClick={prevPhoto} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white bg-black/40 hover:bg-black/70 p-2 rounded-full transition-colors">
                    <ChevronLeft size={22} />
                  </button>
                  <img key={photos[photoIdx]} src={photos[photoIdx]} alt={`${lightboxBoat.name} ${photoIdx + 1}`}
                    className="max-h-full max-w-full object-contain rounded-sm select-none" />
                  <button onClick={nextPhoto} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white bg-black/40 hover:bg-black/70 p-2 rounded-full transition-colors">
                    <ChevronRight size={22} />
                  </button>
                </div>

                {total > 1 && (
                  <div className="pointer-events-auto flex items-center justify-center gap-2 px-6 py-4 overflow-x-auto">
                    {photos.map((src, i) => (
                      <button key={i} onClick={() => setPhotoIdx(i)}
                        className={`w-14 h-10 rounded-sm overflow-hidden border-2 shrink-0 transition-all ${i === photoIdx ? "border-gold opacity-100" : "border-transparent opacity-40 hover:opacity-70"}`}>
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="pointer-events-auto pb-5 text-center">
                  <p className="text-white/30 text-[11px] font-body">{lightboxBoat.type} · {lightboxBoat.length} · {lightboxBoat.specifications.homePort}</p>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
