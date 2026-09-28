import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useShop } from '../context/ShopContext';
import { formatCurrency } from '../utils/formatCurrency';
import ProductImage from '../components/ProductImage';
import FlashDeals from '../components/FlashDeals';
import { 
  Search, 
  ArrowUpDown, 
  RefreshCw, 
  AlertCircle,
  Headphones,
  Zap,
  Cable,
  BatteryCharging,
  Shield,
  Watch,
  Smartphone,
  Layers,
  Radio,
  Grid,
  Plus,
  Flame,
  Clock,
  ShoppingBag,
  Trash2,
  Tag,
  Star,
  Percent
} from 'lucide-react';

// Helper to return consistent category icon
function getCategoryIcon(catName = '') {
  const lower = catName.toLowerCase();
  if (lower.includes('headphone') || lower.includes('audio')) return <Headphones className="w-4 h-4 text-amber-400" />;
  if (lower.includes('earbud')) return <Radio className="w-4 h-4 text-amber-400" />;
  if (lower.includes('charger')) return <Zap className="w-4 h-4 text-amber-400" />;
  if (lower.includes('cable')) return <Cable className="w-4 h-4 text-amber-400" />;
  if (lower.includes('power bank')) return <BatteryCharging className="w-4 h-4 text-amber-400" />;
  if (lower.includes('case') || lower.includes('cover')) return <Shield className="w-4 h-4 text-amber-400" />;
  if (lower.includes('watch')) return <Watch className="w-4 h-4 text-amber-400" />;
  if (lower.includes('accessories') || lower.includes('mobile')) return <Smartphone className="w-4 h-4 text-amber-400" />;
  return <Layers className="w-4 h-4 text-amber-400" />;
}

