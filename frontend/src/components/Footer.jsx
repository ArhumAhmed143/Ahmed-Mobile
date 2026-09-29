import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="glass-card border-t border-violet-500/15 pt-12 sm:pt-20 pb-10 sm:pb-14 bg-[#121212] text-slate-400 text-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
        
        {/* Brand & Description Column */}
        <div className="space-y-4">
          <Link to="/" className="flex min-w-fit shrink-0 items-center gap-3">
            <Logo className="w-10 h-10" />
            <span className="whitespace-nowrap text-2xl font-black tracking-tight gold-gradient-text">
              <span className="whitespace-nowrap">AHMED</span> <span className="whitespace-nowrap">MOBLIE</span>
            </span>
          </Link>

          <p className="text-slate-400 max-w-sm text-xs leading-relaxed">
            Your destination for premium mobile accessories, high-speed GaN chargers, luxury phone cases, and studio acoustics. Built for tech enthusiasts who value quality.
          </p>

          <div className="flex items-center gap-4 text-slate-400 pt-2">
            {/* Instagram — UPDATED LINK */}
            <a 
              href="https://www.instagram.com/official_ahmee" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-8 h-8 rounded-lg glass-card border border-amber-500/20 flex items-center justify-center hover:text-amber-300 hover:border-amber-500/50 transition-colors" 
              title="Instagram"
              aria-label="Ahmed Mobile on Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            {/* TikTok */}
            <a 
              href="https://www.tiktok.com/@ahmed_mobil01?_r=1&_t=ZS-9A4k03NnK0w" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-8 h-8 rounded-lg glass-card border border-amber-500/20 flex items-center justify-center hover:text-amber-300 hover:border-amber-500/50 transition-colors" 
              title="TikTok"
              aria-label="Ahmed Mobile on TikTok"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.41c.02 1.95-.54 3.96-1.68 5.56-1.32 1.86-3.48 3.08-5.75 3.3-2.27.22-4.59-.39-6.38-1.78-1.79-1.39-2.92-3.48-3.1-5.74-.18-2.26.54-4.52 1.97-6.28 1.43-1.76 3.52-2.82 5.79-2.95.34-.02.68.01 1.02.05v4.06c-.63-.12-1.28-.08-1.89.13-.77.26-1.41.8-1.81 1.51-.4.71-.51 1.56-.31 2.37.2.81.71 1.51 1.43 1.95.72.44 1.59.57 2.4.36.81-.21 1.51-.74 1.92-1.47.38-.68.53-1.48.51-2.26V.02z"/></svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-amber-200 uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-amber-300 transition-colors">Home</Link></li>
            <li><Link to="/shop" className="hover:text-amber-300 transition-colors">Shop All</Link></li>
            <li><Link to="/shop?filter=categories" className="hover:text-amber-300 transition-colors">Categories</Link></li>
            <li><Link to="/deals" className="hover:text-amber-300 transition-colors">Special Deals</Link></li>
            <li><Link to="/about" className="hover:text-amber-300 transition-colors">About Us</Link></li>
            <li><a href="#contact" className="hover:text-amber-300 transition-colors">Contact Us</a></li>
          </ul>
        </div>

        {/* Customer Support */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-amber-200 uppercase tracking-wider">Customer Support</h4>
          <ul className="space-y-2">
            <li><a href="#shipping" className="hover:text-amber-300 transition-colors">Shipping Info</a></li>
            <li><a href="#returns" className="hover:text-amber-300 transition-colors">Returns & Refunds</a></li>
            <li><a href="#faq" className="hover:text-amber-300 transition-colors">Frequently Asked Questions</a></li>
            <li><a href="#support" className="hover:text-amber-300 transition-colors">24/7 VIP Support</a></li>
            <li><a href="#warranty" className="hover:text-amber-300 transition-colors">Warranty Registration</a></li>
          </ul>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-amber-200 uppercase tracking-wider">Payment Methods</h4>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-300">
            <span className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-center">VISA</span>
            <span className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-center">MASTERCARD</span>
            <span className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-center">JAZZCASH</span>
            <span className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-center">EASYPAISA</span>
          </div>
          <div className="space-y-2 pt-2 text-slate-400">
            <p className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
              <span>Ahmed Mobile Qasai Chowk Hussnain Street Tench Bhatta Rwp</span>
            </p>
            <a href="mailto:ahmedghulam622@gmail.com" className="flex items-center gap-2 hover:text-violet-300">
              <Mail className="h-4 w-4 text-violet-400 shrink-0" />
              <span>ahmedghulam622@gmail.com</span>
            </a>
            <a href="tel:+923355708704" className="flex items-center gap-2 hover:text-violet-300">
              <Phone className="h-4 w-4 text-violet-400 shrink-0" />
              <span>+92 3355708704</span>
            </a>
          </div>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-violet-500/15 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
        <p>© 2026 Ahmed Mobile. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#privacy" className="hover:text-violet-300 transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-violet-300 transition-colors">Terms of Service</a>
          <Link to="/admin-login" className="hover:text-violet-300 flex items-center gap-1.5 transition-colors">
            <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </div>
    </motion.footer>
  );
}