/**
 * ============================================================
 * OCEANIQUE — DashboardTopBar
 * ============================================================
 * The horizontal top bar shown across all admin dashboard pages.
 * Derives the page title automatically from the current route.
 *
 * Features:
 *  - Breadcrumb page title (Dashboard / Page)
 *  - Light / dark theme toggle
 *  - Notification bell dropdown — live, localStorage-backed alerts:
 *      • pending_booking  — every booking with status "pending"
 *      • upcoming         — confirmed charter starting within 14 days
 *      • new_customer     — customer record created from website booking
 *    Reacts in real-time (cross-tab via storage event; same-tab via
 *    10-second poll). Unread state persisted to NOTIF_READ_KEY.
 *  - Unread count badge on the bell; "Mark all read" action
 *  - Profile dropdown (avatar click) showing admin name, email,
 *    role badge, links to settings + portal, and sign out
 *  - Click-outside handlers that close open dropdowns
 *  - Avatar: photo from AvatarContext, or email-initial fallback
 *
 * DATA SOURCES:
 * - Session / auth    → useAuth() hook
 * - Page title        → derived from usePathname()
 * - Notifications     → localStorage (BOOKINGS_STORAGE_KEY +
 *                       CUSTOMERS_STORAGE_KEY), refreshed live
 * - Brand email       → src/config/site.config.ts (auth.demoEmail)
 * - Avatar            → AvatarContext / localStorage
 *
 * CUSTOMIZE:
 * - Top bar height:   update h-16 here + pt-16 in dashboard/layout.tsx.
 * - Notifications:    extend deriveAdminNotifications() with new sources
 *                     or add a new AdminNotif "type" value + NotifIcon case.
 * - Profile links:    add items to the "Nav actions" section in the dropdown.
 * ============================================================
 */

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, LogOut, Sun, Moon, Menu,
  Bell, AlertCircle, CalendarDays, UserPlus,
  User, Settings, ChevronRight, Check,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { siteConfig } from "@/config/site.config";
import { dashboardConfig } from "@/config/dashboard.config";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAvatar } from "@/contexts/AvatarContext";
import { BOOKINGS_STORAGE_KEY } from "@/contexts/BookingsContext";
import { CUSTOMERS_STORAGE_KEY } from "@/contexts/CustomersContext";
import type { Booking } from "@/types/booking";
import type { Customer } from "@/types/customer";

/** Shared easing for dropdown animations. */
const EASE = [0.25, 0.1, 0, 1] as const;

// ── Types ──────────────────────────────────────────────────────

/**
 * A single admin notification item.
 * "pending_booking" = new booking request needing review.
 * "upcoming"        = confirmed charter starting within 14 days.
 * "new_customer"    = a customer record created from a website booking.
 */
type AdminNotif = {
  id:    string;
  type:  "pending_booking" | "upcoming" | "new_customer";
  title: string;
  sub:   string;
  href:  string;
};

/** localStorage key used to persist which notification IDs the admin has dismissed. */
const NOTIF_READ_KEY = "oceanique_notif_read_v1";

/**
 * Reads a JSON array from localStorage, returning `fallback` on any error.
 * Safe to call during SSR (returns fallback when window is unavailable).
 */
function loadLS<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : fallback;
  } catch { return fallback; }
}

// ── Helper functions ───────────────────────────────────────────

/**
 * Derives a human-readable page title from the current pathname.
 * "/dashboard/bookings" → "Bookings"
 * "/dashboard"          → "Overview"
 */
function getPageTitle(pathname: string): string {
  const segments = pathname.replace(/^\/dashboard\/?/, "").split("/");
  const last = segments[segments.length - 1];
  if (!last) return "Overview";
  return last.charAt(0).toUpperCase() + last.slice(1);
}

/**
 * Derives admin notification items from live localStorage data.
 *
 * Sources:
 *  - BOOKINGS_STORAGE_KEY → pending bookings + upcoming confirmed charters.
 *  - CUSTOMERS_STORAGE_KEY → customers created from website bookings (cust-web-* IDs).
 *
 * Rules:
 *  - Every "pending" booking         → "New booking request" alert.
 *  - Confirmed booking within 14 days → "Upcoming charter" reminder.
 *  - Customer with id starting "cust-web-" → "New customer registered" alert.
 */
