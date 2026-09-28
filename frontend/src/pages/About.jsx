import React from 'react';
import { Check, MessageCircle, ShoppingBag, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { founderImage } from '../components/FounderSection';
import AnimatedHeading from '../components/AnimatedHeading';

const whatsappNumber = String(import.meta.env.VITE_WHATSAPP_NUMBER || '923355708704').replace(/\D/g, '');
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi Ahmed Mobile, I would like to know more about your services.')}`;

const trustPoints = ['Genuine Products', 'Expert Technicians', '100% Genuine Gear', 'Fast Turnaround'];

export default function About() {
  return (
    <div className="mx-auto max-w-7xl space-y-12 sm:space-y-16 md:space-y-24 px-4 sm:px-6 py-10 sm:py-16 md:py-20">
      <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.05em] text-[#a78bfa]">Ahmed Mobile</p>
          <AnimatedHeading as="h1" className="mb-3 text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#f5f5f7]">The Story Behind Ahmed Mobile</AnimatedHeading>
          <p className="mb-4 sm:mb-6 text-xs sm:text-sm font-medium uppercase tracking-[0.05em] text-[#a78bfa]">CEO &amp; Co-Founder of Ahmed Mobile</p>
          <p className="max-w-xl text-base sm:text-lg lg:text-xl leading-[1.6] sm:leading-[1.7] text-[#a1a1a6]">A personal standard for better technology, thoughtful advice, and repairs done with precision.</p>
        </div>
        <img src={founderImage} alt="Ahmed Ghulam in the Ahmed Mobile studio" className="h-[260px] sm:h-[380px] lg:h-[460px] w-full rounded-2xl border border-white/10 object-cover" />
      </motion.section>

      <section className="max-w-3xl">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.05em] text-[#a78bfa]">Our story</p>
        <AnimatedHeading className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-[#f5f5f7]">Built around trust, not trends.</AnimatedHeading>
        <div className="space-y-4 sm:space-y-5 text-sm sm:text-base leading-[1.6] text-[#a1a1a6]">
          <p>Ahmed Mobile began with a simple belief: buying or repairing a phone should feel clear, personal, and dependable. Ahmed Ghulam brought years of hands-on technical experience into a store built for people who care about the technology they use every day.</p>
          <p>From carefully selected accessories to precise mobile repairs, every recommendation is made with the customer&apos;s real needs in mind. That same care shapes our support and after-sales service.</p>
        </div>
      </section>

      <section>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.05em] text-[#a78bfa]">What we do</p>
        <AnimatedHeading className="mb-6 sm:mb-8 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#f5f5f7]">Our Services</AnimatedHeading>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <ServiceCard icon={ShoppingBag} title="Premium Tech Accessories">Curated chargers, audio, power, and mobile accessories chosen for quality, compatibility, and everyday performance.</ServiceCard>
          <ServiceCard icon={Wrench} title="Expert Mobile Repairs">From screen replacements to complex board-level repairs, we handle it all with precision.</ServiceCard>
        </div>
      </section>

      <section>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.05em] text-[#a78bfa]">Our standard</p>
        <AnimatedHeading className="mb-6 sm:mb-8 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#f5f5f7]">Why Trust Us</AnimatedHeading>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {trustPoints.map((point) => (
            <div key={point} className="relative overflow-hidden flex items-center gap-2.5 sm:gap-3 rounded-2xl bg-gradient-to-r from-violet-500 via-violet-600 to-violet-800 px-3.5 sm:px-5 py-3.5 sm:py-4.5 text-xs sm:text-sm font-black text-white border border-violet-400/30 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
              <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.35)_25%,rgba(255,255,255,0.35)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.35)_75%)] [background-size:24px_24px]" />
              <div className="relative z-10 w-7 h-7 rounded-lg bg-black/30 border border-white/20 flex items-center justify-center shrink-0">
                <Check className="h-4 w-4 text-white" />
              </div>
              <span className="relative z-10">{point}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-violet-500 via-violet-600 to-violet-800 px-6 py-10 sm:px-12 sm:py-14 text-center shadow-[0_0_35px_rgba(139,92,246,0.25)] border border-violet-400/30">
        {/* Diagonal striped pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.35)_25%,rgba(255,255,255,0.35)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.35)_75%)] [background-size:28px_28px]" />

        <div className="relative z-10">
          <AnimatedHeading className="mb-3 sm:mb-4 text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">Let's look after your tech.</AnimatedHeading>
          <p className="mx-auto mb-6 sm:mb-8 max-w-xl text-xs sm:text-base leading-[1.6] text-white/95 font-medium">Visit our store at Ahmed Mobile, Qasai Chowk, Hussnain Street, Tench Bhatta, Rawalpindi or message us on WhatsApp for repair and product support.</p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-white-cta"><MessageCircle className="h-5 w-5" /> <span>Contact Us on WhatsApp (+92 3355708704)</span></a>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ icon: Icon, title, children }) {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-violet-500 via-violet-600 to-violet-800 p-6 sm:p-8 shadow-[0_0_25px_rgba(139,92,246,0.2)] border border-violet-400/30 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.35)_25%,rgba(255,255,255,0.35)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.35)_75%)] [background-size:24px_24px]" />
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-4 text-white">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 sm:mb-3 text-xl sm:text-2xl font-black uppercase text-white tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm leading-[1.6] text-white/95 font-medium">{children}</p>
      </div>
    </div>
  );
}