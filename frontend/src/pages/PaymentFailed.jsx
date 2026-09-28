import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { XCircle, RefreshCw, ShoppingCart, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentFailed() {
  const { orderId } = useParams();

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 rounded-3xl bg-red-950/80 text-red-400 border border-red-500/40 mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.3)]"
      >
        <XCircle className="w-12 h-12" />
      </motion.div>

      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full bg-red-950 text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wider">
          PAYMENT UNCOMPLETED
        </span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-red-300 mt-2">
          PAYMENT COULD NOT BE COMPLETED
        </h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          We could not verify payment for Order #NXH-{orderId}. The order remains unpaid in our system.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          to={`/payment-processing?orderId=${orderId}`}
          className="w-full sm:w-auto px-8 py-4 rounded-xl gold-gradient-bg text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </Link>

        <Link
          to="/checkout"
          className="w-full sm:w-auto px-8 py-4 rounded-xl border border-amber-500/30 text-slate-200 hover:text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-slate-900/60"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Return to Checkout</span>
        </Link>
      </div>

    </div>
  );
}
