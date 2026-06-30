/**
 * ============================================================
 * OCEANIQUE — DashboardSidebar
 * ============================================================
 * The left sidebar navigation shown on all dashboard pages.
 * Renders nav items from navigation.config.ts with Lucide icons,
 * highlights the active route with an animated Framer Motion pill,
 * shows pending booking count badges, and displays an admin
 * identity card pinned at the bottom.
 *
 * Features:
 *  - Animated active-item indicator (spring layoutId)
 *  - Pending booking count badge on the Bookings nav item,
 *    derived from dashboardConfig.recentBookings
 *  - Admin identity mini-card (avatar + email + role badge)
 *    sharing the same AvatarContext as the portal
 *  - Mobile slide-in drawer with backdrop and close button
 *  - Sign-out with intentional red hover state
 *
 * DATA SOURCES:
 * - Nav items      → src/config/navigation.config.ts (dashboard.sidebar)
 * - Bottom items   → src/config/navigation.config.ts (dashboard.sidebarBottom)
 * - Brand name     → src/config/site.config.ts (brand.logoText)
 * - Admin session  → useAuth() hook
 * - Avatar         → AvatarContext / localStorage
 * - Badge counts   → src/config/dashboard.config.ts (recentBookings)
 *
 * CUSTOMIZE:
 * - Add/remove nav items: edit navigation.config.ts → dashboard.sidebar
 * - Add a new icon: import from lucide-react, add to ICON_MAP below.
 * - Badge logic: extend badgeCounts with additional hrefs/counts.
 * - Sidebar width: update w-64 here and pl-64 in dashboard/layout.tsx.
 * ============================================================
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Anchor,
  BookOpen,
  CalendarDays,
  Users,
  BarChart3,
  Settings,
  Globe,
  LogOut,
  X,
  type LucideIcon,
} from "lucide-react";
import { navigationConfig } from "@/config/navigation.config";
import { siteConfig } from "@/config/site.config";
import { dashboardConfig } from "@/config/dashboard.config";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAvatar } from "@/contexts/AvatarContext";

/**
 * Lucide icon lookup map.
 * Keys must match the `icon` string values in navigation.config.ts.
 * Add entries here when a new icon is needed for a nav item.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Anchor,
  BookOpen,
  CalendarDays,
  Users,
  BarChart3,
  Settings,
  Globe,
  LogOut,
};

export function DashboardSidebar() {
  const pathname           = usePathname();
  const { session, logout } = useAuth();
  const { sidebar, sidebarBottom } = navigationConfig.dashboard;
  const { isOpen, close } = useSidebar();
  /** Shared profile picture set via the customer portal. */
  const { avatarUrl }      = useAvatar();

  /** Close the mobile drawer whenever the route changes. */
  useEffect(() => { close(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Badge counts derived from config ── */

  /**
   * Number of bookings currently in "pending" status.
   * Shown as a count badge on the Bookings nav item to alert
   * the admin that requests need attention.
   */
  const pendingBookingCount = dashboardConfig.recentBookings.filter(
    (b) => b.status === "pending",
  ).length;

  /**
   * Maps nav item hrefs to their badge count values.
   * Only items with count > 0 will render a badge.
   */
  const badgeCounts: Record<string, number> = {
    "/dashboard/bookings": pendingBookingCount,
  };

  /* ── Admin identity for the mini-card ── */

  /** Displayed email — falls back to the demo email from siteConfig. */
  const adminEmail = session?.email ?? siteConfig.auth.demoEmail;

  /**
   * Display name derived from session or from the email prefix.
   * e.g. "admin@oceanique.com" → "Admin"
   */
  const adminName = session?.name
    ?? adminEmail.split("@")[0].replace(/[._-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

  /** Single-letter initials from the email for the fallback avatar. */
  const initials = adminEmail.charAt(0).toUpperCase();

  return (
    <>
      {/* ── Mobile backdrop ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={close}
          />
        )}
      </AnimatePresence>

      {/*
       * sidebar-drawer  — base transition (transform 0.3s ease-in-out)
       * sidebar-open    — translateX(0)   when drawer is open
       * sidebar-closed  — translateX(-100%) when drawer is closed
       * Both classes resolve to transform:none on lg+ so the sidebar
       * is always visible on desktop regardless of isOpen state.
       * These are static CSS utilities in globals.css — immune to the
       * Tailwind v4 scanner's inability to detect dynamic class names.
       */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-40
          sidebar-drawer ${isOpen ? "sidebar-open" : "sidebar-closed"}
        `}
      >

        {/* ── Brand / logo header ── */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border flex-shrink-0">
          <div className="flex flex-col">
            <Link
              href="/"
              className="font-heading text-base tracking-[0.3em] uppercase text-gold hover:text-gold-light transition-colors leading-none"
            >
              {siteConfig.brand.logoText}
            </Link>
            <span className="text-muted-foreground/30 text-[9px] tracking-[0.25em] uppercase font-body mt-1">
              Admin Panel
            </span>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={close}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Main navigation ── */}
        <nav className="flex-1 py-4 overflow-y-auto" aria-label="Dashboard navigation">
          {/* Section label */}
          <p className="text-muted-foreground/35 text-[9px] font-body tracking-[0.25em] uppercase px-6 mb-3">
            Management
          </p>
          <ul className="space-y-0.5 px-3">
            {sidebar.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              const Icon  = ICON_MAP[item.icon] ?? LayoutDashboard;
              /** Pending-action badge count for this item (0 = no badge). */
              const badge = badgeCounts[item.href] ?? 0;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={item.description}
                    className={`
                      relative flex items-center gap-3 px-3 py-2.5 rounded-sm
                      font-body text-sm transition-colors duration-150
                      ${isActive
                        ? "text-gold bg-gold/10"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      }
                    `}
                  >
                    {/* Animated gold left-edge active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1 bottom-1 w-0.5 bg-gold rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    {/* Nav icon */}
                    <Icon
                      size={16}
                      className={isActive ? "text-gold" : "text-muted-foreground/50"}
                      aria-hidden
                    />

                    {/* Label */}
                    <span className="flex-1">{item.label}</span>

                    {/* Pending count badge — only rendered when badge > 0 */}
                    {badge > 0 && (
                      <span className="text-[9px] font-body font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded-sm leading-none">
                        {badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Admin identity card + bottom actions ── */}
        <div className="flex-shrink-0 border-t border-sidebar-border">

          {/* Admin identity card */}
          <div className="px-4 py-3 border-b border-sidebar-border">
            <div className="flex items-center gap-2.5">
              {/* Avatar: photo from AvatarContext, or initial fallback */}
              <div className="w-7 h-7 rounded-sm overflow-hidden border border-gold/20 shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Admin avatar"
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full bg-gold/15 flex items-center justify-center">
                    <span className="text-gold text-[10px] font-body font-bold tracking-wide">
                      {initials}
                    </span>
                  </div>
                )}
              </div>
              {/* Name + role */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-body text-foreground font-medium leading-tight truncate">
                  {adminName}
                </p>
                <p className="text-[9px] font-body text-gold tracking-[0.15em] uppercase mt-0.5">
                  Administrator
                </p>
              </div>
            </div>
          </div>

          {/* Bottom action links (Visit Website, Sign Out) */}
          <div className="py-2 px-3 space-y-0.5">
            {sidebarBottom.map((item) => {
              const Icon     = ICON_MAP[item.icon] ?? Globe;
              const isLogout = item.icon === "LogOut";

              if (isLogout) {
                return (
                  <button
                    key={item.href}
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-sm font-body text-sm transition-colors duration-150 text-muted-foreground/50 hover:text-red-400 hover:bg-red-500/5"
                  >
                    <Icon size={15} aria-hidden />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-sm font-body text-sm transition-colors duration-150 text-muted-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <Icon size={15} aria-hidden />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
