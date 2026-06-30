/**
 * ============================================================
 * OCEANIQUE — MAIN SITE CONFIGURATION
 * ============================================================
 * This is the primary configuration file for the Oceanique template.
 * All brand identity, SEO, contact details, CTAs, and authentication
 * settings live here. Customers should start here when customizing.
 *
 * HOW TO CUSTOMIZE:
 *  1. Replace all values below with your own business information.
 *  2. Update images in /public/images/ to match your brand.
 *  3. After editing, the changes reflect automatically site-wide.
 * ============================================================
 */

export const siteConfig = {
  // ----------------------------------------------------------
  // BRAND IDENTITY
  // Change these to your business name, tagline, and description.
  // ----------------------------------------------------------
  brand: {
    name: "Oceanique",
    tagline: "Where Luxury Meets the Horizon",
    description:
      "Oceanique offers bespoke yacht charter experiences tailored to the most discerning clients. From intimate sunset cruises to extended Mediterranean voyages, we redefine life at sea.",
    logoText: "OCEANIQUE", // Text shown if no logo image is used
    logoImage: "/images/logo.svg", // Set to "" to use logoText instead
    faviconPath: "/favicon.ico",
    foundedYear: 2010,
  },

  // ----------------------------------------------------------
  // SEO & META TAGS
  // These values populate <head> meta tags used for search engines
  // and social media previews (Open Graph / Twitter Card).
  // ----------------------------------------------------------
  seo: {
    title: "Oceanique | Luxury Yacht Charter & Marine Services",
    titleTemplate: "%s | Oceanique", // %s is replaced with page-specific title
    description:
      "Discover unparalleled luxury yacht charter experiences with Oceanique. Explore our fleet, book your voyage, and elevate your time at sea.",
    keywords: [
      "luxury yacht charter",
      "boat rental",
      "yacht hire",
      "private charter",
      "Mediterranean sailing",
      "luxury marine services",
    ],
    ogImage: "/images/og-image.jpg", // 1200x630px recommended for Open Graph
    twitterCard: "summary_large_image" as const,
    twitterHandle: "@oceanique",
    canonicalUrl: "https://www.oceanique.com", // Replace with your domain
    locale: "en_US",
  },

  // ----------------------------------------------------------
  // CONTACT INFORMATION
  // Displayed in the Footer, Contact page, and dashboard settings.
  // ----------------------------------------------------------
  contact: {
    email: "info@oceanique.com",
    phone: "+1 (555) 000-0000",
    whatsapp: "+15550000000", // Used for WhatsApp click-to-chat links
    address: {
      street: "1 Marina Promenade",
      city: "Monaco",
      state: "",
      zip: "98000",
      country: "Monaco",
    },
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=...YOUR_EMBED_URL...", // Google Maps embed URL
    businessHours: "Monday – Sunday: 8:00 AM – 8:00 PM",
  },

  // ----------------------------------------------------------
  // SOCIAL MEDIA LINKS
  // Leave a value as "" to hide that social icon in the footer.
  // ----------------------------------------------------------
  social: {
    instagram: "https://instagram.com/oceanique",
    facebook: "https://facebook.com/oceanique",
    twitter: "https://twitter.com/oceanique",
    youtube: "https://youtube.com/@oceanique",
    linkedin: "https://linkedin.com/company/oceanique",
    tiktok: "",
  },

  // ----------------------------------------------------------
  // CALL-TO-ACTION (CTA) VARIANTS
  // These are the primary and secondary action buttons used
  // throughout the website (Hero, Header, etc.).
  // Customize the text and destination href as needed.
  // ----------------------------------------------------------
  cta: {
    primary: {
      text: "Book Your Charter",
      href: "/contact",
      ariaLabel: "Book a yacht charter with Oceanique",
    },
    secondary: {
      text: "Explore Our Fleet",
      href: "/fleet",
      ariaLabel: "Browse the Oceanique yacht fleet",
    },
    hero: {
      text: "Discover the Experience",
      href: "/fleet",
      ariaLabel: "Discover Oceanique yacht experiences",
    },
  },

  // ----------------------------------------------------------
  // MOCK AUTHENTICATION (DEMO / TEMPLATE ONLY)
  // This template uses client-side mock authentication.
  // Replace with a real authentication provider before going live.
  // Credentials shown here are for demonstration purposes only.
  // ----------------------------------------------------------
  auth: {
    // Admin (internal team) credentials
    demoEmail: "admin@oceanique.com",
    demoPassword: "Oceanique2024!",
    dashboardRedirect: "/dashboard",
    // Customer (charter client) credentials
    customerDemoEmail: "guest@oceanique.com",
    customerDemoPassword: "Guest2024!",
    portalRedirect: "/portal",
    // Shared
    loginRedirect: "/login",
    sessionKey: "oceanique_session", // localStorage key for session
  },

  // ----------------------------------------------------------
  // FEATURE FLAGS
  // Toggle features on/off without deleting code.
  // ----------------------------------------------------------
  features: {
    showWhatsAppButton: true, // Floating WhatsApp CTA button
    showNewsletterSignup: true, // Newsletter form in footer
    showLiveChat: false, // Placeholder for live chat integration
    showAvailabilityCalendar: true, // Calendar on the fleet page
    enableDarkModeToggle: false, // Dark mode toggle in header
    showPricingOnFleetPage: true, // Show price per day on fleet cards
  },

  // ----------------------------------------------------------
  // ANALYTICS (optional)
  // Add your tracking IDs. Leave as "" to disable.
  // ----------------------------------------------------------
  analytics: {
    googleAnalyticsId: "", // e.g. "G-XXXXXXXXXX"
    facebookPixelId: "", // e.g. "123456789012345"
  },
} as const;

/** Convenience type export for use across the codebase */
export type SiteConfig = typeof siteConfig;
