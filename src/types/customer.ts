/**
 * ============================================================
 * OCEANIQUE — CUSTOMER TYPE DEFINITIONS
 * ============================================================
 * TypeScript interfaces for customer/client data.
 * Used in the dashboard customers page and config.
 * ============================================================
 */

/**
 * Full Customer data model.
 * Used in `dashboard.config.ts` and the customers dashboard page.
 */
export interface Customer {
  /** Unique customer identifier (e.g. "cust-001") */
  id: string;
  /** Sequential human-readable number shown in the UI (e.g. 1 → displayed as #001) */
  customerNumber?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** ISO 3166-1 country name (e.g. "France") */
  country: string;
  /** City of residence */
  city?: string;
  /** Street address */
  address?: string;
  /** Total number of completed bookings */
  totalBookings: number;
  /** Lifetime value in the business currency */
  totalSpent: number;
  /** References a `Boat.id` — the customer's most frequently booked boat */
  preferredBoat?: string;
  /** VIP flag — used to show a badge and prioritize in lists */
  vip: boolean;
  /** ISO date string for when the customer first booked (YYYY-MM-DD) */
  joinedDate: string;
  /** ISO date string of the most recent booking */
  lastBooking?: string;
  /** Internal notes visible only in the dashboard */
  notes?: string;
}

/** Lightweight customer summary used in dropdowns and autocomplete */
export interface CustomerSummary {
  id: string;
  fullName: string;
  email: string;
  vip: boolean;
}
