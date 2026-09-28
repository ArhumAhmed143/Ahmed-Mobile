import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '../../components/Logo';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username.trim(), password);
      navigate('/admin');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080A] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden selection:bg-[#D4AF37] selection:text-black">
      
      {/* Background Ambient Gold Glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#D4AF37]/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[300px] bg-[#B8860B]/10 blur-[160px] pointer-events-none rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-card gold-border-glow rounded-3xl p-8 md:p-10 relative overflow-hidden z-10 shadow-[0_0_50px_rgba(0,0,0,0.9)]"
      >
        
        {/* Brand Header */}
        <div className="text-center space-y-3 mb-8">
          <Logo className="w-16 h-16 mx-auto" />
          <h1 className="whitespace-nowrap text-2xl font-black uppercase tracking-tight gold-gradient-text">
            <span className="whitespace-nowrap">AHMED</span> <span className="whitespace-nowrap">MOBLIE</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>ADMIN PORTAL SIGN IN</span>
          </p>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-950/40 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 text-red-200 text-xs"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              type="text"
              required
              placeholder="Enter admin username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-900/90 border border-amber-500/30 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-[0_0_15px_rgba(0,0,0,0.4)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/90 border border-amber-500/30 rounded-xl pl-4 pr-11 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-[0_0_15px_rgba(0,0,0,0.4)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-amber-300 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl gold-gradient-bg text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>SIGN IN</span>
              </>
            )}
          </button>
        </form>

        {/* Back to Store Button */}
        <div className="pt-6 mt-6 border-t border-amber-500/10 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>
        </div>

      </motion.div>
    </div>
  );
}
