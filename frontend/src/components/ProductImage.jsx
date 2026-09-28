import React, { useState, useEffect } from 'react';
import { 
  Headphones, 
  Watch, 
  Zap, 
  Cable, 
  BatteryCharging, 
  Shield, 
  Smartphone, 
  Cpu, 
  Radio
} from 'lucide-react';

const BACKEND_BASE = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') 
  : 'http://localhost:5000';

const DEFAULT_PRODUCT_IMAGES = {
  1: '/uploads/products/product-1786174016533-471374403.jpeg',
  2: '/uploads/products/product-1786174016536-708287127.jpeg',
  3: '/uploads/products/product-1786174016537-279544776.jpeg',
  4: '/uploads/products/product-1786175200781-154681304.jpeg',
  5: '/uploads/products/product-1786175200789-987261174.jpeg',
  6: '/uploads/products/product-1786175535389-327515189.jpeg',
  7: '/uploads/products/product-1786175535393-397665237.jpeg',
  8: '/uploads/products/product-1786175535394-205742837.jpeg',
  'p9-headset': '/uploads/products/product-1786174016533-471374403.jpeg',
  'p9-wireless-pro-headphones': '/uploads/products/product-1786174016533-471374403.jpeg',
  'pro2-airpods': '/uploads/products/product-1786174016536-708287127.jpeg',
  'pro2-noise-canceling-earbuds': '/uploads/products/product-1786174016536-708287127.jpeg',
  'ultra-watch-9': '/uploads/products/product-1786174016537-279544776.jpeg',
  'ultra-smart-watch-9-gold-edition': '/uploads/products/product-1786174016537-279544776.jpeg',
  'gan-charger-65w': '/uploads/products/product-1786175200781-154681304.jpeg',
  '65w-gan-fast-wall-charger': '/uploads/products/product-1786175200781-154681304.jpeg',
  'braided-usbc-240w': '/uploads/products/product-1786175200789-987261174.jpeg',
  'braided-usbc-to-usbc-cable-240w': '/uploads/products/product-1786175200789-987261174.jpeg',
  'magnetic-powerbank-20k': '/uploads/products/product-1786175535389-327515189.jpeg',
  '20000mah-magsafe-power-bank': '/uploads/products/product-1786175535389-327515189.jpeg',
  'titanium-armor-case': '/uploads/products/product-1786175535393-397665237.jpeg',
  'titanium-magsafe-armor-case': '/uploads/products/product-1786175535393-397665237.jpeg',
  'magnetic-wireless-pad': '/uploads/products/product-1786175535394-205742837.jpeg',
  'dual-magnetic-wireless-charger': '/uploads/products/product-1786175535394-205742837.jpeg'
};

export default function ProductImage({ imageUrl, productId, category, className = "h-48", iconSize = 48 }) {
  const [imgError, setImgError] = useState(false);

  // Resolve target image: explicit prop image if valid string (path or HTTP URL), or fallback mapping by product ID/slug
  const validPropImage = (imageUrl && typeof imageUrl === 'string' && (imageUrl.startsWith('/') || imageUrl.startsWith('http')))
    ? imageUrl
    : null;

  const defaultMappedImage = DEFAULT_PRODUCT_IMAGES[productId] || DEFAULT_PRODUCT_IMAGES[String(productId || '').toLowerCase()];
  const targetImage = validPropImage || defaultMappedImage;

  useEffect(() => {
    setImgError(false);
  }, [targetImage]);

  // If a real uploaded image path/URL is available and has not errored, display it
  if (targetImage && !imgError) {
    const src = targetImage.startsWith('http') ? targetImage : `${BACKEND_BASE}${targetImage}`;
    return (
      <div className={`w-full ${className} rounded-2xl bg-slate-900 border border-amber-500/20 overflow-hidden flex items-center justify-center relative group`}>
        <img 
          src={src} 
          alt="Product" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgError(true)}
        />
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
      </div>
    );
  }

  // Fallback SVG graphic if no uploaded image exists or image genuinely fails to load
  const getIcon = () => {
    const key = (category || String(productId || '')).toLowerCase().trim();

    switch (key) {
      case 'p9-headset':
      case 'audio':
        return <Headphones className="text-amber-300 drop-shadow-[0_0_20px_rgba(212,175,55,0.6)]" size={iconSize} />;
      case 'pro2-airpods':
        return <Radio className="text-[#F5D77F] drop-shadow-[0_0_20px_rgba(245,215,127,0.6)]" size={iconSize} />;
      case 'ultra-watch-9':
      case 'smart watches':
      case 'smart-watches':
        return <Watch className="text-amber-400 drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]" size={iconSize} />;
      case 'gan-charger-65w':
      case 'chargers':
        return <Zap className="text-yellow-300 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)]" size={iconSize} />;
      case 'braided-usbc-240w':
      case 'cables':
        return <Cable className="text-amber-200 drop-shadow-[0_0_20px_rgba(253,230,138,0.6)]" size={iconSize} />;
      case 'magnetic-powerbank-20k':
      case 'power banks':
      case 'power-banks':
        return <BatteryCharging className="text-amber-400 drop-shadow-[0_0_20px_rgba(212,175,55,0.6)]" size={iconSize} />;
      case 'titanium-armor-case':
      case 'phone cases':
      case 'phone-cases':
        return <Shield className="text-amber-300 drop-shadow-[0_0_20px_rgba(212,175,55,0.6)]" size={iconSize} />;
      case 'magnetic-wireless-pad':
      case 'electronics':
        return <Cpu className="text-yellow-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)]" size={iconSize} />;
      default:
        return <Smartphone className="text-amber-300" size={iconSize} />;
    }
  };

  return (
    <div className={`w-full ${className} rounded-2xl bg-gradient-to-br from-slate-900/90 via-[#0F0F14] to-black border border-amber-500/20 flex flex-col items-center justify-center relative overflow-hidden group`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.12)_0,transparent_70%)] pointer-events-none" />
      <div className="w-32 h-32 rounded-full border border-amber-500/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-500" />
      <div className="z-10 transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
        {getIcon()}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
    </div>
  );
}