function deriveAdminNotifications(
  bookings:  Booking[],
  customers: Customer[],
): AdminNotif[] {
  const notifs: AdminNotif[] = [];
  const now  = Date.now();
  const in14 = now + 14 * 24 * 60 * 60 * 1_000;

  /* ── Booking-derived notifications ── */
  for (const b of bookings) {
    if (b.status === "pending") {
      notifs.push({
        id:    `pending-${b.id}`,
        type:  "pending_booking",
        title: "New booking request",
        sub:   `${b.customerName} · ${b.boatName}`,
        href:  "/dashboard/bookings",
      });
    } else if (b.status === "confirmed") {
      const start = new Date(b.startDate).getTime();
      if (start >= now && start <= in14) {
        notifs.push({
          id:    `upcoming-${b.id}`,
          type:  "upcoming",
          title: "Upcoming charter",
          sub:   `${b.boatName} · ${b.customerName} · ${
            new Date(b.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
          }`,
          href:  "/dashboard/calendar",
        });
      }
    }
  }

  /* ── New website customers ── */
  for (const c of customers) {
    if (c.id.startsWith("cust-web-")) {
      notifs.push({
        id:    `new-cust-${c.id}`,
        type:  "new_customer",
        title: "New customer registered",
        sub:   `${c.firstName} ${c.lastName} · ${c.email}`,
        href:  "/dashboard/customers",
      });
    }
  }

  return notifs;
}

/** Loads and re-derives all notifications from localStorage. */
function refreshNotifications(): AdminNotif[] {
  const bookings  = loadLS<Booking>(BOOKINGS_STORAGE_KEY,  dashboardConfig.recentBookings as Booking[]);
  const customers = loadLS<Customer>(CUSTOMERS_STORAGE_KEY, dashboardConfig.customers as Customer[]);
  return deriveAdminNotifications(bookings, customers);
}

// ── Sub-component ──────────────────────────────────────────────

/**
 * Renders the appropriate icon for a notification type.
 * pending_booking → amber AlertCircle
 * upcoming        → blue CalendarDays
 * new_customer    → emerald UserPlus
 */
