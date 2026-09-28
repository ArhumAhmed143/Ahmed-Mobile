import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { api } from '../services/api';
import { Trophy, AlertCircle, RefreshCw } from 'lucide-react';
import AnimatedHeading from './AnimatedHeading';

export default function BestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBestSellers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getBestSellers();
      if (res.success && res.data) {
        setProducts(res.data);
      } else {
        setError('Unable to load best sellers.');
      }
    } catch (err) {
      console.error('Best sellers API error:', err);
      setError('Unable to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBestSellers();
  }, []);

  return (
    <section className="py-12 sm:py-20 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 border-b border-violet-500/20 pb-4 sm:pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-violet-400">
              <Trophy className="w-4 h-4 text-violet-400" />
              <span>MOST POPULAR CHOICE</span>
            </div>
            <AnimatedHeading className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-1">Best Sellers</AnimatedHeading>
          </div>
          <p className="text-xs text-slate-400 max-w-sm">
            Our most loved products
          </p>
        </div>

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
              onClick={fetchBestSellers}
              className="px-4 py-2 rounded-xl bg-violet-500/10 text-violet-300 border border-violet-500/30 text-xs font-bold inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} variant="homepage" />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
