/**
 * ============================================================
 * OCEANIQUE — ContactSection
 * ============================================================
 * Contact form and business info section. Used on the homepage
 * (condensed) and as the full /contact page body.
 *
 * DATA SOURCES:
 * - Contact details → src/config/site.config.ts (contact)
 * - Social links    → src/config/site.config.ts (social)
 *
 * CUSTOMIZE:
 * - To change contact details: edit site.config.ts > contact
 * - To wire up form submission: replace the handleSubmit stub
 *   below with a real API call (e.g. Resend, EmailJS, Formspree).
 * - To change form fields: add/remove <input> elements below.
 * ============================================================
 *
 * TODO: Build out this component — see design spec.
 * Planned features:
 *  - Controlled form with React state
 *  - Client-side validation with error messages
 *  - Success toast notification on send
 *  - Contact info column with icons (email, phone, address)
 *  - Optional Google Maps embed
 */

"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Mail, Phone, MapPin, Clock, CheckCircle } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { SectionHeading } from "@/components/common/SectionHeading";

const LABEL = "block text-silver/50 text-[11px] tracking-[0.15em] uppercase font-body mb-2";
const INPUT  = "w-full bg-transparent border border-white/10 text-white placeholder:text-silver/25 font-body text-sm px-4 py-3 focus:outline-none focus:border-gold transition-colors";

// ─────────────────────────────────────────────────────────────────────────────
// ✏️  EDIT HERE — Section heading copy
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Heading text shown in the left column.
 * Contact details (email, phone, address, hours) are pulled automatically
 * from src/config/site.config.ts — edit them there.
 */
const CONTENT = {
  /** Small uppercase label above the title. */
  eyebrow: "Get in Touch",
  /** Main section title. */
  title: "Begin Your Journey",
  /** Short description below the title. */
  description: "Our charter specialists are available to craft the perfect bespoke experience for you.",
  /** Success screen title after the form is submitted. */
  successTitle: "Enquiry Received",
  /** Success screen body — {name} is replaced with the user's first name. */
  successBody: (name: string) =>
    `Thank you, ${name}. Our team will be in touch within 24 hours to discuss your bespoke charter.`,
  /** Link text on the success screen to submit another message. */
  successReset: "Send another enquiry",
  /** Submit button label while idle. */
  submitLabel: "Send Enquiry",
  /** Submit button label while the form is submitting. */
  submittingLabel: "Sending\u2026",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// ✏️  EDIT HERE — Enquiry type dropdown options
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Options shown in the "Enquiry Type" select field.
 * Add, remove, or rename any entry — the first item is the default.
 */
const ENQUIRY_TYPES = [
  "Day Charter",
  "Private Event",
  "Corporate Charter",
  "Extended Voyage",
  "General Enquiry",
] as const;

export function ContactSection() {
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  /** Default to the first enquiry type defined in ENQUIRY_TYPES above. */
  const [type,      setType]      = useState<string>(ENQUIRY_TYPES[0]);
  const [message,   setMessage]   = useState("");
  const [sent,      setSent]      = useState(false);
  const [loading,   setLoading]   = useState(false);

  /** Ref on the grid container — gates both column entrance animations. */
  const ref      = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    /*
      WIRE UP: Replace the setTimeout below with a real API call, e.g.
        await fetch("/api/contact", { method: "POST", body: JSON.stringify({ firstName, lastName, email, type, message }) });
      or use Resend / EmailJS / Formspree.
    */
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
  }

  return (
    <section className="bg-midnight py-24 px-6">
      <div ref={ref} className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* ---- Left: info — slides in from the left ---- */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.75, ease: [0.25, 0.1, 0, 1] }}
        >
          {/* Heading — edit CONTENT above */}
          <SectionHeading
            eyebrow={CONTENT.eyebrow}
            title={CONTENT.title}
            description={CONTENT.description}
            align="left"
            light
          />

          <div className="mt-10 space-y-6">
            {[
              { Icon: Mail,   label: "Email",    value: siteConfig.contact.email },
              { Icon: Phone,  label: "Phone",    value: siteConfig.contact.phone },
              {
                Icon: MapPin,
                label: "Location",
                value: `${siteConfig.contact.address.street}, ${siteConfig.contact.address.city}, ${siteConfig.contact.address.country}`,
              },
              { Icon: Clock,  label: "Hours",    value: siteConfig.contact.businessHours },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-8 h-8 border border-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={14} className="text-gold/60" aria-hidden />
                </div>
                <div>
                  <p className="text-gold text-[11px] tracking-[0.2em] uppercase font-body mb-1">{label}</p>
                  <p className="text-silver/70 font-body text-sm">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ---- Right: form — slides in from the right ---- */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.25, 0.1, 0, 1] }}
        >
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center text-center py-16"
            >
              <CheckCircle size={48} className="text-gold mb-6" />
              <h3 className="font-heading text-3xl text-white mb-3">{CONTENT.successTitle}</h3>
              <div className="w-10 h-px bg-gold mx-auto mb-5" />
              <p className="text-silver/60 font-body text-sm max-w-xs leading-relaxed">
                {CONTENT.successBody(firstName)}
              </p>
              <button
                onClick={() => { setSent(false); setFirstName(""); setLastName(""); setEmail(""); setMessage(""); }}
                className="mt-8 text-silver/40 text-xs font-body hover:text-gold transition-colors underline underline-offset-4"
              >
                {CONTENT.successReset}
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="firstName" className={LABEL}>First Name</label>
                  <input id="firstName" type="text" required placeholder="Alexandre" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={INPUT} />
                </div>
                <div>
                  <label htmlFor="lastName" className={LABEL}>Last Name</label>
                  <input id="lastName" type="text" required placeholder="Dupont" value={lastName} onChange={(e) => setLastName(e.target.value)} className={INPUT} />
                </div>
              </div>

              <div>
                <label htmlFor="contactEmail" className={LABEL}>Email Address</label>
                <input id="contactEmail" type="email" required placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT} />
              </div>

              <div>
                <label htmlFor="enquiryType" className={LABEL}>Enquiry Type</label>
                <select
                  id="enquiryType"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-midnight border border-white/10 text-silver font-body text-sm px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                >
                  {/* Options — edit ENQUIRY_TYPES above */}
                  {ENQUIRY_TYPES.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="contactMessage" className={LABEL}>Message</label>
                <textarea
                  id="contactMessage"
                  rows={4}
                  required
                  placeholder="Tell us about your ideal charter experience..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`${INPUT} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-gold text-midnight text-xs font-body font-semibold tracking-[0.2em] uppercase hover:bg-gold-light disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? CONTENT.submittingLabel : CONTENT.submitLabel}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
