/**
 * ============================================================
 * OCEANIQUE — WebsiteLayout
 * ============================================================
 * Wrapper component applied to all public website pages.
 * It renders the site Header above the page content and the
 * Footer below it.
 *
 * Usage:
 *   <WebsiteLayout>
 *     <HeroSection />
 *     ...
 *   </WebsiteLayout>
 *
 * CUSTOMIZE:
 * - To add a site-wide announcement banner, add it between
 *   <Header /> and <main>.
 * - To add a cookie consent bar, add it before </footer> or
 *   as a fixed overlay inside this wrapper.
 * ============================================================
 */

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface WebsiteLayoutProps {
  children: React.ReactNode;
}

export function WebsiteLayout({ children }: WebsiteLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white text-midnight">
      {/* Site-wide navigation header */}
      <Header />

      {/* Page-specific content */}
      <main className="flex-1">{children}</main>

      {/* Site-wide footer */}
      <Footer />
    </div>
  );
}
