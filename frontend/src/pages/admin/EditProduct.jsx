import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ArrowLeft, Save, AlertCircle, Image as ImageIcon, X, Trash2 } from 'lucide-react';
import ProductImage from '../../components/ProductImage';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    brand: 'Ahmed Moblie',
    category_id: '',
    price: '',
    old_price: '',
    discount_percentage: '0',
    stock_quantity: '0',
    short_description: '',
    description: '',
    is_featured: false,
    is_featured_highlight: false,
    is_new_arrival: false,
    is_best_seller: false
  });

  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  const fetchProductData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        api.getCategories(),
        api.getProductById(id)
      ]);

      if (catRes.success && catRes.data) setCategories(catRes.data);

      if (prodRes.success && prodRes.data) {
        const prod = prodRes.data;
        setFormData({
          name: prod.name || '',
          sku: prod.sku || '',
          brand: prod.brand || 'Ahmed Moblie',
          category_id: prod.category_id || '',
          price: prod.price || '',
          old_price: prod.old_price || prod.oldPrice || '',
          discount_percentage: prod.discount_percentage || prod.discount || 0,
          stock_quantity: prod.stock_quantity || prod.stock || 0,
          short_description: prod.short_description || '',
          description: prod.description || '',
          is_featured: Boolean(prod.is_featured),
          is_featured_highlight: Boolean(prod.is_featured_highlight),
          is_new_arrival: Boolean(prod.is_new_arrival),
          is_best_seller: Boolean(prod.is_best_seller)
        });
        setExistingImages(prod.images || []);
      }
    } catch (err) {
      console.error('Fetch edit product error:', err);
      setError('Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [id]);

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
        setError(`File "${file.name}" has an unsupported format.`);
        return;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    setError(null);
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setNewPreviews(prev => [...prev, ...validPreviews]);
  };

  const removeNewFile = (index) => {
    URL.revokeObjectURL(newPreviews[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (imageId) => {
    if (!window.confirm('Delete this image from product gallery?')) return;
    try {
      const res = await api.deleteProductImage(id, imageId);
      if (res.success) {
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
      }
    } catch (err) {
      console.error('Delete image error:', err);
      alert('Failed to delete image.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      selectedFiles.forEach(file => {
        data.append('images', file);
      });

      const res = await api.updateProduct(id, data);

      if (res.success) {
        alert('Product updated successfully!');
        navigate('/admin/products');
      } else {
        setError(res.message || 'Failed to update product.');
      }
    } catch (err) {
      console.error('Update product error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save product updates.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading product attributes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-amber-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Products</span>
      </Link>

      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight gold-gradient-text">
          EDIT PRODUCT
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Editing product ID #{id}: {formData.name}
        </p>
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
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-amber-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">SKU Code *</label>
            <input
              type="text"
              name="sku"
              required
              value={formData.sku}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-amber-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Category *</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-amber-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Price (PKR) *</label>
            <input
              type="number"
              step="1"
              name="price"
              required
              value={formData.price}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-amber-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Stock Quantity *</label>
            <input
              type="number"
              name="stock_quantity"
              required
              value={formData.stock_quantity}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-amber-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Discount (%)</label>
            <input
              type="number"
              name="discount_percentage"
              value={formData.discount_percentage}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-amber-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Full Description</label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-amber-500/30 rounded-xl p-4 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Product Badges & Featured Highlight */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/20 space-y-3">
          <span className="block text-xs font-bold text-amber-300 uppercase tracking-wider">Product Highlights & Badges</span>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-xs font-bold text-violet-300 cursor-pointer bg-violet-950/40 border border-violet-500/30 px-3 py-1.5 rounded-xl hover:border-violet-400 transition-colors">
              <input
                type="checkbox"
                name="is_featured_highlight"
                checked={formData.is_featured_highlight}
                onChange={handleChange}
                className="accent-violet-500 w-4 h-4 cursor-pointer"
              />
              <span>★ Homepage Featured Highlight (Max 1)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="accent-amber-400 w-4 h-4 cursor-pointer"
              />
              <span>Featured Product</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                name="is_new_arrival"
                checked={formData.is_new_arrival}
                onChange={handleChange}
                className="accent-amber-400 w-4 h-4 cursor-pointer"
              />
              <span>New Arrival</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                name="is_best_seller"
                checked={formData.is_best_seller}
                onChange={handleChange}
                className="accent-amber-400 w-4 h-4 cursor-pointer"
              />
              <span>Best Seller</span>
            </label>
          </div>
          <p className="text-[11px] text-slate-400">
            Note: <strong>Homepage Featured Highlight</strong> poore store mein sirf 1 product par set ho sakta hai. Agar aap is product ko chunenge to pehle wala product khud ba khud hat jayega.
          </p>
        </div>

        {/* Existing Images Gallery */}
        {existingImages.length > 0 && (
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Current Uploaded Images</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {existingImages.map(img => (
                <div key={img.id} className="relative glass-card gold-border-glow rounded-xl p-2 group">
                  <ProductImage imageUrl={img.image_url} className="h-24" />
                  <button
                    type="button"
                    onClick={() => handleDeleteExistingImage(img.id)}
                    className="absolute top-3 right-3 bg-red-950 text-red-300 p-1.5 rounded-lg border border-red-500/40 hover:bg-red-900 transition-colors"
                    title="Delete image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload New Additional Images */}
        <div className="space-y-4 pt-4 border-t border-amber-500/20">
          <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
            Upload Additional Images
          </label>
          <div className="border-2 border-dashed border-amber-500/30 hover:border-amber-400 rounded-2xl p-6 text-center bg-slate-900/40 relative cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <ImageIcon className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="text-xs font-bold text-slate-200 mt-2">Click to select new image files</p>
          </div>

          {newPreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {newPreviews.map((src, idx) => (
                <div key={idx} className="relative glass-card gold-border-glow rounded-xl p-2">
                  <img src={src} alt="New Preview" className="w-full h-24 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeNewFile(idx)}
                    className="absolute top-3 right-3 bg-red-950/80 text-red-300 p-1 rounded-full border border-red-500/40"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-xl gold-gradient-bg text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Saving Updates...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>

      </form>

    </div>
  );
}
