import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { api } from '../services/api';
import { Sparkles, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedHeading from './AnimatedHeading';

export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabs = [
    { id: 'all', label: 'All Tech' },
    { id: 'audio', label: 'Audio' },
    { id: 'chargers', label: 'Chargers & Power' },
    { id: 'smart-watches', label: 'Smart Wearables' },
  ];

  const fetchFeatured = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getFeaturedProducts();
      if (res.success && res.data) {
        setProducts(res.data);
      } else {
        setError('Unable to load featured products.');
      }
    } catch (err) {
      console.error('Featured products API error:', err);
      setError('Unable to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatured();
  }, []);

  const filteredProducts = activeTab === 'all'
    ? products
    : products.filter(p => {
        const cat = p.category_name || p.category || '';
        return cat.toLowerCase().includes(activeTab) || activeTab.includes(cat.toLowerCase());
      });

  return (
    <section className="py-12 sm:py-20 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 border-b border-violet-500/20 pb-4 sm:pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-violet-400">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Handpicked Perfection</span>
            </div>
            <AnimatedHeading className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white mt-1">FEATURED GEAR</AnimatedHeading>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none w-full md:w-auto -mx-1 px-1 sm:mx-0 sm:px-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-violet-500 via-violet-600 to-violet-800 text-white shadow-[0_0_15px_rgba(139,92,246,0.35)]'
                    : 'border border-violet-500/20 bg-[#12121e] text-slate-300 hover:text-white hover:border-violet-400/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-2xl border border-violet-500/15 bg-[#12121e] p-5 h-80 animate-pulse space-y-4">
                <div className="w-full h-40 bg-[#1e1e2e] rounded-xl" />
                <div className="h-4 bg-[#1e1e2e] rounded w-3/4" />
                <div className="h-4 bg-[#1e1e2e] rounded w-1/2" />
                <div className="h-10 bg-[#1e1e2e] rounded-xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center rounded-2xl border border-violet-500/20 bg-[#12121e] space-y-3">
            <AlertCircle className="w-8 h-8 text-violet-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">{error}</p>
            <button
              onClick={fetchFeatured}
              className="px-4 py-2 rounded-xl bg-violet-500/10 text-violet-300 border border-violet-500/30 text-xs font-bold inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center pt-6">
          <Link
            to="/shop"
            className="btn-purple-cta"
          >
            <span>VIEW ALL PRODUCTS</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
