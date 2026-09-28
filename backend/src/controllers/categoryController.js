const mongoose = require('mongoose');
const { Category, Product } = require('../models');

const fallbackCategories = [
  { id: '1', name: 'Audio', slug: 'audio', description: 'Studio-grade headphones, earbuds & speakers', image: '🎧' },
  { id: '2', name: 'Chargers', slug: 'chargers', description: 'GaN ultra-fast adapters & wireless pads', image: '🔌' },
  { id: '3', name: 'Cables', slug: 'cables', description: 'High-speed braided 240W cables', image: '🧵' },
  { id: '4', name: 'Power Banks', slug: 'power-banks', description: 'Magnetic wireless & high-capacity power banks', image: '🔋' },
  { id: '5', name: 'Phone Cases', slug: 'phone-cases', description: 'Titanium armor & mag-safe luxury cases', image: '📱' },
  { id: '6', name: 'Smart Watches', slug: 'smart-watches', description: 'Fitness trackers & luxury smartwatches', image: '⌚' },
  { id: '7', name: 'Mobile Accessories', slug: 'mobile-accessories', description: 'Camera lenses, stands & car mounts', image: '🤳' },
  { id: '8', name: 'Electronics', slug: 'electronics', description: 'Smart gadgets & desk accessories', image: '⚡' }
];

function generateSlug(text) {
  return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
}

async function getCategories(req, res) {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    const counts = await Product.aggregate([
      { $match: { is_active: 1, category_id: { $ne: null } } },
      { $group: { _id: '$category_id', count: { $sum: 1 } } }
    ]);
    const countByCategory = new Map(counts.map((item) => [String(item._id), item.count]));
    const data = categories.map((category) => ({
      ...category,
      id: String(category._id),
      product_count: countByCategory.get(String(category._id)) || 0
    }));
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(200).json({ success: true, data: fallbackCategories, notice: 'Serving fallback data due to database connection status' });
  }
}

async function getCategoryById(req, res) {
  const { id } = req.params;
  try {
    const category = mongoose.isValidObjectId(id)
      ? await Category.findById(id)
      : await Category.findOne({ slug: id });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    const found = fallbackCategories.find((category) => String(category.id) === id || category.slug === id);
    if (found) return res.status(200).json({ success: true, data: found });
    return res.status(500).json({ success: false, message: 'Server error while fetching category' });
  }
}

async function createCategory(req, res) {
  const { name, description = '', image = '' } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Category name is required.' });
  const cleanName = name.trim();
  const slug = generateSlug(cleanName);
  try {
    if (await Category.exists({ $or: [{ slug }, { name: cleanName }] })) {
      return res.status(400).json({ success: false, message: 'A category with this name already exists.' });
    }
    const category = await Category.create({ name: cleanName, slug, description: description.trim(), image: image.trim() });
    return res.status(201).json({ success: true, message: 'Category created successfully', data: category });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
}

async function updateCategory(req, res) {
  const { id } = req.params;
  const { name, description = '', image = '' } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Category name is required.' });
  try {
    const category = mongoose.isValidObjectId(id) ? await Category.findById(id) : null;
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    category.name = name.trim();
    category.slug = generateSlug(name);
    category.description = description.trim();
    category.image = image.trim();
    await category.save();
    return res.status(200).json({ success: true, message: 'Category updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
}

async function deleteCategory(req, res) {
  const { id } = req.params;
  try {
    const category = mongoose.isValidObjectId(id) ? await Category.findById(id) : null;
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    const productCount = await Product.countDocuments({ category_id: category._id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category "${category.name}" because ${productCount} product(s) are assigned to it. Please reassign or remove the products first.`
      });
    }
    await category.deleteOne();
    return res.status(200).json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
}

module.exports = { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory };