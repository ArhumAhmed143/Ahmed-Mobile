import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Headphones, 
  Zap, 
  Cable, 
  BatteryCharging, 
  Shield, 
  Watch, 
  Smartphone, 
  Cpu 
} from 'lucide-react';
import { api } from '../services/api';
import AnimatedHeading from './AnimatedHeading';

const iconMap = {
  Headphones,
  Zap,
  Cable,
  BatteryCharging,
  Shield,
  Watch,
  Smartphone,
  Cpu
};

export default function Categories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.getCategories()
      .then(res => {
        if (res.success && res.data) setCategories(res.data);
      })
      .catch(err => console.warn('Categories API fetch error:', err));
  }, []);

  return (
    <section className="py-12 sm:py-20 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 border-b border-violet-500/20 pb-4 sm:pb-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-violet-400">Curated Collections</span>
            <AnimatedHeading className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-1">Shop by Category</AnimatedHeading>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            Browse our wide collection of premium electronics, fast chargers, studio audio equipment & smart gadgets.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.slice(0, 5).map((category, index) => {
            const IconComponent = iconMap[category.iconName] || Smartphone;
            
            return (
              <motion.div
                key={category.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Link
                  to={`/shop?category=${encodeURIComponent(category.name)}`}
                  className="relative overflow-hidden rounded-2xl border border-violet-400/30 bg-gradient-to-r from-violet-500 via-violet-600 to-violet-800 p-3.5 sm:p-5 flex flex-col items-center justify-center gap-3 sm:gap-4 min-h-[140px] sm:min-h-44 group hover:-translate-y-1.5 hover:scale-[1.02] shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all duration-300 block text-center"
                >
                  {/* Diagonal striped pattern */}
                  <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.35)_25%,rgba(255,255,255,0.35)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.35)_75%)] [background-size:24px_24px]" />

                  <div className="flex items-center justify-between z-10 relative">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-all shadow-md">
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>

                  <div className="z-10 mt-1 relative">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide text-white">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
