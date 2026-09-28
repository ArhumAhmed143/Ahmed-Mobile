import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { api } from '../services/api';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNewArrivals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getNewArrivals();
      if (res.success && res.data) {
        setProducts(res.data);
      } else {
        setError('Unable to load new arrivals.');
      }
    } catch (err) {
      console.error('New arrivals API error:', err);
      setError('Unable to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewArrivals();
  }, []);

  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-amber-500/20 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-amber-400">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>FRESH IN STOCK</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight gold-gradient-text mt-1">
              NEW ARRIVALS
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-sm">
            Be the first to get your hands on our newest drop of luxury high-tech accessories.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="glass-card gold-border-glow p-6 rounded-2xl h-80 animate-pulse space-y-4">
                <div className="w-full h-40 bg-slate-800/80 rounded-xl" />
                <div className="h-4 bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="glass-card gold-border-glow p-8 text-center rounded-2xl space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">{error}</p>
            <button
              onClick={fetchNewArrivals}
              className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
