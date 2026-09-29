import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { PlusCircle, Search, Edit2, Trash2, RefreshCw, Eye, AlertTriangle, X, FileSpreadsheet, Upload, CheckCircle2, AlertCircle, LoaderCircle, Sparkles } from 'lucide-react';
import ProductImage from '../../components/ProductImage';
import { motion, AnimatePresence } from 'framer-motion';
import readXlsxFile from 'read-excel-file/browser';

function normalizeHeader(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  
  const [loading, setLoading] = useState(true);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [importRows, setImportRows] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [importReport, setImportReport] = useState(null);
  const [importProgress, setImportProgress] = useState({ completed: 0, total: 0 });
  const [isImporting, setIsImporting] = useState(false);
  const importInputRef = useRef(null);

  // Modal Delete State
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Featured Highlight State
  const [togglingHighlightId, setTogglingHighlightId] = useState(null);
  const [highlightToast, setHighlightToast] = useState(null);

  const handleToggleHighlight = async (product) => {
    setTogglingHighlightId(product.id);
    try {
      const res = await api.toggleFeaturedHighlight(product.id);
      if (res.success) {
        const isNowHighlight = res.is_featured_highlight === 1;
        setProducts(prev => prev.map(p => {
          if (p.id === product.id) {
            return { ...p, is_featured_highlight: isNowHighlight ? 1 : 0 };
          }
          return isNowHighlight ? { ...p, is_featured_highlight: 0 } : p;
        }));

        setHighlightToast({
          type: 'success',
          text: isNowHighlight
            ? `✨ "${product.name}" is now set as the Homepage Featured Highlight! (Limit: 1 product)`
            : `"${product.name}" removed from Homepage Featured Highlight.`
        });
        setTimeout(() => setHighlightToast(null), 4000);
      } else {
        alert(res.message || 'Failed to update highlight.');
      }
    } catch (err) {
      console.error('Highlight toggle error:', err);
      alert('Error updating featured highlight.');
    } finally {
      setTogglingHighlightId(null);
    }
  };

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ]);
      if (prodRes.success && prodRes.data) setProducts(prodRes.data);
      if (catRes.success && catRes.data) setCategories(catRes.data);
    } catch (err) {
      console.warn('Admin products fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    try {
      const res = await api.deleteProduct(productToDelete.id);
      if (res.success) {
        setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
        setProductToDelete(null);
      } else {
        alert(res.message || 'Failed to delete product.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting product.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setImportRows([]);
    setImportErrors([]);
    setImportReport(null);
    setImportFileName(file.name);

    if (file.size > 10 * 1024 * 1024) {
      setImportErrors(['Workbook exceeds the 10 MB upload limit.']);
      return;
    }

    try {
      const sheet = await readXlsxFile(file);
      if (sheet.length < 2) {
        setImportErrors(['The workbook must contain a header row and at least one product row.']);
        return;
      }

      const headerIndexes = new Map(sheet[0].map((value, index) => [normalizeHeader(value), index]));
      const hasHeader = (...aliases) => aliases.some((alias) => headerIndexes.has(normalizeHeader(alias)));
      const missingHeaders = [];
      if (!hasHeader('name', 'product name', 'product')) missingHeaders.push('name');
      if (!hasHeader('sku', 'sku code')) missingHeaders.push('sku');
      if (!hasHeader('price', 'price pkr')) missingHeaders.push('price');
      if (!hasHeader('category', 'category name', 'category id')) missingHeaders.push('category');
      if (missingHeaders.length) {
        setImportErrors([`Missing required column${missingHeaders.length === 1 ? '' : 's'}: ${missingHeaders.join(', ')}.`]);
        return;
      }

      const valueFor = (row, ...aliases) => {
        const index = aliases.map(normalizeHeader).map((name) => headerIndexes.get(name)).find((value) => value !== undefined);
        return index === undefined ? '' : row[index];
      };
      const errors = [];
      const validRows = [];
      const seenSkus = new Set();

      sheet.slice(1).forEach((row, index) => {
        if (row.every((value) => value === null || String(value).trim() === '')) return;
        const rowNumber = index + 2;
        const name = String(valueFor(row, 'name', 'product name', 'product') ?? '').trim();
        const sku = String(valueFor(row, 'sku', 'sku code') ?? '').trim();
        const priceValue = valueFor(row, 'price', 'price pkr');
        const price = priceValue === '' || priceValue === null ? Number.NaN : Number(priceValue);
        const stockValue = valueFor(row, 'stock', 'stock quantity', 'quantity');
        const stock = stockValue === '' || stockValue === null ? 0 : Number(stockValue);
        const categoryValue = String(valueFor(row, 'category', 'category name', 'category id') ?? '').trim();
        const category = categories.find((item) => String(item.id) === categoryValue || item.name.toLowerCase() === categoryValue.toLowerCase());
        const oldPriceValue = valueFor(row, 'old price', 'original price');
        const discountValue = valueFor(row, 'discount', 'discount percentage');
        const oldPrice = oldPriceValue === '' || oldPriceValue === null ? '' : Number(oldPriceValue);
        const discount = discountValue === '' || discountValue === null ? 0 : Number(discountValue);

        const rowErrors = [];
        if (!name) rowErrors.push('name is required');
        if (!sku) rowErrors.push('SKU is required');
        if (sku && seenSkus.has(sku.toLowerCase())) rowErrors.push('SKU is duplicated in this workbook');
        if (sku) seenSkus.add(sku.toLowerCase());
        if (!Number.isFinite(price) || price < 0) rowErrors.push('price must be a non-negative number');
        if (!Number.isInteger(stock) || stock < 0) rowErrors.push('stock must be a non-negative whole number');
        if (oldPrice !== '' && (!Number.isFinite(oldPrice) || oldPrice < 0)) rowErrors.push('old_price must be a non-negative number');
        if (!Number.isFinite(discount) || discount < 0) rowErrors.push('discount_percentage must be a non-negative number');
        if (!category) rowErrors.push(`category "${categoryValue || 'blank'}" was not found`);

        if (rowErrors.length) {
          errors.push(`Row ${rowNumber}: ${rowErrors.join(', ')}.`);
          return;
        }

        validRows.push({
          rowNumber,
          name,
          sku,
          brand: String(valueFor(row, 'brand') || 'Ahmed Moblie').trim(),
          category_id: category.id,
          price,
          old_price: oldPrice,
          discount_percentage: discount,
          stock_quantity: stock,
          short_description: String(valueFor(row, 'short description', 'short description text') ?? ''),
          description: String(valueFor(row, 'description', 'full description') ?? '')
        });
      });

      setImportRows(validRows);
      setImportErrors(errors);
    } catch (error) {
      setImportErrors([`Could not read this workbook. Save it as .xlsx and try again. ${error.message}`]);
    }
  };

  const handleImportProducts = async () => {
    if (!importRows.length || isImporting) return;
    setIsImporting(true);
    setImportProgress({ completed: 0, total: importRows.length });
    const errors = [...importErrors];
    let created = 0;

    for (const [index, product] of importRows.entries()) {
      try {
        const formData = new FormData();
        Object.entries(product).forEach(([key, value]) => {
          if (key !== 'rowNumber') formData.append(key, value);
        });
        const result = await api.createProduct(formData);
        if (!result.success) throw new Error(result.message || 'Product creation failed.');
        created += 1;
      } catch (error) {
        errors.push(`Row ${product.rowNumber} (${product.sku}): ${error.response?.data?.message || error.message || 'Import failed.'}`);
      }
      setImportProgress({ completed: index + 1, total: importRows.length });
    }

    setImportReport({ created, failed: errors.length });
    setImportErrors(errors);
    setImportRows([]);
    setIsImporting(false);
    await fetchProductsAndCategories();
  };

  const filteredProducts = products.filter(prod => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = prod.name.toLowerCase().includes(term) ||
                          (prod.sku && prod.sku.toLowerCase().includes(term)) ||
                          (prod.brand && prod.brand.toLowerCase().includes(term));
    
    const matchesCategory = selectedCategory === 'All' || 
                            (prod.category_name || prod.category) === selectedCategory;

    const stock = Number(prod.stock_quantity || prod.stock || 0);
    let matchesStock = true;
    if (stockFilter === 'out') matchesStock = stock === 0;
    if (stockFilter === 'low') matchesStock = stock > 0 && stock <= 5;
    if (stockFilter === 'in') matchesStock = stock > 5;

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight gold-gradient-text">
            PRODUCT MANAGEMENT
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time MongoDB product inventory management, stock controls, and image gallery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/50 bg-amber-500/10 px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-amber-200 transition-colors hover:bg-amber-500/20"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Import Excel
          </button>
          <Link
            to="/admin/products/add"
            className="inline-flex items-center justify-center gap-2 rounded-xl gold-gradient-bg px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(124,58,237,0.3)] transition-all hover:shadow-[0_0_25px_rgba(124,58,237,0.45)]"
          >
            <PlusCircle className="h-4 w-4" />
            <span>+ Add Product</span>
          </Link>
        </div>
      </div>

      {/* Control Bar: Search & Filter Pills */}
      <div className="glass-card gold-border-glow p-5 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-amber-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search products by name, SKU, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/90 border border-amber-500/30 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
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

          {/* Stock Filter */}
          <div className="md:col-span-2">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full bg-slate-900 border border-amber-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            >
              <option value="All">All Stock Status</option>
              <option value="in">In Stock (&gt; 5)</option>
              <option value="low">Low Stock (1-5)</option>
              <option value="out">Out of Stock (0)</option>
            </select>
          </div>

          {/* Refresh Button */}
          <div className="md:col-span-1 flex justify-end">
            <button
              onClick={fetchProductsAndCategories}
              className="p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-amber-300 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Toast Alert for Highlight Changes */}
      <AnimatePresence>
        {highlightToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/90 via-slate-900 to-[#12121e] border border-violet-500/40 text-violet-200 text-xs font-bold flex items-center justify-between shadow-[0_0_25px_rgba(139,92,246,0.25)]"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-violet-300 fill-violet-300" />
              <span>{highlightToast.text}</span>
            </div>
            <button
              onClick={() => setHighlightToast(null)}
              className="text-violet-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Catalog Table */}
      <div className="glass-card gold-border-glow rounded-3xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Image</th>
                <th className="pb-3 px-3">Product</th>
                <th className="pb-3 px-3">SKU</th>
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3">Price</th>
                <th className="pb-3 px-3">Stock</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-center">Featured Highlight (1 Max)</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">Loading catalog from database...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">No matching products found.</td>
                </tr>
              ) : (
                filteredProducts.map(prod => {
                  const stock = Number(prod.stock_quantity || prod.stock || 0);
                  const imageUrl = prod.primary_image || prod.image_url || prod.image || (prod.images && prod.images[0]?.image_url);
                  
                  return (
                    <tr key={prod.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-3">
                        <div className="w-10 h-10 shrink-0">
                          <ProductImage imageUrl={imageUrl} productId={prod.id} category={prod.category_name || prod.category} className="h-10" iconSize={18} />
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-100">{prod.name}</td>
                      <td className="py-3 px-3 font-mono text-slate-400">{prod.sku || 'NEX-PROD'}</td>
                      <td className="py-3 px-3 text-slate-300">{prod.category_name || prod.category}</td>
                      <td className="py-3 px-3 font-mono text-amber-300 font-bold">{formatCurrency(prod.price)}</td>
                      <td className="py-3 px-3 font-mono">{stock}</td>
                      <td className="py-3 px-3">
                        {stock === 0 ? (
                          <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/30 text-[10px] font-bold">Out of Stock</span>
                        ) : stock <= 5 ? (
                          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 text-[10px] font-bold">Low Stock</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">In Stock</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          disabled={togglingHighlightId === prod.id}
                          onClick={() => handleToggleHighlight(prod)}
                          title={prod.is_featured_highlight === 1 ? "Active Hero Highlight (Click to remove)" : "Click to make this the 1 Homepage Featured Highlight"}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                            prod.is_featured_highlight === 1
                              ? "bg-violet-600/30 text-violet-200 border border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.35)] ring-1 ring-violet-400"
                              : "bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-violet-500/50 hover:text-violet-300 hover:bg-slate-800/80"
                          } disabled:opacity-50`}
                        >
                          {togglingHighlightId === prod.id ? (
                            <LoaderCircle className="w-3.5 h-3.5 animate-spin text-violet-400" />
                          ) : (
                            <Sparkles className={`w-3.5 h-3.5 ${prod.is_featured_highlight === 1 ? 'text-violet-300 fill-violet-300' : 'text-slate-500'}`} />
                          )}
                          <span>
                            {prod.is_featured_highlight === 1 ? "★ Highlight Active" : "Set Highlight"}
                          </span>
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/product/${prod.id}`}
                            target="_blank"
                            className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:text-amber-300 transition-colors"
                            title="View Product Page"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            to={`/admin/products/edit/${prod.id}`}
                            className="p-2 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => setProductToDelete(prod)}
                            className="p-2 rounded-lg bg-red-950/40 text-red-400 border border-red-500/30 hover:bg-red-900/40 transition-colors"
                            title="Delete Product"
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

      {/* Excel Import Dialog */}
      <AnimatePresence>
        {isImportOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isImporting && setIsImportOpen(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="excel-import-title"
              className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-amber-400/25 bg-[#12121e] p-5 text-slate-100 shadow-2xl sm:p-7"
            >
              <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 id="excel-import-title" className="text-lg font-extrabold text-white">Import products from Excel</h2>
                  <p className="mt-1 text-xs text-slate-400">Upload an .xlsx workbook. Each valid row is saved to MongoDB.</p>
                </div>
                <button
                  type="button"
                  onClick={() => !isImporting && setIsImportOpen(false)}
                  disabled={isImporting}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-50"
                  aria-label="Close import dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <input
                ref={importInputRef}
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleImportFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                disabled={isImporting}
                className="flex min-h-32 w-full flex-col items-center justify-center rounded-xl border border-dashed border-amber-400/40 bg-slate-900/50 px-5 py-6 text-center transition-colors hover:border-amber-400 hover:bg-slate-900 disabled:opacity-50"
              >
                <Upload className="mb-2 h-6 w-6 text-amber-300" />
                <span className="text-sm font-bold text-slate-100">{importFileName || 'Choose an Excel workbook'}</span>
                <span className="mt-1 text-[11px] text-slate-400">Required columns: name, sku, category, price, stock_quantity</span>
                <span className="mt-0.5 text-[10px] text-slate-500">Optional: brand, old_price, discount_percentage, short_description, description</span>
              </button>

              {(importRows.length > 0 || importErrors.length > 0) && (
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap gap-2 text-xs">
                    {importRows.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {importRows.length} valid row{importRows.length === 1 ? '' : 's'}
                      </span>
                    )}
                    {importErrors.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-rose-300">
                        <AlertCircle className="h-3.5 w-3.5" /> {importErrors.length} issue{importErrors.length === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>

                  {isImporting && (
                    <div className="space-y-2" aria-live="polite">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Importing products</span>
                        <span>{importProgress.completed} / {importProgress.total}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                        <div className="h-full rounded-full gold-gradient-bg transition-all" style={{ width: `${(importProgress.completed / importProgress.total) * 100}%` }} />
                      </div>
                    </div>
                  )}

                  {importReport && (
                    <p className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs text-slate-200" role="status">
                      Import finished: {importReport.created} created, {importReport.failed} failed.
                    </p>
                  )}

                  {importErrors.length > 0 && (
                    <div className="max-h-32 overflow-y-auto rounded-lg border border-rose-500/20 bg-rose-950/20 p-3 text-[11px] text-rose-200">
                      <ul className="space-y-1">
                        {importErrors.map((error, index) => <li key={`${index}-${error}`}>{error}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsImportOpen(false)}
                  disabled={isImporting}
                  className="rounded-lg border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors hover:bg-slate-800 disabled:opacity-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleImportProducts}
                  disabled={!importRows.length || isImporting}
                  className="inline-flex items-center gap-2 rounded-lg gold-gradient-bg px-4 py-2.5 text-xs font-extrabold text-white shadow-lg transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isImporting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Import {importRows.length || ''} products
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {productToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductToDelete(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0E0E14] border border-red-500/30 rounded-3xl p-6 z-50 text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.9)] space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3 text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                  <h3 className="text-lg font-bold">Delete Product?</h3>
                </div>
                <button onClick={() => setProductToDelete(null)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p>Are you sure you want to permanently delete this product?</p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-bold text-amber-200">
                  {productToDelete.name} ({productToDelete.sku || 'NEX-PROD'})
                </div>
                <p className="text-slate-400">This action will remove the database record and associated image files.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setProductToDelete(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 text-xs font-bold"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-500 text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Product'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
