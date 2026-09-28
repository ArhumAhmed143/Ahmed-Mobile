export const CATEGORIES = [
  { id: 'audio', name: 'Audio', iconName: 'Headphones', count: '24 Products', description: 'Studio-grade headphones, earbuds & speakers' },
  { id: 'chargers', name: 'Chargers', iconName: 'Zap', count: '18 Products', description: 'GaN ultra-fast adapters & wireless pads' },
  { id: 'cables', name: 'Cables', iconName: 'Cable', count: '15 Products', description: 'High-speed braided 240W cables' },
  { id: 'power-banks', name: 'Power Banks', iconName: 'BatteryCharging', count: '12 Products', description: 'Magnetic wireless & high-capacity power banks' },
  { id: 'phone-cases', name: 'Phone Cases', iconName: 'Shield', count: '30 Products', description: 'Titanium armor & mag-safe luxury cases' },
  { id: 'smart-watches', name: 'Smart Watches', iconName: 'Watch', count: '10 Products', description: 'Fitness trackers & luxury smartwatches' },
  { id: 'accessories', name: 'Mobile Accessories', iconName: 'Smartphone', count: '22 Products', description: 'Camera lenses, stands & car mounts' },
  { id: 'electronics', name: 'Electronics', iconName: 'Cpu', count: '16 Products', description: 'Smart gadgets & desk accessories' },
];

