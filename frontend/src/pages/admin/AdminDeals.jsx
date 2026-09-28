import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { 
  Tag, 
  Search, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Flame, 
  Percent, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Plus, 
  Layers,
  ArrowUpDown,
  ShoppingBag
} from 'lucide-react';
import ProductImage from '../../components/ProductImage';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDeals() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dealFilter, setDealFilter] = useState('All'); // 'All', 'DealsOnly', 'NonDeals'

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Modal State for editing/creating deals
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dealPriceInput, setDealPriceInput] = useState('');
  const [originalPriceInput, setOriginalPriceInput] = useState('');
  const [isDealActive, setIsDealActive] = useState(true);
  const [modalError, setModalError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchCatalogData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ]);
      if (prodRes.success && prodRes.data) setProducts(prodRes.data);
      if (catRes.success && catRes.data) setCategories(catRes.data);
    } catch (err) {
      console.warn('AdminDeals fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();
  }, []);

  const openDealModal = (product) => {
    setSelectedProduct(product);
    setModalError('');

    const currentPrice = Number(product.price) || 0;
    const currentOldPrice = Number(product.old_price || product.oldPrice) || 0;
    const isCurrentlyDeal = product.is_deal === 1 || (currentOldPrice > currentPrice);

    if (isCurrentlyDeal && currentOldPrice > 0) {
      setOriginalPriceInput(String(currentOldPrice));
      setDealPriceInput(String(currentPrice));
    } else {
      setOriginalPriceInput(String(currentPrice));
      setDealPriceInput(String(Math.round(currentPrice * 0.8 * 100) / 100)); // Default 20% discount suggestion
    }
    setIsDealActive(isCurrentlyDeal);
  };

  const handleSaveDeal = async (e) => {
    e.preventDefault();
    setModalError('');

    const parsedOriginalPrice = Number(originalPriceInput);
    const parsedDealPrice = Number(dealPriceInput);

    // Strict Validations
    if (isNaN(parsedDealPrice) || parsedDealPrice <= 0) {
      setModalError('Deal price must be a valid positive number greater than 0.');
      return;
    }

    if (isDealActive) {
      if (isNaN(parsedOriginalPrice) || parsedOriginalPrice <= 0) {
        setModalError('Original price is required to set an active deal.');
        return;
      }
      if (parsedDealPrice >= parsedOriginalPrice) {
        setModalError(`Deal price (${formatCurrency(parsedDealPrice)}) must be strictly lower than the original price (${formatCurrency(parsedOriginalPrice)}).`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const res = await api.updateProductDeal(selectedProduct.id, {
        is_deal: isDealActive ? 1 : 0,
        price: parsedDealPrice,
        old_price: isDealActive ? parsedOriginalPrice : null
      });

      if (res.success) {
        setMessage({ type: 'success', text: res.message || 'Deal updated successfully!' });
        setSelectedProduct(null);
        fetchCatalogData();
      } else {
        setModalError(res.message || 'Failed to update deal.');
      }
    } catch (err) {
      console.error('Update deal error:', err);
      setModalError(err.response?.data?.message || 'Error updating deal.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveDeal = async (product) => {
    if (!window.confirm(`Are you sure you want to remove the deal from "${product.name}"?`)) return;

    try {
      const originalPrice = Number(product.old_price || product.oldPrice || product.price);
      const res = await api.updateProductDeal(product.id, {
        is_deal: 0,
        price: originalPrice,
        old_price: null
      });

      if (res.success) {
        setMessage({ type: 'success', text: `Removed deal from "${product.name}"` });
        fetchCatalogData();
      } else {
        alert(res.message || 'Failed to remove deal.');
      }
    } catch (err) {
      console.error('Remove deal error:', err);
      alert('Error removing deal.');
    }
  };

  // Filter products
  const filteredProducts = products.filter(prod => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = prod.name.toLowerCase().includes(term) ||
                          (prod.sku && prod.sku.toLowerCase().includes(term));
    const matchesCategory = selectedCategory === 'All' || 
                            (prod.category_name || prod.category) === selectedCategory;

    const isDeal = prod.is_deal === 1 || (Number(prod.old_price || prod.oldPrice) > Number(prod.price));
    let matchesDeal = true;
    if (dealFilter === 'DealsOnly') matchesDeal = isDeal;
    if (dealFilter === 'NonDeals') matchesDeal = !isDeal;

    return matchesSearch && matchesCategory && matchesDeal;
  });

  const activeDealsCount = products.filter(p => p.is_deal === 1 || (Number(p.old_price || p.oldPrice) > Number(p.price))).length;

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>PROMOTIONAL DEALS MANAGEMENT</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight gold-gradient-text">
            DEALS CONTROL CENTER
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage live active deal products, set custom promotional prices, and control real-time customer discounts.
          </p>
        </div>

        <button
          onClick={fetchCatalogData}
          className="px-5 py-2.5 rounded-xl border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition-all text-xs font-bold flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {message && (
        <div className="glass-card gold-border-glow p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-emerald-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card gold-border-glow p-6 rounded-3xl bg-[#0C0C10] border border-amber-500/20 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Active Deal Products</span>
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black font-mono text-amber-300 mt-3">
            {activeDealsCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Currently live on public Deals page</p>
        </div>

        <div className="glass-card gold-border-glow p-6 rounded-3xl bg-[#0C0C10] border border-amber-500/20 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Catalog Products</span>
            <ShoppingBag className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black font-mono text-slate-100 mt-3">
            {products.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Available for deal assignment</p>
        </div>

        <div className="glass-card gold-border-glow p-6 rounded-3xl bg-[#0C0C10] border border-amber-500/20 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Avg. Discount Rate</span>
            <Percent className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black font-mono text-amber-300 mt-3">
            23% OFF
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Average marked down savings</p>
        </div>
      </div>

      {/* Controls Bar: Search & Filter Pills */}
      <div className="glass-card gold-border-glow p-5 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-amber-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/90 border border-amber-500/30 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-900 border border-amber-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={dealFilter}
              onChange={(e) => setDealFilter(e.target.value)}
              className="w-full bg-slate-900 border border-amber-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-bold"
            >
              <option value="All">Show All Products</option>
              <option value="DealsOnly">Active Deals Only ({activeDealsCount})</option>
              <option value="NonDeals">Standard Products Only</option>
            </select>
          </div>

        </div>
      </div>

      {/* Catalog Table */}
      <div className="glass-card gold-border-glow rounded-3xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Product Image</th>
                <th className="pb-3 px-3">Product Name</th>
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3">Original Price</th>
                <th className="pb-3 px-3">Deal Price</th>
                <th className="pb-3 px-3">Discount %</th>
                <th className="pb-3 px-3">Deal Status</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">Loading catalog deals from database...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">No matching products found.</td>
                </tr>
              ) : (
                filteredProducts.map(prod => {
                  const price = Number(prod.price) || 0;
                  const oldPrice = Number(prod.old_price || prod.oldPrice) || 0;
                  const isDeal = prod.is_deal === 1 || (oldPrice > price);
                  const discount = Number(prod.discount_percentage || prod.discount) || (isDeal && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0);
                  const imageUrl = prod.primary_image || prod.image_url || prod.image;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-3">
                        <div className="w-10 h-10 shrink-0">
                          <ProductImage imageUrl={imageUrl} productId={prod.id} category={prod.category_name || prod.category} className="h-10" iconSize={18} />
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-100">{prod.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{prod.sku || 'NEX-PROD'}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{prod.category_name || prod.category}</td>
                      
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {isDeal && oldPrice > 0 ? (
                          <span className="line-through">{formatCurrency(oldPrice)}</span>
                        ) : (
                          formatCurrency(price)
                        )}
                      </td>
                      
                      <td className="py-3 px-3 font-mono font-bold text-amber-300">
                        {formatCurrency(price)}
                      </td>

                      <td className="py-3 px-3">
                        {isDeal && discount > 0 ? (
                          <span className="px-2 py-0.5 rounded gold-gradient-bg text-black text-[10px] font-black">
                            -{discount}% OFF
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px]">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {isDeal ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold inline-flex items-center gap-1">
                            <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span>Active Deal</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-bold">
                            Standard
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openDealModal(prod)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all font-bold text-[11px] flex items-center gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{isDeal ? 'Edit Deal' : 'Make Deal'}</span>
                          </button>

                          {isDeal && (
                            <button
                              onClick={() => handleRemoveDeal(prod)}
                              className="px-2.5 py-1.5 rounded-lg bg-red-950/40 text-red-400 border border-red-500/30 hover:bg-red-900/40 transition-colors font-bold text-[11px]"
                              title="Remove Deal Status"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Set/Edit Deal Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#0E0E14] border border-amber-500/30 rounded-3xl p-6 md:p-8 z-50 text-slate-100 shadow-[0_0_50px_rgba(212,175,55,0.25)] space-y-6"
            >
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
                <div className="flex items-center gap-3">
                  <Tag className="w-6 h-6 text-amber-400" />
                  <h3 className="text-lg font-black uppercase tracking-wider gold-gradient-text">
                    MANAGE PRODUCT DEAL
                  </h3>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product Info Card Header */}
              <div className="glass-card gold-border-glow p-3.5 rounded-2xl bg-slate-900/80 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl shrink-0 overflow-hidden bg-black border border-amber-500/20 flex items-center justify-center">
                  <ProductImage imageUrl={selectedProduct.primary_image || selectedProduct.image_url || selectedProduct.image} productId={selectedProduct.id} category={selectedProduct.category_name || selectedProduct.category} className="h-11" iconSize={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100">{selectedProduct.name}</h4>
                  <p className="text-[11px] text-amber-300 font-mono">SKU: {selectedProduct.sku || 'NEX-PROD'}</p>
                </div>
              </div>

              {/* Error Alert inside Modal */}
              {modalError && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSaveDeal} className="space-y-4 text-xs">
                
                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-amber-500/20">
                  <div>
                    <span className="font-bold text-slate-200 block">Deal Status</span>
                    <span className="text-[11px] text-slate-400">Mark product as an active deal on the store</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDealActive(!isDealActive)}
                    className={`px-4 py-2 rounded-xl font-bold transition-all ${
                      isDealActive 
                        ? 'gold-gradient-bg text-black shadow-md' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isDealActive ? 'ACTIVE DEAL' : 'STANDARD'}
                  </button>
                </div>

                {isDealActive && (
                  <>
                    {/* Original Price */}
                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5">
                        Original Standard Price ({formatCurrency(0).slice(0, 1)})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="e.g. 199.99"
                        value={originalPriceInput}
                        onChange={(e) => setOriginalPriceInput(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-amber-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Deal Price */}
                    <div>
                      <label className="block text-amber-300 font-bold mb-1.5">
                        Special Deal Price ({formatCurrency(0).slice(0, 1)})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="e.g. 149.99"
                        value={dealPriceInput}
                        onChange={(e) => setDealPriceInput(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-amber-400 rounded-xl px-4 py-2.5 text-xs text-amber-200 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>

                    {/* Calculated Discount Percentage Preview */}
                    {Number(originalPriceInput) > Number(dealPriceInput) && Number(dealPriceInput) > 0 && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between font-mono font-bold">
                        <span>Calculated Discount:</span>
                        <span className="text-sm">
                          -{Math.round(((Number(originalPriceInput) - Number(dealPriceInput)) / Number(originalPriceInput)) * 100)}% OFF
                        </span>
                      </div>
                    )}
                  </>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-500/20">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl gold-gradient-bg text-black font-extrabold uppercase tracking-wider shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-all disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Deal Settings'}
                  </button>
                </div>

              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
