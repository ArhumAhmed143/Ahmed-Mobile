const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { Category, FlashDeal, Product } = require('../models');

function slugify(text) {
  return `${text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-')}-${Date.now().toString().slice(-4)}`;
}

function isEnabled(value) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function productWithImages(product) {
  const value = product.toJSON ? product.toJSON() : product;
  const images = [...(value.images || [])]
    .map((image) => ({ ...image, id: String(image._id || image.id), _id: undefined }))
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
  const primaryImage = images[0]?.image_url || null;
  return {
    ...value,
    id: String(value._id || value.id),
    _id: undefined,
    __v: undefined,
    images,
    primary_image: primaryImage,
    image_url: primaryImage,
    image: primaryImage
  };
}

function removeUploadedImage(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith('/uploads/products/')) return;
  const filePath = path.join(__dirname, '../../uploads/products', path.basename(imageUrl));
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (error) => {
      if (error) console.warn('Image file deletion warning:', error.message);
    });
  }
}

function uploadedImages(files, hasPrimary = false) {
  return (files || []).map((file, index) => ({
    image_url: `/uploads/products/${file.filename}`,
    is_primary: !hasPrimary && index === 0 ? 1 : 0
  }));
}

async function getProducts(req, res, query = req.query) {
  try {
    const { search, category, minPrice, maxPrice, sort, featured, newArrival, bestSeller, deals } = query;
    const filter = { is_active: 1 };

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      filter.$or = [{ name: searchRegex }, { sku: searchRegex }, { brand: searchRegex }, { description: searchRegex }];
    }
    if (category) {
      let categoryRecord = null;
      if (mongoose.isValidObjectId(category)) categoryRecord = await Category.findById(category).select('_id');
      if (!categoryRecord) {
        const escaped = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        categoryRecord = await Category.findOne({ $or: [{ slug: category }, { name: new RegExp(escaped, 'i') }] }).select('_id');
      }
      filter.category_id = categoryRecord ? categoryRecord._id : null;
    }
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    if (isEnabled(featured)) filter.is_featured = 1;
    if (isEnabled(newArrival)) filter.is_new_arrival = 1;
    if (isEnabled(bestSeller)) filter.is_best_seller = 1;
    if (isEnabled(deals)) {
      filter.$and = [...(filter.$and || []), {
        $or: [{ is_deal: 1 }, { $expr: { $gt: ['$old_price', '$price'] } }]
      }];
    }

    const sortBy = { price_asc: { price: 1 }, price_desc: { price: -1 }, rating: { rating: -1 }, newest: { created_at: -1 } }[sort] || { created_at: -1 };
    const products = await Product.find(filter).sort(sortBy).lean();
    const categoryIds = [...new Set(products.map((product) => product.category_id ? String(product.category_id) : null).filter(Boolean))];
    const categories = await Category.find({ _id: { $in: categoryIds } }).select('name').lean();
    const categoryNames = new Map(categories.map((item) => [String(item._id), item.name]));
    const data = products.map((product) => {
      const view = productWithImages(product);
      return { ...view, category_name: categoryNames.get(String(product.category_id)) || null };
    });
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
}

async function getFeaturedProducts(req, res) {
  return getProducts(req, res, { ...req.query, featured: '1' });
}

async function getNewArrivals(req, res) {
  return getProducts(req, res, { ...req.query, newArrival: '1' });
}

async function getBestSellers(req, res) {
  return getProducts(req, res, { ...req.query, bestSeller: '1' });
}

async function getProductsByCategory(req, res) {
  return getProducts(req, res, { ...req.query, category: req.params.categoryId });
}