export const PRODUCTS = [
  {
    id: 'p9-headset',
    name: 'P9 Wireless Pro Headphones',
    category: 'Audio',
    price: 149.99,
    oldPrice: 199.99,
    discount: 25,
    rating: 4.9,
    reviewsCount: 128,
    isNew: true,
    isBestSeller: true,
    isFlashDeal: true,
    flashEndHours: 8,
    stock: 14,
    image: '🎧',
    primary_image: '/uploads/products/product-1786174016533-471374403.jpeg',
    image_url: '/uploads/products/product-1786174016533-471374403.jpeg',
    bgGradient: 'from-amber-500/20 via-slate-900 to-black',
    accentColor: '#D4AF37',
    description: 'Experience immersive spatial audio with active noise cancellation, handcrafted memory foam ear cushions, and up to 40 hours of battery life.',
    specs: {
      'Driver Size': '40mm Custom Dynamic',
      'Battery Life': 'Up to 40 Hours (ANC On)',
      'Connectivity': 'Bluetooth 5.3 + 3.5mm Aux',
      'Weight': '285g',
      'Warranty': '2 Years Official Warranty'
    }
  },
  {
    id: 'pro2-airpods',
    name: 'Pro2 Noise-Canceling Earbuds',
    category: 'Audio',
    price: 129.99,
    oldPrice: 159.99,
    discount: 19,
    rating: 4.8,
    reviewsCount: 94,
    isNew: false,
    isBestSeller: true,
    isFlashDeal: false,
    stock: 22,
    image: '🎵',
    primary_image: '/uploads/products/product-1786174016536-708287127.jpeg',
    image_url: '/uploads/products/product-1786174016536-708287127.jpeg',
    bgGradient: 'from-yellow-500/20 via-slate-900 to-black',
    accentColor: '#F5D77F',
    description: 'Next-generation acoustic architecture with transparent ambient sound mode, customizable touch controls, and MagSafe wireless charging case.',
    specs: {
      'Audio Tech': 'Active Noise Cancellation + Transparency',
      'Battery Life': '6 Hrs (Earbuds) + 24 Hrs (Case)',
      'Water Resistance': 'IPX4 Sweat & Water Resistant',
      'Microphone': 'Quad Beamforming Mics',
      'Warranty': '1 Year Official Warranty'
    }
  },
  {
    id: 'ultra-watch-9',
    name: 'Ultra Smart Watch 9 Gold Edition',
    category: 'Smart Watches',
    price: 249.99,
    oldPrice: 299.99,
    discount: 17,
    rating: 5.0,
    reviewsCount: 210,
    isNew: true,
    isBestSeller: true,
    isFlashDeal: true,
    flashEndHours: 5,
    stock: 8,
    image: '⌚',
    primary_image: '/uploads/products/product-1786174016537-279544776.jpeg',
    image_url: '/uploads/products/product-1786174016537-279544776.jpeg',
    bgGradient: 'from-amber-600/20 via-slate-900 to-black',
    accentColor: '#FFD700',
    description: 'Aerospace-grade titanium chassis with a stunning 2.1-inch Always-On Retina AMOLED display, dual-frequency GPS, and bio-sensor suite.',
    specs: {
      'Display': '2.1" AMOLED (2000 nits peak brightness)',
      'Case Material': 'Titanium Alloy + Gold Bezel',
      'Battery Life': '7 Days Typical Usage',
      'Sensors': 'ECG, SpO2, Heart Rate, Temperature',
      'Water Resistance': '100m Water Resistant'
    }
  },
  {
    id: 'gan-charger-65w',
    name: '65W GaN Fast Wall Charger',
    category: 'Chargers',
    price: 49.99,
    oldPrice: 69.99,
    discount: 28,
    rating: 4.7,
    reviewsCount: 86,
    isNew: false,
    isBestSeller: false,
    isFlashDeal: true,
    flashEndHours: 12,
    stock: 35,
    image: '🔌',
    primary_image: '/uploads/products/product-1786175200781-154681304.jpeg',
    image_url: '/uploads/products/product-1786175200781-154681304.jpeg',
    bgGradient: 'from-yellow-600/20 via-slate-900 to-black',
    accentColor: '#D4AF37',
    description: 'Ultra-compact Gallium Nitride (GaN) technology capable of charging laptops, phones, and tablets simultaneously with 3 multi-ports.',
    specs: {
      'Output Power': '65W Max Total Power',
      'Ports': '2x USB-C Power Delivery + 1x USB-A QC 4.0',
      'Technology': 'GaN III Semiconductor',
      'Safety': 'Over-voltage & Thermal Protection',
      'Compatibility': 'MacBook, iPhone, Android, iPad'
    }
  },
  {
    id: 'braided-usbc-240w',
    name: 'Braided USB-C to USB-C Cable (240W)',
    category: 'Cables',
    price: 24.99,
    oldPrice: 34.99,
    discount: 28,
    rating: 4.9,
    reviewsCount: 142,
    isNew: true,
    isBestSeller: false,
    isFlashDeal: false,
    stock: 50,
    image: '🧵',
    primary_image: '/uploads/products/product-1786175200789-987261174.jpeg',
    image_url: '/uploads/products/product-1786175200789-987261174.jpeg',
    bgGradient: 'from-amber-400/20 via-slate-900 to-black',
    accentColor: '#F5D77F',
    description: 'Gold-plated zinc alloy connectors with kevlar-reinforced nylon braiding. Supports up to 240W PD fast charging and 40Gbps data sync.',
    specs: {
      'Length': '2 Meters / 6.6 Feet',
      'Power Rating': '240W (48V / 5A) Power Delivery 3.1',
      'Data Transfer': 'Up to 40Gbps (USB4)',
      'Durability': '30,000+ Bend Lifespan',
      'Material': 'Gold-Plated Connectors & Kevlar Weave'
    }
  },
  {
    id: 'magnetic-powerbank-20k',
    name: '20,000mAh MagSafe Power Bank',
    category: 'Power Banks',
    price: 79.99,
    oldPrice: 99.99,
    discount: 20,
    rating: 4.8,
    reviewsCount: 79,
    isNew: false,
    isBestSeller: true,
    isFlashDeal: true,
    flashEndHours: 3,
    stock: 19,
    image: '🔋',
    primary_image: '/uploads/products/product-1786175535389-327515189.jpeg',
    image_url: '/uploads/products/product-1786175535389-327515189.jpeg',
    bgGradient: 'from-amber-500/20 via-slate-900 to-black',
    accentColor: '#D4AF37',
    description: 'High-density lithium polymer power bank featuring 15W wireless MagSafe attachment and 22.5W USB-C bi-directional fast charging.',
    specs: {
      'Capacity': '20,000mAh / 74Wh',
      'Wireless Output': '15W MagSafe Magnetic',
      'Wired Output': '22.5W Power Delivery USB-C',
      'Display': 'Digital LED Battery Percentage Indicator',
      'Safety Cert': 'CE, FCC, RoHS Certified'
    }
  },
  {
    id: 'titanium-armor-case',
    name: 'Titanium MagSafe Armor Case',
    category: 'Phone Cases',
    price: 39.99,
    oldPrice: 49.99,
    discount: 20,
    rating: 4.9,
    reviewsCount: 165,
    isNew: true,
    isBestSeller: true,
    isFlashDeal: false,
    stock: 40,
    image: '📱',
    primary_image: '/uploads/products/product-1786175535393-397665237.jpeg',
    image_url: '/uploads/products/product-1786175535393-397665237.jpeg',
    bgGradient: 'from-yellow-400/20 via-slate-900 to-black',
    accentColor: '#FFD700',
    description: 'Military-grade 15ft drop protection with brushed metallic gold frame accents, tactile responsive alloy buttons, and strong N52 magnet ring.',
    specs: {
      'Material': 'Polycarbonate + TPU + Brushed Metallic Gold Accent',
      'Drop Protection': '15 Feet (MIL-STD-810G)',
      'Magnets': '38x N52 Neodymium Magnets Built-In',
      'Screen/Camera': '1.8mm Raised Bezel Protection',
      'Compatibility': 'iPhone 15/16 Series & Galaxy S24 Series'
    }
  },
  {
    id: 'magnetic-wireless-pad',
    name: 'Dual Magnetic Wireless Charger',
    category: 'Electronics',
    price: 59.99,
    oldPrice: 79.99,
    discount: 25,
    rating: 4.7,
    reviewsCount: 53,
    isNew: true,
    isBestSeller: false,
    isFlashDeal: false,
    stock: 15,
    image: '⚡',
    primary_image: '/uploads/products/product-1786175535394-205742837.jpeg',
    image_url: '/uploads/products/product-1786175535394-205742837.jpeg',
    bgGradient: 'from-amber-600/20 via-slate-900 to-black',
    accentColor: '#D4AF37',
    description: 'Sleek aluminum stand that simultaneously charges your phone and earbuds with intelligent temperature management.',
    specs: {
      'Charging Pads': '15W Magnetic Stand + 5W Earbud Pad',
      'Structure': 'CNC Machined Aluminum & Soft Silicone',
      'LED Indicator': 'Subtle Breathing Gold Status Light',
      'Input': '9V/3A, 12V/2A USB-C',
      'Warranty': '1 Year Replacement Warranty'
    }
  }
];

