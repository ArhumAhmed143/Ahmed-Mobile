import React from 'react';
import { ArrowRight, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedHeading from './AnimatedHeading';

const whatsappNumber = String(import.meta.env.VITE_WHATSAPP_NUMBER || '923355708704').replace(/\D/g, '');
const repairUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi Ahmed Mobile, I would like to book a repair.')}`;

export default function RepairServices() {
  return (
    <section className="px-4 sm:px-6 py-12 sm:py-20 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-violet-500 via-violet-600 to-violet-800 px-6 py-10 sm:px-12 sm:py-12 shadow-[0_0_35px_rgba(139,92,246,0.25)] border border-violet-400/30"
      >
        {/* Diagonal striped pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.35)_25%,rgba(255,255,255,0.35)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.35)_75%)] [background-size:28px_28px]" />

        <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:gap-8 md:flex-row md:items-center">
          <div>
            <p className="mb-2 sm:mb-3 text-xs font-black uppercase tracking-[0.1em] text-white/95">Local expertise, personal care</p>
            <AnimatedHeading className="mb-3 sm:mb-4 text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">Repair Services</AnimatedHeading>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-base leading-[1.6] text-white font-semibold">
              <p>⚡ Cracked Screen? We Fix It in 30 Minutes.</p>
              <p>🔋 Battery Draining Fast? Free Diagnosis.</p>
            </div>
          </div>
          <a
            href={repairUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-white-cta w-full sm:w-auto shrink-0"
          >
            <Wrench className="h-4 w-4" />
            <span>Book a Repair</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}