/**
 * ============================================================
 * OCEANIQUE — TYPE DEFINITIONS (BARREL EXPORT)
 * ============================================================
 * Central export point for all TypeScript types.
 * Import from "@/types" rather than individual type files.
 *
 * Example:
 *   import type { Boat, Booking, Customer } from "@/types";
 * ============================================================
 */

export type { Boat, BoatStatus, BoatType, BoatCapacity, BoatPricing, BoatImages, BoatSpecifications } from "./boat";
export type { Booking, BookingStatus, CalendarEvent } from "./booking";
export type { Customer, CustomerSummary } from "./customer";
