import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useShop } from '../context/ShopContext';
import { formatCurrency } from '../utils/formatCurrency';
import ProductImage from '../components/ProductImage';
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
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Star
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

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    cart, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    cartCount, 
    cartSubtotal, 
    cartTotal, 
    deliveryFee,
    setIsCartOpen 
  } = useShop();

  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const filterParam = searchParams.get('filter') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceMax, setPriceMax] = useState(50000);
  const [sortBy, setSortBy] = useState('newest');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state with URL search params
  useEffect(() => {
    if (searchParams.get('search') !== null) setSearchTerm(searchParams.get('search'));
    if (searchParams.get('category') !== null) setSelectedCategory(searchParams.get('category'));
    if (filterParam === 'deals') setSortBy('price_asc');
  }, [searchParams, filterParam]);

  // Fetch Categories from Database
  useEffect(() => {
    api.getCategories()
      .then(res => {
        if (res.success && res.data) setCategories(res.data);
      })
      .catch(err => console.warn('Categories API fetch warning:', err));
  }, []);

  // Fetch Products based on filter state
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (priceMax < 50000) params.maxPrice = priceMax;
      if (sortBy) params.sort = sortBy;

      const res = await api.getProducts(params);
      if (res.success && res.data) {
        setProducts(res.data);
      } else {
        setError('Unable to load catalog products.');
      }
    } catch (err) {
      console.error('Shop API fetch error:', err);
      setError('Unable to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, priceMax, sortBy]);

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    const newParams = {};
    if (searchTerm) newParams.search = searchTerm;
    if (categoryName && categoryName !== 'All') newParams.category = categoryName;
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setPriceMax(50000);
    setSortBy('newest');
    setSearchParams({});
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
        
        {/* 1. TOP: Category Navigation Bar (Premium Dark + Gold POS Style) */}
        <div className="glass-card gold-border-glow bg-[#0C0C10] p-3 rounded-2xl border border-amber-500/20 shadow-lg sticky top-20 z-20">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-amber-500/20 flex-nowrap">
            
            {/* All Products Button */}
            <button
              onClick={() => handleCategorySelect('All')}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 border ${
                selectedCategory === 'All'
                  ? 'gold-gradient-bg text-black border-amber-400 shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-[1.02]'
                  : 'bg-slate-900/90 text-slate-300 border-amber-500/20 hover:border-amber-400/50 hover:text-amber-300'
              }`}
            >
              <Grid className={`w-4 h-4 ${selectedCategory === 'All' ? 'text-black' : 'text-amber-400'}`} />
              <span>All Products</span>
            </button>

            {/* Dynamic Category Buttons */}
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

        {/* 2. MAIN POS SCREEN: 2 Columns on Desktop (75% Products | 25% Cart) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT AREA: Catalog Products & Search (~75% on Desktop) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* Search Bar & Sorting Bar */}
            <div className="glass-card gold-border-glow bg-[#0C0C10] p-4 rounded-2xl border border-amber-500/20 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Prominent Search Input */}
              <div className="relative w-full sm:flex-1">
                <Search className="w-4 h-4 text-amber-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  placeholder="Search products, brands & categories..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    const newParams = {};
                    if (e.target.value) newParams.search = e.target.value;
                    if (selectedCategory && selectedCategory !== 'All') newParams.category = selectedCategory;
                    setSearchParams(newParams);
                  }}
                  className="w-full bg-slate-900 border border-amber-500/30 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all"
                />
              </div>

              {/* Sorting & Item Count */}
              <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
                <div className="text-xs font-bold text-slate-400 font-mono">
                  {products.length} {products.length === 1 ? 'item' : 'items'}
                </div>

                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-900 border border-amber-500/30 rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="newest">Sort: Popular & Newest</option>
                    <option value="price_asc">Sort: Price (Low → High)</option>
                    <option value="price_desc">Sort: Price (High → Low)</option>
                    <option value="rating">Sort: Top Rating</option>
                  </select>
                </div>
              </div>

            </div>

            {/* POS Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
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
                  onClick={fetchProducts}
                  className="px-6 py-2.5 rounded-xl gold-gradient-bg text-black font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="glass-card gold-border-glow bg-[#0C0C10] p-16 text-center rounded-2xl border border-amber-500/20 shadow-md space-y-4">
                <Search className="w-12 h-12 text-amber-400/40 mx-auto" />
                <h3 className="text-lg font-bold text-slate-200">No products found in this category</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  We couldn't find any products matching your search term or category filter.
                </p>
                <button
                  onClick={() => handleCategorySelect('All')}
                  className="px-6 py-2.5 rounded-xl gold-gradient-bg text-black font-extrabold text-xs uppercase tracking-wider inline-block hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(product => {
                  const price = Number(product.price) || 0;
                  const oldPrice = Number(product.old_price || product.oldPrice) || 0;
                  const categoryName = product.category_name || product.category || 'Tech';
                  const imageUrl = product.primary_image || product.image_url || product.image;
                  const inCartQty = cart.find(item => item.product.id === product.id)?.quantity || 0;

                  return (
                    <div 
                      key={product.id} 
                      className="glass-card gold-border-glow bg-[#0C0C10] rounded-2xl p-4 border border-amber-500/20 shadow-md hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-300 flex flex-col justify-between group relative"
                    >
                      {/* Product Image Clickable Link */}
                      <div>
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
                            <span className="font-bold text-slate-200">{product.rating || 5.0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & POS Instant Add Button */}
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

                        {/* PLUS Button for instant cart addition */}
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

          {/* RIGHT AREA: Permanent POS Shopping Cart Panel (~25% on Desktop) */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-20">
            <div className="glass-card gold-border-glow bg-[#0C0C10] rounded-2xl border border-amber-500/20 shadow-xl p-5 flex flex-col justify-between min-h-[580px] max-h-[82vh]">
              
              {/* Cart Header */}
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
                    title="Clear Cart"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 max-h-[380px] divide-y divide-slate-800/60">
                {cart.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-amber-400/50">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Your cart is empty.</p>
                    <p className="text-[11px] text-slate-500">Click <span className="font-bold text-amber-300">[ + ]</span> on any product to add it.</p>
                  </div>
                ) : (
                  cart.map(item => {
                    const prod = item.product;
                    const price = Number(prod.price) || 0;
                    const itemSubtotal = price * item.quantity;

                    return (
                      <div key={prod.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                        
                        {/* Item Details */}
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
                            <h4 className="font-bold text-slate-100 truncate leading-tight">{prod.name}</h4>
                            <span className="text-[11px] font-mono text-amber-300">{formatCurrency(price)}</span>
                          </div>
                        </div>

                        {/* Stepper Quantity & Subtotal */}
                        <div className="flex items-center gap-2 shrink-0">
                          
                          {/* Stepper */}
                          <div className="flex items-center gap-1 bg-slate-900 border border-amber-500/30 rounded-lg p-0.5">
                            <button
                              onClick={() => updateQuantity(prod.id, item.quantity - 1)}
                              className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center font-mono font-bold text-xs text-slate-100">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(prod.id, item.quantity + 1)}
                              className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Item Subtotal */}
                          <div className="w-16 text-right font-mono font-bold text-slate-100 text-xs">
                            {formatCurrency(itemSubtotal)}
                          </div>

                          {/* Remove Trash Button */}
                          <button
                            onClick={() => removeFromCart(prod.id)}
                            className="text-slate-400 hover:text-red-400 transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>

                      </div>
                    );
                  })
                )}
              </div>

              {/* Cart Footer Summary */}
              <div className="border-t border-amber-500/20 pt-4 space-y-3 bg-slate-950/60 p-4 -mx-5 -mb-5 rounded-b-2xl">
                
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold text-slate-200">{formatCurrency(cartSubtotal)}</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Delivery Fee</span>
                    <span className="font-mono font-bold text-slate-200">{formatCurrency(deliveryFee)}</span>
                  </div>

                  <div className="pt-2 border-t border-amber-500/20 flex justify-between text-slate-100 text-sm font-extrabold">
                    <span>TOTAL</span>
                    <span className="font-mono text-amber-300 text-base font-black">{formatCurrency(cartTotal)}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={() => {
                    if (cart.length === 0) return;
                    navigate('/checkout');
                  }}
                  disabled={cart.length === 0}
                  className="w-full py-3.5 rounded-xl gold-gradient-bg text-black font-extrabold text-xs uppercase tracking-wider hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </div>

            </div>
          </div>

        </div>

      </div>

      {/* MOBILE / TABLET FLOATING BOTTOM CART BAR (< 1024px) */}
      {cartCount > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0C0C10]/95 backdrop-blur-md text-slate-100 p-3 px-4 sm:px-6 shadow-2xl border-t border-amber-500/30 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-3 text-left"
          >
            <div className="relative">
              <ShoppingBag className="w-6 h-6 text-amber-400" />
              <span className="absolute -top-2 -right-2 bg-amber-400 text-black text-[10px] font-bold font-mono w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Amount</span>
              <span className="text-sm font-mono font-bold text-amber-300">{formatCurrency(cartTotal)}</span>
            </div>
          </button>

          <button
            onClick={() => navigate('/checkout')}
            className="px-5 py-2.5 rounded-xl gold-gradient-bg text-black font-extrabold text-xs uppercase tracking-wider shadow-md flex items-center gap-2"
          >
            <span>Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
