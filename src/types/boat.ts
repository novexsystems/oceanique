/**
 * ============================================================
 * OCEANIQUE — BOAT / FLEET TYPE DEFINITIONS
 * ============================================================
 * All TypeScript interfaces for boat/yacht data used across
 * the fleet config, dashboard components, and public pages.
 * ============================================================
 */

/** Availability status of a boat */
export type BoatStatus = "available" | "booked" | "maintenance";

/** Type/category of watercraft */
export type BoatType =
  | "Motor Yacht"
  | "Sailing Yacht"
  | "Super Yacht"
  | "Catamaran"
  | "Speedboat"
  | "Classic Yacht"
  | "Gulet";

/** Capacity breakdown for guests and crew */
export interface BoatCapacity {
  /** Maximum day-charter guests */
  guests: number;
  /** Maximum overnight guests */
  overnight: number;
  /** Crew members included */
  crew: number;
}

/** Pricing structure for a single boat */
export interface BoatPricing {
  /** Hourly charter price */
  perHour: number;
  /** Half-day charter price */
  perHalf: number;
  /** Full-day charter price */
  perDay: number;
  /** Currency code (e.g. "USD", "EUR") */
  currency: string;
  /** Required deposit as a percentage of total (e.g. 30 = 30%) */
  depositPercent: number;
}

/** Image assets for a boat listing */
export interface BoatImages {
  /** Hero/primary image shown on cards and listings */
  primary: string;
  /** Additional gallery images */
  gallery: string[];
}

/** Technical specifications of a boat */
export interface BoatSpecifications {
  engines: string;
  maxSpeed: string;
  cruisingSpeed: string;
  fuelCapacity: string;
  waterCapacity: string;
  homePort: string;
}

/**
 * Full Boat data model.
 * Used in `boats.config.ts`, fleet pages, and dashboard.
 */
export interface Boat {
  /** Unique identifier (e.g. "boat-001") */
  id: string;
  name: string;
  type: BoatType;
  manufacturer: string;
  model: string;
  year: number;
  length: string;
  beam: string;
  capacity: BoatCapacity;
  pricing: BoatPricing;
  status: BoatStatus;
  /** If true, shown in featured/hero sections on the website */
  featured: boolean;
  images: BoatImages;
  /** Long-form description for boat detail pages */
  description: string;
  /** Short one-liner for cards and listings */
  shortDescription: string;
  /** List of onboard amenities and features */
  features: string[];
  specifications: BoatSpecifications;
}
