/**
 * ============================================================
 * OCEANIQUE — ServicesSection
 * ============================================================
 * Displays the core services the business offers. Renders a
 * grid of service cards, each with an icon, title, and short
 * description. Used on the homepage.
 *
 * DATA SOURCES:
 * - Service items → defined locally in the `services` array below
 *
 * CUSTOMIZE:
 * - To change service cards: edit the `services` array below.
 *   Each item has: icon (Lucide name), title, description.
 * - To change the section background: update className on <section>.
 * ============================================================
 *
 * TODO: Build out this component — see design spec.
 * Planned features:
 *  - Lucide icons for each service
 *  - Hover state with gold border + lift shadow
 *  - Framer Motion stagger reveal on scroll
 */

"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Anchor,
  Star,
  Briefcase,
  Map,
  Utensils,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";

/**
 * Edit this array to change the displayed services.
 * `icon` must match a key in `iconMap` below.
 */
const services: { icon: string; title: string; description: string }[] = [
  {
    icon: "Anchor",
    title: "Day Charters",
    description:
      "Spend a perfect day at sea with family and friends. Our day charters include a dedicated captain, crew, and full onboard catering.",
  },
  {
    icon: "Star",
    title: "Private Events",
    description:
      "Mark every milestone in extraordinary fashion. Birthdays, anniversaries, proposals — we craft experiences that last a lifetime.",
  },
  {
    icon: "Briefcase",
    title: "Corporate Charters",
    description:
      "Elevate your business meetings and team experiences. Private, exclusive, and unforgettable — the perfect setting for success.",
  },
  {
    icon: "Map",
    title: "Extended Voyages",
    description:
      "Explore the Mediterranean, Caribbean, or beyond. Our long-term charter packages provide everything for a voyage of true luxury.",
  },
  {
    icon: "Utensils",
    title: "Catering & Cuisine",
    description:
      "Our onboard chefs craft bespoke menus using the finest local ingredients. Fine dining, reimagined for life at sea.",
  },
  {
    icon: "Waves",
    title: "Water Sports",
    description:
      "Dive, snorkel, jet-ski, or paddleboard. A curated selection of water sports equipment is included with every charter.",
  },
];

const iconMap: Record<string, LucideIcon> = {
  Anchor,
  Star,
  Briefcase,
  Map,
  Utensils,
  Waves,
};

function ServiceCard({
  service,
  index,
}: {
  service: (typeof services)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const Icon = iconMap[service.icon] ?? Anchor;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.25, 0.1, 0, 1] }}
      className="group border border-white/8 p-8 hover:border-gold/40 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Icon container */}
      <div className="w-11 h-11 border border-gold/30 flex items-center justify-center mb-6 group-hover:border-gold/70 transition-colors duration-300">
        <Icon size={18} className="text-gold/70 group-hover:text-gold transition-colors" aria-hidden />
      </div>

      <h3 className="font-heading text-xl text-white mb-3 group-hover:text-gold/90 transition-colors duration-300">
        {service.title}
      </h3>
      <p className="text-silver/50 text-sm font-body leading-relaxed">
        {service.description}
      </p>
    </motion.div>
  );
}

export function ServicesSection() {
  return (
    <section className="bg-midnight py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="What We Offer"
          title="Experiences Crafted for You"
          description="Every charter is a tailored journey. We handle every detail so you can focus entirely on the pleasure of the sea."
          light
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {services.map((service, i) => (
            <ServiceCard key={service.title} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
