/**
 * ============================================================
 * OCEANIQUE — Customer Portal Overview  (Route: /portal)
 * ============================================================
 * Landing page of the customer portal. Shows:
 *   - Personalised welcome greeting
 *   - Next upcoming charter hero card with countdown
 *   - Quick-stat cards (upcoming, past voyages, loyalty pts, nights)
 *   - Recent activity feed
 *   - Loyalty programme progress bar
 *
 * DATA SOURCE: src/config/portal.config.ts
 * ============================================================
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Anchor,
  CalendarDays,
  MapPin,
  Users,
  Star,
  TrendingUp,
  Clock,
  ChevronRight,
  Crown,
  AlertCircle,
  BookOpen,
  FileText,
  Compass,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Circle,
} from "lucide-react";
import { portalConfig } from "@/config/portal.config";
import { boatsConfig } from "@/config/boats.config";

const EASE = [0.25, 0.1, 0, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: EASE },
  }),
};

/** Format ISO date string to "14 Aug 2026" */
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Days remaining until a date (uses a live `now` timestamp) */
function daysUntil(iso: string, now: number) {
  const diff = new Date(iso).getTime() - now;
  return Math.max(0, Math.floor(diff / 86_400_000));
}

/** Hours remaining in the current (partial) day */
function hoursUntil(iso: string, now: number) {
  const diff = new Date(iso).getTime() - now;
  if (diff <= 0) return 0;
  return Math.floor((diff % 86_400_000) / 3_600_000);
}

