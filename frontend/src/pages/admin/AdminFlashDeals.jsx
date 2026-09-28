import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { 
  Zap, 
  Search, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Clock, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Calendar,
  Eye,
  Power
} from 'lucide-react';
import ProductImage from '../../components/ProductImage';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to format ISO date string for datetime-local input (YYYY-MM-DDTHH:mm)
function toDatetimeLocal(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Helper to format date for human display
function formatHumanDateTime(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function AdminFlashDeals() {
  const [flashDeals, setFlashDeals] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  
  // Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [flashPriceInput, setFlashPriceInput] = useState('');
  const [startTimeInput, setStartTimeInput] = useState('');
  const [endTimeInput, setEndTimeInput] = useState('');
  const [isActiveToggle, setIsActiveToggle] = useState(true);

  const [modalError, setModalError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // ============ Robust product fetching ============
  const fetchFlashDealsAndProducts = async () => {
    setLoading(true);
    try {
      const [dealsRes, prodsRes] = await Promise.all([
        api.getAllFlashDeals().catch(e => { console.error('Deals fetch error:', e); return { success: false }; }),
        api.getProducts().catch(e => { console.error('Products fetch error:', e); return { success: false }; })
      ]);

      console.log('🔍 Deals API response:', dealsRes);
      console.log('🔍 Products API response:', prodsRes);

      // Handle deals response
      if (dealsRes?.success && dealsRes?.data) {
        setFlashDeals(dealsRes.data);
      } else if (Array.isArray(dealsRes)) {
        setFlashDeals(dealsRes);
      } else if (dealsRes?.data && Array.isArray(dealsRes.data)) {
        setFlashDeals(dealsRes.data);
      }

      // Handle products response - MULTIPLE formats supported
      let productsList = [];
      if (Array.isArray(prodsRes)) {
        productsList = prodsRes;
      } else if (prodsRes?.success && Array.isArray(prodsRes.data)) {
        productsList = prodsRes.data;
      } else if (prodsRes?.data && Array.isArray(prodsRes.data)) {
        productsList = prodsRes.data;
      } else if (Array.isArray(prodsRes?.products)) {
        productsList = prodsRes.products;
      }

      console.log('✅ Products loaded:', productsList.length, productsList);
      setProducts(productsList);

      if (productsList.length === 0) {
        console.warn('⚠️ No products found! Backend check karo.');
        setMessage({ 
          type: 'error', 
          text: 'No products found in database. Please add products first from "Add Product" page.' 
        });
      }

    } catch (err) {
      console.warn('AdminFlashDeals fetch error:', err);
      setMessage({ type: 'error', text: 'Failed to load data. Check console for details.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashDealsAndProducts();
  }, []);

  const openCreateModal = () => {
    setEditingDeal(null);
    setSelectedProductId('');
    setFlashPriceInput('');

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
    setStartTimeInput(toDatetimeLocal(now));
    setEndTimeInput(toDatetimeLocal(tomorrow));
    setIsActiveToggle(true);
    setModalError('');
    setIsModalOpen(true);
  };

  // ✅ FIX 1: Safe String conversion
  const openEditModal = (deal) => {
    setEditingDeal(deal);
    setSelectedProductId(String(deal.product_id || deal.productId || ''));
    setFlashPriceInput(String(deal.flash_price));
    setStartTimeInput(toDatetimeLocal(deal.start_time));
    setEndTimeInput(toDatetimeLocal(deal.end_time));
    setIsActiveToggle(deal.is_active === 1);
    setModalError('');
    setIsModalOpen(true);
  };

  // ✅ FIX 2: Support both id and _id
  const handleProductSelectionChange = (prodIdStr) => {
    setSelectedProductId(prodIdStr);
    const prod = products.find(p => String(p.id || p._id) === String(prodIdStr));
    if (prod) {
      const origPrice = Number(prod.price) || 0;
      setFlashPriceInput(String(Math.round(origPrice * 0.7 * 100) / 100));
    }
  };

  // ✅ FIX 3: Full fixed handleSaveFlashDeal
  const handleSaveFlashDeal = async (e) => {
    e.preventDefault();
    setModalError('');

    // Proper validation with string trim
    if (!selectedProductId || !String(selectedProductId).trim()) {
      setModalError('Please select a product for the Flash Deal.');
      return;
    }

    const parsedFlashPrice = Number(flashPriceInput);
    if (isNaN(parsedFlashPrice) || parsedFlashPrice <= 0) {
      setModalError('Flash Deal price must be a valid number greater than 0.');
      return;
    }

    if (!startTimeInput || !endTimeInput) {
      setModalError('Both start date/time and end date/time are required.');
      return;
    }

    const startDate = new Date(startTimeInput);
    const endDate = new Date(endTimeInput);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setModalError('Please enter valid dates.');
      return;
    }

    if (endDate <= startDate) {
      setModalError('End date & time must be strictly after start date & time.');
      return;
    }

    // Product find — support both id and _id
    const prod = products.find(p => String(p.id || p._id) === String(selectedProductId));
    if (!prod) {
      setModalError('Selected product not found in catalog. Please refresh and try again.');
      return;
    }

    const origPrice = Number(prod.old_price || prod.oldPrice || prod.price) || 0;
    if (origPrice > 0 && parsedFlashPrice >= origPrice) {
      setModalError(`Flash Deal price (${formatCurrency(parsedFlashPrice)}) must be strictly lower than the product's original price (${formatCurrency(origPrice)}).`);
      return;
    }

    setIsSaving(true);
    try {
      // ✅ product_id as STRING (MongoDB ObjectId), NOT Number
      const payload = {
        product_id: String(selectedProductId),
        flash_price: parsedFlashPrice,
        original_price: origPrice,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        is_active: isActiveToggle ? 1 : 0,
        product_name: prod.name,
        primary_image: prod.primary_image || prod.image_url || prod.image,
        category_name: prod.category_name || prod.category
      };

      console.log('🔍 Sending Flash Deal payload:', payload);

      let res;
      if (editingDeal) {
        res = await api.updateFlashDeal(editingDeal.id, payload);
      } else {
        res = await api.createFlashDeal(payload);
      }

      if (res.success) {
        setMessage({ type: 'success', text: res.message || 'Flash Deal saved successfully!' });
        setIsModalOpen(false);
        fetchFlashDealsAndProducts();
      } else {
        setModalError(res.message || 'Failed to save Flash Deal.');
      }
    } catch (err) {
      console.error('Save Flash Deal error:', err);
      setModalError(err.response?.data?.message || 'Error saving Flash Deal.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (dealId) => {
    try {
      const res = await api.toggleFlashDealStatus(dealId);
      if (res.success) {
        setMessage({ type: 'success', text: 'Flash Deal status updated!' });
        fetchFlashDealsAndProducts();
      }
    } catch (err) {
      alert('Error updating status.');
    }
  };

  const handleDeleteFlashDeal = async (deal) => {
    if (!window.confirm(`Are you sure you want to delete the Flash Deal for "${deal.product_name}"?`)) return;

    try {
      const res = await api.deleteFlashDeal(deal.id);
      if (res.success) {
        setMessage({ type: 'success', text: 'Flash Deal deleted successfully!' });
        fetchFlashDealsAndProducts();
      } else {
        alert(res.message || 'Failed to delete Flash Deal.');
      }
    } catch (err) {
      alert('Error deleting Flash Deal.');
    }
  };

  const getComputedStatus = (deal) => {
    if (deal.is_active === 0) return 'INACTIVE';
    const now = new Date();
    const start = new Date(deal.start_time);
    const end = new Date(deal.end_time);
    if (now < start) return 'SCHEDULED';
    if (now > end) return 'EXPIRED';
    return 'ACTIVE';
  };

  const filteredDeals = flashDeals.filter(deal => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = deal.product_name?.toLowerCase().includes(term);
    const status = getComputedStatus(deal);
    const matchesStatus = statusFilter === 'All' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = flashDeals.filter(d => getComputedStatus(d) === 'ACTIVE').length;
  const scheduledCount = flashDeals.filter(d => getComputedStatus(d) === 'SCHEDULED').length;
  const expiredCount = flashDeals.filter(d => getComputedStatus(d) === 'EXPIRED').length;

  // ✅ FIX 5: Support both id and _id
  const selectedProductObj = products.find(p => String(p.id || p._id) === String(selectedProductId));

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4 text-violet-400 fill-violet-400 animate-pulse" />
            <span>LIMITED-TIME PROMOTIONS</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight gold-gradient-text">
            ⚡ FLASH DEALS CONTROL CENTER
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, schedule, and manage flash sales with automatic real-time countdown timers.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-6 py-3 rounded-xl gold-gradient-bg text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(167,139,250,0.3)] hover:shadow-[0_0_25px_rgba(167,139,250,0.5)] transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Create Flash Deal</span>
        </button>
      </div>

      {/* Success/Error Notification */}
      {message && (
        <div className={`glass-card p-4 rounded-2xl text-xs font-bold flex items-center justify-between border ${
          message.type === 'error' 
            ? 'border-red-500/30 bg-red-950/20 text-red-300'
            : 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'error' 
              ? <AlertCircle className="w-5 h-5 text-red-400" />
              : <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            }
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card gold-border-glow p-6 rounded-3xl bg-[#0C0C10] border border-violet-500/20 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Currently Active</span>
            <Flame className="w-5 h-5 text-emerald-400 fill-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-3">
            {activeCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Live on public website right now</p>
        </div>

        <div className="glass-card gold-border-glow p-6 rounded-3xl bg-[#0C0C10] border border-violet-500/20 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Scheduled Deals</span>
            <Calendar className="w-5 h-5 text-violet-400" />
          </div>
          <div className="text-3xl font-black font-mono text-violet-300 mt-3">
            {scheduledCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Set to go live automatically</p>
        </div>

        <div className="glass-card gold-border-glow p-6 rounded-3xl bg-[#0C0C10] border border-violet-500/20 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Expired Deals</span>
            <Clock className="w-5 h-5 text-slate-500" />
          </div>
          <div className="text-3xl font-black font-mono text-slate-400 mt-3">
            {expiredCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Ended (Products restored to standard price)</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="glass-card gold-border-glow p-5 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-violet-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search Flash Deals by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/90 border border-violet-500/30 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-400"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900 border border-violet-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-violet-400 font-bold"
            >
              <option value="All">All Statuses</option>
              <option value="ACTIVE">ACTIVE Deals ({activeCount})</option>
              <option value="SCHEDULED">SCHEDULED Deals ({scheduledCount})</option>
              <option value="EXPIRED">EXPIRED Deals ({expiredCount})</option>
              <option value="INACTIVE">INACTIVE / Disabled</option>
            </select>
          </div>

          <div className="md:col-span-1 flex justify-end">
            <button
              onClick={fetchFlashDealsAndProducts}
              className="p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-violet-300 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Flash Deals Table */}
      <div className="glass-card gold-border-glow rounded-3xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Product</th>
                <th className="pb-3 px-3">Original Price</th>
                <th className="pb-3 px-3">Flash Price</th>
                <th className="pb-3 px-3">Discount</th>
                <th className="pb-3 px-3">Start Date & Time</th>
                <th className="pb-3 px-3">End Date & Time</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">Loading Flash Deals from database...</td>
                </tr>
              ) : filteredDeals.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">No Flash Deals match your filter.</td>
                </tr>
              ) : (
                filteredDeals.map(deal => {
                  const status = getComputedStatus(deal);
                  const origPrice = Number(deal.original_price) || 0;
                  const flashPrice = Number(deal.flash_price) || 0;
                  const discount = origPrice > flashPrice ? Math.round(((origPrice - flashPrice) / origPrice) * 100) : 0;
                  const imageUrl = deal.primary_image || deal.image_url;

                  return (
                    <tr key={deal.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0">
                            <ProductImage imageUrl={imageUrl} productId={deal.product_id} category={deal.category_name} className="h-10" iconSize={18} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-100">{deal.product_name}</div>
                            <div className="text-[10px] text-violet-300/80 uppercase font-extrabold">{deal.category_name || 'Tech'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-400 line-through">
                        {formatCurrency(origPrice)}
                      </td>

                      <td className="py-3 px-3 font-mono font-black text-violet-300 text-sm">
                        {formatCurrency(flashPrice)}
                      </td>

                      <td className="py-3 px-3">
                        {discount > 0 ? (
                          <span className="px-2 py-0.5 rounded gold-gradient-bg text-white font-black text-[10px]">
                            -{discount}% OFF
                          </span>
                        ) : '-'}
                      </td>

                      <td className="py-3 px-3 text-[11px] font-mono text-slate-300">
                        {formatHumanDateTime(deal.start_time)}
                      </td>

                      <td className="py-3 px-3 text-[11px] font-mono text-slate-300">
                        {formatHumanDateTime(deal.end_time)}
                      </td>

                      <td className="py-3 px-3">
                        {status === 'ACTIVE' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold flex items-center gap-1 w-max">
                            <Flame className="w-3 h-3 text-emerald-400 fill-emerald-400 animate-pulse" />
                            <span>ACTIVE</span>
                          </span>
                        )}
                        {status === 'SCHEDULED' && (
                          <span className="px-2.5 py-1 rounded-full bg-violet-950 text-violet-300 border border-violet-500/40 text-[10px] font-extrabold flex items-center gap-1 w-max">
                            <Clock className="w-3 h-3 text-violet-400" />
                            <span>SCHEDULED</span>
                          </span>
                        )}
                        {status === 'EXPIRED' && (
                          <span className="px-2.5 py-1 rounded-full bg-slate-900 text-slate-500 border border-slate-800 text-[10px] font-bold w-max">
                            EXPIRED
                          </span>
                        )}
                        {status === 'INACTIVE' && (
                          <span className="px-2.5 py-1 rounded-full bg-red-950/40 text-red-400 border border-red-500/30 text-[10px] font-bold w-max">
                            INACTIVE
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(deal.id)}
                            className={`p-2 rounded-lg border transition-colors ${
                              deal.is_active === 1
                                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                                : 'bg-slate-900 text-slate-500 border-slate-800'
                            }`}
                            title={deal.is_active === 1 ? 'Deactivate Deal' : 'Activate Deal'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => openEditModal(deal)}
                            className="p-2 rounded-lg bg-violet-500/10 text-violet-300 border border-violet-500/30 hover:bg-violet-500/20 transition-all"
                            title="Edit Flash Deal"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteFlashDeal(deal)}
                            className="p-2 rounded-lg bg-red-950/40 text-red-400 border border-red-500/30 hover:bg-red-900/40 transition-colors"
                            title="Delete Flash Deal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Create / Edit Flash Deal Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-[#0E0E14] border border-violet-500/30 rounded-3xl p-6 md:p-8 z-50 text-slate-100 shadow-[0_0_50px_rgba(167,139,250,0.25)] space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-violet-500/20 pb-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-violet-400 fill-violet-400" />
                  <h3 className="text-lg font-black uppercase tracking-wider gold-gradient-text">
                    {editingDeal ? 'EDIT FLASH DEAL' : 'CREATE FLASH DEAL'}
                  </h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSaveFlashDeal} className="space-y-4 text-xs">
                
                {/* 1. Select Product */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Select Target Product
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => handleProductSelectionChange(e.target.value)}
                    disabled={!!editingDeal}
                    required
                    className="w-full bg-[#16161a] border border-violet-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 hover:border-violet-500/50 cursor-pointer disabled:opacity-50 transition-colors"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" className="bg-[#16161a] text-slate-100">
                      {products.length === 0 
                        ? '-- No products available. Add products first! --' 
                        : '-- Choose Product from Catalog --'}
                    </option>
                    {/* ✅ FIX 4: support both id and _id */}
                    {products.map(p => (
                      <option key={p.id || p._id} value={p.id || p._id} className="bg-[#16161a] text-slate-100">
                        {p.name} ({formatCurrency(p.price)})
                      </option>
                    ))}
                  </select>
                  {products.length === 0 && !loading && (
                    <p className="text-[10px] text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      No products found. Please add products from "Add Product" page first.
                    </p>
                  )}
                </div>

                {/* Live Preview Box */}
                {selectedProductObj && (
                  <div className="glass-card gold-border-glow p-3.5 rounded-2xl bg-slate-900/80 flex items-center gap-3 border border-violet-500/20">
                    <div className="w-12 h-12 rounded-xl shrink-0 overflow-hidden bg-black border border-violet-500/20 flex items-center justify-center">
                      <ProductImage imageUrl={selectedProductObj.primary_image || selectedProductObj.image_url || selectedProductObj.image} productId={selectedProductObj.id || selectedProductObj._id} category={selectedProductObj.category_name || selectedProductObj.category} className="h-11" iconSize={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-slate-100 truncate">{selectedProductObj.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Original Price: <span className="text-violet-200 font-bold">{formatCurrency(selectedProductObj.old_price || selectedProductObj.oldPrice || selectedProductObj.price)}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Flash Price */}
                <div>
                  <label className="block text-violet-300 font-bold mb-1.5">
                    Special Flash Deal Price (PKR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g. 119.99"
                    value={flashPriceInput}
                    onChange={(e) => setFlashPriceInput(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-violet-400 rounded-xl px-4 py-2.5 text-xs text-violet-200 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-violet-400"
                  />
                </div>

                {/* 3. Start Date & Time */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Flash Deal Start Date & Time (Local Timezone)
                  </label>
                  <input
                    type="datetime-local"
                    value={startTimeInput}
                    onChange={(e) => setStartTimeInput(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-violet-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-violet-400"
                  />
                </div>

                {/* 4. End Date & Time */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Flash Deal End Date & Time (Local Timezone)
                  </label>
                  <input
                    type="datetime-local"
                    value={endTimeInput}
                    onChange={(e) => setEndTimeInput(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-violet-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-violet-400"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-violet-500/20">
                  <div>
                    <span className="font-bold text-slate-200 block">Flash Deal Status</span>
                    <span className="text-[11px] text-slate-400">Enable or temporarily pause this Flash Deal</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsActiveToggle(!isActiveToggle)}
                    className={`px-4 py-2 rounded-xl font-bold transition-all ${
                      isActiveToggle 
                        ? 'gold-gradient-bg text-white shadow-md' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isActiveToggle ? 'ACTIVE' : 'DISABLED'}
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-violet-500/20">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving || products.length === 0}
                    className="px-6 py-2.5 rounded-xl gold-gradient-bg text-white font-extrabold uppercase tracking-wider shadow-[0_0_15px_rgba(167,139,250,0.3)] hover:shadow-[0_0_25px_rgba(167,139,250,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : editingDeal ? 'Update Flash Deal' : 'Create Flash Deal'}
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