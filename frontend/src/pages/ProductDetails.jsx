import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useShop } from '../context/ShopContext';
import ProductImage from '../components/ProductImage';
import { formatCurrency } from '../utils/formatCurrency';
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Plus, 
  Minus, 
  ArrowLeft,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, wishlist, toggleWishlist } = useShop();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs');
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);

  const fetchProductDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProductById(id);
      if (res.success && res.data) {
        setProduct(res.data);
        // Initialize default primary image
        const primary = res.data.primary_image || res.data.image_url || res.data.image || (res.data.images && res.data.images[0]?.image_url);
        setSelectedImage(primary);
      } else {
        setError('Product not found.');
      }
    } catch (err) {
      console.error('Product details API error:', err);
      setError('Unable to load product details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center glass-card gold-border-glow rounded-3xl space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-200">{error || 'Product Not Found'}</h3>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 rounded-xl gold-gradient-bg text-black font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Shop</span>
        </button>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);
  const price = Number(product.price) || 0;
  const oldPrice = Number(product.old_price || product.oldPrice) || 0;
  const discount = product.discount_percentage || product.discount || 0;
  const categoryName = product.category_name || product.category || 'Electronics';

  const defaultImage = product.primary_image || product.image_url || product.image || (product.images && product.images[0]?.image_url);
  const imagesList = product.images && product.images.length > 0
    ? product.images.map(img => typeof img === 'string' ? img : img.image_url)
    : (defaultImage ? [defaultImage] : []);

  const currentMainImage = selectedImage || defaultImage;
  const zoomImageSrc = currentMainImage && (currentMainImage.startsWith('http')
    ? currentMainImage
    : currentMainImage.startsWith('/')
      ? `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : 'http://localhost:5000'}${currentMainImage}`
      : null);

  const handleImagePointerMove = (event) => {
    if (!zoomImageSrc) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100));
    setZoomPosition({ x, y });
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    alert(`Added ${quantity}x ${product.name} to cart.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-6 sm:space-y-12">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-amber-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Products</span>
      </button>

      {/* Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Product Graphic */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-card gold-border-glow p-4 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden">
            <div
              className="relative"
              onMouseEnter={() => setIsZooming(Boolean(zoomImageSrc))}
              onMouseMove={handleImagePointerMove}
              onMouseLeave={() => setIsZooming(false)}
            >
              <ProductImage imageUrl={currentMainImage} productId={product.id} category={categoryName} className="h-64 sm:h-80 md:h-96" iconSize={100} />
              {zoomImageSrc && (
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 hidden rounded-2xl border border-violet-400/40 bg-no-repeat shadow-[0_0_30px_rgba(124,58,237,0.25)] transition-opacity duration-150 lg:block ${isZooming ? 'opacity-100' : 'opacity-0'}`}
                  style={{
                    backgroundImage: `url(${zoomImageSrc})`,
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    backgroundSize: '200%'
                  }}
                />
              )}
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2">
              {discount > 0 && (
                <span className="px-2.5 py-1 rounded-lg gold-gradient-bg text-black font-black text-[11px] sm:text-xs uppercase tracking-wider">
                  -{discount}% OFF
                </span>
              )}
              {product.is_new_arrival === 1 && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-[11px] sm:text-xs uppercase">
                  NEW DROP
                </span>
              )}
            </div>
          </div>

          {/* Real Uploaded Image Thumbnails Selector */}
          {imagesList.length > 0 && (
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              {imagesList.map((imgUrl, thumbIdx) => (
                <div
                  key={thumbIdx}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`glass-card p-1.5 sm:p-2 rounded-xl sm:rounded-2xl cursor-pointer transition-all border ${
                    (currentMainImage === imgUrl)
                      ? 'border-amber-400 opacity-100 shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                      : 'border-amber-500/20 opacity-60 hover:opacity-100 hover:border-amber-500/40'
                  }`}
                >
                  <ProductImage imageUrl={imgUrl} productId={product.id} category={categoryName} className="h-14 sm:h-16" iconSize={24} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details, Pricing & CTAs */}
        <div className="lg:col-span-6 space-y-6 sm:space-y-8">
          
          <div className="space-y-2 sm:space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
              {categoryName}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400 pt-1">
              <div className="flex text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#D4AF37]" />
                ))}
              </div>
              <span className="font-bold text-slate-200">{product.rating || 5.0} / 5.0</span>
              <span className="text-emerald-400 font-semibold">• Stock: {product.stock_quantity || product.stock || 10} units</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="glass-card gold-border-glow p-4 sm:p-6 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider block">Price</span>
              <div className="flex items-baseline gap-2 sm:gap-3 mt-1">
                <span className="text-2xl sm:text-3xl font-black font-mono gold-gradient-text">
                  {formatCurrency(price)}
                </span>
                {oldPrice > 0 && (
                  <span className="text-xs sm:text-sm text-slate-500 line-through font-mono">
                    {formatCurrency(oldPrice)}
                  </span>
                )}
              </div>
            </div>

            {discount > 0 && oldPrice > price && (
              <div className="text-right">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Total Savings</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-emerald-300">
                  {formatCurrency(oldPrice - price)}
                </span>
              </div>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity & CTA */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center gap-3 glass-card gold-border-glow px-3 py-1.5 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-mono font-bold text-slate-100 px-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 pt-2">
              <button
                onClick={() => addToCart(product, quantity)}
                className="flex-1 py-3.5 sm:py-4 rounded-xl gold-gradient-bg text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_35px_rgba(212,175,55,0.6)] transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Add to Cart ({quantity})</span>
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleWishlist(product.id);
                }}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                  isWishlisted
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'glass-card gold-border-glow text-slate-400 hover:text-amber-300'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-[#D4AF37] text-[#D4AF37]' : ''}`} />
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 border-t border-amber-500/20 text-center">
            <div className="space-y-1">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 mx-auto" />
              <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-300 block">Fast Delivery</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 block">Express Shipping</span>
            </div>
            <div className="space-y-1">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 mx-auto" />
              <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-300 block">1 Year Warranty</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 block">Official Guarantee</span>
            </div>
            <div className="space-y-1">
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 mx-auto" />
              <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-300 block">7 Days Return</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 block">Hassle-Free Policy</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
