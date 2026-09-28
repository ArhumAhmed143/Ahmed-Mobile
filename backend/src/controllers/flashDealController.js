const mongoose = require('mongoose');
const { FlashDeal, Product } = require('../models');

function calculateStatus(start, end, isActive) {
  if (!isActive) return 'INACTIVE';
  const now = new Date();
  if (now < new Date(start)) return 'SCHEDULED';
  if (now > new Date(end)) return 'EXPIRED';
  return 'ACTIVE';
}

function activeFlag(value) {
  return value === true || value === 1 || value === '1' || value === 'true' ? 1 : 0;
}

async function populateDeal(deal) {
  const product = await Product.findById(deal.product_id).populate('category_id', 'name');
  if (!product) return null;
  const item = deal.toJSON();
  const images = [...product.images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
  const originalPrice = Number(product.old_price || product.price) || 0;
  const flashPrice = Number(deal.flash_price) || 0;
  const image = images[0]?.image_url || null;
  return {
    ...item,
    product_id: String(product.id),
    product_name: product.name,
    original_price: originalPrice,
    current_product_price: Number(product.price),
    old_price: product.old_price,
    sku: product.sku,
    flash_price: flashPrice,
    discount_percentage: originalPrice > flashPrice ? Math.round(((originalPrice - flashPrice) / originalPrice) * 100) : 0,
    status: calculateStatus(deal.start_time, deal.end_time, deal.is_active === 1),
    primary_image: image,
    image_url: image,
    category_name: product.category_id?.name || 'Tech',
    rating: product.rating || 4.9
  };
}

async function getActiveFlashDeals(req, res) {
  try {
    const now = new Date();
    const deals = await FlashDeal.find({ is_active: 1, start_time: { $lte: now }, end_time: { $gte: now } }).sort({ end_time: 1 });
    const data = (await Promise.all(deals.map(populateDeal))).filter(Boolean);
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch active flash deals.' });
  }
}

async function getAllFlashDeals(req, res) {
  try {
    const deals = await FlashDeal.find().sort({ created_at: -1 });
    const data = (await Promise.all(deals.map(populateDeal))).filter(Boolean);
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch flash deals.' });
  }
}

async function createFlashDeal(req, res) {
  const { product_id, flash_price, original_price, start_time, end_time, is_active = 1 } = req.body;
  const parsedFlashPrice = Number(flash_price);
  const startDate = new Date(start_time);
  const endDate = new Date(end_time);
  if (!mongoose.isValidObjectId(String(product_id || ''))) return res.status(400).json({ success: false, message: 'Please select a valid product.' });
  if (!Number.isFinite(parsedFlashPrice) || parsedFlashPrice <= 0) return res.status(400).json({ success: false, message: 'Flash deal price must be greater than 0.' });
  if (!start_time || Number.isNaN(startDate.getTime())) return res.status(400).json({ success: false, message: 'Valid start date & time is required.' });
  if (!end_time || Number.isNaN(endDate.getTime())) return res.status(400).json({ success: false, message: 'Valid end date & time is required.' });
  if (endDate <= startDate) return res.status(400).json({ success: false, message: 'End date/time must be strictly after start date/time.' });

  try {
    const product = await Product.findById(product_id);
    if (!product) return res.status(400).json({ success: false, message: 'Selected product was not found.' });
    const referencePrice = Number(original_price) || Number(product.old_price || product.price);
    if (parsedFlashPrice >= referencePrice) return res.status(400).json({ success: false, message: 'Flash deal price must be lower than original price.' });
    const existing = await FlashDeal.exists({ product_id, is_active: 1, end_time: { $gte: new Date() } });
    if (existing) return res.status(400).json({ success: false, message: 'An active or scheduled Flash Deal already exists for this product.' });
    const deal = await FlashDeal.create({ product_id, flash_price: parsedFlashPrice, start_time: startDate, end_time: endDate, is_active: activeFlag(is_active) });
    return res.status(201).json({ success: true, message: 'Flash Deal created successfully!', dealId: deal.id });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create flash deal.' });
  }
}

async function updateFlashDeal(req, res) {
  const { id } = req.params;
  const { flash_price, original_price, start_time, end_time, is_active } = req.body;
  const parsedFlashPrice = Number(flash_price);
  const startDate = new Date(start_time);
  const endDate = new Date(end_time);
  if (!Number.isFinite(parsedFlashPrice) || parsedFlashPrice <= 0) return res.status(400).json({ success: false, message: 'Flash deal price must be greater than 0.' });
  if (!start_time || Number.isNaN(startDate.getTime())) return res.status(400).json({ success: false, message: 'Valid start date & time is required.' });
  if (!end_time || Number.isNaN(endDate.getTime())) return res.status(400).json({ success: false, message: 'Valid end date & time is required.' });
  if (endDate <= startDate) return res.status(400).json({ success: false, message: 'End date/time must be strictly after start date/time.' });

  try {
    const deal = mongoose.isValidObjectId(id) ? await FlashDeal.findById(id).populate('product_id', 'price old_price') : null;
    if (!deal) return res.status(404).json({ success: false, message: 'Flash deal not found.' });
    const referencePrice = Number(original_price) || Number(deal.product_id.old_price || deal.product_id.price);
    if (parsedFlashPrice >= referencePrice) return res.status(400).json({ success: false, message: 'Flash deal price must be lower than original price.' });
    deal.flash_price = parsedFlashPrice;
    deal.start_time = startDate;
    deal.end_time = endDate;
    deal.is_active = activeFlag(is_active);
    await deal.save();
    return res.status(200).json({ success: true, message: 'Flash Deal updated successfully!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update flash deal.' });
  }
}

async function deleteFlashDeal(req, res) {
  const { id } = req.params;
  try {
    const deal = mongoose.isValidObjectId(id) ? await FlashDeal.findByIdAndDelete(id) : null;
    if (!deal) return res.status(404).json({ success: false, message: 'Flash deal not found.' });
    return res.status(200).json({ success: true, message: 'Flash Deal deleted successfully!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete flash deal.' });
  }
}

async function toggleFlashDealStatus(req, res) {
  const { id } = req.params;
  try {
    const deal = mongoose.isValidObjectId(id) ? await FlashDeal.findById(id) : null;
    if (!deal) return res.status(404).json({ success: false, message: 'Flash deal not found.' });
    deal.is_active = deal.is_active === 1 ? 0 : 1;
    await deal.save();
    return res.status(200).json({ success: true, message: 'Flash Deal status updated!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update flash deal status.' });
  }
}

module.exports = { getActiveFlashDeals, getAllFlashDeals, createFlashDeal, updateFlashDeal, deleteFlashDeal, toggleFlashDealStatus };