export const REVIEWS = [
  {
    id: 1,
    name: 'Alexander V.',
    role: 'Verified Buyer',
    rating: 5,
    date: '2 days ago',
    comment: 'The P9 Headset sound quality blew me away! The gold accents look super sleek in person. Delivery took less than 48 hours.',
    productName: 'P9 Wireless Pro Headphones'
  },
  {
    id: 2,
    name: 'Sophia M.',
    role: 'Verified Buyer',
    rating: 5,
    date: '1 week ago',
    comment: 'Ahmed Moblie is hands down the best store for premium accessories. The Ultra Smart Watch 9 looks like a luxury timepiece!',
    productName: 'Ultra Smart Watch 9 Gold Edition'
  },
  {
    id: 3,
    name: 'Marcus K.',
    role: 'Verified Buyer',
    rating: 5,
    date: '2 weeks ago',
    comment: 'The 65W GaN charger is surprisingly compact and charges my MacBook Pro and iPhone ultra fast. 10/10 build quality.',
    productName: '65W GaN Fast Wall Charger'
  },
  {
    id: 4,
    name: 'Elena R.',
    role: 'Verified Buyer',
    rating: 5,
    date: '3 weeks ago',
    comment: 'Titanium Armor Case feels extremely solid and luxury gold border matches my phone perfectly. Very satisfied with customer service.',
    productName: 'Titanium MagSafe Armor Case'
  }
];

export const FEATURES = [
  {
    id: 1,
    title: 'Premium Quality',
    description: 'Crafted with aerospace-grade alloys, kevlar weaves & high-grade acoustic components.',
    iconName: 'ShieldCheck'
  },
  {
    id: 2,
    title: 'Trusted Brand',
    description: 'Over 50,000+ satisfied tech enthusiasts around the globe with 4.9/5 overall rating.',
    iconName: 'Award'
  },
  {
    id: 3,
    title: 'Fast & Safe Delivery',
    description: 'Express tracked shipping with insured protective luxury packaging.',
    iconName: 'Truck'
  },
  {
    id: 4,
    title: '24/7 VIP Support',
    description: 'Dedicated customer concierge to assist with setup, warranties, and inquiries.',
    iconName: 'Headphones'
  }
];
