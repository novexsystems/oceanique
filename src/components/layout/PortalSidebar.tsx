/**
 * ============================================================
 * OCEANIQUE — PortalSidebar  (Customer Portal)
 * ============================================================
 * Left sidebar shown on all /portal/* pages. Mirrors the
 * DashboardSidebar structure but uses portal navigation items
 * and customer-specific bottom actions.
 *
 * Features:
 *  - Brand logo + "Guest Portal" label
 *  - Animated active-item indicator (spring layoutId)
 *  - Pending count badges on Bookings and Documents items
 *    derived from portalConfig (no extra prop drilling needed)
 *  - Customer mini-card at the bottom showing initials, name,
 *    and membership tier for a personalised feel
 *  - Sign-out button with intentional red hover state
 *
 * DATA SOURCES:
 * - Nav items    → src/config/navigation.config.ts (portal.sidebar)
 * - Bottom items → src/config/navigation.config.ts (portal.sidebarBottom)
 * - Brand name   → src/config/site.config.ts (brand.logoText)
 * - Customer     → src/config/portal.config.ts (customerProfile)
 * - Badges       → src/config/portal.config.ts (bookings, documents)
 *
 * CUSTOMIZE:
 * - Add/remove nav items: edit navigation.config.ts → portal.sidebar
 * - Add a new icon: import from lucide-react, add to ICON_MAP below.
 * - Badge logic: update PENDING_BADGE_HREFS / counts to match new pages.
 * ============================================================
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Anchor,
  BookOpen,
  FileText,
  User,
  MessageCircle,
  Globe,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { navigationConfig } from "@/config/navigation.config";
import { siteConfig } from "@/config/site.config";
import { portalConfig } from "@/config/portal.config";
import { useAuth } from "@/hooks/useAuth";
import { useAvatar } from "@/contexts/AvatarContext";

/**
 * Lucide icon lookup map.
 * Keys must match the `icon` string values in navigation.config.ts.
 * Add entries here whenever a new icon is needed for a nav item.
 */
const ICON_MAP: Record<string, LucideIcon> = {
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
 * Returns the membership-tier text colour class for the customer
 * mini-card. Intentionally distinct from the top-bar tier badge
 * so it reads well inside the sidebar's background.
 */
function tierColourClass(tier: string): string {
  if (tier === "Gold")     return "text-gold";
  if (tier === "Platinum") return "text-slate-400 dark:text-slate-300";
  return "text-slate-400";
}

export function PortalSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { sidebar, sidebarBottom } = navigationConfig.portal;

  /* ── Customer data for the mini-card ── */
  const { firstName, lastName, membershipTier } = portalConfig.customerProfile;
  /** Shared profile picture — set from /portal/profile, also visible in top bars. */
  const { avatarUrl } = useAvatar();

  /**
   * Number of bookings in a "pending" state.
   * Shown as a count badge on the My Bookings nav item.
   */
  const pendingBookingCount = portalConfig.bookings.filter(
    (b) => b.status === "pending",
  ).length;

  /**
   * Number of documents with a "pending" status (unpaid invoices,
   * unsigned forms, etc.). Shown as a badge on the Documents nav item.
   */
  const pendingDocCount = portalConfig.documents.filter(
    (d) => d.status === "pending",
  ).length;

  /**
   * Maps a nav item's href to its pending count badge value.
   * Only items with a count > 0 will render a badge.
   */
  const badgeCounts: Record<string, number> = {
    "/portal/bookings":  pendingBookingCount,
    "/portal/documents": pendingDocCount,
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-40">

      {/* ── Brand / logo header ── */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border flex-shrink-0">
        <div className="flex flex-col">
          <Link
            href="/"
            className="font-heading text-base tracking-[0.3em] uppercase text-gold hover:text-gold-light transition-colors leading-none"
          >
            {siteConfig.brand.logoText}
          </Link>
          <span className="text-muted-foreground/30 text-[9px] tracking-[0.25em] uppercase font-body mt-1">
            Guest Portal
          </span>
        </div>
      </div>

      {/* ── Main navigation ── */}
      <nav className="flex-1 py-4 overflow-y-auto" aria-label="Portal navigation">
        {/* Section label */}
        <p className="text-muted-foreground/35 text-[9px] font-body tracking-[0.25em] uppercase px-6 mb-3">
          Navigation
        </p>

        <ul className="space-y-0.5 px-3">
          {sidebar.map((item) => {
            const isActive =
              item.href === "/portal"
                ? pathname === "/portal"
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
                      layoutId="portal-sidebar-active"
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

      {/* ── Customer mini-card + bottom actions ── */}
      <div className="flex-shrink-0 border-t border-sidebar-border">

        {/* Customer identity card */}
        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            {/* Initials avatar or uploaded photo */}
            <div className="w-7 h-7 rounded-sm overflow-hidden border border-gold/20 shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full bg-gold/15 flex items-center justify-center">
                  <span className="text-gold text-[10px] font-body font-bold tracking-wide">
                    {firstName[0]}{lastName[0]}
                  </span>
                </div>
              )}
            </div>
            {/* Name + tier */}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-body text-foreground font-medium leading-tight truncate">
                {firstName} {lastName}
              </p>
              <p className={`text-[9px] font-body tracking-[0.15em] uppercase mt-0.5 ${tierColourClass(membershipTier)}`}>
                {membershipTier}
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
  );
}
