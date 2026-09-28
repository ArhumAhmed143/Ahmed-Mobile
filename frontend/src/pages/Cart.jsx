import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import ProductImage from '../components/ProductImage';
import { formatCurrency } from '../utils/formatCurrency';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartSubtotal, cartTotal, deliveryFee } = useShop();

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl gold-gradient-bg mx-auto flex items-center justify-center text-black shadow-[0_0_40px_rgba(212,175,55,0.4)]">
          <ShoppingBag className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black uppercase tracking-tight gold-gradient-text">
            YOUR CART IS EMPTY
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Looks like you haven't added any luxury accessories to your shopping cart yet.
          </p>
        </div>

        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gold-gradient-bg text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight gold-gradient-text">
            SHOPPING CART
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review selected luxury products before proceeding to checkout.
          </p>
        </div>

        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-amber-300 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Main Grid: Cart Items (Left) + Order Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Items Column */}
        <div className="lg:col-span-8 space-y-3 sm:space-y-4">
          {cart.map((item) => {
            const prod = item.product;
            const stock = Number(prod.stock_quantity ?? prod.stock ?? 10);
            const price = Number(prod.price) || 0;
            const itemSubtotal = price * item.quantity;
            const imageUrl = prod.primary_image || prod.image_url;

            return (
              <motion.div
                key={prod.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card gold-border-glow rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6"
              >
                
                {/* Product Thumbnail & Details */}
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                    <ProductImage imageUrl={imageUrl} productId={prod.id} category={prod.category_name} className="h-16 sm:h-20" iconSize={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      {prod.category_name || prod.category || 'Tech'}
                    </span>
                    <Link to={`/product/${prod.id}`}>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-100 hover:text-amber-300 transition-colors line-clamp-1">
                        {prod.name}
                      </h3>
                    </Link>
                    <p className="text-xs font-mono font-bold text-amber-300 mt-1">
                      {formatCurrency(price)}
                    </p>
                  </div>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto border-t sm:border-t-0 border-slate-800/80 pt-3 sm:pt-0">
                  
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 border border-amber-500/30 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(prod.id, item.quantity - 1)}
                      className="p-1.5 text-slate-400 hover:text-amber-300 transition-colors"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 sm:w-8 text-center text-xs font-mono font-bold text-slate-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(prod.id, item.quantity + 1)}
                      disabled={item.quantity >= stock}
                      className="p-1.5 text-slate-400 hover:text-amber-300 transition-colors disabled:opacity-30"
                      title="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Item Subtotal */}
                  <div className="text-right font-mono text-xs sm:text-sm font-bold text-slate-100 min-w-[70px] sm:min-w-[80px]">
                    {formatCurrency(itemSubtotal)}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(prod.id)}
                    className="p-2 rounded-xl bg-red-950/40 text-red-400 border border-red-500/30 hover:bg-red-900/40 transition-colors shrink-0"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>

              </motion.div>
            );
          })}
        </div>

        {/* Right Order Summary Column */}
        <div className="lg:col-span-4 glass-card gold-border-glow p-5 sm:p-8 rounded-2xl sm:rounded-3xl space-y-5 sm:space-y-6 lg:sticky lg:top-28">
          <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wider text-slate-100 border-b border-amber-500/20 pb-3 sm:pb-4">
            ORDER SUMMARY
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Cart Subtotal</span>
              <span className="font-mono font-bold text-slate-200">{formatCurrency(cartSubtotal)}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Standard Delivery Fee</span>
              <span className="font-mono font-bold text-slate-200">{formatCurrency(deliveryFee)}</span>
            </div>

            <div className="pt-3 border-t border-amber-500/20 flex justify-between text-slate-100 text-sm font-bold">
              <span>Total Amount</span>
              <span className="font-mono text-amber-300 text-base sm:text-lg">{formatCurrency(cartTotal)}</span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="w-full py-3.5 sm:py-4 rounded-xl gold-gradient-bg text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2 text-[10px] text-slate-400 justify-center pt-2">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>Guaranteed Safe & Secure Checkout</span>
          </div>
        </div>

      </div>

    </div>
  );
}
