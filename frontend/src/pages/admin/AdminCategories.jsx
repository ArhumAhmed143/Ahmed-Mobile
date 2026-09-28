import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Layers, Plus, Search, Edit3, Trash2, RefreshCw, AlertTriangle, X, Save, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null); // { id, name, description, image }
  
  const [formData, setFormData] = useState({ name: '', description: '', image: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.warn('Fetch categories error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setFormData({ name: '', description: '', image: '' });
    setErrorMsg(null);
    setIsAddOpen(true);
  };

  const openEditModal = (cat) => {
    setEditCategory(cat);
    setFormData({ name: cat.name || '', description: cat.description || '', image: cat.image || '' });
    setErrorMsg(null);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await api.createCategory(formData);
      if (res.success) {
        setIsAddOpen(false);
        fetchCategories();
      } else {
        setErrorMsg(res.message || 'Failed to create category.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error creating category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editCategory) return;
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await api.updateCategory(editCategory.id, formData);
      if (res.success) {
        setEditCategory(null);
        fetchCategories();
      } else {
        setErrorMsg(res.message || 'Failed to update category.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;

    try {
      const res = await api.deleteCategory(cat.id);
      if (res.success) {
        fetchCategories();
      } else {
        alert(res.message || 'Failed to delete category.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete category. Products may still be assigned to it.';
      alert(msg);
    }
  };

  const filteredCategories = categories.filter(c => {
    const term = searchTerm.toLowerCase();
    return c.name.toLowerCase().includes(term) || (c.slug && c.slug.toLowerCase().includes(term));
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight gold-gradient-text">
            CATEGORY MANAGEMENT
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize catalog categories, descriptions, icons, and dynamic shop tab ordering.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={fetchCategories}
            className="px-4 py-2.5 rounded-xl glass-card gold-border-glow text-amber-300 font-bold text-xs uppercase tracking-wider hover:bg-amber-500/10 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-xl gold-gradient-bg text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card gold-border-glow p-5 rounded-2xl">
        <div className="relative">
          <Search className="w-4 h-4 text-amber-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search categories by name or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/90 border border-amber-500/30 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="glass-card gold-border-glow rounded-3xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Icon / Image</th>
                <th className="pb-3 px-3">Category Name</th>
                <th className="pb-3 px-3">Slug</th>
                <th className="pb-3 px-3">Description</th>
                <th className="pb-3 px-3">Assigned Products</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">Loading categories...</td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">No categories found.</td>
                </tr>
              ) : (
                filteredCategories.map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-900/40">
                    <td className="py-3.5 px-3 text-xl">{cat.image || '🏷️'}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-100">{cat.name}</td>
                    <td className="py-3.5 px-3 font-mono text-amber-300">{cat.slug}</td>
                    <td className="py-3.5 px-3 text-slate-400 max-w-xs truncate">{cat.description || 'No description provided.'}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-bold font-mono">
                        {cat.product_count || 0} Products
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-amber-300 transition-colors inline-block"
                        title="Edit Category"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="p-1.5 rounded-lg bg-red-950/50 text-red-400 border border-red-500/30 hover:bg-red-900 transition-colors inline-block"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      <AnimatePresence>
        {(isAddOpen || editCategory) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAddOpen(false); setEditCategory(null); }}
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
                  <Layers className="w-6 h-6" />
                  <h3 className="text-lg font-bold">{isAddOpen ? 'Add New Category' : 'Edit Category'}</h3>
                </div>
                <button onClick={() => { setIsAddOpen(false); setEditCategory(null); }} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMsg && (
                <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3 text-xs text-red-300">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={isAddOpen ? handleCreateSubmit : handleEditSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Headphones"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-900 border border-amber-500/30 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">Icon / Emoji (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 🎧"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full bg-slate-900 border border-amber-500/30 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    rows="3"
                    placeholder="Category description..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-900 border border-amber-500/30 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setIsAddOpen(false); setEditCategory(null); }}
                    className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl gold-gradient-bg text-black hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] font-extrabold flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{isAddOpen ? 'Create Category' : 'Save Changes'}</span>
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
