import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ArrowLeft, PlusCircle, AlertCircle, Image as ImageIcon, X, CheckCircle2, Star } from 'lucide-react';

export default function AddProduct() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    brand: 'Ahmed Moblie',
    category_id: '',
    price: '',
    old_price: '',
    discount_percentage: '0',
    stock_quantity: '10',
    short_description: '',
    description: '',
    is_featured: false,
    is_featured_highlight: false,
    is_new_arrival: true,
    is_best_seller: false
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    api.getCategories()
      .then(res => {
        if (res.success && res.data) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setFormData(prev => ({ ...prev, category_id: res.data[0].id }));
          }
        }
      })
      .catch(err => console.warn('Categories fetch error:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    const validFiles = [];
    const validPreviews = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds the 5 MB file size limit.`);
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        setError(`File "${file.name}" has an unsupported format. Please use JPG, JPEG, PNG, or WEBP.`);
        return;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    setError(null);
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...validPreviews]);
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) return setError('Product name is required.');
    if (!formData.sku.trim()) return setError('SKU code is required.');
    if (!formData.price || Number(formData.price) < 0) return setError('Price must be a valid non-negative number.');
    if (!formData.category_id) return setError('Please select a category.');

    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      selectedFiles.forEach(file => {
        data.append('images', file);
      });

      const res = await api.createProduct(data);

      if (res.success) {
        alert('Product added successfully!');
        navigate('/admin/products');
      } else {
        setError(res.message || 'Failed to create product.');
      }
    } catch (err) {
      console.error('Create product error:', err);
      const msg = err.response?.data?.message || err.message || 'Product creation failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-violet-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Products</span>
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight gold-gradient-text">
            ADD NEW PRODUCT
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create a product, set stock levels, and upload product images to MySQL.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card gold-border-glow p-8 rounded-3xl space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Product Name *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Wireless Pro Headphones"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-violet-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">SKU Code *</label>
            <input
              type="text"
              name="sku"
              required
              placeholder="e.g. NEX-AUD-01"
              value={formData.sku}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-violet-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-violet-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-violet-400"
            />
          </div>

          {/* ===== FIXED CATEGORY DROPDOWN ===== */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Category *</label>
            <div className="relative">
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full appearance-none bg-[#16161a] border border-violet-500/30 rounded-xl px-4 py-2.5 pr-10 text-xs text-slate-100 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 hover:border-violet-500/50 cursor-pointer transition-colors"
                style={{ colorScheme: 'dark' }}
              >
                {categories.length === 0 && (
                  <option value="">Loading categories...</option>
                )}
                {categories.map(cat => (
                  <option
                    key={cat.id}
                    value={cat.id}
                    className="bg-[#16161a] text-slate-100"
                  >
                    {cat.name}
                  </option>
                ))}
              </select>
              {/* Custom arrow icon */}
              <svg
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
          {/* ===== END FIXED CATEGORY DROPDOWN ===== */}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Price (PKR) *</label>
            <input
              type="number"
              step="1"
              name="price"
              required
              placeholder="e.g. 2500"
              value={formData.price}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-violet-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-violet-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Original Price (PKR)</label>
            <input
              type="number"
              step="1"
              name="old_price"
              placeholder="e.g. 3000"
              value={formData.old_price}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-violet-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-violet-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Stock Quantity *</label>
            <input
              type="number"
              name="stock_quantity"
              required
              placeholder="e.g. 25"
              value={formData.stock_quantity}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-violet-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-violet-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Discount (%)</label>
            <input
              type="number"
              name="discount_percentage"
              placeholder="e.g. 20"
              value={formData.discount_percentage}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-violet-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-violet-400"
            />
          </div>

        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Short Description</label>
          <input
            type="text"
            name="short_description"
            placeholder="Brief 1-line summary..."
            value={formData.short_description}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-violet-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-violet-400"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Full Description</label>
          <textarea
            name="description"
            rows="4"
            placeholder="Detailed features and specs..."
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-violet-500/30 rounded-xl p-4 text-xs text-slate-100 focus:outline-none focus:border-violet-400"
          />
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <label className="flex items-center gap-2 text-xs font-bold text-violet-300 cursor-pointer bg-violet-950/40 border border-violet-500/30 px-3 py-1.5 rounded-xl hover:border-violet-400 transition-colors">
            <input
              type="checkbox"
              name="is_featured_highlight"
              checked={formData.is_featured_highlight}
              onChange={handleChange}
              className="accent-violet-500 w-4 h-4 cursor-pointer"
            />
            <span>★ Featured Highlight (Homepage Top Card - Max 1)</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="accent-[#a78bfa]"
            />
            <span>Featured Product</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              name="is_new_arrival"
              checked={formData.is_new_arrival}
              onChange={handleChange}
              className="accent-[#a78bfa]"
            />
            <span>New Arrival</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              name="is_best_seller"
              checked={formData.is_best_seller}
              onChange={handleChange}
              className="accent-[#a78bfa]"
            />
            <span>Best Seller</span>
          </label>
        </div>

        {/* Real Multer Image Dropzone & Preview */}
        <div className="space-y-4 pt-4 border-t border-violet-500/20">
          <label className="block text-xs font-bold text-violet-300 uppercase tracking-wider">
            Product Images (JPG, JPEG, PNG, WEBP &le; 5 MB)
          </label>

          <div className="border-2 border-dashed border-violet-500/30 hover:border-violet-400 rounded-2xl p-8 text-center bg-slate-900/40 relative cursor-pointer group transition-colors">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <ImageIcon className="w-10 h-10 text-violet-400/80 mx-auto group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-slate-200 mt-2">Click or drag images here to select files</p>
            <p className="text-[10px] text-slate-500 mt-0.5">First image will be assigned as primary</p>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {imagePreviews.map((src, idx) => (
                <div key={idx} className="relative glass-card gold-border-glow rounded-xl p-2 group">
                  <img src={src} alt="Preview" className="w-full h-24 object-cover rounded-lg" />
                  {idx === 0 && (
                    <span className="absolute top-3 left-3 bg-violet-500 text-white text-[9px] font-black px-2 py-0.5 rounded shadow">
                      PRIMARY
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute top-3 right-3 bg-red-950/80 text-red-300 p-1 rounded-full border border-red-500/40 hover:bg-red-900 transition-colors"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl gold-gradient-bg text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(167,139,250,0.3)] hover:shadow-[0_0_30px_rgba(167,139,250,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Uploading & Saving Product...</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              <span>Add Product</span>
            </>
          )}
        </button>

      </form>

    </div>
  );
}