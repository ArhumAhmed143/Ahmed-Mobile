import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatCurrency } from '../utils/formatCurrency';
import ProductImage from './ProductImage';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartSubtotal } = useShop();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#0C0C10] border-l border-amber-500/20 text-slate-100 z-50 flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.9)]"
          >
            {/* Header */}
            <div className="p-6 border-b border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-xl font-bold tracking-wider gold-gradient-text uppercase">Your Cart</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 rounded-full glass-card gold-border-glow mx-auto flex items-center justify-center text-amber-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <p className="text-slate-300 font-medium">Your cart is currently empty</p>
                  <p className="text-xs text-slate-500">Discover premium tech gear and add your favorite items!</p>
                </div>
              ) : (
                cart.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="glass-card gold-border-glow p-4 rounded-xl flex items-center gap-4 relative"
                  >
                    <div className="w-16 h-16 shrink-0">
                      <ProductImage productId={product.id} category={product.category} className="h-16" iconSize={24} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-100 truncate">{product.name}</h4>
                      <p className="text-xs text-amber-400 font-mono mt-0.5">{formatCurrency(product.price)}</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-bold">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-violet-500/20 bg-slate-950/80 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300 font-semibold">Subtotal</span>
                  <span className="text-xl font-black font-mono text-white">
                    {formatCurrency(cartSubtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Shipping & Taxes</span>
                  <span>Calculated at checkout</span>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-sm uppercase tracking-wider border border-violet-400/50 shadow-[0_4px_20px_rgba(139,92,246,0.45)] hover:shadow-[0_6px_28px_rgba(139,92,246,0.65)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-300 uppercase tracking-widest pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>256-Bit Encrypted Secure Checkout</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