export default function Deals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    cart, 
    addToCart, 
    clearCart, 
    cartCount,
    cartSubtotal,
    cartTotal
  } = useShop();

  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('discount_desc');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories
  useEffect(() => {
    api.getCategories()
      .then(res => {
        if (res.success && res.data) setCategories(res.data);
      })
      .catch(err => console.warn('Categories API fetch warning:', err));
  }, []);

  // Fetch Products & Filter Deals
  const fetchDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;

      const res = await api.getProducts(params);
      if (res.success && res.data) {
        // Filter products to keep only items with active discounts / old prices
        let dealItems = res.data.filter(p => {
          const price = Number(p.price) || 0;
          const oldPrice = Number(p.old_price || p.oldPrice) || 0;
          const discount = Number(p.discount_percentage || p.discount) || 0;
          return discount > 0 || oldPrice > price;
        });

        // Apply sorting
        if (sortBy === 'discount_desc') {
          dealItems.sort((a, b) => {
            const dA = Number(a.discount_percentage || a.discount || 0);
            const dB = Number(b.discount_percentage || b.discount || 0);
            return dB - dA;
          });
        } else if (sortBy === 'price_asc') {
          dealItems.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        } else if (sortBy === 'price_desc') {
          dealItems.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        } else if (sortBy === 'rating') {
          dealItems.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
        }

        setProducts(dealItems);
      } else {
        setError('Unable to load special deal products.');
      }
    } catch (err) {
      console.error('Deals API fetch error:', err);
      setError('Unable to load deals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [searchTerm, selectedCategory, sortBy]);

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    const newParams = {};
    if (searchTerm) newParams.search = searchTerm;
    if (categoryName && categoryName !== 'All') newParams.category = categoryName;
    setSearchParams(newParams);
  };

  const handleClearCartClick = () => {
    if (cart.length === 0) return;
    if (window.confirm('Are you sure you want to clear all items from your cart?')) {
      clearCart();
    }
  };

  return (
    <div className="min-h-screen bg-[#08080A] text-slate-100 selection:bg-[#D4AF37] selection:text-black pb-24 lg:pb-12">
      <div className="max-w-[1650px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* 1. TOP HEADER BANNER: Dedicated Deals Title */}
        <div className="glass-card gold-border-glow bg-gradient-to-r from-amber-950/40 via-[#0C0C10] to-[#0F0F16] p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 blur-[120px] pointer-events-none rounded-full" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                <span>EXCLUSIVE LIMITED-TIME OFFERS</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight gold-gradient-text">
                TODAY'S SPECIAL DEALS
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Save big on premium tech gear, GaN chargers, audio headsets, smart watches, and luxury mobile accessories. All deal prices marked down up to 30% off!
              </p>
            </div>
          </div>
        </div>

        {/* PROMINENT FLASH DEALS SECTION */}
        <FlashDeals />

        {/* 2. CATEGORY FILTER BAR */}
        <div className="glass-card gold-border-glow bg-[#0C0C10] p-3 rounded-2xl border border-amber-500/20 shadow-lg sticky top-20 z-20">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-amber-500/20 flex-nowrap">
            
            <button
              onClick={() => handleCategorySelect('All')}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 border ${
                selectedCategory === 'All'
                  ? 'gold-gradient-bg text-black border-amber-400 shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-[1.02]'
                  : 'bg-slate-900/90 text-slate-300 border-amber-500/20 hover:border-amber-400/50 hover:text-amber-300'
              }`}
            >
              <Grid className={`w-4 h-4 ${selectedCategory === 'All' ? 'text-black' : 'text-amber-400'}`} />
              <span>All Deals</span>
            </button>

            {categories.map(cat => {
              const isActive = selectedCategory.toLowerCase() === cat.name.toLowerCase() || selectedCategory.toLowerCase() === cat.slug.toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 border ${
                    isActive
                      ? 'gold-gradient-bg text-black border-amber-400 shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-[1.02]'
                      : 'bg-slate-900/90 text-slate-300 border-amber-500/20 hover:border-amber-400/50 hover:text-amber-300'
                  }`}
                >
                  {getCategoryIcon(cat.name)}
                  <span>{cat.name}</span>
                </button>
              );
            })}

          </div>
        </div>

        {/* 3. MAIN CONTENT: 2 Columns on Desktop (Products Grid | POS Cart Panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Deals Catalog Grid */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* Search & Sort Controls */}
            <div className="glass-card gold-border-glow bg-[#0C0C10] p-4 rounded-2xl border border-amber-500/20 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              
              <div className="relative w-full sm:flex-1">
                <Search className="w-4 h-4 text-amber-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  placeholder="Search discounted products & brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-amber-500/30 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
                <div className="text-xs font-bold text-amber-400 font-mono flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5" />
                  <span>{products.length} {products.length === 1 ? 'deal available' : 'deals available'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-900 border border-amber-500/30 rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="discount_desc">Sort: Highest Discount %</option>
                    <option value="price_asc">Sort: Price (Low → High)</option>
                    <option value="price_desc">Sort: Price (High → Low)</option>
                    <option value="rating">Sort: Top Rated Deals</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Deals Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="glass-card gold-border-glow bg-[#0C0C10] p-4 rounded-2xl border border-amber-500/20 h-64 animate-pulse space-y-3">
                    <div className="w-full h-32 bg-slate-800/80 rounded-xl" />
                    <div className="h-3 bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="glass-card gold-border-glow bg-[#0C0C10] p-12 text-center rounded-2xl border border-amber-500/20 shadow-md space-y-4">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-200">{error}</h3>
                <button
                  onClick={fetchDeals}
                  className="px-6 py-2.5 rounded-xl gold-gradient-bg text-black font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="glass-card gold-border-glow bg-[#0C0C10] p-16 text-center rounded-2xl border border-amber-500/20 shadow-md space-y-4">
                <Tag className="w-12 h-12 text-amber-400/40 mx-auto" />
                <h3 className="text-xl font-black uppercase tracking-wider gold-gradient-text">No Deals Available</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Check back soon for exclusive offers.
                </p>
                <Link
                  to="/shop"
                  className="px-6 py-2.5 rounded-xl gold-gradient-bg text-black font-extrabold text-xs uppercase tracking-wider inline-block shadow-md hover:shadow-lg transition-all"
                >
                  Explore Full Catalog
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(product => {
                  const price = Number(product.price) || 0;
                  const oldPrice = Number(product.old_price || product.oldPrice) || 0;
                  const discount = Number(product.discount_percentage || product.discount) || (oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0);
                  const categoryName = product.category_name || product.category || 'Tech';
                  const imageUrl = product.primary_image || product.image_url || product.image;
                  const inCartQty = cart.find(item => item.product.id === product.id)?.quantity || 0;

                  return (
                    <div 
                      key={product.id} 
                      className="glass-card gold-border-glow bg-[#0C0C10] rounded-2xl p-4 border border-amber-500/20 shadow-md hover:shadow-[0_0_20px_rgba(212,175,55,0.25)] transition-all duration-300 flex flex-col justify-between group relative"
                    >
                      
                      {/* Top Discount Badge Overlay */}
                      {discount > 0 && (
                        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg gold-gradient-bg text-black font-black text-[10px] uppercase tracking-wider shadow-md">
                          -{discount}% OFF
                        </div>
                      )}

                      <div>
                        {/* Product Image Link */}
                        <Link to={`/product/${product.id}`} className="block mb-3 relative group-hover:scale-105 transition-transform duration-300">
                          <ProductImage imageUrl={imageUrl} productId={product.id} category={categoryName} className="h-36" iconSize={40} />
                          {inCartQty > 0 && (
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/40 shadow-sm backdrop-blur-sm">
                              {inCartQty} in cart
                            </span>
                          )}
                        </Link>

                        {/* Category & Title */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold text-amber-400/90 uppercase tracking-widest block">
                            {categoryName}
                          </span>
                          <Link to={`/product/${product.id}`}>
                            <h3 className="text-xs font-bold text-slate-100 line-clamp-1 group-hover:text-amber-300 transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                            <span className="font-bold text-slate-200">{product.rating || 4.9}</span>
                          </div>
                        </div>
                      </div>

                      {/* Clear Pricing & POS Add Button */}
                      <div className="pt-3 border-t border-amber-500/10 flex items-center justify-between gap-2 mt-3">
                        <div>
                          <div className="text-sm font-black font-mono text-amber-200">
                            {formatCurrency(price)}
                          </div>
                          {oldPrice > 0 && (
                            <div className="text-[10px] text-slate-500 line-through font-mono">
                              {formatCurrency(oldPrice)}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => addToCart(product, 1)}
                          className="w-9 h-9 rounded-xl gold-gradient-bg text-black hover:shadow-[0_0_15px_rgba(212,175,55,0.5)] flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0 font-black"
                          title="Add item to cart"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* RIGHT: Permanent POS Shopping Cart Panel (~25% Desktop) */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-20">
            <div className="glass-card gold-border-glow bg-[#0C0C10] rounded-2xl border border-amber-500/20 shadow-xl p-5 flex flex-col justify-between min-h-[580px] max-h-[82vh]">
              
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <div className="flex items-center gap-2 text-slate-100 font-extrabold text-sm uppercase tracking-wider">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>Shopping Cart</span>
                  {cartCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold border border-amber-500/30">
                      {cartCount}
                    </span>
                  )}
                </div>

                {cart.length > 0 && (
                  <button
                    onClick={handleClearCartClick}
                    className="text-[11px] font-bold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 max-h-[380px] divide-y divide-slate-800/60">
                {cart.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-amber-400/50">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Your cart is empty.</p>
                    <p className="text-[11px] text-slate-500">Click <span className="font-bold text-amber-300">[ + ]</span> on any deal item to add it.</p>
                  </div>
                ) : (
                  cart.map(item => {
                    const prod = item.product;
                    const price = Number(prod.price) || 0;
                    const itemSubtotal = price * item.quantity;

                    return (
                      <div key={prod.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-amber-500/20 shrink-0 overflow-hidden flex items-center justify-center">
                            <ProductImage 
                              imageUrl={prod.primary_image || prod.image_url || prod.image} 
                              productId={prod.id} 
                              category={prod.category_name || prod.category} 
                              className="h-9" 
                              iconSize={16} 
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-slate-200 truncate">{prod.name}</h4>
                            <p className="text-[10px] text-slate-400 font-mono">{formatCurrency(price)} × {item.quantity}</p>
                          </div>
                        </div>
                        <div className="font-bold font-mono text-amber-300 text-right">
                          {formatCurrency(itemSubtotal)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-amber-500/20 pt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono font-extrabold">
                    <span className="text-slate-400 uppercase font-sans">Subtotal</span>
                    <span className="text-amber-200">{formatCurrency(cartSubtotal)}</span>
                  </div>
                  <Link
                    to="/cart"
                    className="w-full py-3 rounded-xl gold-gradient-bg text-black font-extrabold text-xs uppercase tracking-wider text-center block shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all"
                  >
                    View Cart & Checkout
                  </Link>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
