import React from 'react';
import { Star, CheckCircle2, MessageSquareQuote } from 'lucide-react';
import { REVIEWS } from '../data/mockData';
import AnimatedHeading from './AnimatedHeading';

export default function Reviews() {
  return (
    <section className="py-12 sm:py-20 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-violet-400">Authentic Testimonials</span>
          <AnimatedHeading className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white">WHAT OUR CUSTOMERS SAY</AnimatedHeading>
          <p className="text-xs text-slate-400">
            Real feedback from verified buyers who experienced the Ahmed Mobile standard.
          </p>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-950/35 via-[#141424] to-[#0e0e18] p-5 sm:p-6 border border-violet-500/30 shadow-lg hover:border-violet-400/60 hover:shadow-[0_0_25px_rgba(139,92,246,0.25)] transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4 relative z-10">
                {/* Rating & Quote Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <MessageSquareQuote className="w-6 h-6 text-violet-400/50 group-hover:text-violet-300 transition-colors" />
                </div>

                {/* Comment */}
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{review.comment}"
                </p>
              </div>

              {/* User Meta */}
              <div className="pt-4 mt-4 border-t border-violet-500/20 space-y-1 relative z-10">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{review.name}</h4>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <p className="text-[10px] text-violet-400 font-mono truncate">{review.productName}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
