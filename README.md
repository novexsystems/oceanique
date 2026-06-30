# Oceanique — Luxury Yacht Charter Template

A premium, config-driven frontend template for luxury boat charter businesses.
Built with **Next.js 15**, **TailwindCSS v4**, **ShadCN UI**, and **Framer Motion**.

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Next.js | 15 | Framework (App Router, RSC) |
| React | 19 | UI library |
| TypeScript | 5 | Type safety |
| TailwindCSS | 4 | Styling |
| ShadCN UI | latest | Component primitives |
| Framer Motion | 12 | Animations |

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the public website.
Visit [http://localhost:3000/login](http://localhost:3000/login) to access the dashboard.

**Demo credentials:**
- Email: `admin@oceanique.com`
- Password: `Oceanique2024!`

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Homepage (/)
│   ├── fleet/page.tsx      # Fleet page (/fleet)
│   ├── about/page.tsx      # About page (/about)
│   ├── contact/page.tsx    # Contact page (/contact)
│   ├── login/page.tsx      # Login page (/login)
│   └── dashboard/          # Dashboard (protected, /dashboard/*)
│       ├── layout.tsx      # Dashboard shell (sidebar + topbar)
│       ├── page.tsx        # Overview
│       ├── boats/          # Fleet management
│       ├── bookings/       # Booking management
│       ├── calendar/       # Availability calendar
│       ├── customers/      # Customer directory
│       ├── analytics/      # Revenue & charts
│       └── settings/       # Business settings
├── components/
│   ├── layout/             # Header, Footer, DashboardSidebar, DashboardTopBar
│   ├── sections/           # Homepage sections (Hero, Fleet, Services, etc.)
│   ├── dashboard/          # Dashboard widgets (StatsCard, BoatCard, tables, charts)
│   └── common/             # Shared UI (GoldButton, SectionHeading, GoldDivider, etc.)
├── config/                 # ← CUSTOMIZE HERE
│   ├── site.config.ts      # Brand identity, SEO, contact, CTAs, auth
│   ├── theme.config.ts     # Colors, fonts, spacing, animations
│   ├── navigation.config.ts# Website nav links + dashboard sidebar
│   ├── boats.config.ts     # Fleet data (boats, specs, pricing)
│   └── dashboard.config.ts # Mock dashboard data (stats, bookings, customers)
├── types/                  # TypeScript interfaces (Boat, Booking, Customer)
├── hooks/                  # useAuth, useLocalStorage
└── lib/                    # auth.ts (mock client-side auth)
```

---

## Customization Guide

### 1. Brand Identity & SEO
Edit **`src/config/site.config.ts`**:
- `brand.name` — Business name
- `brand.tagline` — Hero headline
- `brand.description` — Meta description / hero paragraph
- `brand.foundedYear` — Used in StatsSection and AboutSection
- `seo.*` — All meta tags, OG image, Twitter card
- `contact.*` — Email, phone, address, business hours
- `social.*` — Social media URLs

### 2. Colors
Edit **`src/app/globals.css`** (brand token block, lines 30–51):
```css
--color-midnight: #0A0F1A;   /* Main dark color */
--color-gold:     #C9A227;   /* Accent color */
--color-silver:   #E5E7EB;   /* Light neutral */
```
Also update the matching values in **`src/config/theme.config.ts`**.

### 3. Fonts
Edit **`src/app/layout.tsx`**:
- Replace the `Cormorant_Garamond` import with any Google Font for headings.
- Replace the `Montserrat` import for body text.
- Update `--font-heading` / `--font-body` in `globals.css` to match.

### 4. Fleet / Boats
Edit **`src/config/boats.config.ts`**:
- Add, remove, or edit boat entries in the `fleet` array.
- Set `featured: true` to show a boat on the homepage preview.
- Each boat follows the `Boat` TypeScript interface in `src/types/boat.ts`.

### 5. Navigation
Edit **`src/config/navigation.config.ts`**:
- `website.main` — Public header nav links
- `website.footer` — Footer link columns
- `dashboard.sidebar` — Dashboard left sidebar items
- `dashboard.sidebarBottom` — Settings / help links at sidebar bottom

### 6. CTAs
Edit **`src/config/site.config.ts`** > `cta`:
- `cta.primary` — Main "Book Now" button
- `cta.secondary` — "View Fleet" button
- `cta.hero` — Hero section CTA

### 7. Mock Dashboard Data
Edit **`src/config/dashboard.config.ts`**:
- `stats.*` — KPI numbers on the overview page
- `recentBookings` — Bookings shown in the table and calendar
- `customers` — Customer directory entries
- `revenueChart` — Monthly revenue data for the bar chart

### 8. Authentication
The template uses **mock client-side auth** via `localStorage` (no backend).
- Credentials are set in `site.config.ts > auth.demoEmail / demoPassword`.
- To replace with a real auth provider: update `src/lib/auth.ts` and the
  `useAuth` hook, then add a `src/middleware.ts` to protect `/dashboard/*`.

---

## Adding Images

Replace placeholder divs with real images by:
1. Adding image files to `public/images/`:
   - `public/images/hero/hero-bg.jpg` — Hero background
   - `public/images/boats/[boat-id]-primary.jpg` — Per-boat images
   - `public/images/about/about-image.jpg` — About section image
2. Importing `Image` from `next/image` in the relevant component.
3. Replacing the placeholder `<div>` with `<Image src="..." alt="..." fill />`.

---

## Deployment

```bash
npm run build
npm run start
```

Or deploy to Vercel with zero configuration — connect your GitHub repository
at [vercel.com](https://vercel.com) and it will auto-detect Next.js.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
