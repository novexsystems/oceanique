/**
 * ============================================================
 * OCEANIQUE — CUSTOMER PORTAL CONFIGURATION
 * ============================================================
 * Provides mock data and configuration for the customer portal
 * (/portal/*). All data is static for template/demo purposes.
 * Replace with real API calls when integrating a backend.
 *
 * DEMO CUSTOMER: Sophie Laurent (Platinum member)
 *   Email:    guest@oceanique.com
 *   Password: Guest2024!
 *
 * HOW TO CUSTOMIZE:
 *  1. Update `customerProfile` to match your demo customer.
 *  2. Edit `bookings` to add/remove charter records.
 *  3. Edit `documents` to reflect the correct file catalogue.
 *  4. Remove mock data and wire up real API endpoints when
 *     the template is integrated with a backend.
 * ============================================================
 */

import type { BookingStatus } from "@/types/booking";

// ----------------------------------------------------------
// CUSTOMER PROFILE
// The mock profile for the logged-in demo customer.
// ----------------------------------------------------------
export const portalConfig = {
  customerProfile: {
    id: "cust-001",
    firstName: "Sophie",
    lastName: "Laurent",
    email: "guest@oceanique.com",
    phone: "+33 6 12 34 56 78",
    country: "France",
    city: "Paris",
    memberSince: "2022-03-15",
    membershipTier: "Platinum" as const,
    /** Loyalty points balance */
    loyaltyPoints: 8_400,
    totalCharters: 7,
    totalNightsAtSea: 24,
    totalSpent: 187_500,
    preferredBoatType: "Motor Yacht",
    dietaryPreferences: "Vegetarian",
    specialRequests: "Champagne Moët & Chandon on arrival. Prefers aft deck dining.",
    emergencyContact: {
      name: "Marc Laurent",
      relation: "Spouse",
      phone: "+33 6 98 76 54 32",
    },
  },

  // ----------------------------------------------------------
  // CUSTOMER'S BOOKINGS
  // Shown on the My Bookings page — split by status.
  // ----------------------------------------------------------
  bookings: [
    // ── Upcoming ──
    {
      id: "bk-3101",
      boatId: "boat-001",
      boatName: "Azure Horizon",
      boatType: "Motor Yacht",
      startDate: "2026-08-14",
      endDate: "2026-08-18",
      totalAmount: 34_000,
      status: "confirmed" as BookingStatus,
      guests: 6,
      captain: "Capt. Marco Ferretti",
      basePort: "Monaco",
      itinerary: "Monaco → Cannes → Saint-Tropez → Monaco",
      notes: "Champagne on arrival. Sunset dinner at Saint-Tropez.",
      invoiceId: "INV-3101",
      contractId: "CTR-3101",
    },
    {
      id: "bk-3102",
      boatId: "boat-003",
      boatName: "Obsidian",
      boatType: "Super Yacht",
      startDate: "2026-09-05",
      endDate: "2026-09-12",
      totalAmount: 154_000,
      status: "pending" as BookingStatus,
      guests: 10,
      captain: "Capt. Elena Vasquez",
      basePort: "Cannes",
      itinerary: "Cannes → Porto Cervo → Amalfi Coast → Capri",
      notes: "Corporate retreat — awaiting final guest list.",
      invoiceId: "INV-3102",
      contractId: null,
    },
    // ── Past ──
    {
      id: "bk-2901",
      boatId: "boat-001",
      boatName: "Azure Horizon",
      boatType: "Motor Yacht",
      startDate: "2026-05-10",
      endDate: "2026-05-13",
      totalAmount: 25_500,
      status: "completed" as BookingStatus,
      guests: 4,
      captain: "Capt. Marco Ferretti",
      basePort: "Monaco",
      itinerary: "Monaco → Nice → Antibes",
      notes: "",
      invoiceId: "INV-2901",
      contractId: "CTR-2901",
    },
    {
      id: "bk-2902",
      boatId: "boat-002",
      boatName: "Celeste",
      boatType: "Sailing Yacht",
      startDate: "2026-03-18",
      endDate: "2026-03-21",
      totalAmount: 10_400,
      status: "completed" as BookingStatus,
      guests: 6,
      captain: "Capt. Luc Beaumont",
      basePort: "Marseille",
      itinerary: "Marseille → Île de Porquerolles → Toulon",
      notes: "",
      invoiceId: "INV-2902",
      contractId: "CTR-2902",
    },
    {
      id: "bk-2903",
      boatId: "boat-001",
      boatName: "Azure Horizon",
      boatType: "Motor Yacht",
      startDate: "2026-02-10",
      endDate: "2026-02-13",
      totalAmount: 25_500,
      status: "completed" as BookingStatus,
      guests: 8,
      captain: "Capt. Marco Ferretti",
      basePort: "Monaco",
      itinerary: "Monaco → Menton → Bordighera",
      notes: "",
      invoiceId: "INV-2903",
      contractId: "CTR-2903",
    },
    {
      id: "bk-2904",
      boatId: "boat-004",
      boatName: "Pearl",
      boatType: "Catamaran",
      startDate: "2025-08-20",
      endDate: "2025-08-27",
      totalAmount: 42_000,
      status: "completed" as BookingStatus,
      guests: 8,
      captain: "Capt. Yannick Morel",
      basePort: "Palma de Mallorca",
      itinerary: "Palma → Ibiza → Formentera → Palma",
      notes: "",
      invoiceId: "INV-2904",
      contractId: "CTR-2904",
    },
    // ── Cancelled ──
    {
      id: "bk-2801",
      boatId: "boat-003",
      boatName: "Obsidian",
      boatType: "Super Yacht",
      startDate: "2025-06-10",
      endDate: "2025-06-17",
      totalAmount: 154_000,
      status: "cancelled" as BookingStatus,
      guests: 12,
      captain: "Capt. Elena Vasquez",
      basePort: "Monaco",
      itinerary: "Monaco → Sardinia → Corsica",
      notes: "Cancelled due to weather conditions.",
      invoiceId: "INV-2801",
      contractId: "CTR-2801",
    },
  ],

  // ----------------------------------------------------------
  // DOCUMENTS
  // Mock file catalogue for the Documents page.
  // ----------------------------------------------------------
  documents: [
    {
      id: "doc-001",
      name: "Charter Contract — Azure Horizon Aug 2026",
      type: "contract" as const,
      bookingId: "bk-3101",
      boatName: "Azure Horizon",
      date: "2026-07-20",
      sizeKb: 312,
      status: "signed" as const,
    },
    {
      id: "doc-002",
      name: "Invoice #INV-3101",
      type: "invoice" as const,
      bookingId: "bk-3101",
      boatName: "Azure Horizon",
      date: "2026-07-20",
      sizeKb: 180,
      status: "paid" as const,
    },
    {
      id: "doc-003",
      name: "Invoice #INV-3102 — Obsidian Sep 2026",
      type: "invoice" as const,
      bookingId: "bk-3102",
      boatName: "Obsidian",
      date: "2026-07-28",
      sizeKb: 180,
      status: "pending" as const,
    },
    {
      id: "doc-004",
      name: "Pre-Departure Safety Form — Azure Horizon Aug 2026",
      type: "form" as const,
      bookingId: "bk-3101",
      boatName: "Azure Horizon",
      date: "2026-07-25",
      sizeKb: 95,
      status: "pending" as const,
    },
    {
      id: "doc-005",
      name: "Invoice #INV-2901",
      type: "invoice" as const,
      bookingId: "bk-2901",
      boatName: "Azure Horizon",
      date: "2026-05-13",
      sizeKb: 180,
      status: "paid" as const,
    },
    {
      id: "doc-006",
      name: "Charter Contract — Azure Horizon May 2026",
      type: "contract" as const,
      bookingId: "bk-2901",
      boatName: "Azure Horizon",
      date: "2026-04-20",
      sizeKb: 310,
      status: "signed" as const,
    },
    {
      id: "doc-007",
      name: "Invoice #INV-2902",
      type: "invoice" as const,
      bookingId: "bk-2902",
      boatName: "Celeste",
      date: "2026-03-21",
      sizeKb: 178,
      status: "paid" as const,
    },
  ],

  // ----------------------------------------------------------
  // SUPPORT FAQ
  // Shown on the Support page.
  // ----------------------------------------------------------
  faq: [
    {
      question: "How do I modify or cancel a booking?",
      answer:
        "Contact our charter team at least 72 hours before the departure date. Cancellation policies are outlined in your charter contract. You can also reach us via the Support page.",
    },
    {
      question: "What is included in the charter price?",
      answer:
        "Your charter includes the vessel, captain, and crew. Fuel, provisioning, port fees, and additional crew requests are charged separately unless stated in your contract.",
    },
    {
      question: "Can I bring my own food and beverages?",
      answer:
        "Yes. Alternatively, our team can arrange professional catering and provisioning tailored to your preferences.",
    },
    {
      question: "What happens if the weather is bad?",
      answer:
        "Safety is our priority. If conditions are deemed unsafe by the captain, the itinerary will be adjusted or the charter may be rescheduled. Please review the Force Majeure clause in your contract.",
    },
    {
      question: "How do loyalty points work?",
      answer:
        "You earn 1 point for every $10 spent on charters. Points can be redeemed for onboard credits, upgrades, or priority booking access. Platinum members earn double points.",
    },
  ],

  // ----------------------------------------------------------
  // LOYALTY TIERS
  // Defines the membership programme tier thresholds.
  // ----------------------------------------------------------
  loyaltyTiers: [
    { name: "Silver", minSpend: 0, pointsMultiplier: 1, color: "#A0AEC0" },
    { name: "Gold", minSpend: 50_000, pointsMultiplier: 1.5, color: "#C9A227" },
    { name: "Platinum", minSpend: 150_000, pointsMultiplier: 2, color: "#E2E8F0" },
  ],
} as const;

/** Convenience type */
export type PortalConfig = typeof portalConfig;
export type CustomerBooking = (typeof portalConfig.bookings)[number];
export type PortalDocument = (typeof portalConfig.documents)[number];
