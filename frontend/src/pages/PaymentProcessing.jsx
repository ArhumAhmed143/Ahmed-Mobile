import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import { ShieldCheck, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentProcessing() {
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get('orderId');
  const method = searchParams.get('method') || 'nayapay';

  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    if (orderId) {
      api.getPaymentStatus(orderId)
        .then(res => {
          if (res.success && res.data) setPaymentInfo(res.data);
        })
        .catch(err => console.warn('Payment status fetch error:', err));
    }
  }, [orderId]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
      
      {/* Icon Badge */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center shadow-lg"
      >
        <Clock className="w-10 h-10 animate-pulse" />
      </motion.div>

      {/* Main Title & Notice */}
      <div className="space-y-2">
        <span className="px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
          ORDER RECEIVED &bull; PAYMENT PENDING
        </span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-100 mt-2">
          LIVE NAYAPAY PAYMENT NOT CONFIGURED YET
        </h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Your order has been received and payment status is <strong className="text-amber-400 uppercase font-mono">PENDING</strong>. Payment will be verified once official NayaPay merchant integration is configured.
        </p>
      </div>

      {/* Local Dev Mode Transparent Card */}
      <div className="glass-card gold-border-glow p-8 rounded-3xl text-left max-w-lg mx-auto space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Payment Method</span>
          <span className="text-xs font-bold text-amber-300 uppercase font-mono">{method}</span>
        </div>

        <div className="space-y-3 text-xs">
          
          <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 font-semibold">Order Reference</span>
            <span className="font-mono font-bold text-amber-300">#NXH-{orderId}</span>
          </div>

          {paymentInfo?.total_amount && (
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 font-semibold">Order Amount</span>
              <span className="font-mono font-extrabold text-amber-200 text-sm">
                {formatCurrency(paymentInfo.total_amount)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 font-semibold">Payment Status</span>
            <span className="px-2.5 py-1 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold uppercase font-mono">
              PENDING
            </span>
          </div>

        </div>

        {/* View Order Details Button */}
        <Link
          to={`/order-success/${orderId}`}
          className="w-full py-4 rounded-xl gold-gradient-bg text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all flex items-center justify-center gap-2"
        >
          <span>View Order Details</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

      </div>

      <div className="flex items-center gap-2 text-[10px] text-slate-400 justify-center">
        <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
        <span>Order status remains Pending until verified by official gateway or admin</span>
      </div>

    </div>
  );
}
