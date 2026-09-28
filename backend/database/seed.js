const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { connectDatabase } = require('../src/config/db');
const { Category, Product } = require('../src/models');

const categories = [
  { name: 'Audio', slug: 'audio', description: 'Studio-grade headphones, earbuds & speakers', image: '🎧' },
  { name: 'Chargers', slug: 'chargers', description: 'GaN ultra-fast adapters & wireless pads', image: '🔌' },
  { name: 'Cables', slug: 'cables', description: 'High-speed braided 240W cables', image: '🧵' },
  { name: 'Power Banks', slug: 'power-banks', description: 'Magnetic wireless & high-capacity power banks', image: '🔋' },
  { name: 'Phone Cases', slug: 'phone-cases', description: 'Titanium armor & mag-safe luxury cases', image: '📱' },
  { name: 'Smart Watches', slug: 'smart-watches', description: 'Fitness trackers & luxury smartwatches', image: '⌚' },
  { name: 'Mobile Accessories', slug: 'mobile-accessories', description: 'Camera lenses, stands & car mounts', image: '🤳' },
  { name: 'Electronics', slug: 'electronics', description: 'Smart gadgets & desk accessories', image: '⚡' }
];

const products = [
  { name: 'P9 Wireless Pro Headphones', slug: 'p9-wireless-pro-headphones', description: 'Immersive spatial audio, active noise cancellation, memory foam cushions, and up to 40 hours of battery life.', short_description: 'Spatial audio, ANC & memory foam cushions.', price: 149.99, old_price: 199.99, discount_percentage: 25, stock_quantity: 14, sku: 'NEX-AUD-P9', category: 'audio', rating: 4.9, is_featured: 1, is_new_arrival: 1, is_best_seller: 1, image: 'product-1786174016533-471374403.jpeg' },
  { name: 'Pro2 Noise-Canceling Earbuds', slug: 'pro2-noise-canceling-earbuds', description: 'Active noise cancellation, transparent ambient mode, customizable touch controls, and wireless charging case.', short_description: 'ANC, transparency mode & wireless case.', price: 129.99, old_price: 159.99, discount_percentage: 19, stock_quantity: 22, sku: 'NEX-AUD-PRO2', category: 'audio', rating: 4.8, is_featured: 1, is_new_arrival: 0, is_best_seller: 1, image: 'product-1786174016536-708287127.jpeg' },
  { name: 'Ultra Smart Watch 9 Gold Edition', slug: 'ultra-smart-watch-9-gold-edition', description: 'Titanium chassis, 2.1-inch AMOLED display, dual-frequency GPS, and bio-sensor suite.', short_description: 'AMOLED display, titanium chassis & GPS.', price: 249.99, old_price: 299.99, discount_percentage: 17, stock_quantity: 8, sku: 'NEX-WAT-ULTRA9', category: 'smart-watches', rating: 5, is_featured: 1, is_new_arrival: 1, is_best_seller: 1, image: 'product-1786174016537-279544776.jpeg' },
  { name: '65W GaN Fast Wall Charger', slug: '65w-gan-fast-wall-charger', description: 'Compact GaN charger for laptops, phones, and tablets with three ports.', short_description: 'GaN III technology with three ports.', price: 49.99, old_price: 69.99, discount_percentage: 28, stock_quantity: 35, sku: 'NEX-CHG-65W', category: 'chargers', rating: 4.7, is_featured: 0, is_new_arrival: 0, is_best_seller: 1, image: 'product-1786175200781-154681304.jpeg' },
  { name: 'Braided USB-C to USB-C Cable (240W)', slug: 'braided-usbc-to-usbc-cable-240w', description: 'Braided 240W Power Delivery cable with 40Gbps data sync.', short_description: '240W Power Delivery with 40Gbps sync.', price: 24.99, old_price: 34.99, discount_percentage: 28, stock_quantity: 50, sku: 'NEX-CBL-240W', category: 'cables', rating: 4.9, is_featured: 0, is_new_arrival: 1, is_best_seller: 0, image: 'product-1786175200789-987261174.jpeg' },
  { name: '20,000mAh MagSafe Power Bank', slug: '20000mah-magsafe-power-bank', description: '20,000mAh capacity, 15W magnetic wireless charging, and USB-C fast charging.', short_description: '20,000mAh with 15W magnetic wireless charging.', price: 79.99, old_price: 99.99, discount_percentage: 20, stock_quantity: 19, sku: 'NEX-PWR-20K', category: 'power-banks', rating: 4.8, is_featured: 1, is_new_arrival: 0, is_best_seller: 1, image: 'product-1786175535389-327515189.jpeg' },
  { name: 'Titanium MagSafe Armor Case', slug: 'titanium-magsafe-armor-case', description: 'Drop protection with brushed metallic accents, responsive alloy buttons, and magnetic ring.', short_description: 'Protective case with metallic accents.', price: 39.99, old_price: 49.99, discount_percentage: 20, stock_quantity: 40, sku: 'NEX-CSE-TITAN', category: 'phone-cases', rating: 4.9, is_featured: 1, is_new_arrival: 1, is_best_seller: 1, image: 'product-1786175535393-397665237.jpeg' },
  { name: 'Dual Magnetic Wireless Charger', slug: 'dual-magnetic-wireless-charger', description: 'Aluminum stand that charges a phone and earbuds simultaneously with temperature management.', short_description: 'Dual charging stand for phone and earbuds.', price: 59.99, old_price: 79.99, discount_percentage: 25, stock_quantity: 15, sku: 'NEX-ELE-DUALPAD', category: 'electronics', rating: 4.7, is_featured: 0, is_new_arrival: 1, is_best_seller: 0, image: 'product-1786175535394-205742837.jpeg' }
];

async function seedDatabase() {
  try {
    await connectDatabase();
    const categoryBySlug = {};
    for (const category of categories) {
      let saved = await Category.findOne({ slug: category.slug });
      if (saved) {
        saved.name = category.name;
        saved.description = category.description;
        await saved.save();
      } else {
        saved = await Category.create(category);
      }
      categoryBySlug[category.slug] = saved._id;
    }

    for (const product of products) {
      const { category, image, ...fields } = product;
      let saved = await Product.findOne({ sku: product.sku });
      if (saved) {
        saved.price = fields.price;
        saved.stock_quantity = fields.stock_quantity;
        saved.rating = fields.rating;
        await saved.save();
      } else {
        await Product.create({
          ...fields,
          brand: 'Ahmed Moblie',
          category_id: categoryBySlug[category],
          is_active: 1,
          images: [{ image_url: `/uploads/products/${image}`, is_primary: 1 }]
        });
      }
    }
    console.log(`Seeded ${categories.length} categories and ${products.length} products in MongoDB.`);
  } catch (error) {
    console.error('MongoDB seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
  }
}

if (require.main === module) seedDatabase();

module.exports = { seedDatabase };