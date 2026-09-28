import React from 'react';
import { CreditCard, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Truck, title: 'Free Delivery', description: 'All over Pakistan' },
  { icon: ShieldCheck, title: '100% Genuine', description: 'Original Tech Gear' },
  { icon: CreditCard, title: 'Cash on Delivery', description: 'Pay at your doorstep' },
  { icon: RotateCcw, title: '7 Days Return', description: 'Easy returns policy' }
];

export default function TrustFeatures() {
  return (
    <section className="relative border-y border-violet-500/15 bg-[#0a0a14] py-5 sm:py-6">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 sm:px-6 lg:grid-cols-4 lg:gap-5">
        {features.map(({ icon: Icon, title, description }, index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: index * 0.06 }}
            className="relative overflow-hidden flex items-center gap-3 rounded-2xl bg-gradient-to-r from-violet-500 via-violet-600 to-violet-800 px-3.5 py-4 sm:px-5 sm:py-4.5 shadow-[0_0_20px_rgba(139,92,246,0.2)] border border-violet-400/30 hover:scale-[1.02] transition-all group"
          >
            {/* Diagonal striped pattern */}
            <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.35)_25%,rgba(255,255,255,0.35)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.35)_75%)] [background-size:24px_24px]" />
            
            <div className="relative z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Icon className="h-5 w-5 text-white sm:h-5.5 sm:w-5.5" />
            </div>
            <div className="min-w-0 relative z-10">
              <h3 className="truncate text-xs font-black text-white sm:text-sm uppercase tracking-wide">{title}</h3>
              <p className="truncate text-[11px] text-violet-100 font-medium sm:text-xs">{description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}