/**
 * ============================================================
 * OCEANIQUE — NAVIGATION CONFIGURATION
 * ============================================================
 * Defines all navigation menus: the public website header,
 * footer links, and the dashboard sidebar navigation.
 *
 * HOW TO CUSTOMIZE:
 *  1. Edit `website.main` to change the public header menu items.
 *  2. Edit `website.footer` to organize footer link columns.
 *  3. Edit `dashboard.sidebar` to add/remove dashboard pages.
 *     The `icon` field matches Lucide icon component names
 *     (see https://lucide.dev/icons/).
 * ============================================================
 */

export const navigationConfig = {
  // ----------------------------------------------------------
  // PUBLIC WEBSITE NAVIGATION
  // ----------------------------------------------------------
  website: {
    /** Main header navigation links */
    main: [
      { label: "Home", href: "/" },
      { label: "Fleet", href: "/fleet" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],

    /** Footer link columns — each column has a title and list of links */
    footer: {
      company: {
        title: "Company",
        links: [
          { label: "About Us", href: "/about" },
          { label: "Our Fleet", href: "/fleet" },
          { label: "Contact", href: "/contact" },
          { label: "Dashboard", href: "/login" },
        ],
      },
      services: {
        title: "Services",
        links: [
          { label: "Day Charters", href: "/fleet" },
          { label: "Private Events", href: "/contact" },
          { label: "Corporate Charters", href: "/contact" },
          { label: "Long-Term Rentals", href: "/contact" },
        ],
      },
      legal: {
        title: "Legal",
        links: [
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms of Service", href: "/terms" },
          { label: "Cookie Policy", href: "/cookies" },
        ],
      },
    },
  },

  // ----------------------------------------------------------
  // CUSTOMER PORTAL SIDEBAR NAVIGATION
  // Each item maps to a portal page. Icon values must be valid
  // Lucide icon names (PascalCase).
  // ----------------------------------------------------------
  portal: {
    sidebar: [
      {
        label: "Overview",
        href: "/portal",
        icon: "LayoutDashboard",
        description: "Your charter summary and upcoming trips",
      },
      {
        label: "My Bookings",
        href: "/portal/bookings",
        icon: "BookOpen",
        description: "View and manage your charter bookings",
      },
      {
        label: "Explore Fleet",
        href: "/portal/fleet",
        icon: "Anchor",
        description: "Browse available yachts and request a charter",
      },
      {
        label: "Documents",
        href: "/portal/documents",
        icon: "FileText",
        description: "Your contracts, invoices, and forms",
      },
      {
        label: "My Profile",
        href: "/portal/profile",
        icon: "User",
        description: "Personal details and charter preferences",
      },
      {
        label: "Support",
        href: "/portal/support",
        icon: "MessageCircle",
        description: "Get help from the Oceanique team",
      },
    ],

    sidebarBottom: [
      {
        label: "Visit Website",
        href: "/",
        icon: "Globe",
      },
      {
        label: "Sign Out",
        href: "/login",
        icon: "LogOut",
      },
    ],
  },

  // ----------------------------------------------------------
  // ADMIN DASHBOARD SIDEBAR NAVIGATION
  // Each item maps to a dashboard page. The `icon` value must
  // be a valid Lucide icon name (PascalCase).
  // ----------------------------------------------------------
  dashboard: {
    sidebar: [
      {
        label: "Overview",
        href: "/dashboard",
        icon: "LayoutDashboard",
        description: "Business summary and key metrics",
      },
      {
        label: "Fleet",
        href: "/dashboard/boats",
        icon: "Anchor",
        description: "Manage your boat inventory and availability",
      },
      {
        label: "Bookings",
        href: "/dashboard/bookings",
        icon: "BookOpen",
        description: "View and manage all bookings",
      },
      {
        label: "Calendar",
        href: "/dashboard/calendar",
        icon: "CalendarDays",
        description: "Visual availability and booking calendar",
      },
      {
        label: "Customers",
        href: "/dashboard/customers",
        icon: "Users",
        description: "Customer database and profiles",
      },
      {
        label: "Analytics",
        href: "/dashboard/analytics",
        icon: "BarChart3",
        description: "Revenue, bookings, and performance data",
      },
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: "Settings",
        description: "Business and account settings",
      },
    ],

    /** Bottom sidebar items (pinned below main nav) */
    sidebarBottom: [
      {
        label: "Visit Website",
        href: "/",
        icon: "Globe",
      },
      {
        label: "Sign Out",
        href: "/login",
        icon: "LogOut",
      },
    ],
  },
} as const;

/** Convenience type exports */
export type NavigationConfig = typeof navigationConfig;
export type WebsiteNavItem = (typeof navigationConfig.website.main)[number];
export type DashboardNavItem =
  (typeof navigationConfig.dashboard.sidebar)[number];
