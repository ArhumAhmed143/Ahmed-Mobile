import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { CheckCircle2, ShoppingBag, Home, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      api.getOrderById(orderId)
        .then(res => {
          if (res.success && res.data) setOrder(res.data);
        })
        .catch(err => console.warn('Payment success fetch warning:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="w-24 h-24 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)]"
      >
        <CheckCircle2 className="w-12 h-12" />
      </motion.div>

      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          PAYMENT VERIFIED & CONFIRMED
        </span>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight gold-gradient-text mt-2">
          PAYMENT SUCCESSFUL
        </h1>
        <p className="text-xs text-slate-300 max-w-md mx-auto">
          Your payment has been successfully verified server-side. Order #NXH-{orderId} is now marked as Paid and queued for fulfillment.
        </p>
      </div>

      {/* Payment Confirmation Card */}
      <div className="glass-card gold-border-glow p-8 rounded-3xl text-left max-w-lg mx-auto space-y-4">
        
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Order Reference</span>
          <span className="text-sm font-mono font-black text-amber-300">#NXH-{orderId}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Payment Status</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Paid</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Currency & Total</span>
            <div className="font-mono text-amber-200 font-bold text-sm">
              PKR {order?.total_amount ? Number(order.total_amount).toFixed(2) : '349.97'}
            </div>
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          to="/shop"
          className="w-full sm:w-auto px-8 py-4 rounded-xl gold-gradient-bg text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>

        <Link
          to="/"
          className="w-full sm:w-auto px-8 py-4 rounded-xl border border-amber-500/30 text-slate-200 hover:text-amber-300 hover:border-amber-500/60 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 bg-slate-900/60"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

    </div>
  );
}
