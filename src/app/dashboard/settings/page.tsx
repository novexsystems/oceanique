/**
 * ============================================================
 * OCEANIQUE — Dashboard Settings Page  (Route: /dashboard/settings)
 * ============================================================
 * Sections: Business Profile · Social Media · SEO & Meta ·
 *           Feature Flags · Analytics · Data Management ·
 *           Demo Credentials
 *
 * Settings are persisted to localStorage (oceanique_settings_v1).
 * To make changes permanent, update src/config/site.config.ts.
 * ============================================================
 */

"use client";

import { useState, useEffect } from "react";
import { Check, RotateCcw, AlertTriangle } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { BOOKINGS_STORAGE_KEY } from "@/contexts/BookingsContext";
import { CUSTOMERS_STORAGE_KEY } from "@/contexts/CustomersContext";

const SETTINGS_STORAGE_KEY = "oceanique_settings_v1";

interface Settings {
  businessName:    string; tagline:        string;
  email:           string; phone:          string;
  whatsapp:        string; street:         string;
  city:            string; zip:            string;
  country:         string; businessHours:  string;
  instagram:       string; facebook:       string;
  twitter:         string; youtube:        string;
  linkedin:        string; tiktok:         string;
  metaTitle:       string; metaDescription: string;
  googleAnalyticsId: string; facebookPixelId: string;
  showWhatsAppButton:      boolean;
  showNewsletterSignup:    boolean;
  showLiveChat:            boolean;
  showAvailabilityCalendar: boolean;
  showPricingOnFleetPage:  boolean;
}

const DEFAULTS: Settings = {
  businessName:    siteConfig.brand.name,
  tagline:         siteConfig.brand.tagline,
  email:           siteConfig.contact.email,
  phone:           siteConfig.contact.phone,
  whatsapp:        siteConfig.contact.whatsapp,
  street:          siteConfig.contact.address.street,
  city:            siteConfig.contact.address.city,
  zip:             siteConfig.contact.address.zip,
  country:         siteConfig.contact.address.country,
  businessHours:   siteConfig.contact.businessHours,
  instagram:       siteConfig.social.instagram,
  facebook:        siteConfig.social.facebook,
  twitter:         siteConfig.social.twitter,
  youtube:         siteConfig.social.youtube,
  linkedin:        siteConfig.social.linkedin,
  tiktok:          siteConfig.social.tiktok,
  metaTitle:       siteConfig.seo.title,
  metaDescription: siteConfig.seo.description,
  googleAnalyticsId: siteConfig.analytics.googleAnalyticsId,
  facebookPixelId:   siteConfig.analytics.facebookPixelId,
  showWhatsAppButton:       siteConfig.features.showWhatsAppButton,
  showNewsletterSignup:     siteConfig.features.showNewsletterSignup,
  showLiveChat:             siteConfig.features.showLiveChat,
  showAvailabilityCalendar: siteConfig.features.showAvailabilityCalendar,
  showPricingOnFleetPage:   siteConfig.features.showPricingOnFleetPage,
};

/* ── Shared style tokens ─────────────────────────────────── */
const INPUT = "w-full bg-background border border-border text-foreground text-sm font-body px-3 py-2.5 placeholder:text-muted-foreground/40 focus:outline-none focus:border-gold/60 transition-colors";
const LABEL = "block text-muted-foreground text-[10px] font-body tracking-[0.15em] uppercase mb-1.5";

/* ── Toggle switch ───────────────────────────────────────── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-checked={checked}
      role="switch"
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? "bg-gold" : "bg-border"
      }`}
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
        checked ? "translate-x-[18px]" : "translate-x-[2px]"
      }`} />
    </button>
  );
}

/* ── Field row ───────────────────────────────────────────── */
function Field({ label, value, onChange, type = "text", placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} className={INPUT} />
    </div>
  );
}

