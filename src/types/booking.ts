/**
 * ============================================================
 * OCEANIQUE — BOOKING TYPE DEFINITIONS
 * ============================================================
 * TypeScript interfaces for booking/reservation data.
 * Used in the dashboard bookings page, calendar, and config.
 * ============================================================
 */

/** Charter duration type for a booking */
export type CharterType = "hourly" | "half-day" | "full-day" | "multi-day";

/** All possible states a booking can be in */
export type BookingStatus =
  | "pending" // Awaiting confirmation / deposit
  | "confirmed" // Deposit received, booking confirmed
  | "completed" // Charter completed
  | "cancelled" // Cancelled by client or business
  | "refunded"; // Refund issued after cancellation

/**
 * Full Booking data model.
 * Used in `dashboard.config.ts`, booking tables, and calendar.
 */
export interface Booking {
  /** Unique booking reference (e.g. "bk-2401") */
  id: string;
  /** Display name of the customer who made the booking */
  customerName: string;
  /** References a `Boat.id` from boats.config.ts */
  boatId: string;
  /** Display name of the booked boat (denormalized for quick access) */
  boatName: string;
  /** ISO date string for charter start date (YYYY-MM-DD) */
  startDate: string;
  /** ISO date string for charter end date (YYYY-MM-DD) */
  endDate: string;
  /** Total booking value in the business currency */
  totalAmount: number;
  status: BookingStatus;
  /** Number of guests on this booking */
  guests: number;
  /** Optional internal notes visible only in the dashboard */
  notes?: string;
  /** Charter duration type — determines how totalAmount was calculated */
  charterType?: CharterType;
  /** Duration in hours — only set for hourly charters */
  hours?: number;
}

/**
 * Lightweight booking summary used in the calendar view.
 * Only contains the fields needed to render a calendar event.
 */
export interface CalendarEvent {
  id: string;
  title: string; // e.g. "Azure Horizon — Dupont"
  boatId: string;
  start: string; // ISO date string
  end: string; // ISO date string
  status: BookingStatus;
  color?: string; // Optional override for calendar event color
}
