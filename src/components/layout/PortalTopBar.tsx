/**
 * ============================================================
 * OCEANIQUE — PortalTopBar  (Customer Portal)
 * ============================================================
 * Fixed top bar shown on all /portal/* pages.
 *
 * Features:
 *  - Page title derived from the current pathname
 *  - ⌘K / Ctrl+K search command palette: filters portal nav
 *    items and navigates on selection; Escape to close
 *  - Notification bell with a dropdown panel:
 *      · Items derived automatically from portalConfig
 *        (upcoming confirmed bookings, pending bookings,
 *         pending invoices, pending forms)
 *      · Per-notification read/unread dot
 *      · Unread count badge on the bell
 *      · "Mark all read" shortcut
 *  - Avatar / profile dropdown:
 *      · Customer name, email, and tier header
 *      · "My Profile" link → /portal/profile
 *      · Sign out action
 *  - Light/dark theme toggle (persisted in localStorage)
 *  - Click-outside handler closes both dropdowns
 *
 * DATA SOURCES:
 * - Session / name    → useAuth hook (src/hooks/useAuth.ts)
 * - Portal nav        → src/config/navigation.config.ts
 * - Notification data → src/config/portal.config.ts
 *
 * CUSTOMIZE:
 * - Replace the derived notification logic with a real
 *   /api/notifications fetch when a backend is available.
 * ============================================================
 */

"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Crown, Sun, Moon, Search, X, Anchor, FileText,
  AlertTriangle, User, ChevronRight, LogOut, Check,
  LayoutDashboard, BookOpen, MessageCircle, Globe,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { navigationConfig } from "@/config/navigation.config";
import { portalConfig } from "@/config/portal.config";
import { useAvatar } from "@/contexts/AvatarContext";

/** Shared easing for dropdown animations. */
const EASE = [0.25, 0.1, 0, 1] as const;

/**
 * Tier badge colour classes, keyed by tier name.
 * Falls back to Silver styling for unknown tiers.
 */
const TIER_COLOUR: Record<string, string> = {
  Platinum: "text-slate-600 dark:text-slate-200 border-slate-300 dark:border-slate-500/40 bg-slate-100 dark:bg-slate-500/10",
  Gold:     "text-gold border-gold/40 bg-gold/10",
  Silver:   "text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-400/40 bg-slate-50 dark:bg-slate-400/10",
};

/**
 * Icon map for the search palette — mirrors PortalSidebar's iconMap
 * so the correct icon is shown next to each nav item in results.
 */
const NAV_ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Anchor,
  BookOpen,
  FileText,
  User,
  MessageCircle,
  Globe,
  LogOut,
};

/**
 * Represents a single item in the notification dropdown.
 * Derived from portalConfig bookings and documents.
 */
type PortalNotification = {
  id:       string;
  title:    string;
  desc:     string;
  href:     string;
  /** Controls which icon/colour is shown for this notification. */
  variant:  "booking-confirmed" | "booking-pending" | "invoice" | "form";
};

// ── Helpers ──────────────────────────────────────────────────

/**
 * Derives the human-readable page title from the current pathname
 * by matching against the portal sidebar navigation config.
 */
function getPageTitle(pathname: string): string {
  const match = navigationConfig.portal.sidebar.find((item) =>
    item.href === "/portal"
      ? pathname === "/portal"
      : pathname.startsWith(item.href),
  );
  return match?.label ?? "Portal";
}

/**
 * Builds the notification list from static portal config data.
 * Replace with an API fetch to get real server-side notifications.
 *
 * Generates:
 *  - Upcoming confirmed bookings (departs in N days)
 *  - Bookings awaiting confirmation
 *  - Pending invoices (unpaid)
 *  - Pending documents (awaiting completion)
 */
