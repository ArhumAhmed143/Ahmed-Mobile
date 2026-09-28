import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedHeading from './AnimatedHeading';

export default function PromoBanner() {
  return (
    <section className="px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 via-violet-600 to-violet-800 px-6 py-12 text-center shadow-[0_0_35px_rgba(139,92,246,0.2)] sm:px-10"
      >
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.35)_25%,rgba(255,255,255,0.35)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.35)_75%)] [background-size:28px_28px]" />
        <div className="relative">
          <Sparkles className="mx-auto mb-3 h-6 w-6 text-violet-100" />
          <AnimatedHeading className="text-3xl font-black uppercase tracking-tight text-white sm:text-5xl">MEGA SALE - UPTO 40% OFF</AnimatedHeading>
          <p className="mt-3 text-sm text-white/95 font-medium sm:text-base">Limited time offer on premium accessories</p>
          <Link to="/shop" className="btn-white-cta mt-7">
            <span>Shop Now</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}