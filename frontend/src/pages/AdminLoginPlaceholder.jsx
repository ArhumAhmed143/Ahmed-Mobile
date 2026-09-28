import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowLeft, AlertCircle } from 'lucide-react';

export default function AdminLoginPlaceholder() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="glass-card gold-border-glow rounded-3xl p-8 md:p-12 max-w-md w-full text-center space-y-6 bg-gradient-to-b from-[#0E0E14] to-black relative">
        
        {/* Top Lock Badge */}
        <div className="w-16 h-16 rounded-2xl gold-gradient-bg mx-auto flex items-center justify-center text-black shadow-[0_0_30px_rgba(212,175,55,0.4)]">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
            System Route: /admin-login
          </span>
          <h1 className="text-2xl font-black uppercase tracking-tight gold-gradient-text">
            ADMIN PORTAL ACCESS
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            This route is reserved for Ahmed Moblie store administrators to manage products, orders, and system analytics.
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-left flex items-start gap-3 text-xs text-amber-200">
          <AlertCircle className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-300">Step 2 Frontend Demo Notice</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Admin Authentication, JWT tokens, and MySQL database connection will be fully implemented in future steps.
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="w-full py-3.5 rounded-xl gold-gradient-bg text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Store</span>
        </Link>

      </div>
    </div>
  );
}
