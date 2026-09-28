import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useShop } from '../context/ShopContext';
import { formatCurrency } from '../utils/formatCurrency';
import ProductImage from './ProductImage';
import { Flame, Clock, Zap, Plus, Star, Tag } from 'lucide-react';

function getRemainingTime(endTimeStr) {
  if (!endTimeStr) return { formatted: '00:00:00', isExpired: true };
  const end = new Date(endTimeStr).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, formatted: '00:00:00', isExpired: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const hStr = String(hours).padStart(2, '0');
  const mStr = String(minutes).padStart(2, '0');
  const sStr = String(seconds).padStart(2, '0');

  return {
    hours,
    minutes,
    seconds,
    formatted: `${hStr}:${mStr}:${sStr}`,
    isExpired: false
  };
}

export default function FlashDeals() {
  const [flashDeals, setFlashDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nowMs, setNowMs] = useState(Date.now());
  const { addToCart, cart } = useShop();

  // Tick timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchActiveDeals = () => {
    api.getActiveFlashDeals()
      .then(res => {
        if (res.success && res.data) {
          setFlashDeals(res.data);
        }
      })
      .catch(err => console.warn('FlashDeals fetch warning:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchActiveDeals();
  }, []);

  // Filter out any expired deals in real-time
  const validActiveDeals = flashDeals.filter(d => {
    const timerInfo = getRemainingTime(d.end_time);
    return d.is_active === 1 && !timerInfo.isExpired;
  });

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Banner Frame */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-500 via-violet-600 to-violet-800 p-6 sm:p-10 md:p-12 shadow-[0_0_35px_rgba(139,92,246,0.25)] border border-violet-400/30">
          
          {/* Diagonal striped pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.35)_25%,rgba(255,255,255,0.35)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.35)_75%)] [background-size:28px_28px]" />

          {/* Top Flame Badge & Header */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/20 pb-6 mb-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white text-xs font-bold uppercase tracking-wider">
                <Flame className="w-4 h-4 text-violet-200 fill-violet-200 animate-pulse" />
                <span>LIMITED TIME FLASH SALE</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                <Zap className="w-8 h-8 text-white fill-white" />
                <span>FLASH DEALS</span>
              </h2>
              <p className="text-xs sm:text-sm text-white/95 font-medium max-w-xl">
                Exclusive high-discount offers available in limited quantities. Grab yours before the countdown timer runs out!
              </p>
            </div>

            {validActiveDeals.length > 0 && (
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-black/30 backdrop-blur-md border border-white/20 shrink-0 text-white">
                <Clock className="w-5 h-5 text-violet-200 shrink-0" />
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Deals Active: <span className="font-mono text-white text-sm font-black">{validActiveDeals.length}</span>
                </div>
              </div>
            )}
          </div>

          {/* Flash Deal Products Grid or Professional Empty State */}
          {loading ? (
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-5 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 h-64 animate-pulse" />
              ))}
            </div>
          ) : validActiveDeals.length === 0 ? (
            <div className="relative z-10 py-12 px-6 text-center space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-black/30 border border-white/20 text-white flex items-center justify-center mx-auto">
                <Zap className="w-7 h-7 text-violet-200" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-wider text-white">
                ⚡ No Flash Deals Available
              </h3>
              <p className="text-xs sm:text-sm text-white/95 font-medium leading-relaxed">
                Check back soon for our next limited-time offers.
              </p>
              <Link
                to="/shop"
                className="btn-white-cta"
              >
                <span>Browse Shop Catalog</span>
              </Link>
            </div>
          ) : (
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {validActiveDeals.map(deal => {
                const timer = getRemainingTime(deal.end_time);
                const origPrice = Number(deal.original_price) || 0;
                const flashPrice = Number(deal.flash_price) || 0;
                const discount = Number(deal.discount_percentage) || (origPrice > flashPrice ? Math.round(((origPrice - flashPrice) / origPrice) * 100) : 0);
                const imageUrl = deal.primary_image || deal.image_url;

                // Product object mapped for cart
                const cartProduct = {
                  id: deal.product_id,
                  name: deal.product_name,
                  price: flashPrice,
                  old_price: origPrice,
                  discount_percentage: discount,
                  primary_image: imageUrl,
                  category_name: deal.category_name
                };

                const inCartQty = cart.find(item => item.product.id === deal.product_id)?.quantity || 0;

                return (
                  <div
                    key={deal.id}
                    className="relative overflow-hidden bg-[#0d0d0f]/95 rounded-2xl p-5 border border-white/10 shadow-2xl hover:border-violet-300/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all duration-300 flex flex-col justify-between group"
                  >
                    
                    {/* Top Flash Deal Badge & Discount */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-600/30 text-violet-300 border border-violet-500/40 font-black text-[10px] uppercase tracking-wider">
                        <Zap className="w-3 h-3 text-violet-400 fill-violet-400" />
                        <span>FLASH DEAL</span>
                      </div>

                      {discount > 0 && (
                        <div className="px-2.5 py-1 rounded-lg bg-white text-violet-950 font-black text-[10px] uppercase tracking-wider shadow-sm">
                          -{discount}% OFF
                        </div>
                      )}
                    </div>

                    <div>
                      {/* Product Image Link */}
                      <Link to={`/product/${deal.product_id}`} className="block mb-3 relative group-hover:scale-105 transition-transform duration-300">
                        <ProductImage imageUrl={imageUrl} productId={deal.product_id} category={deal.category_name} className="h-40" iconSize={44} />
                        {inCartQty > 0 && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-violet-500/30 text-violet-200 text-[10px] font-mono font-bold border border-violet-400/40 shadow-sm backdrop-blur-sm">
                            {inCartQty} in cart
                          </span>
                        )}
                      </Link>

                      {/* Title & Category */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-violet-400 uppercase tracking-widest block">
                          {deal.category_name || 'Tech'}
                        </span>
                        <Link to={`/product/${deal.product_id}`}>
                          <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-violet-300 transition-colors">
                            {deal.product_name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-slate-200">{deal.rating || 4.9}</span>
                        </div>
                      </div>
                    </div>

                    {/* Live Countdown Timer Badge */}
                    <div className="my-3 p-2.5 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
                        <Clock className="w-3.5 h-3.5 text-violet-400" />
                        <span>Ends in:</span>
                      </div>
                      <div className="font-mono font-black text-violet-300 text-xs tracking-wider">
                        {timer.formatted}
                      </div>
                    </div>

                    {/* Pricing & Add to Cart */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-base font-black font-mono text-white">
                          {formatCurrency(flashPrice)}
                        </div>
                        {origPrice > 0 && (
                          <div className="text-[11px] text-slate-400 line-through font-mono">
                            {formatCurrency(origPrice)}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => addToCart(cartProduct, 1)}
                        className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-xs uppercase tracking-wider border border-violet-400/50 shadow-[0_2px_12px_rgba(139,92,246,0.4)] hover:shadow-[0_4px_18px_rgba(139,92,246,0.6)] flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>Add</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
