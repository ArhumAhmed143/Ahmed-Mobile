import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Headphones, ShieldCheck, Zap, Star } from 'lucide-react';
import ProductImage from './ProductImage';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import AnimatedHeading from './AnimatedHeading';

export default function Hero() {
  const [featuredProduct, setFeaturedProduct] = useState(null);

  useEffect(() => {
    api.getFeaturedHighlight()
      .then(res => {
        if (res.success && res.data) {
          setFeaturedProduct(res.data);
        }
      })
      .catch(err => {
        console.warn('Hero featured highlight fetch error:', err);
        api.getFeaturedProducts()
          .then(res => {
            if (res.success && res.data?.[0]) {
              setFeaturedProduct(res.data[0]);
            }
          })
          .catch(() => {});
      });
  }, []);
  return (
    <section className="relative overflow-hidden bg-[#0d0d0f] pt-8 pb-14 sm:py-16 md:py-24">
      {/* Background Ambient Glows & Grid */}
      <div className="pointer-events-none absolute left-0 top-0 h-[420px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.05)_0%,transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Text & CTA Column */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left z-10">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/15 text-violet-200 text-xs font-bold uppercase tracking-widest shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-violet-300" />
            <span>Official Luxury Electronics Store</span>
          </motion.div>

          <h1 className="max-w-4xl text-[26px] min-[400px]:text-3xl sm:text-5xl md:text-6xl font-medium uppercase leading-[1.12] tracking-tight">
            <span className="block whitespace-nowrap text-[#f5f5f7]">
              <AnimatedHeading as="span" className="inline-block text-[#f5f5f7]">
                PREMIUM TECH.
              </AnimatedHeading>
            </span>
            <span className="block whitespace-nowrap text-[#a78bfa]">
              <AnimatedHeading as="span" delay={0.2} className="inline-block text-[#a78bfa]">
                SMARTER EVERY DAY.
              </AnimatedHeading>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-300 text-lg sm:text-xl font-light max-w-2xl mx-auto lg:mx-0 leading-relaxed"
          >
            Discover premium mobile accessories and electronics designed for your everyday life.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
          >
            <Link
              to="/shop"
              className="btn-purple-cta w-full sm:w-auto"
            >
              <span>SHOP NOW</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/deals"
              className="btn-white-cta w-full sm:w-auto"
            >
              <Zap className="w-4 h-4" />
              <span>EXPLORE DEALS</span>
            </Link>
          </motion.div>

          {/* Social Proof Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-6 border-t border-violet-500/15 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400"
          >
            <div className="flex items-center gap-1.5 text-violet-300">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="font-bold text-white ml-1">4.9/5</span>
              <span className="text-slate-400">(10k+ Customer Reviews)</span>
            </div>
          </motion.div>

        </div>

        {/* Right Technology Visual Column */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-5 relative"
        >
          {/* Main Hero Product Display Card */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-violet-500/30 bg-gradient-to-b from-[#18182a] via-[#12121e] to-[#0e0e16] p-5 sm:p-8 shadow-[0_0_35px_rgba(139,92,246,0.2)] group">
            
            {/* Top Showcase Label */}
            <div className="mb-4">
              <span className="px-3 py-1 rounded-full bg-violet-600/25 border border-violet-400/40 text-violet-200 text-xs font-bold uppercase tracking-wider">
                FEATURED HIGHLIGHT
              </span>
              <span className="mt-3 block text-2xl font-black font-mono text-white">
                {formatCurrency(featuredProduct?.price || 1500)}
              </span>
            </div>

            {/* Visual Image Render */}
            <Link to={`/product/${featuredProduct?.id || 1}`}>
              <ProductImage 
                imageUrl={featuredProduct?.primary_image || featuredProduct?.image_url || featuredProduct?.image || '/uploads/products/product-1786174016533-471374403.jpeg'} 
                productId={featuredProduct?.id || 1} 
                category={featuredProduct?.category_name || 'Audio'} 
                className="h-64 sm:h-72 md:h-80" 
                iconSize={80} 
              />
            </Link>

            {/* Product Meta */}
            <div className="mt-6 space-y-2">
              <Link to={`/product/${featuredProduct?.id || 1}`}>
                <h3 className="text-xl font-black text-white group-hover:text-violet-300 transition-colors">
                  {featuredProduct?.name || 'P9 Wireless Pro Headphones'}
                </h3>
              </Link>
              <p className="text-xs text-slate-400 line-clamp-2">
                {featuredProduct?.description || 'Spatial audio, active noise cancellation, memory foam ear cushions & titanium chassis.'}
              </p>
              
              <div className="pt-3 flex items-center justify-between border-t border-violet-500/15">
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  In Stock & Ready to Ship
                </span>
                <Link to={`/product/${featuredProduct?.id || 1}`} className="text-xs font-bold text-violet-400 hover:underline">
                  View Specs →
                </Link>
              </div>
            </div>

            {/* Floating Decorative Purple Badge */}
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-violet-500 to-violet-700 text-white border border-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-xl">
              25% OFF LIMITED TIME
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