/* ── Toggle row ──────────────────────────────────────────── */
function ToggleRow({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border/40 last:border-0">
      <div className="min-w-0">
        <p className="text-foreground text-sm font-body font-medium">{label}</p>
        <p className="text-muted-foreground text-xs font-body mt-0.5">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export default function DashboardSettingsPage() {
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [saved, setSaved]       = useState(false);
  const [resetKey, setResetKey] = useState<string | null>(null);

  /* Load persisted settings on mount */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (raw) setS({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {}
  }, []);

  function set<K extends keyof Settings>(key: K, val: Settings[K]) {
    setS(prev => ({ ...prev, [key]: val }));
  }

  function handleSave() {
    try { localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(s)); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset(key: string, storageKey: string) {
    if (resetKey === key) {
      try { localStorage.removeItem(storageKey); } catch {}
      setResetKey(null);
      window.location.reload();
    } else {
      setResetKey(key);
      setTimeout(() => setResetKey(null), 4000);
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl text-foreground mb-1">Settings</h1>
        <p className="text-muted-foreground text-sm font-body">
          Manage your business profile, features, and application preferences.
        </p>
      </div>

      {/* ── Business Profile ── */}
      <section className="bg-card border border-border rounded-sm p-6 space-y-5">
        <div>
          <p className="text-gold text-[10px] font-body tracking-[0.2em] uppercase mb-0.5">Company</p>
          <h2 className="font-heading text-xl text-foreground">Business Profile</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Business Name" value={s.businessName} onChange={v => set("businessName", v)} />
          <Field label="Tagline"       value={s.tagline}       onChange={v => set("tagline", v)} />
          <Field label="Email"         value={s.email}         onChange={v => set("email", v)}   type="email" />
          <Field label="Phone"         value={s.phone}         onChange={v => set("phone", v)}   type="tel" />
          <Field label="WhatsApp"      value={s.whatsapp}      onChange={v => set("whatsapp", v)} placeholder="+1555000000" type="tel" />
          <Field label="Business Hours" value={s.businessHours} onChange={v => set("businessHours", v)} placeholder="Mon – Sun: 8 AM – 8 PM" />
        </div>

        <div>
          <p className="text-muted-foreground text-[10px] font-body tracking-[0.15em] uppercase mb-3">Address</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Street" value={s.street} onChange={v => set("street", v)} placeholder="1 Marina Promenade" />
            </div>
            <Field label="City"    value={s.city}    onChange={v => set("city", v)} />
            <Field label="ZIP"     value={s.zip}     onChange={v => set("zip", v)} />
            <Field label="Country" value={s.country} onChange={v => set("country", v)} />
          </div>
        </div>
      </section>

      {/* ── Social Media ── */}
      <section className="bg-card border border-border rounded-sm p-6 space-y-5">
        <div>
          <p className="text-gold text-[10px] font-body tracking-[0.2em] uppercase mb-0.5">Online Presence</p>
          <h2 className="font-heading text-xl text-foreground">Social Media</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(["instagram","facebook","twitter","youtube","linkedin","tiktok"] as const).map(platform => (
            <Field
              key={platform}
              label={platform.charAt(0).toUpperCase() + platform.slice(1)}
              value={s[platform]}
              onChange={v => set(platform, v)}
              placeholder={`https://${platform}.com/oceanique`}
              type="url"
            />
          ))}
        </div>
        <p className="text-muted-foreground text-[10px] font-body">Leave blank to hide the icon in the site footer.</p>
      </section>

      {/* ── SEO & Meta ── */}
      <section className="bg-card border border-border rounded-sm p-6 space-y-4">
        <div>
          <p className="text-gold text-[10px] font-body tracking-[0.2em] uppercase mb-0.5">Search</p>
          <h2 className="font-heading text-xl text-foreground">SEO &amp; Meta</h2>
        </div>
        <Field label="Meta Title" value={s.metaTitle} onChange={v => set("metaTitle", v)} />
        <div>
          <label className={LABEL}>Meta Description</label>
          <textarea
            value={s.metaDescription}
            onChange={e => set("metaDescription", e.target.value)}
            rows={3}
            className={`${INPUT} resize-none`}
          />
          <p className={`text-[10px] font-body mt-1 ${s.metaDescription.length > 160 ? "text-amber-400" : "text-muted-foreground"}`}>
            {s.metaDescription.length}/160 characters {s.metaDescription.length > 160 ? "— too long" : "recommended"}
          </p>
        </div>
      </section>

      {/* ── Feature Flags ── */}
      <section className="bg-card border border-border rounded-sm p-6 space-y-1">
        <div className="mb-4">
          <p className="text-gold text-[10px] font-body tracking-[0.2em] uppercase mb-0.5">Configuration</p>
          <h2 className="font-heading text-xl text-foreground">Feature Flags</h2>
        </div>
        <ToggleRow
          label="WhatsApp Button"
          description="Show a floating click-to-chat button on the public site."
          checked={s.showWhatsAppButton}
          onChange={v => set("showWhatsAppButton", v)}
        />
        <ToggleRow
          label="Newsletter Sign-up"
          description="Display the newsletter subscription form in the footer."
          checked={s.showNewsletterSignup}
          onChange={v => set("showNewsletterSignup", v)}
        />
        <ToggleRow
          label="Live Chat"
          description="Enable the live chat widget placeholder."
          checked={s.showLiveChat}
          onChange={v => set("showLiveChat", v)}
        />
        <ToggleRow
          label="Availability Calendar"
          description="Show the fleet availability calendar on the public fleet page."
          checked={s.showAvailabilityCalendar}
          onChange={v => set("showAvailabilityCalendar", v)}
        />
        <ToggleRow
          label="Pricing on Fleet Page"
          description="Display the per-day rate on public fleet vessel cards."
          checked={s.showPricingOnFleetPage}
          onChange={v => set("showPricingOnFleetPage", v)}
        />
      </section>

      {/* ── Analytics ── */}
      <section className="bg-card border border-border rounded-sm p-6 space-y-4">
        <div>
          <p className="text-gold text-[10px] font-body tracking-[0.2em] uppercase mb-0.5">Tracking</p>
          <h2 className="font-heading text-xl text-foreground">Analytics</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Google Analytics ID" value={s.googleAnalyticsId} onChange={v => set("googleAnalyticsId", v)} placeholder="G-XXXXXXXXXX" />
          <Field label="Facebook Pixel ID"   value={s.facebookPixelId}   onChange={v => set("facebookPixelId", v)}   placeholder="123456789012345" />
        </div>
        <p className="text-muted-foreground text-[10px] font-body">Leave blank to disable tracking.</p>
      </section>

      {/* ── Data Management ── */}
      <section className="bg-card border border-border rounded-sm p-6 space-y-4">
        <div>
          <p className="text-gold text-[10px] font-body tracking-[0.2em] uppercase mb-0.5">Demo</p>
          <h2 className="font-heading text-xl text-foreground">Data Management</h2>
        </div>
        <p className="text-muted-foreground text-sm font-body">
          Restore bookings or customers back to the seed data. This clears any changes made in this session.
        </p>
        <div className="space-y-3">
          {[
            { key: "bookings",  storageKey: BOOKINGS_STORAGE_KEY,  label: "Reset Bookings",  desc: "Restores all bookings to the config seed data." },
            { key: "customers", storageKey: CUSTOMERS_STORAGE_KEY, label: "Reset Customers", desc: "Restores all customers to the config seed data." },
          ].map(({ key, storageKey, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4 p-4 border border-border/50 bg-background">
              <div>
                <p className="text-foreground text-sm font-body font-medium">{label}</p>
                <p className="text-muted-foreground text-[11px] font-body mt-0.5">{desc}</p>
              </div>
              <button
                onClick={() => handleReset(key, storageKey)}
                className={`flex items-center gap-1.5 text-[11px] font-body tracking-[0.1em] uppercase px-4 py-2 shrink-0 transition-colors ${
                  resetKey === key
                    ? "bg-red-700 text-white"
                    : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
                }`}
              >
                {resetKey === key ? (
                  <><AlertTriangle size={11} /> Confirm Reset</>
                ) : (
                  <><RotateCcw size={11} /> Reset</>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Demo Credentials ── */}
      <section className="bg-card border border-border rounded-sm p-6 space-y-4">
        <div>
          <p className="text-gold text-[10px] font-body tracking-[0.2em] uppercase mb-0.5">Auth</p>
          <h2 className="font-heading text-xl text-foreground">Demo Credentials</h2>
        </div>
        <p className="text-muted-foreground text-sm font-body">
          Mock login credentials from <code className="text-gold">site.config.ts › auth</code>. Replace with a real provider before going live.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Admin Email",    val: siteConfig.auth.demoEmail },
            { label: "Admin Password", val: siteConfig.auth.demoPassword },
            { label: "Guest Email",    val: siteConfig.auth.customerDemoEmail },
            { label: "Guest Password", val: siteConfig.auth.customerDemoPassword },
          ].map(({ label, val }) => (
            <div key={label} className="bg-background border border-border p-4">
              <p className="text-muted-foreground text-[10px] uppercase tracking-[0.1em] font-body mb-1">{label}</p>
              <p className="text-gold font-mono text-sm">{val}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Save ── */}
      <div className="flex items-center gap-4 pb-4">
        <button
          onClick={handleSave}
          className="bg-gold text-midnight text-xs font-body font-semibold tracking-[0.15em] uppercase px-8 py-3 hover:bg-gold-light transition-colors"
        >
          Save Changes
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-body">
            <Check size={13} /> Saved to session
          </span>
        )}
        <p className="text-muted-foreground text-[10px] font-body ml-auto">
          To make permanent, update <code className="text-gold">site.config.ts</code>
        </p>
      </div>
    </div>
  );
}