function deriveNotifications(): PortalNotification[] {
  const items: PortalNotification[] = [];

  /* Booking-derived notifications */
  for (const b of portalConfig.bookings) {
    if (b.status === "confirmed") {
      const days = Math.ceil(
        (new Date(b.startDate).getTime() - Date.now()) / 86_400_000,
      );
      /* Only surface upcoming departures (future dates) */
      if (days > 0) {
        items.push({
          id:      `b-${b.id}`,
          variant: "booking-confirmed",
          title:   `Departure in ${days} day${days !== 1 ? "s" : ""}`,
          desc:    `${b.boatName} · ${b.basePort}`,
          href:    "/portal/bookings",
        });
      }
    }
    if (b.status === "pending") {
      items.push({
        id:      `bp-${b.id}`,
        variant: "booking-pending",
        title:   "Booking awaiting confirmation",
        desc:    `${b.boatName} · ${new Date(b.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`,
        href:    "/portal/bookings",
      });
    }
  }

  /* Document-derived notifications */
  for (const d of portalConfig.documents) {
    if (d.status !== "pending") continue;
    const truncated = d.name.length > 46 ? d.name.slice(0, 46) + "…" : d.name;
    items.push({
      id:      `d-${d.id}`,
      variant: d.type === "invoice" ? "invoice" : "form",
      title:   d.type === "invoice" ? "Invoice awaiting payment" : "Document needs attention",
      desc:    truncated,
      href:    "/portal/documents",
    });
  }

  return items;
}

// ── Sub-component ─────────────────────────────────────────────

/**
 * Coloured icon tile for a notification row.
 * Variant determines the icon and background colour.
 */
