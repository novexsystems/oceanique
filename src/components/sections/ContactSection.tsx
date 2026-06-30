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

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Clock, CheckCircle } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { SectionHeading } from "@/components/common/SectionHeading";

const LABEL = "block text-silver/50 text-[11px] tracking-[0.15em] uppercase font-body mb-2";
const INPUT  = "w-full bg-transparent border border-white/10 text-white placeholder:text-silver/25 font-body text-sm px-4 py-3 focus:outline-none focus:border-gold transition-colors";

export function ContactSection() {
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [type,      setType]      = useState("Day Charter");
  const [message,   setMessage]   = useState("");
  const [sent,      setSent]      = useState(false);
  const [loading,   setLoading]   = useState(false);

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
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* ---- Left: info ---- */}
        <div>
          <SectionHeading
            eyebrow="Get in Touch"
            title="Begin Your Journey"
            description="Our charter specialists are available to craft the perfect bespoke experience for you."
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
        </div>

        {/* ---- Right: form ---- */}
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center text-center py-16"
            >
              <CheckCircle size={48} className="text-gold mb-6" />
              <h3 className="font-heading text-3xl text-white mb-3">Enquiry Received</h3>
              <div className="w-10 h-px bg-gold mx-auto mb-5" />
              <p className="text-silver/60 font-body text-sm max-w-xs leading-relaxed">
                Thank you, {firstName}. Our team will be in touch within 24 hours to discuss your bespoke charter.
              </p>
              <button
                onClick={() => { setSent(false); setFirstName(""); setLastName(""); setEmail(""); setMessage(""); }}
                className="mt-8 text-silver/40 text-xs font-body hover:text-gold transition-colors underline underline-offset-4"
              >
                Send another enquiry
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
                  {["Day Charter", "Private Event", "Corporate Charter", "Extended Voyage", "General Enquiry"].map((o) => (
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
                {loading ? "Sending…" : "Send Enquiry"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
