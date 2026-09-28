import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Search, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Edit3, X, Save } from 'lucide-react';
import ProductImage from '../../components/ProductImage';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Quick Stock Edit Modal State
  const [targetProduct, setTargetProduct] = useState(null); // { id, name, sku, stock_quantity }
  const [newStock, setNewStock] = useState('');
  const [updating, setUpdating] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.getProducts();
      if (res.success && res.data) setProducts(res.data);
    } catch (err) {
      console.warn('Inventory fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const openStockModal = (prod) => {
    setTargetProduct(prod);
    setNewStock(String(prod.stock_quantity ?? prod.stock ?? 0));
    setModalError(null);
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);

    if (newStock === '' || isNaN(newStock) || Number(newStock) < 0) {
      return setModalError('Stock quantity must be a non-negative integer.');
    }

    setUpdating(true);
    try {
      const res = await api.updateInventoryStock(targetProduct.id, Number(newStock));
      if (res.success) {
        setProducts(prev => prev.map(p => p.id === targetProduct.id ? { ...p, stock_quantity: Number(newStock) } : p));
        setTargetProduct(null);
      } else {
        setModalError(res.message || 'Failed to update stock.');
      }
    } catch (err) {
      console.error('Stock update error:', err);
      setModalError('Error updating inventory stock.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredProducts = products.filter(prod => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = prod.name.toLowerCase().includes(term) ||
                          (prod.sku && prod.sku.toLowerCase().includes(term));
    
    const stock = Number(prod.stock_quantity ?? prod.stock ?? 0);
    let matchesStock = true;
    if (stockFilter === 'out') matchesStock = stock === 0;
    if (stockFilter === 'low') matchesStock = stock > 0 && stock <= 5;
    if (stockFilter === 'in') matchesStock = stock > 5;

    return matchesSearch && matchesStock;
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight gold-gradient-text">
            INVENTORY CONTROL & STOCK MONITORING
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock monitoring, quick inventory adjustments, and automated threshold alerts.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="px-4 py-2.5 rounded-xl glass-card gold-border-glow text-amber-300 font-bold text-xs uppercase tracking-wider hover:bg-amber-500/10 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="glass-card gold-border-glow p-5 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Search Input */}
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-amber-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search inventory by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/90 border border-amber-500/30 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Stock Filter */}
          <div className="md:col-span-4">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full bg-slate-900 border border-amber-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            >
              <option value="All">All Stock Levels</option>
              <option value="in">In Stock (&gt; 5)</option>
              <option value="low">Low Stock (1-5)</option>
              <option value="out">Out of Stock (0)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Inventory Table */}
      <div className="glass-card gold-border-glow rounded-3xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Product</th>
                <th className="pb-3 px-3">SKU</th>
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3">Stock Units</th>
                <th className="pb-3 px-3">Inventory Status</th>
                <th className="pb-3 px-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">Loading inventory data...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">No inventory records found.</td>
                </tr>
              ) : (
                filteredProducts.map(prod => {
                  const stock = Number(prod.stock_quantity ?? prod.stock ?? 0);
                  const imageUrl = prod.primary_image || prod.image_url || prod.image || (prod.images && prod.images[0]?.image_url);

                  return (
                    <tr key={prod.id} className="hover:bg-slate-900/40">
                      <td className="py-3.5 px-3 flex items-center gap-3">
                        <div className="w-10 h-10 shrink-0">
                          <ProductImage imageUrl={imageUrl} productId={prod.id} category={prod.category_name || prod.category} className="h-10" iconSize={18} />
                        </div>
                        <span className="font-bold text-slate-100">{prod.name}</span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-400">{prod.sku || 'NEX-PROD'}</td>
                      <td className="py-3.5 px-3 text-slate-300">{prod.category_name || prod.category}</td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-100 text-sm">{stock}</td>
                      <td className="py-3.5 px-3">
                        {stock === 0 ? (
                          <span className="px-3 py-1 rounded-full bg-red-950 text-red-400 border border-red-500/40 text-[10px] font-bold inline-flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Out of Stock (0)</span>
                          </span>
                        ) : stock <= 5 ? (
                          <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 text-[10px] font-bold inline-flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Low Stock ({stock})</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>In Stock ({stock})</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => openStockModal(prod)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors inline-flex items-center gap-1.5 text-xs font-bold"
                          title="Update Stock"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Adjust Stock</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Quick Stock Adjustments */}
      <AnimatePresence>
        {targetProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTargetProduct(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0E0E14] border border-amber-500/30 rounded-3xl p-6 z-50 text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.9)] space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3 text-amber-400">
                  <Edit3 className="w-6 h-6" />
                  <h3 className="text-lg font-bold">Adjust Inventory Stock</h3>
                </div>
                <button onClick={() => setTargetProduct(null)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3 text-xs text-red-300">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleStockSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Product</label>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-bold text-amber-200">
                    {targetProduct.name} ({targetProduct.sku || 'NEX-PROD'})
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-2">New Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full bg-slate-900 border border-amber-500/30 rounded-xl px-4 py-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setTargetProduct(null)}
                    className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2.5 rounded-xl gold-gradient-bg text-black hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] font-extrabold flex items-center gap-2 disabled:opacity-50"
                  >
                    {updating ? (
                      'Updating...'
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Stock</span>
                      </>
                    )}
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
