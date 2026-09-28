import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, ShieldCheck, UserCheck, KeyRound, Store } from 'lucide-react';

export default function AdminSettings() {
  const { admin } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight gold-gradient-text">
          ADMIN SETTINGS
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Store security policies, credentials, and configuration controls.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Admin Profile Details */}
        <div className="glass-card gold-border-glow p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
            <UserCheck className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-bold text-slate-100">Authenticated Admin Account</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold">Admin Username</span>
              <p className="text-amber-300 font-mono font-bold text-sm">{admin?.username || 'admin'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold">Security Role</span>
              <p className="text-emerald-400 font-mono font-bold text-sm">Super Administrator</p>
            </div>
          </div>
        </div>

        {/* Security Password Change Section */}
        <div className="glass-card gold-border-glow p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
            <KeyRound className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-bold text-slate-100">Password Security</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
                <input
                  type="password"
                  disabled
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                <input
                  type="password"
                  disabled
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <span>Notice: Password updates will be enabled in upcoming administrative security modules.</span>
            </div>
          </div>
        </div>

        {/* Store Information */}
        <div className="glass-card gold-border-glow p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
            <Store className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-bold text-slate-100">Ahmed Moblie Store Configuration</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold">Store Brand Name</span>
              <p className="text-slate-100 font-bold">Ahmed Moblie</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold">Catalog Currency</span>
              <p className="text-slate-100 font-bold font-mono">PKR (₨)</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
