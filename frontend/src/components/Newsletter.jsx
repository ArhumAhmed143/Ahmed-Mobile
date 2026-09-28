import React, { useState } from 'react';
import { Mail, CheckCircle2, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import AnimatedHeading from './AnimatedHeading';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await api.subscribeNewsletter(email.trim());
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Subscription failed. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 sm:py-20 md:py-24 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-violet-500 via-violet-600 to-violet-800 p-8 sm:p-12 md:p-14 text-center shadow-[0_0_35px_rgba(139,92,246,0.25)] border border-violet-400/30">
          
          {/* Diagonal striped pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.35)_25%,rgba(255,255,255,0.35)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.35)_75%)] [background-size:28px_28px]" />

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-black/30 backdrop-blur-md mx-auto flex items-center justify-center text-white mb-5 sm:mb-6 border border-white/20 shadow-lg">
              <Sparkles className="w-6 h-6 text-violet-200" />
            </div>

            <AnimatedHeading className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">Subscribe to Our Newsletter</AnimatedHeading>

            <p className="text-xs md:text-sm text-white/95 font-medium max-w-xl mx-auto mt-3 leading-relaxed">
              Get exclusive deals, VIP flash discounts, and new arrivals straight to your inbox
            </p>

            {subscribed ? (
              <div className="mt-8 bg-black/40 border border-white/30 rounded-2xl p-4 inline-flex items-center gap-3 text-white text-sm font-semibold backdrop-blur-md">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Thank you for subscribing! Check your email for exclusive deals.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-violet-200 absolute left-4 top-4" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0d0d0f]/90 border-2 border-white/30 focus:border-white rounded-xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-white/70 focus:outline-none shadow-lg transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-white-cta whitespace-nowrap disabled:opacity-60"
                >
                  <span>{isSubmitting ? 'Subscribing...' : 'Subscribe'}</span>
                </button>
              </form>
            )}
          </div>

          {errorMessage && (
            <p className="mt-3 text-xs font-semibold text-red-300" role="alert">{errorMessage}</p>
          )}

          <p className="text-xs text-white/90 font-medium mt-4">
            We respect your privacy. Unsubscribe at any time. No spam ever.
          </p>

        </div>
      </div>
    </section>
  );
}
