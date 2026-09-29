const mongoose = require('mongoose');
const { DELIVERY_FEE } = require('../config/constants');
const { Order, Product } = require('../models');
const { sendOrderConfirmation } = require('../services/email/brevoService');

async function createOrder(req, res) {
  const {
    customer_name, customer_email, customer_phone, shipping_address,
    city, postal_code, order_notes = '', payment_method = 'cod', items
  } = req.body;

  if (!customer_name || !String(customer_name).trim()) return res.status(400).json({ success: false, message: 'Please enter your full name.' });
  if (!customer_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email.trim())) return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  if (!customer_phone || !String(customer_phone).trim()) return res.status(400).json({ success: false, message: 'Please enter your phone number.' });
  if (!shipping_address || !String(shipping_address).trim()) return res.status(400).json({ success: false, message: 'Please enter your shipping address.' });
  if (!city || !String(city).trim()) return res.status(400).json({ success: false, message: 'Please enter your city.' });
  if (!postal_code || !String(postal_code).trim()) return res.status(400).json({ success: false, message: 'Please enter your postal code.' });
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ success: false, message: 'Your cart is empty.' });

  const requested = new Map();
  for (const item of items) {
    const productId = String(item.product_id || item.id || '');
    const quantity = Number(item.quantity);
    if (!mongoose.isValidObjectId(productId) || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid product quantity in order.' });
    }
    requested.set(productId, (requested.get(productId) || 0) + quantity);
  }

  let validatedItems = [];
  let calculatedSubtotal = 0;
  for (const [productId, quantity] of requested) {
    const product = await Product.findById(productId).select('name price stock_quantity is_active');
    if (!product || product.is_active !== 1) {
      return res.status(400).json({ success: false, message: `Product (ID: ${productId}) is no longer available.` });
    }
    if (product.stock_quantity < quantity) {
      const message = product.stock_quantity <= 0
        ? `"${product.name}" is currently out of stock.`
        : `Only ${product.stock_quantity} units of "${product.name}" are available in stock.`;
      return res.status(400).json({ success: false, message });
    }
    const unitPrice = Number(product.price);
    const subtotal = unitPrice * quantity;
    calculatedSubtotal += subtotal;
    validatedItems.push({ product_id: product._id, product_name: product.name, quantity, unit_price: unitPrice, subtotal });
  }

  const deliveryFee = DELIVERY_FEE;
  const totalAmount = calculatedSubtotal + deliveryFee;
  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      for (const item of validatedItems) {
        const result = await Product.updateOne(
          { _id: item.product_id, is_active: 1, stock_quantity: { $gte: item.quantity } },
          { $inc: { stock_quantity: -item.quantity } },
          { session }
        );
        if (result.modifiedCount !== 1) {
          const error = new Error(`Insufficient stock for "${item.product_name}". Order was not placed.`);
          error.statusCode = 400;
          throw error;
        }
      }
      [order] = await Order.create([{
        customer_name: customer_name.trim(),
        customer_email: customer_email.trim(),
        customer_phone: customer_phone.trim(),
        shipping_address: shipping_address.trim(),
        city: city.trim(),
        postal_code: postal_code.trim(),
        order_notes: String(order_notes).trim(),
        payment_method,
        subtotal: calculatedSubtotal,
        delivery_fee: deliveryFee,
        total_amount: totalAmount,
        payment_status: 'pending',
        order_status: 'pending',
        items: validatedItems
      }], { session });
    });

    // 🔔 AUTOMATION: Order Confirmation Email (Customer + Admin)
    // Yeh call ab SAFE hai kyunki 'order' variable upar initialize ho chuka hai
    sendOrderConfirmation(order).catch((error) => {
      console.warn('Brevo order confirmation failed:', error.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order_id: order.id,
        order_status: order.order_status,
        payment_status: order.payment_status,
        subtotal: calculatedSubtotal,
        delivery_fee: deliveryFee,
        total_amount: totalAmount
      }
    });
  } catch (error) {
    console.error('Error during MongoDB order transaction:', error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Unable to place order. Please try again.'
    });
  } finally {
    await session.endSession();
  }
}

async function getOrderById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ success: false, message: 'Order not found' });
  try {
    const order = await Order.findById(id).select('subtotal delivery_fee total_amount payment_status order_status payment_method created_at');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.status(200).json({
      success: true,
      data: {
        order_id: order.id,
        order_status: order.order_status,
        payment_status: order.payment_status,
        payment_method: order.payment_method || 'cod',
        subtotal: Number(order.subtotal),
        delivery_fee: Number(order.delivery_fee),
        total_amount: Number(order.total_amount),
        created_at: order.created_at
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch order.' });
  }
}

module.exports = { createOrder, getOrderById };