/**
 * ============================================================
 * OCEANIQUE — FLEET (BOATS) CONFIGURATION
 * ============================================================
 * This file contains all data for the yacht fleet displayed
 * on the public Fleet page and in the dashboard.
 *
 * HOW TO CUSTOMIZE:
 *  1. Edit, add, or remove boat objects in the `fleet` array.
 *  2. Place boat images in /public/images/boats/ and update
 *     the `images` array with the correct filenames.
 *  3. Set `status` to control dashboard availability indicators:
 *       - "available"   → green badge, bookable
 *       - "booked"      → amber badge, not available
 *       - "maintenance" → red badge, out of service
 *  4. Update `features` with the actual amenities of each vessel.
 * ============================================================
 */

import type { Boat } from "@/types/boat";

export const boatsConfig: { fleet: Boat[] } = {
  fleet: [
    // ----------------------------------------------------------
    // BOAT 1
    // ----------------------------------------------------------
    {
      id: "boat-001",
      name: "Azure Horizon",
      type: "Motor Yacht",
      manufacturer: "Sunseeker",
      model: "Manhattan 85",
      year: 2022,
      length: "85 ft",
      beam: "19 ft",
      capacity: {
        guests: 12,
        overnight: 6,
        crew: 3,
      },
      pricing: {
        perHour: 1200,
        perHalf: 4800,
        perDay: 8500,
        currency: "USD",
        depositPercent: 30,
      },
      status: "available",
      featured: true,
      images: {
        primary: "/images/boats/Azure Horizon-boat.png",
        gallery: [
          "/images/boats/azure-horizon-deck.jpg",
          "/images/boats/azure-horizon-interior.jpg",
          "/images/boats/azure-horizon-cabin.jpg",
        ],
      },
      description:
        "The Azure Horizon is the crown jewel of our fleet — a masterclass in nautical luxury. Her sweeping decks, sunlit saloons, and world-class amenities make every voyage an unforgettable affair.",
      shortDescription: "85ft Motor Yacht · 12 Guests · From $8,500/day",
      features: [
        "Jacuzzi on sun deck",
        "High-speed WiFi",
        "Air conditioning throughout",
        "Full bar and catering service",
        "Jet ski & snorkeling gear",
        "Satellite entertainment system",
        "Four ensuite cabins",
        "Professional captain & crew",
      ],
      specifications: {
        engines: "2 × Volvo IPS 1200",
        maxSpeed: "32 knots",
        cruisingSpeed: "22 knots",
        fuelCapacity: "3,000 L",
        waterCapacity: "1,000 L",
        homePort: "Monaco, Monte Carlo",
      },
    },

    // ----------------------------------------------------------
    // BOAT 2
    // ----------------------------------------------------------
    {
      id: "boat-002",
      name: "Celeste",
      type: "Sailing Yacht",
      manufacturer: "Hallberg-Rassy",
      model: "HR 64",
      year: 2021,
      length: "64 ft",
      beam: "17 ft",
      capacity: {
        guests: 8,
        overnight: 4,
        crew: 2,
      },
      pricing: {
        perHour: 750,
        perHalf: 2900,
        perDay: 5200,
        currency: "USD",
        depositPercent: 30,
      },
      status: "available",
      featured: true,
      images: {
        primary: "/images/boats/Celeste-boat.png",
        gallery: [
          "/images/boats/celeste-sails.jpg",
          "/images/boats/celeste-cockpit.jpg",
          "/images/boats/celeste-cabin.jpg",
        ],
      },
      description:
        "Celeste embodies the romance of pure sailing. A timeless blue-water cruiser, she cuts through the water with grace, offering an intimate and authentic seafaring experience.",
      shortDescription: "64ft Sailing Yacht · 8 Guests · From $5,200/day",
      features: [
        "Furling sails with electric winches",
        "Teak cockpit",
        "Three private cabins",
        "Full navigation suite",
        "Kayaks & paddleboards",
        "Air conditioning",
        "Gourmet galley kitchen",
        "High-speed WiFi",
      ],
      specifications: {
        engines: "Yanmar 4JH57",
        maxSpeed: "12 knots (sailing)",
        cruisingSpeed: "8 knots (motor)",
        fuelCapacity: "800 L",
        waterCapacity: "600 L",
        homePort: "Cannes, France",
      },
    },

    // ----------------------------------------------------------
    // BOAT 3
    // ----------------------------------------------------------
    {
      id: "boat-003",
      name: "Obsidian",
      type: "Super Yacht",
      manufacturer: "Heesen",
      model: "YN 16550",
      year: 2023,
      length: "110 ft",
      beam: "23 ft",
      capacity: {
        guests: 16,
        overnight: 8,
        crew: 5,
      },
      pricing: {
        perHour: 3200,
        perHalf: 12000,
        perDay: 22000,
        currency: "USD",
        depositPercent: 50,
      },
      status: "available",
      featured: true,
      images: {
        primary: "/images/boats/Obsidian-boat.png",
        gallery: [
          "/images/boats/obsidian-exterior.jpg",
          "/images/boats/obsidian-lounge.jpg",
          "/images/boats/obsidian-master.jpg",
        ],
      },
      description:
        "Obsidian is the pinnacle of maritime engineering and design. Her obsidian-black hull, bespoke interiors, and extraordinary range make her the ultimate expression of exclusivity at sea.",
      shortDescription: "110ft Super Yacht · 16 Guests · From $22,000/day",
      features: [
        "Helipad",
        "Infinity pool",
        "Full spa and gym",
        "Cinema room",
        "Tender garage",
        "Chef's kitchen with full staff",
        "Starlink satellite internet",
        "Eight luxury suites",
      ],
      specifications: {
        engines: "2 × MTU 12V 4000 M93L",
        maxSpeed: "28 knots",
        cruisingSpeed: "20 knots",
        fuelCapacity: "18,000 L",
        waterCapacity: "5,000 L",
        homePort: "Monaco, Monte Carlo",
      },
    },

    // ----------------------------------------------------------
    // BOAT 4
    // ----------------------------------------------------------
    {
      id: "boat-004",
      name: "Pearl",
      type: "Catamaran",
      manufacturer: "Lagoon",
      model: "Lagoon 620",
      year: 2020,
      length: "62 ft",
      beam: "34 ft",
      capacity: {
        guests: 10,
        overnight: 8,
        crew: 2,
      },
      pricing: {
        perHour: 650,
        perHalf: 2500,
        perDay: 4500,
        currency: "USD",
        depositPercent: 30,
      },
      status: "maintenance",
      featured: false,
      images: {
        primary: "/images/boats/Pearl-boat.png",
        gallery: [
          "/images/boats/pearl-deck.jpg",
          "/images/boats/pearl-salon.jpg",
        ],
      },
      description:
        "Pearl offers extraordinary stability and spaciousness on the water. Her wide beam and airy saloon make her ideal for families and groups seeking comfort and simplicity.",
      shortDescription: "62ft Catamaran · 10 Guests · From $4,500/day",
      features: [
        "Four double cabins",
        "Spacious flybridge",
        "Water slide",
        "Snorkeling & diving equipment",
        "Air conditioning",
        "WiFi",
        "BBQ on deck",
        "Full kitchen",
      ],
      specifications: {
        engines: "2 × Volvo D2-75",
        maxSpeed: "14 knots",
        cruisingSpeed: "9 knots",
        fuelCapacity: "1,200 L",
        waterCapacity: "800 L",
        homePort: "Saint-Tropez, France",
      },
    },
  ],
};

/** Convenience type for using fleet data */
export type Fleet = typeof boatsConfig.fleet;