function NotifIcon({ type }: { type: AdminNotif["type"] }) {
  if (type === "pending_booking") {
    return (
      <div className="w-7 h-7 rounded-sm bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
        <AlertCircle size={13} className="text-amber-500" aria-hidden />
      </div>
    );
  }
  if (type === "new_customer") {
    return (
      <div className="w-7 h-7 rounded-sm bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
        <UserPlus size={13} className="text-emerald-400" aria-hidden />
      </div>
    );
  }
  return (
    <div className="w-7 h-7 rounded-sm bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
      <CalendarDays size={13} className="text-blue-400" aria-hidden />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────

export function DashboardTopBar() {
  const pathname = usePathname();
  const { session, logout }  = useAuth();
  const { theme, toggle }    = useDashboardTheme();
  const { toggle: toggleSidebar } = useSidebar();
  /**
   * Profile picture uploaded via the customer portal (/portal/profile).
   * Shared through AvatarContext / localStorage so it appears here
   * automatically without extra wiring.
   */
  const { avatarUrl } = useAvatar();

  /* ── Dropdown open state ── */

  /** Whether the notification bell dropdown is open. */
  const [notifOpen,   setNotifOpen]   = useState(false);
  /** Whether the profile/avatar dropdown is open. */
  const [profileOpen, setProfileOpen] = useState(false);

  /**
   * Set of notification IDs the admin has dismissed.
   * Persisted to NOTIF_READ_KEY in localStorage so it survives page refreshes.
   */
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(NOTIF_READ_KEY);
      return raw ? new Set<string>(JSON.parse(raw) as string[]) : new Set();
    } catch { return new Set(); }
  });

  /* ── DOM refs for click-outside detection ── */

  /** Wraps the bell button + dropdown panel. */
  const notifRef   = useRef<HTMLDivElement>(null);
  /** Wraps the avatar button + dropdown panel. */
  const profileRef = useRef<HTMLDivElement>(null);

  /* ── Click-outside handler ── */

  /**
   * Closes any open dropdown when the user clicks outside its ref element.
   * Registered once on mount and cleaned up on unmount.
   */
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  /* ── Derived values ── */

  const title = getPageTitle(pathname);

  /**
   * Live notification list, seeded from localStorage on mount.
   * Updated whenever BOOKINGS_STORAGE_KEY or CUSTOMERS_STORAGE_KEY changes
   * (cross-tab via storage event, or same-tab after navigation).
   */
  const [notifications, setNotifications] = useState<AdminNotif[]>(() => refreshNotifications());

  /** Number of notifications the admin has not yet read. */
  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const email = session?.email ?? siteConfig.auth.demoEmail;

  /**
   * Display name: from session, or derived from email prefix.
   * e.g. "admin@oceanique.com" → "Admin"
   */
  const adminName = session?.name
    ?? email.split("@")[0].replace(/[._-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

  /** Single-letter initial for the avatar fallback tile. */
  const initial = email.charAt(0).toUpperCase();

  /* ── Persist readIds to localStorage on every change ── */
  useEffect(() => {
    try { localStorage.setItem(NOTIF_READ_KEY, JSON.stringify([...readIds])); } catch {}
  }, [readIds]);

  /* ── Re-derive notifications when another tab writes bookings or customers ── */
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === BOOKINGS_STORAGE_KEY || e.key === CUSTOMERS_STORAGE_KEY) {
        setNotifications(refreshNotifications());
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  /* ── Poll localStorage every 10 s for same-tab changes ──
   * localStorage.setItem() does NOT fire a storage event in the writing tab,
   * so a lightweight poll covers the case where both website and admin are
   * open in the same browser tab session (uncommon but possible).
   */
  useEffect(() => {
    const id = setInterval(() => setNotifications(refreshNotifications()), 10_000);
    return () => clearInterval(id);
  }, []);

  /** Marks every visible notification as read. */
  function markAllRead() {
    setReadIds(new Set(notifications.map((n) => n.id)));
  }

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-6 z-30">

      {/* ── Left: hamburger (mobile) + breadcrumb ── */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb: "Dashboard" / "Page Title" */}
        <span className="text-muted-foreground text-sm font-body">Dashboard</span>
        {title !== "Overview" && (
          <>
            <span className="text-muted-foreground/30 text-sm" aria-hidden>/</span>
            <span className="text-foreground text-sm font-body font-medium">{title}</span>
          </>
        )}
      </div>

      {/* ── Right: actions ── */}
      <div className="flex items-center gap-2">

        {/* Visit public website */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-xs font-body px-2 py-1.5 rounded-sm hover:bg-accent"
          title="Open public website"
        >
          <Globe size={14} aria-hidden />
          <span>Website</span>
        </Link>

        {/* Divider */}
        <div className="w-px h-4 bg-border mx-1" />

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="w-8 h-8 flex items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-foreground hover:border-gold/50 hover:bg-accent transition-colors duration-200"
        >
          {theme === "dark" ? (
            <Sun size={14} className="text-gold" aria-hidden />
          ) : (
            <Moon size={14} aria-hidden />
          )}
        </button>

        {/* ── Notification bell + dropdown ── */}
        <div ref={notifRef} className="relative">
          <button
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
            onClick={() => { setNotifOpen((o) => !o); setProfileOpen(false); }}
            className="relative w-8 h-8 flex items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-foreground hover:border-gold/50 hover:bg-accent transition-colors duration-200"
          >
            <Bell size={14} aria-hidden />
            {/* Unread count badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown panel */}
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                key="notif-panel"
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                exit={{    opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15, ease: EASE }}
                className="absolute top-full right-0 mt-2 w-80 bg-sidebar border border-sidebar-border shadow-2xl z-40 overflow-hidden"
              >
                {/* Panel header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
                  <div>
                    <p className="text-sm font-body font-medium text-foreground">Notifications</p>
                    <p className="text-[10px] font-body text-muted-foreground/50 mt-0.5">
                      {unreadCount > 0 ? `${unreadCount} requiring attention` : "All caught up"}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] font-body text-gold hover:text-gold-light transition-colors flex items-center gap-1"
                    >
                      <Check size={10} aria-hidden />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification list */}
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-muted-foreground/40 text-xs font-body">No notifications</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-sidebar-border max-h-72 overflow-y-auto">
                    {notifications.map((n) => {
                      const isRead = readIds.has(n.id);
                      return (
                        <li key={n.id}>
                          <Link
                            href={n.href}
                            onClick={() => {
                              setReadIds((prev) => new Set([...prev, n.id]));
                              setNotifOpen(false);
                            }}
                            className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-sidebar-accent ${
                              isRead ? "opacity-50" : ""
                            }`}
                          >
                            <NotifIcon type={n.type} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-body font-medium text-foreground leading-tight ${isRead ? "" : "text-foreground"}`}>
                                {n.title}
                              </p>
                              <p className="text-[10px] font-body text-muted-foreground/60 mt-0.5 truncate">
                                {n.sub}
                              </p>
                            </div>
                            {/* Unread dot */}
                            {!isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Footer: link to bookings page */}
                <div className="border-t border-sidebar-border">
                  <Link
                    href="/dashboard/bookings"
                    onClick={() => setNotifOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 text-[11px] font-body text-muted-foreground/60 hover:text-foreground hover:bg-sidebar-accent transition-colors"
                  >
                    <span>View all bookings</span>
                    <ChevronRight size={12} aria-hidden />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-border mx-1" />

        {/* ── Avatar + profile dropdown ── */}
        <div ref={profileRef} className="relative">
          {/*
           * If a photo has been uploaded it fills the button as an <img>;
           * otherwise the initial tile is shown as a fallback.
           */}
          <button
            aria-label="Open admin profile menu"
            onClick={() => { setProfileOpen((o) => !o); setNotifOpen(false); }}
            className="w-8 h-8 rounded-sm overflow-hidden border border-gold/30 hover:border-gold/60 transition-colors shrink-0"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Admin profile"
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full bg-gold/15 flex items-center justify-center">
                <span className="text-gold text-xs font-heading font-semibold">
                  {initial}
                </span>
              </div>
            )}
          </button>

          {/* Profile dropdown panel */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                key="profile-panel"
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                exit={{    opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15, ease: EASE }}
                className="absolute top-full right-0 mt-2 w-56 bg-sidebar border border-sidebar-border shadow-2xl z-40 overflow-hidden"
              >
                {/* Admin identity header */}
                <div className="px-4 py-3 border-b border-sidebar-border">
                  {/* Mini avatar + name row */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-sm overflow-hidden border border-gold/20 shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Admin profile" className="w-full h-full object-cover object-center" />
                      ) : (
                        <div className="w-full h-full bg-gold/15 flex items-center justify-center">
                          <span className="text-gold text-[11px] font-heading font-semibold">{initial}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-body text-foreground font-medium leading-tight truncate">
                        {adminName}
                      </p>
                      <p className="text-[11px] font-body text-muted-foreground/50 truncate">{email}</p>
                    </div>
                  </div>
                  {/* Role badge */}
                  <span className="inline-flex items-center gap-1 text-[9px] font-body font-medium tracking-[0.2em] uppercase px-2 py-0.5 rounded-sm border text-gold border-gold/30 bg-gold/8">
                    Administrator
                  </span>
                </div>

                {/* Navigation actions */}
                <div className="py-1.5">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm font-body text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
                  >
                    <Settings size={13} className="shrink-0" aria-hidden />
                    Settings
                  </Link>
                  <Link
                    href="/portal"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm font-body text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
                  >
                    <User size={13} className="shrink-0" aria-hidden />
                    Customer Portal
                  </Link>
                </div>

                {/* Divider + sign out */}
                <div className="border-t border-sidebar-border py-1.5">
                  <button
                    onClick={() => { setProfileOpen(false); logout(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-body text-muted-foreground/60 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                  >
                    <LogOut size={13} className="shrink-0" aria-hidden />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
