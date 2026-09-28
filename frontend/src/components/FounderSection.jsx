import React from 'react';
import { ArrowRight, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AnimatedHeading from './AnimatedHeading';

export const founderImage = '/WhatsApp%20Image%202026-09-27%20at%201.59.14%20PM.jpeg';

export default function FounderSection() {
  return (
    <section className="relative py-12 sm:py-20 md:py-24" id="about">
      <div className="mx-auto grid max-w-7xl items-center gap-8 sm:gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-[#181828] to-[#10101c] p-3 shadow-[0_0_35px_rgba(139,92,246,0.22)]"
        >
          <img src={founderImage} alt="Ahmed Ghulam, founder of Ahmed Mobile" className="h-[260px] sm:h-[380px] lg:h-[460px] w-full rounded-2xl object-cover object-center" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-xl text-center lg:text-left mx-auto lg:mx-0"
        >
          <p className="mb-2 sm:mb-4 text-xs font-bold uppercase tracking-[0.05em] text-[#a78bfa]">The person behind the promise</p>
          <AnimatedHeading className="mb-4 sm:mb-6 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#f5f5f7]">Meet the Founder</AnimatedHeading>
          <p className="mb-8 text-base leading-[1.6] text-[#a1a1a6]">
            Hi, I&apos;m Ahmed Ghulam, Founder of Ahmed Mobile. With hands-on experience in mobile repairs and premium tech accessories, I personally ensure every product meets the highest standards.
          </p>
          <div className="mb-8 inline-flex items-center gap-3 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-xs sm:text-sm font-semibold text-violet-200">
            <Wrench className="h-4 w-4 text-violet-400" />
            Expert Repairs &amp; Technical Support Available
          </div>
          <div>
            <Link to="/about" className="btn-purple-cta">
              <span>Learn More About Us</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}