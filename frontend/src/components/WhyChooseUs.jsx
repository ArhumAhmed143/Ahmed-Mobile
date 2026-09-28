import React from 'react';
import { ShieldCheck, Award, Truck, Headphones } from 'lucide-react';
import { FEATURES } from '../data/mockData';
import AnimatedHeading from './AnimatedHeading';

const iconMap = {
  ShieldCheck,
  Award,
  Truck,
  Headphones
};

export default function WhyChooseUs() {
  return (
    <section className="py-12 sm:py-20 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-10">
        
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-violet-400">The Ahmed Mobile Standard</span>
          <AnimatedHeading className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white">WHY CHOOSE AHMED MOBILE</AnimatedHeading>
          <p className="text-xs text-slate-400">
            We deliver uncompromising craftsmanship, rapid fulfillment, and dedicated VIP support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((item) => {
            const IconComp = iconMap[item.iconName] || ShieldCheck;
            return (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 via-violet-600 to-violet-800 p-6 flex flex-col items-start gap-4 border border-violet-400/30 shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:scale-[1.02] transition-all group"
              >
                {/* Diagonal striped pattern */}
                <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.35)_25%,rgba(255,255,255,0.35)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.35)_75%)] [background-size:24px_24px]" />

                <div className="relative z-10 w-14 h-14 rounded-2xl bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-all shadow-md">
                  <IconComp className="w-7 h-7" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-lg font-black uppercase text-white tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-violet-100 font-medium mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