function NotifIcon({ variant }: { variant: PortalNotification["variant"] }) {
  if (variant === "booking-confirmed")
    return (
      <div className="w-8 h-8 rounded-sm bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
        <Anchor size={13} className="text-gold" />
      </div>
    );
  if (variant === "booking-pending")
    return (
      <div className="w-8 h-8 rounded-sm bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
        <Anchor size={13} className="text-amber-400" />
      </div>
    );
  if (variant === "invoice")
    return (
      <div className="w-8 h-8 rounded-sm bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
        <AlertTriangle size={13} className="text-amber-400" />
      </div>
    );
  /* form */
  return (
    <div className="w-8 h-8 rounded-sm bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
      <FileText size={13} className="text-blue-400" />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

export function PortalTopBar() {
  const pathname   = usePathname();
  const router     = useRouter();
  const { session, logout } = useAuth();
  const { theme, toggle }   = useDashboardTheme();
  /** Profile picture shared with PortalSidebar and DashboardTopBar. */
  const { avatarUrl }       = useAvatar();

  /* ── Dropdown / overlay open state ── */

  /** Whether the notification dropdown panel is open. */
  const [notifOpen,   setNotifOpen]   = useState(false);
  /** Whether the profile/avatar dropdown is open. */
  const [profileOpen, setProfileOpen] = useState(false);
  /** Whether the ⌘K search command palette is open. */
  const [searchOpen,  setSearchOpen]  = useState(false);
  /** Current text in the search palette input. */
  const [searchQuery, setSearchQuery] = useState("");

  /**
   * Set of notification IDs the customer has "read" (clicked or marked).
   * Persists only for the current session — wire to API for permanence.
   */
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  /* ── DOM refs for click-outside detection ── */

  /** Wraps the bell button + dropdown for click-outside detection. */
  const notifRef   = useRef<HTMLDivElement>(null);
  /** Wraps the avatar button + dropdown for click-outside detection. */
  const profileRef = useRef<HTMLDivElement>(null);

  /* ── Derived values ── */

  const pageTitle                  = getPageTitle(pathname);
  const { membershipTier, firstName, lastName, email } = portalConfig.customerProfile;

  /** All portal notifications derived from static config. */
  const notifications = useMemo(() => deriveNotifications(), []);

  /** Count of notifications the customer hasn't yet read. */
  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  /** Initials shown in the avatar tile. */
  const initials = session?.name
    ? session.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : `${firstName[0]}${lastName[0]}`;

  /**
   * Portal nav items filtered by the current search query.
   * Searches both the label and description fields.
   */
  const filteredNav = useMemo(() => {
    if (!searchQuery.trim()) return navigationConfig.portal.sidebar;
    const q = searchQuery.toLowerCase();
    return navigationConfig.portal.sidebar.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item as { description?: string }).description?.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  /* ── Side effects ── */

  /**
   * Global mousedown handler that closes open dropdowns when the
   * user clicks anywhere outside their containing element.
   */
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  /**
   * Global keydown handler.
   * - ⌘K / Ctrl+K : open the search command palette.
   * - Escape       : close the search palette (also clears the query).
   */
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, []);

  /* ── Handlers ── */

  /** Marks a single notification as read and navigates to its href. */
  function openNotification(n: PortalNotification) {
    setReadIds((prev) => new Set([...prev, n.id]));
    setNotifOpen(false);
    router.push(n.href);
  }

  /** Marks every notification as read. */
  function markAllRead() {
    setReadIds(new Set(notifications.map((n) => n.id)));
  }

  /** Closes the search palette, clears the query, and navigates. */
  function selectSearchResult(href: string) {
    router.push(href);
    setSearchOpen(false);
    setSearchQuery("");
  }

  return (
    <>
      {/* ── Top bar ── */}
      <header className="fixed top-0 left-64 right-0 h-16 bg-background/95 backdrop-blur border-b border-sidebar-border z-30 flex items-center justify-between px-8">

        {/* Left — page title */}
        <div>
          <h2 className="font-heading text-lg text-foreground leading-none">{pageTitle}</h2>
        </div>

        {/* Right — search + tier badge + theme + notifications + avatar */}
        <div className="flex items-center gap-3">

          {/* ⌘K search trigger button */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-sidebar border border-sidebar-border text-muted-foreground/50 hover:text-foreground hover:border-gold/30 transition-colors text-[11px] font-body"
          >
            <Search size={12} />
            <span>Search</span>
            <kbd className="ml-1 text-[9px] tracking-widest opacity-50">⌘K</kbd>
          </button>

          {/* Membership tier badge */}
          <span className={`hidden sm:inline-flex items-center gap-1.5 text-[10px] font-body font-medium tracking-[0.2em] uppercase px-3 py-1 rounded-sm border ${TIER_COLOUR[membershipTier] ?? TIER_COLOUR.Silver}`}>
            <Crown size={11} aria-hidden />
            {membershipTier}
          </span>

          {/* Light/dark theme toggle */}
          <button
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="w-8 h-8 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-gold/40 hover:bg-accent transition-colors"
          >
            {theme === "dark"
              ? <Sun  size={14} className="text-gold" aria-hidden />
              : <Moon size={14} aria-hidden />}
          </button>

          {/* ── Notification bell + dropdown ── */}
          <div ref={notifRef} className="relative">
            <button
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
              onClick={() => { setNotifOpen((o) => !o); setProfileOpen(false); }}
              className="relative w-8 h-8 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-gold/40 hover:bg-accent transition-colors"
            >
              <Bell size={15} />
              {/* Unread count badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-gold text-midnight text-[9px] font-body font-bold leading-none">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown panel */}
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  key="notif-panel"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  className="absolute top-full right-0 mt-2 w-80 bg-sidebar border border-sidebar-border shadow-2xl z-40 overflow-hidden"
                >
                  {/* Dropdown header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
                    <p className="font-heading text-sm text-foreground">Notifications</p>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[10px] font-body text-gold/70 hover:text-gold transition-colors tracking-[0.1em] uppercase flex items-center gap-1"
                      >
                        <Check size={9} /> Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification list */}
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm font-body text-muted-foreground/50">No notifications.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-sidebar-border">
                      {notifications.map((n) => {
                        const isRead = readIds.has(n.id);
                        return (
                          <button
                            key={n.id}
                            onClick={() => openNotification(n)}
                            className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-sidebar-accent transition-colors ${isRead ? "opacity-50" : ""}`}
                          >
                            <NotifIcon variant={n.variant} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-body text-foreground font-medium leading-snug">
                                {n.title}
                              </p>
                              <p className="text-[11px] font-body text-muted-foreground/60 mt-0.5 truncate">
                                {n.desc}
                              </p>
                            </div>
                            {/* Unread dot */}
                            {!isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Footer links */}
                  <div className="border-t border-sidebar-border px-4 py-2.5 flex items-center gap-4">
                    <Link
                      href="/portal/bookings"
                      onClick={() => setNotifOpen(false)}
                      className="text-[10px] font-body text-muted-foreground/50 hover:text-gold tracking-[0.1em] uppercase transition-colors"
                    >
                      Bookings
                    </Link>
                    <Link
                      href="/portal/documents"
                      onClick={() => setNotifOpen(false)}
                      className="text-[10px] font-body text-muted-foreground/50 hover:text-gold tracking-[0.1em] uppercase transition-colors"
                    >
                      Documents
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Avatar + profile dropdown ── */}
          <div ref={profileRef} className="relative">
            {/*
             * If a photo has been uploaded it fills the button as an <img>;
             * otherwise the initials tile is shown as before.
             */}
            <button
              aria-label="Open profile menu"
              onClick={() => { setProfileOpen((o) => !o); setNotifOpen(false); }}
              className="w-8 h-8 rounded-sm overflow-hidden border border-gold/30 hover:border-gold/60 transition-colors shrink-0"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full bg-gold/20 flex items-center justify-center">
                  <span className="text-gold text-[11px] font-body font-semibold tracking-wide">
                    {initials}
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
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  className="absolute top-full right-0 mt-2 w-56 bg-sidebar border border-sidebar-border shadow-2xl z-40 overflow-hidden"
                >
                  {/* Customer identity header */}
                  <div className="px-4 py-3 border-b border-sidebar-border">
                    {/* Mini avatar + name row */}
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-sm overflow-hidden border border-gold/20 shrink-0">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover object-center" />
                        ) : (
                          <div className="w-full h-full bg-gold/15 flex items-center justify-center">
                            <span className="text-gold text-[10px] font-body font-bold">{initials}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-body text-foreground font-medium leading-tight truncate">
                          {firstName} {lastName}
                        </p>
                        <p className="text-[11px] font-body text-muted-foreground/50 truncate">{email}</p>
                      </div>
                    </div>
                    {/* Tier badge */}
                    <span className={`inline-flex items-center gap-1 text-[9px] font-body font-medium tracking-[0.2em] uppercase px-2 py-0.5 rounded-sm border ${TIER_COLOUR[membershipTier] ?? TIER_COLOUR.Silver}`}>
                      <Crown size={8} aria-hidden />
                      {membershipTier}
                    </span>
                  </div>

                  {/* Navigation actions */}
                  <div className="py-1.5">
                    <Link
                      href="/portal/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm font-body text-foreground hover:bg-sidebar-accent hover:text-gold transition-colors"
                    >
                      <User size={13} className="text-muted-foreground/50" />
                      My Profile
                    </Link>
                  </div>

                  <div className="border-t border-sidebar-border py-1.5">
                    <button
                      onClick={() => { setProfileOpen(false); logout(); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-body text-muted-foreground/60 hover:text-red-400 hover:bg-sidebar-accent transition-colors"
                    >
                      <LogOut size={13} />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ── ⌘K Search command palette overlay ── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            /* Backdrop — click to close */
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-28 px-4"
            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
          >
            {/* Palette card — stopPropagation so clicks inside don't close */}
            <motion.div
              initial={{ opacity: 0, y: -14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.2, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-sidebar border border-sidebar-border shadow-2xl overflow-hidden"
            >
              {/* Search input row */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-sidebar-border">
                <Search size={14} className="text-muted-foreground/40 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search portal pages…"
                  className="flex-1 bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
                />
                <button
                  onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  aria-label="Close search"
                  className="text-muted-foreground/30 hover:text-foreground transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Filtered nav items */}
              <div className="overflow-y-auto max-h-72 py-1.5">
                {filteredNav.length === 0 ? (
                  <p className="px-4 py-6 text-sm font-body text-muted-foreground/50 text-center">
                    No results for &ldquo;{searchQuery}&rdquo;.
                  </p>
                ) : (
                  filteredNav.map((item) => {
                    const Icon = NAV_ICON_MAP[item.icon] ?? LayoutDashboard;
                    const isActive = item.href === "/portal"
                      ? pathname === "/portal"
                      : pathname.startsWith(item.href);
                    return (
                      <button
                        key={item.href}
                        onClick={() => selectSearchResult(item.href)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-sidebar-accent transition-colors text-left"
                      >
                        <Icon size={14} className={isActive ? "text-gold" : "text-muted-foreground/40"} aria-hidden />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-body ${isActive ? "text-gold" : "text-foreground"}`}>
                            {item.label}
                          </p>
                          {(item as { description?: string }).description && (
                            <p className="text-[11px] font-body text-muted-foreground/50 truncate">
                              {(item as { description?: string }).description}
                            </p>
                          )}
                        </div>
                        <ChevronRight size={12} className="text-muted-foreground/25 shrink-0" />
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer keyboard hints */}
              <div className="px-4 py-2 border-t border-sidebar-border flex items-center gap-2">
                <kbd className="text-[9px] font-body text-muted-foreground/30 px-1.5 py-0.5 border border-border">↵</kbd>
                <span className="text-[10px] font-body text-muted-foreground/30">to navigate</span>
                <span className="mx-2 text-muted-foreground/20">·</span>
                <kbd className="text-[9px] font-body text-muted-foreground/30 px-1.5 py-0.5 border border-border">Esc</kbd>
                <span className="text-[10px] font-body text-muted-foreground/30">to close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