export default function PortalOverviewPage() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { customerProfile, bookings, loyaltyTiers } = portalConfig;

  const upcomingBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "pending");
  const pastBookings = bookings.filter((b) => b.status === "completed");
  const nextCharter = upcomingBookings.find((b) => b.status === "confirmed");

  const currentTier = loyaltyTiers.find((t) => t.name === customerProfile.membershipTier)!;
  const nextTierIndex = loyaltyTiers.findIndex((t) => t.name === customerProfile.membershipTier) + 1;
  const nextTier = loyaltyTiers[nextTierIndex];
  const progressPct = nextTier
    ? Math.min(100, ((customerProfile.totalSpent - currentTier.minSpend) / (nextTier.minSpend - currentTier.minSpend)) * 100)
    : 100;

  const recentActivity = [
    { icon: CalendarDays, text: `Booking confirmed — ${nextCharter?.boatName ?? "Azure Horizon"}`, time: "2 days ago", color: "text-emerald-400" },
    { icon: Star, text: "Loyalty points awarded — +2,550 pts", time: "5 days ago", color: "text-gold" },
    { icon: Anchor, text: `Charter completed — ${pastBookings[0]?.boatName ?? "Azure Horizon"}`, time: "3 weeks ago", color: "text-blue-400" },
    { icon: TrendingUp, text: "Membership upgraded to Platinum", time: "2 months ago", color: "text-purple-400" },
  ];

  /* ── Pending action items (documents needing attention) ── */
  const pendingDocs = portalConfig.documents.filter(d =>
    d.status === "pending" &&
    upcomingBookings.some(b => b.id === d.bookingId)
  );

  /* ── Pre-departure checklist for next confirmed charter ── */
  const checklistItems = nextCharter
    ? [
        { label: "Charter Contract",       doc: portalConfig.documents.find(d => d.bookingId === nextCharter.id && d.type === "contract") },
        { label: "Invoice Paid",           doc: portalConfig.documents.find(d => d.bookingId === nextCharter.id && d.type === "invoice") },
        { label: "Pre-Departure Form",     doc: portalConfig.documents.find(d => d.bookingId === nextCharter.id && d.type === "form") },
        { label: "Guest List Confirmed",   doc: undefined, done: nextCharter.guests > 0 },
        { label: "Provisioning Briefing",  doc: undefined, done: !!nextCharter.notes },
      ]
    : [];

  /* ── Fleet recommendations (vessels not currently confirmed) ── */
  const recommendations = boatsConfig.fleet
    .filter(b => b.id !== nextCharter?.boatId && b.status === "available")
    .slice(0, 3);

  return (
    <div className="space-y-8 max-w-7xl">
      {/* ── Welcome header ── */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <p className="text-gold text-[11px] tracking-[0.3em] uppercase font-body mb-1">
          Welcome back
        </p>
        <h1 className="font-heading text-3xl text-foreground">
          {customerProfile.firstName} {customerProfile.lastName}
        </h1>
        <p className="text-muted-foreground text-sm font-body mt-1">
          Here&apos;s everything about your upcoming voyages and account.
        </p>
      </motion.div>

      {/* ── Action required banner ── */}
      {pendingDocs.length > 0 && (
        <motion.div custom={0.5} variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-start gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-sm">
            <AlertCircle size={15} className="text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-amber-400 text-xs font-body font-semibold tracking-[0.05em]">
                {pendingDocs.length} action{pendingDocs.length > 1 ? "s" : ""} required before your next departure
              </p>
              <p className="text-muted-foreground text-xs font-body mt-0.5">
                {pendingDocs.map(d => d.name).join(" · ")}
              </p>
            </div>
            <Link href="/portal/documents"
              className="shrink-0 text-[10px] font-body tracking-[0.1em] uppercase text-amber-400 hover:text-amber-300 transition-colors">
              Review →
            </Link>
          </div>
        </motion.div>
      )}

      {/* ── Next charter hero card ── */}
      {nextCharter && (
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <div className="relative overflow-hidden rounded-sm border border-gold/20 bg-gradient-to-r from-slate-50 to-stone-100/60 dark:from-midnight-mid dark:to-midnight p-6 md:p-8">
            {/* Background glow */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                background: "radial-gradient(ellipse 60% 80% at 80% 50%, rgba(201,162,39,0.15) 0%, transparent 70%)",
              }}
            />
            <div className="relative grid md:grid-cols-2 gap-6 items-center">
              {/* Left — charter info */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-body tracking-[0.2em] uppercase px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    Confirmed
                  </span>
                  <span className="text-muted-foreground text-xs font-body">
                    {nextCharter.id}
                  </span>
                </div>
                <h2 className="font-heading text-2xl text-foreground mb-1">
                  {nextCharter.boatName}
                </h2>
                <p className="text-muted-foreground text-sm font-body mb-4">
                  {nextCharter.boatType}
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground font-body">
                    <CalendarDays size={14} className="text-gold/60 flex-shrink-0" />
                    {fmtDate(nextCharter.startDate)} – {fmtDate(nextCharter.endDate)}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground font-body">
                    <MapPin size={14} className="text-gold/60 flex-shrink-0" />
                    {nextCharter.basePort}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground font-body">
                    <Users size={14} className="text-gold/60 flex-shrink-0" />
                    {nextCharter.guests} guests
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground font-body">
                    <Anchor size={14} className="text-gold/60 flex-shrink-0" />
                    {nextCharter.captain}
                  </div>
                </div>
                {nextCharter.itinerary && (
                  <p className="mt-4 text-muted-foreground/60 text-xs font-body italic">
                    {nextCharter.itinerary}
                  </p>
                )}
              </div>

              {/* Right — countdown */}
              <div className="flex flex-col items-center justify-center text-center border border-gold/20 rounded-sm p-6 bg-card/70">
                <p className="text-muted-foreground/60 text-[10px] tracking-[0.3em] uppercase font-body mb-1">
                  Departure in
                </p>
                <p className="font-heading text-6xl text-gold leading-none">
                  {daysUntil(nextCharter.startDate, now)}
                </p>
                <p className="text-muted-foreground/60 text-xs tracking-[0.2em] uppercase font-body mt-1">
                  days
                </p>
                {daysUntil(nextCharter.startDate, now) < 30 && (
                  <p className="text-muted-foreground/50 text-[11px] font-body mt-2">
                    {hoursUntil(nextCharter.startDate, now)}h remaining today
                  </p>
                )}
                <Link
                  href="/portal/bookings"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-body text-gold/80 hover:text-gold transition-colors tracking-[0.1em] uppercase"
                >
                  View details <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Upcoming Charters", value: upcomingBookings.length, icon: CalendarDays, color: "text-emerald-400" },
          { label: "Past Voyages", value: pastBookings.length, icon: Anchor, color: "text-blue-400" },
          { label: "Loyalty Points", value: customerProfile.loyaltyPoints.toLocaleString(), icon: Star, color: "text-gold" },
          { label: "Nights at Sea", value: customerProfile.totalNightsAtSea, icon: Clock, color: "text-purple-400" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i + 2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-sidebar border border-sidebar-border rounded-sm p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-muted-foreground text-xs font-body tracking-[0.1em] uppercase">
                {stat.label}
              </p>
              <stat.icon size={14} className={stat.color} aria-hidden />
            </div>
            <p className={`font-heading text-2xl ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Quick actions ── */}
      <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: BookOpen,     label: "My Bookings",    href: "/portal/bookings",  color: "text-emerald-400" },
            { icon: FileText,     label: "Documents",      href: "/portal/documents", color: "text-blue-400" },
            { icon: Compass,      label: "Explore Fleet",  href: "/portal/fleet",     color: "text-gold" },
            { icon: MessageCircle,label: "Contact Support",href: "/portal/support",   color: "text-purple-400" },
          ].map(action => (
            <Link key={action.href} href={action.href}
              className="flex flex-col items-center gap-2.5 p-4 bg-sidebar border border-sidebar-border rounded-sm hover:border-gold/40 hover:bg-sidebar-accent transition-colors group text-center"
            >
              <div className="w-9 h-9 rounded-sm bg-sidebar-accent flex items-center justify-center group-hover:bg-card/60 transition-colors">
                <action.icon size={16} className={action.color} />
              </div>
              <span className="text-foreground text-xs font-body font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Loyalty progress + Recent activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Loyalty card */}
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible"
          className="lg:col-span-1 bg-sidebar border border-sidebar-border rounded-sm p-6 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-base text-foreground">Membership</h3>
            <Crown size={16} className="text-gold" aria-hidden />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-gold/10 border border-gold/20 flex items-center justify-center">
              <Crown size={18} className="text-gold" />
            </div>
            <div>
              <p className="font-heading text-lg text-gold leading-none">{customerProfile.membershipTier}</p>
              <p className="text-muted-foreground/60 text-xs font-body">Member since {new Date(customerProfile.memberSince).getFullYear()}</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-body text-muted-foreground/60 mb-1.5">
              <span>{customerProfile.totalSpent.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} spent</span>
              {nextTier && <span>Next: {nextTier.name} at ${nextTier.minSpend.toLocaleString()}</span>}
            </div>
            <div className="h-1.5 bg-sidebar-accent rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gold rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.2, delay: 0.5, ease: [0.25, 0.1, 0, 1] }}
              />
            </div>
          </div>

          <div className="border-t border-sidebar-border pt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground/60 text-[10px] tracking-[0.2em] uppercase font-body">Points balance</p>
                <p className="font-heading text-xl text-gold">{customerProfile.loyaltyPoints.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground/60 text-[10px] tracking-[0.2em] uppercase font-body">Multiplier</p>
                <p className="font-heading text-xl text-foreground">×2.0</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent activity */}
        <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible"
          className="lg:col-span-2 bg-sidebar border border-sidebar-border rounded-sm p-6"
        >
          <h3 className="font-heading text-base text-foreground mb-5">Recent Activity</h3>
          <ul className="space-y-4">
            {recentActivity.map((item, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-sm bg-sidebar-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                  <item.icon size={14} className={item.color} aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body text-foreground/90 leading-snug">{item.text}</p>
                  <p className="text-xs font-body text-muted-foreground/50 mt-0.5">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/portal/bookings"
            className="inline-flex items-center gap-1.5 mt-5 text-xs font-body text-gold/70 hover:text-gold transition-colors tracking-[0.1em] uppercase"
          >
            View all bookings <ChevronRight size={12} />
          </Link>
        </motion.div>
      </div>

      {/* ── Pre-departure checklist + Fleet recommendations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pre-departure checklist */}
        {nextCharter && (
          <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible"
            className="lg:col-span-1 bg-sidebar border border-sidebar-border rounded-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-base text-foreground">Pre-Departure Checklist</h3>
              <span className="text-muted-foreground/50 text-[10px] font-body">
                {checklistItems.filter(i => i.done !== false && (i.doc ? i.doc.status !== "pending" : i.done)).length}/{checklistItems.length}
              </span>
            </div>
            <p className="text-muted-foreground/60 text-[11px] font-body mb-4">{nextCharter.boatName} · {nextCharter.id}</p>
            <ul className="space-y-2.5">
              {checklistItems.map((item, i) => {
                const isDone = item.doc
                  ? item.doc.status === "signed" || item.doc.status === "paid"
                  : !!item.done;
                const isPending = item.doc?.status === "pending";
                return (
                  <li key={i} className="flex items-center gap-3">
                    {isDone ? (
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    ) : isPending ? (
                      <XCircle size={14} className="text-amber-400 shrink-0" />
                    ) : (
                      <Circle size={14} className="text-muted-foreground/30 shrink-0" />
                    )}
                    <span className={`text-sm font-body ${
                      isDone ? "text-foreground/70 line-through" : isPending ? "text-amber-400" : "text-foreground"
                    }`}>
                      {item.label}
                    </span>
                  </li>
                );
              })}
            </ul>
            <Link href="/portal/documents"
              className="inline-flex items-center gap-1.5 mt-5 text-xs font-body text-gold/70 hover:text-gold transition-colors tracking-[0.1em] uppercase"
            >
              View all documents <ChevronRight size={12} />
            </Link>
          </motion.div>
        )}

        {/* Fleet recommendations */}
        <motion.div custom={9} variants={fadeUp} initial="hidden" animate="visible"
          className={`${nextCharter ? "lg:col-span-2" : "lg:col-span-3"} bg-sidebar border border-sidebar-border rounded-sm p-6`}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading text-base text-foreground">Recommended for You</h3>
            <Link href="/portal/fleet" className="text-[10px] font-body tracking-[0.1em] uppercase text-gold/70 hover:text-gold transition-colors">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recommendations.map(vessel => (
              <Link key={vessel.id} href="/portal/fleet"
                className="flex items-center gap-4 p-3 border border-border/40 hover:border-gold/30 hover:bg-sidebar-accent transition-colors group"
              >
                <div className="w-10 h-10 rounded-sm bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                  <Anchor size={14} className="text-gold/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-body font-medium group-hover:text-gold transition-colors">{vessel.name}</p>
                  <p className="text-muted-foreground text-[11px] font-body">{vessel.type} · {vessel.length} · {vessel.capacity.guests} guests</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-gold text-sm font-body font-semibold">${vessel.pricing.perDay.toLocaleString()}</p>
                  <p className="text-muted-foreground text-[10px] font-body">per day</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