async function getProductById(req, res) {
  const { id } = req.params;
  try {
    const query = mongoose.isValidObjectId(id)
      ? { _id: id }
      : { $or: [{ slug: id }, { sku: id }] };
    const product = await Product.findOne(query);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const data = productWithImages(product);
    if (product.category_id) {
      const category = await Category.findById(product.category_id).select('name');
      data.category_name = category?.name || null;
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
}

async function createProduct(req, res) {
  const {
    name, sku, brand = 'Ahmed Moblie', category_id, price, old_price,
    discount_percentage = 0, stock_quantity = 0, short_description = '', description = '',
    is_featured = 0, is_new_arrival = 0, is_best_seller = 0
  } = req.body;

  if (!name || !String(name).trim()) return res.status(400).json({ success: false, message: 'Product name is required.' });
  if (!sku || !String(sku).trim()) return res.status(400).json({ success: false, message: 'SKU code is required.' });
  if (!Number.isFinite(Number(price)) || Number(price) < 0) return res.status(400).json({ success: false, message: 'Price must be a valid non-negative number.' });
  if (!Number.isFinite(Number(stock_quantity)) || Number(stock_quantity) < 0) return res.status(400).json({ success: false, message: 'Stock quantity must be a non-negative integer.' });

  try {
    if (await Product.exists({ sku: String(sku).trim() })) return res.status(400).json({ success: false, message: 'SKU already exists.' });
    const category = category_id && mongoose.isValidObjectId(category_id) ? await Category.findById(category_id).select('_id') : null;
    const product = await Product.create({
      name: String(name).trim(),
      slug: slugify(name),
      description,
      short_description,
      price: Number(price),
      old_price: old_price ? Number(old_price) : null,
      discount_percentage: Number(discount_percentage) || 0,
      stock_quantity: Math.floor(Number(stock_quantity)),
      sku: String(sku).trim(),
      brand,
      category_id: category?._id || null,
      is_featured: isEnabled(is_featured) ? 1 : 0,
      is_new_arrival: isEnabled(is_new_arrival) ? 1 : 0,
      is_best_seller: isEnabled(is_best_seller) ? 1 : 0,
      is_active: 1,
      images: uploadedImages(req.files)
    });
    return res.status(201).json({ success: true, message: 'Product created successfully', productId: product.id });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'SKU or product slug already exists.' });
    return res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
}

async function updateProduct(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ success: false, message: 'Product not found' });
  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const { name, sku, brand = 'Ahmed Moblie', category_id, price, old_price, discount_percentage, stock_quantity,
      short_description, description, is_featured, is_new_arrival, is_best_seller } = req.body;

    if (sku && await Product.exists({ sku: String(sku).trim(), _id: { $ne: id } })) {
      return res.status(400).json({ success: false, message: 'SKU already exists.' });
    }
    if (name !== undefined) {
      product.name = name;
      product.slug = slugify(name);
    }
    if (sku !== undefined) product.sku = String(sku).trim();
    if (brand !== undefined) product.brand = brand;
    if (category_id !== undefined) {
      product.category_id = mongoose.isValidObjectId(category_id) ? category_id : null;
    }
    if (price !== undefined) product.price = Number(price);
    if (old_price !== undefined) product.old_price = old_price === '' ? null : Number(old_price);
    if (discount_percentage !== undefined) product.discount_percentage = Number(discount_percentage) || 0;
    if (stock_quantity !== undefined) product.stock_quantity = Math.max(0, Math.floor(Number(stock_quantity) || 0));
    if (short_description !== undefined) product.short_description = short_description;
    if (description !== undefined) product.description = description;
    if (is_featured !== undefined) product.is_featured = isEnabled(is_featured) ? 1 : 0;
    if (is_new_arrival !== undefined) product.is_new_arrival = isEnabled(is_new_arrival) ? 1 : 0;
    if (is_best_seller !== undefined) product.is_best_seller = isEnabled(is_best_seller) ? 1 : 0;
    if (req.files?.length) product.images.push(...uploadedImages(req.files, product.images.some((image) => image.is_primary === 1)));
    await product.save();
    return res.status(200).json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'SKU or product slug already exists.' });
    return res.status(500).json({ success: false, message: 'Failed to update product' });
  }
}

async function deleteProduct(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ success: false, message: 'Product not found' });
  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const images = product.images.map((image) => image.image_url);
    await FlashDeal.deleteMany({ product_id: product._id });
    await product.deleteOne();
    images.forEach(removeUploadedImage);
    return res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
}

async function deleteProductImage(req, res) {
  const { productId, imageId } = req.params;
  if (!mongoose.isValidObjectId(productId) || !mongoose.isValidObjectId(imageId)) {
    return res.status(404).json({ success: false, message: 'Image not found for this product' });
  }
  try {
    const product = await Product.findById(productId);
    const image = product?.images.id(imageId);
    if (!image) return res.status(404).json({ success: false, message: 'Image not found for this product' });
    const imageUrl = image.image_url;
    image.deleteOne();
    await product.save();
    removeUploadedImage(imageUrl);
    return res.status(200).json({ success: true, message: 'Product image deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete product image' });
  }
}

async function updateProductDeal(req, res) {
  const { id } = req.params;
  const { is_deal, price, old_price } = req.body;
  const parsedPrice = Number(price);
  const parsedOldPrice = old_price !== undefined && old_price !== null && old_price !== '' ? Number(old_price) : null;
  const parsedIsDeal = isEnabled(is_deal) ? 1 : 0;
  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) return res.status(400).json({ success: false, message: 'Deal price must be a valid positive number.' });
  if (parsedIsDeal && (!Number.isFinite(parsedOldPrice) || parsedOldPrice <= parsedPrice)) {
    return res.status(400).json({ success: false, message: 'Deal price must be lower than original price.' });
  }

  try {
    const product = mongoose.isValidObjectId(id) ? await Product.findById(id) : null;
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.is_deal = parsedIsDeal;
    product.price = parsedPrice;
    product.old_price = parsedIsDeal ? parsedOldPrice : null;
    product.discount_percentage = parsedIsDeal ? Math.round(((parsedOldPrice - parsedPrice) / parsedOldPrice) * 100) : 0;
    await product.save();
    return res.status(200).json({
      success: true,
      message: parsedIsDeal ? 'Product deal updated successfully!' : 'Product deal removed successfully!'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update product deal.' });
  }
}

module.exports = {
  getProducts,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  getProductsByCategory,
  getProductById,
  createProduct,
  updateProduct,
  updateProductDeal,
  deleteProduct,
  deleteProductImage
};