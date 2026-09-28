import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, Star, ShoppingBag, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import ProductImage from './ProductImage';
import { formatCurrency } from '../utils/formatCurrency';

export default function ProductCard({ product, variant }) {
  const { addToCart, wishlist, toggleWishlist, cart } = useShop();
  const [isAdded, setIsAdded] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const isWishlisted = wishlist.includes(product.id);
  const isInCart = cart.some(item => item.product.id === product.id);

  const price = Number(product.price) || 0;
  const oldPrice = Number(product.old_price || product.oldPrice) || 0;
  const discount = product.discount_percentage || product.discount || 0;
  const categoryName = product.category_name || product.category || 'Tech';
  const imageUrl = product.primary_image || product.image_url || product.image;

  useEffect(() => {
    if (!isQuickViewOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsQuickViewOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isQuickViewOpen]);

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(139, 92, 246, 0.2)' }}
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden rounded-2xl border border-violet-500/25 bg-gradient-to-b from-[#181828] via-[#12121e] to-[#0e0e16] p-5 flex flex-col justify-between group hover:border-violet-400/60 hover:shadow-[0_0_25px_rgba(139,92,246,0.22)] transition-all duration-300"
    >
      
      {/* Top Badges & Wishlist Button */}
      <div className="flex items-center justify-between z-10 mb-3">
        <div className="flex items-center gap-1.5">
          {discount > 0 && (
            <span className="px-2.5 py-1 rounded-md bg-gradient-to-r from-violet-500 to-violet-700 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-md">
              -{discount}%
            </span>
          )}
          {(product.is_new_arrival === 1 || product.isNew) && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] uppercase">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist Heart Toggle */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={`p-2 rounded-xl border transition-all ${
            isWishlisted
              ? 'bg-violet-500/25 border-violet-400/60 text-violet-300'
              : 'bg-black/40 border-white/10 text-slate-400 hover:text-violet-300 hover:border-violet-500/30'
          }`}
          title="Toggle Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-violet-400 text-violet-400' : ''}`} />
        </button>
      </div>

      {/* Product Image Link */}
      <div className="relative mb-4 overflow-hidden rounded-xl">
        <Link to={`/product/${product.id}`} className="block">
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
            <ProductImage imageUrl={imageUrl} productId={product.id} category={categoryName} className="h-48" iconSize={52} />
          </motion.div>
        </Link>
        <button
          type="button"
          onClick={() => setIsQuickViewOpen(true)}
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-xl border border-violet-300/40 bg-[#0a0a14]/85 px-3 py-2 text-xs font-bold text-white opacity-0 shadow-lg backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-violet-600"
          title={`Quick view ${product.name}`}
          aria-label={`Quick view ${product.name}`}
        >
          <Eye className="h-4 w-4" />
          View
        </button>
      </div>

      {/* Product Details */}
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block">
            {categoryName}
          </span>
          <Link to={`/product/${product.id}`}>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-violet-300 transition-colors line-clamp-1 mt-0.5">
              {product.name}
            </h3>
          </Link>
          
          {/* Ratings */}
          <div className="flex items-center gap-1.5 mt-1 text-xs">
            <div className="flex text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="font-bold text-slate-100">{product.rating || 5.0}</span>
            <span className="text-slate-400 font-mono">({product.reviewsCount || 10})</span>
          </div>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className={`pt-3 border-t border-white/10 flex gap-2 ${variant === 'homepage' ? 'flex-col' : 'items-center justify-between'}`}>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black font-mono text-white">
                {formatCurrency(price)}
              </span>
              {oldPrice > 0 && (
                <span className="text-xs text-slate-400 line-through font-mono">
                  {formatCurrency(oldPrice)}
                </span>
              )}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              addToCart(product, 1);
              setIsAdded(true);
              window.setTimeout(() => setIsAdded(false), 1500);
            }}
            className={`rounded-xl px-6 py-3 font-black text-xs uppercase tracking-wider transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${variant === 'homepage' ? 'w-full' : ''} ${
              isAdded
                ? 'bg-emerald-500 text-white shadow-[0_0_18px_rgba(16,185,129,0.5)] border border-emerald-400'
                : isInCart
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'bg-violet-600 hover:bg-violet-500 text-white border border-violet-400/50 shadow-[0_4px_16px_rgba(139,92,246,0.4)] hover:shadow-[0_6px_22px_rgba(139,92,246,0.65)]'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Added ✓</span>
              </>
            ) : isInCart ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                <span>{variant === 'homepage' ? 'Add to Cart' : 'Add'}</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {isQuickViewOpen && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsQuickViewOpen(false);
          }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Quick view ${product.name}`}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative grid w-full max-w-3xl grid-cols-1 gap-6 rounded-2xl border border-violet-500/30 bg-[#12121e] p-5 shadow-[0_20px_80px_rgba(10,10,20,0.65)] sm:grid-cols-2 sm:p-7"
          >
            <button
              type="button"
              onClick={() => setIsQuickViewOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              title="Close quick view"
              aria-label="Close quick view"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="overflow-hidden rounded-xl">
              <ProductImage imageUrl={imageUrl} productId={product.id} category={categoryName} className="h-64 sm:h-full" iconSize={64} />
            </div>
            <div className="flex flex-col justify-center pr-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">{categoryName}</span>
              <h2 className="mt-2 text-2xl font-black text-white">{product.name}</h2>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">{product.description || 'Premium quality tech accessory designed for your everyday setup.'}</p>
              <span className="mt-6 text-2xl font-black font-mono text-violet-400">{formatCurrency(price)}</span>
              <button
                type="button"
                onClick={() => addToCart(product, 1)}
                className="mt-6 w-full rounded-xl bg-violet-600 px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-violet-500"
              >
                Add to Cart
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
}
