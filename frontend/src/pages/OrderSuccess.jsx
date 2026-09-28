import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import { CheckCircle2, ShoppingBag, Home, ShieldCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      api.getOrderById(orderId)
        .then(res => {
          if (res.success && res.data) setOrder(res.data);
        })
        .catch(err => console.warn('Order success fetch warning:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16 text-center space-y-6 sm:space-y-8">
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl gold-gradient-bg mx-auto flex items-center justify-center text-black shadow-[0_0_50px_rgba(212,175,55,0.5)]"
      >
        <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
      </motion.div>

      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
          ORDER CONFIRMED
        </span>
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight gold-gradient-text mt-2">
          ORDER PLACED SUCCESSFULLY
        </h1>
        <p className="text-xs text-slate-300 max-w-md mx-auto">
          Thank you for shopping with Ahmed Moblie. Your accessories order has been safely registered in our system.
        </p>
      </div>

      {/* Order Details Card */}
      <div className="glass-card gold-border-glow p-5 sm:p-8 rounded-2xl sm:rounded-3xl text-left max-w-lg mx-auto space-y-4">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3 sm:pb-4">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Order Reference</span>
          <span className="text-sm font-mono font-black text-amber-300">#NXH-{orderId}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs">
          <div className="p-3 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Order Status</span>
            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span className="capitalize">{order?.order_status || 'Pending'}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Payment Method</span>
            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{order?.payment_method === 'cod' ? 'Cash on Delivery' : 'COD'}</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Payment status is <strong>Pending</strong>. Please keep cash ready upon parcel delivery.</span>
        </div>

        {order?.total_amount && (
          <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800">
            <span className="text-slate-400 font-bold uppercase tracking-wider">Total Amount Due</span>
            <span className="font-mono text-base sm:text-lg font-bold text-amber-200">{formatCurrency(order.total_amount)}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
        <Link
          to="/shop"
          className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl gold-gradient-bg text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>

        <Link
          to="/"
          className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl border border-amber-500/30 text-slate-200 hover:text-amber-300 hover:border-amber-500/60 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 bg-slate-900/60"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

    </div>
  );
}
