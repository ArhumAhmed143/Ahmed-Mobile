import React from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import TrustFeatures from '../components/TrustFeatures';
import Categories from '../components/Categories';
import FeaturedProducts from '../components/FeaturedProducts';
import FlashDeals from '../components/FlashDeals';
import WhyChooseUs from '../components/WhyChooseUs';
import BestSellers from '../components/BestSellers';
import PromoBanner from '../components/PromoBanner';
import Reviews from '../components/Reviews';
import Newsletter from '../components/Newsletter';
import FounderSection from '../components/FounderSection';
import RepairServices from '../components/RepairServices';

export default function Home() {
  const reveal = (children) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );

  return (
    <div className="space-y-10">
      {reveal(<Hero />)}
      {reveal(<TrustFeatures />)}
      {reveal(<Categories />)}
      {reveal(<BestSellers />)}
      {reveal(<PromoBanner />)}
      {reveal(<FeaturedProducts />)}
      {reveal(<FlashDeals />)}
      {reveal(<WhyChooseUs />)}
      {reveal(<FounderSection />)}
      {reveal(<RepairServices />)}
      {reveal(<Reviews />)}
      {reveal(<Newsletter />)}
    </div>
  );
}
