/**
 * ============================================================
 * OCEANIQUE — DASHBOARD CONFIGURATION
 * ============================================================
 * Provides mock data and configuration for all dashboard views.
 * Since this is a template (no backend), all data is static and
 * defined here. Replace these values with real API calls when
 * integrating a backend.
 *
 * HOW TO CUSTOMIZE:
 *  1. Update the mock `stats` to reflect your realistic KPIs.
 *  2. Edit `recentBookings` and `customers` to use sample names
 *     and figures relevant to your business.
 *  3. Remove the mock data and wire up real API endpoints when
 *     the template is integrated with a backend.
 * ============================================================
 */

import type { Booking, BookingStatus } from "@/types/booking";
import type { Customer } from "@/types/customer";

export const dashboardConfig = {
  // ----------------------------------------------------------
  // OVERVIEW STATS
  // These appear on the main dashboard overview as KPI cards.
  // ----------------------------------------------------------
  stats: {
    /** Total revenue (current month) in USD */
    totalRevenueMTD: 284500,
    /** Total revenue (year-to-date) in USD */
    totalRevenueYTD: 1_847_200,
    /** Active (confirmed) bookings right now */
    activeBookings: 12,
    /** Total unique customers in the database */
    totalCustomers: 248,
    /** Fleet utilization as a percentage (0–100) */
    fleetUtilization: 78,
    /** New bookings this week */
    newBookingsThisWeek: 5,
    /** Customer satisfaction score (1–5) */
    customerSatisfaction: 4.8,
    /** Average booking value in USD */
    averageBookingValue: 9200,
  },

  // ----------------------------------------------------------
  // RECENT BOOKINGS
  // Shown on the dashboard overview and bookings page.
  // ----------------------------------------------------------
  recentBookings: [
    {
      id: "bk-2401",
      customerName: "Alexandre Dupont",
      boatId: "boat-001",
      boatName: "Azure Horizon",
      startDate: "2026-06-22",
      endDate: "2026-06-25",
      totalAmount: 25500,
      status: "confirmed" as BookingStatus,
      guests: 8,
      notes: "Anniversary celebration. Champagne on arrival requested.",
    },
    {
      id: "bk-2402",
      customerName: "Isabella Romano",
      boatId: "boat-003",
      boatName: "Obsidian",
      startDate: "2026-07-04",
      endDate: "2026-07-11",
      totalAmount: 154000,
      status: "confirmed" as BookingStatus,
      guests: 14,
      notes: "Corporate retreat for 14 executives.",
    },
    {
      id: "bk-2403",
      customerName: "James Whitfield",
      boatId: "boat-002",
      boatName: "Celeste",
      startDate: "2026-06-27",
      endDate: "2026-06-29",
      totalAmount: 10400,
      status: "pending" as BookingStatus,
      guests: 6,
      notes: "",
    },
    {
      id: "bk-2404",
      customerName: "Sophia van der Berg",
      boatId: "boat-001",
      boatName: "Azure Horizon",
      startDate: "2026-07-07",
      endDate: "2026-07-10",
      totalAmount: 25500,
      status: "pending" as BookingStatus,
      guests: 10,
      notes: "Birthday party. Requires DJ setup.",
    },
    {
      id: "bk-2405",
      customerName: "Chen Wei",
      boatId: "boat-003",
      boatName: "Obsidian",
      startDate: "2026-08-03",
      endDate: "2026-08-09",
      totalAmount: 154000,
      status: "confirmed" as BookingStatus,
      guests: 12,
      notes: "Full catering + private chef required.",
    },
    {
      id: "bk-2406",
      customerName: "Margot Lefèvre",
      boatId: "boat-002",
      boatName: "Celeste",
      startDate: "2026-06-05",
      endDate: "2026-06-07",
      totalAmount: 10400,
      status: "completed" as BookingStatus,
      guests: 4,
      notes: "Honeymooners. Great experience.",
    },
    {
      id: "bk-2407",
      customerName: "Luca Ferretti",
      boatId: "boat-004",
      boatName: "Pearl",
      startDate: "2026-06-13",
      endDate: "2026-06-16",
      totalAmount: 13500,
      status: "completed" as BookingStatus,
      guests: 8,
      notes: "Family reunion. Snorkeling equipment requested.",
    },
    {
      id: "bk-2408",
      customerName: "Natasha Volkov",
      boatId: "boat-003",
      boatName: "Obsidian",
      startDate: "2026-08-14",
      endDate: "2026-08-18",
      totalAmount: 154000,
      status: "pending" as BookingStatus,
      guests: 10,
      notes: "Fashion week afterparty. Full media setup required.",
    },
    {
      id: "bk-2409",
      customerName: "William Harrington",
      boatId: "boat-001",
      boatName: "Azure Horizon",
      startDate: "2026-07-18",
      endDate: "2026-07-21",
      totalAmount: 25500,
      status: "cancelled" as BookingStatus,
      guests: 6,
      notes: "Cancelled due to weather concerns.",
    },
    {
      id: "bk-2410",
      customerName: "Amélie Fontaine",
      boatId: "boat-002",
      boatName: "Celeste",
      startDate: "2026-09-12",
      endDate: "2026-09-15",
      totalAmount: 10400,
      status: "confirmed" as BookingStatus,
      guests: 5,
      notes: "Wine tasting charter.",
    },
    {
      id: "bk-2411",
      customerName: "Rajan Mehta",
      boatId: "boat-003",
      boatName: "Obsidian",
      startDate: "2026-07-25",
      endDate: "2026-08-01",
      totalAmount: 154000,
      status: "refunded" as BookingStatus,
      guests: 12,
      notes: "Refund issued after mechanical issue.",
    },
  ] satisfies Booking[],

  // ----------------------------------------------------------
  // CUSTOMERS
  // Sample customer records for the Customers dashboard page.
  // ----------------------------------------------------------
  customers: [
    {
      id: "cust-001",
      customerNumber: 1,
      firstName: "Alexandre",
      lastName: "Dupont",
      email: "a.dupont@example.com",
      phone: "+33 6 12 34 56 78",
      country: "France",
      city: "Paris",
      address: "14 Rue de la Paix, 75002 Paris",
      totalBookings: 4,
      totalSpent: 87500,
      preferredBoat: "boat-001",
      vip: true,
      joinedDate: "2022-03-15",
      lastBooking: "2026-06-25",
      notes: "Prefers Champagne Moët & Chandon on arrival.",
    },
    {
      id: "cust-002",
      customerNumber: 2,
      firstName: "Isabella",
      lastName: "Romano",
      email: "i.romano@example.com",
      phone: "+39 347 123 4567",
      country: "Italy",
      city: "Milan",
      address: "Via Montenapoleone 8, 20121 Milan",
      totalBookings: 2,
      totalSpent: 262000,
      preferredBoat: "boat-003",
      vip: true,
      joinedDate: "2023-01-08",
      lastBooking: "2026-07-11",
      notes: "Corporate account — Rosario Group.",
    },
    {
      id: "cust-003",
      customerNumber: 3,
      firstName: "James",
      lastName: "Whitfield",
      email: "james.w@example.com",
      phone: "+44 7700 900123",
      country: "United Kingdom",
      city: "London",
      address: "12 Cadogan Place, London SW1X 9PX",
      totalBookings: 1,
      totalSpent: 10400,
      preferredBoat: "boat-002",
      vip: false,
      joinedDate: "2024-06-01",
      lastBooking: "2026-06-29",
      notes: "",
    },
    {
      id: "cust-004",
      customerNumber: 4,
      firstName: "Sophia",
      lastName: "van der Berg",
      email: "sophia.vdb@example.com",
      phone: "+31 6 98 76 54 32",
      country: "Netherlands",
      city: "Amsterdam",
      address: "Keizersgracht 482, 1017 EG Amsterdam",
      totalBookings: 3,
      totalSpent: 54000,
      preferredBoat: "boat-001",
      vip: false,
      joinedDate: "2023-07-22",
      lastBooking: "2026-07-10",
      notes: "Always books for large groups.",
    },
    {
      id: "cust-005",
      customerNumber: 5,
      firstName: "Chen",
      lastName: "Wei",
      email: "chen.wei@example.com",
      phone: "+86 138 0000 1234",
      country: "China",
      city: "Shanghai",
      address: "388 Huaihai Middle Road, Huangpu, Shanghai",
      totalBookings: 2,
      totalSpent: 286000,
      preferredBoat: "boat-003",
      vip: true,
      joinedDate: "2023-11-14",
      lastBooking: "2026-08-09",
      notes: "Requires Mandarin-speaking crew member.",
    },
    {
      id: "cust-006",
      customerNumber: 6,
      firstName: "Margot",
      lastName: "Lefèvre",
      email: "margot.lefevre@example.com",
      phone: "+32 471 123 456",
      country: "Belgium",
      city: "Brussels",
      address: "Avenue Louise 54, 1050 Brussels",
      totalBookings: 1,
      totalSpent: 10400,
      preferredBoat: "boat-002",
      vip: false,
      joinedDate: "2024-05-30",
      lastBooking: "2026-06-07",
      notes: "Honeymooners — gave 5-star review.",
    },
    {
      id: "cust-007",
      customerNumber: 7,
      firstName: "Luca",
      lastName: "Ferretti",
      email: "luca.ferretti@example.com",
      phone: "+39 333 987 6543",
      country: "Italy",
      city: "Rome",
      address: "Via Veneto 125, 00187 Rome",
      totalBookings: 1,
      totalSpent: 13500,
      preferredBoat: "boat-004",
      vip: false,
      joinedDate: "2025-04-10",
      lastBooking: "2026-06-16",
      notes: "Family reunion. Snorkeling equipment requested.",
    },
    {
      id: "cust-008",
      customerNumber: 8,
      firstName: "Natasha",
      lastName: "Volkov",
      email: "n.volkov@example.com",
      phone: "+7 916 123 45 67",
      country: "Russia",
      city: "Moscow",
      address: "Tverskaya St 7, Moscow 125009",
      totalBookings: 1,
      totalSpent: 154000,
      preferredBoat: "boat-003",
      vip: true,
      joinedDate: "2025-06-01",
      lastBooking: "2026-08-18",
      notes: "Fashion week afterparty. Full media setup required.",
    },
    {
      id: "cust-009",
      customerNumber: 9,
      firstName: "William",
      lastName: "Harrington",
      email: "w.harrington@example.com",
      phone: "+1 212 555 0192",
      country: "United States",
      city: "New York",
      address: "740 Park Avenue, New York, NY 10021",
      totalBookings: 2,
      totalSpent: 51000,
      preferredBoat: "boat-001",
      vip: false,
      joinedDate: "2024-02-18",
      lastBooking: "2026-07-21",
      notes: "Cancelled due to weather concerns once. Follow up before season.",
    },
    {
      id: "cust-010",
      customerNumber: 10,
      firstName: "Amélie",
      lastName: "Fontaine",
      email: "amelie.fontaine@example.com",
      phone: "+33 6 87 65 43 21",
      country: "France",
      city: "Lyon",
      address: "Place Bellecour 12, 69002 Lyon",
      totalBookings: 1,
      totalSpent: 10400,
      preferredBoat: "boat-002",
      vip: false,
      joinedDate: "2025-08-20",
      lastBooking: "2026-09-15",
      notes: "Wine tasting charter.",
    },
  ] satisfies Customer[],

  // ----------------------------------------------------------
  // CHART DATA
  // Revenue chart data for the Analytics page (monthly breakdown).
  // ----------------------------------------------------------
  revenueChart: [
    { month: "Jan", revenue: 120000, bookings: 14 },
    { month: "Feb", revenue: 98000, bookings: 11 },
    { month: "Mar", revenue: 145000, bookings: 17 },
    { month: "Apr", revenue: 162000, bookings: 19 },
    { month: "May", revenue: 198000, bookings: 23 },
    { month: "Jun", revenue: 224000, bookings: 26 },
    { month: "Jul", revenue: 284500, bookings: 31 },
    { month: "Aug", revenue: 258000, bookings: 28 },
    { month: "Sep", revenue: 185000, bookings: 21 },
    { month: "Oct", revenue: 117200, bookings: 13 },
    { month: "Nov", revenue: 55500,  bookings: 6  },
    { month: "Dec", revenue: 0,      bookings: 0  }, // Future
  ],

  // ----------------------------------------------------------
  // DASHBOARD UI SETTINGS
  // ----------------------------------------------------------
  ui: {
    /** Number of items per page in tables */
    tablePageSize: 10,
    /** Date format used across dashboard (date-fns format string) */
    dateFormat: "dd MMM yyyy",
    /** Currency symbol shown in revenue displays */
    currency: "USD",
    currencySymbol: "$",
    /** Default time zone for calendar and booking times */
    timezone: "Europe/Monaco",
  },
} as const;

/** Convenience type */
export type DashboardConfig = typeof dashboardConfig;
