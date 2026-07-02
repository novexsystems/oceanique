/**
 * ============================================================
 * OCEANIQUE — Footer (Public Website)
 * ============================================================
 * The site-wide footer shown on all public website pages.
 * Displays brand info, navigation link columns, social icons,
 * an optional newsletter form, and the copyright notice.
 *
 * DATA SOURCES:
 * - Brand name / description → src/config/site.config.ts (brand)
 * - Footer link columns      → src/config/navigation.config.ts (website.footer)
 * - Social links             → src/config/site.config.ts (social)
 * - Newsletter toggle        → src/config/site.config.ts (features.showNewsletterSignup)
 *
 * CUSTOMIZE:
 * - To change footer links: edit navigation.config.ts > website.footer
 * - To hide the newsletter form: set features.showNewsletterSignup = false in site.config.ts
 * - To add/remove social icons: edit site.config.ts > social
 * ============================================================
 */

"use client";

import Link from "next/link";
import { navigationConfig } from "@/config/navigation.config";
import { siteConfig } from "@/config/site.config";

/** Minimal inline SVG social icons — no external icon library dependency */
const socialIcons: Record<string, React.ReactNode> = {
  instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  twitter: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  linkedin: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  youtube: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
    </svg>
  ),
};

export function Footer() {
  const { footer } = navigationConfig.website;
  const footerColumns = Object.values(footer);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#060912] border-t border-white/[0.08]">
      {/* ---- Main footer grid ---- */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Brand column — takes 2 cols on lg */}
          <div className="lg:col-span-2">
            <Link href="/">
              <span className="font-heading text-2xl text-white tracking-[0.35em] uppercase hover:text-gold transition-colors">
                {siteConfig.brand.logoText}
              </span>
            </Link>
            <div className="w-10 h-px bg-gold mt-4 mb-5" />
            <p className="text-silver/50 text-sm font-body leading-relaxed max-w-xs">
              {siteConfig.brand.description.slice(0, 120)}…
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-4 mt-8">
              {Object.entries(siteConfig.social).map(([platform, url]) => {
                if (!url) return null;
                const icon = socialIcons[platform];
                if (!icon) return null;
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow us on ${platform}`}
                    className="text-silver/40 hover:text-gold transition-colors duration-200"
                  >
                    {icon}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-white text-xs font-body font-semibold tracking-[0.25em] uppercase mb-5">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-silver/50 text-sm font-body hover:text-gold transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ---- Newsletter ---- */}
        {siteConfig.features.showNewsletterSignup && (
          <div className="border-t border-white/5 mt-14 pt-12">
            <div className="max-w-xl">
              <h3 className="font-heading text-2xl text-white mb-2">
                Stay on the Horizon
              </h3>
              <p className="text-silver/50 text-sm font-body mb-6">
                Receive exclusive charter offers and destination guides.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex gap-0"
              >
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent border border-white/10 text-white placeholder:text-silver/30 font-body text-sm px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gold text-midnight text-xs font-body font-semibold tracking-[0.15em] uppercase hover:bg-gold-light transition-colors flex-shrink-0"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ---- Copyright bar ---- */}
      <div className="border-t border-white/[0.08] py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-silver/30 text-xs font-body">
            © {year} {siteConfig.brand.name}. All rights reserved.
          </p>
          <p className="text-silver/20 text-xs font-body">
            Est. {siteConfig.brand.foundedYear} &middot; {siteConfig.contact.address.city}, {siteConfig.contact.address.country}
          </p>
        </div>
      </div>
    </footer>
  );
}
