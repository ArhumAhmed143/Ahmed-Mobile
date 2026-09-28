const mongoose = require('mongoose');
const { Order } = require('../models');
const { processPaymentCreation, verifyGatewaySignature } = require('../services/payment/paymentService');
const { sendPaymentStatusEmail } = require('../services/email/brevoService');

async function createPayment(req, res) {
  const { order_id, payment_method = 'nayapay' } = req.body;
  if (!order_id) return res.status(400).json({ success: false, message: 'Order ID is required.' });
  if (!mongoose.isValidObjectId(order_id)) return res.status(404).json({ success: false, message: 'Order not found.' });

  try {
    const order = await Order.findById(order_id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    const authoritativeAmount = Number(order.total_amount);
    if (order.payment_status === 'paid') return res.status(400).json({ success: false, message: 'This order has already been paid.' });

    const result = await processPaymentCreation({ orderId: order.id, paymentMethod: payment_method, amount: authoritativeAmount });
    order.payments.push({
      payment_method,
      transaction_id: result.transaction_id,
      amount: authoritativeAmount,
      status: 'pending',
      provider: result.provider,
      provider_reference: result.provider_reference
    });
    order.payment_status = 'pending';
    await order.save();
    const payment = order.payments[order.payments.length - 1];

    return res.status(201).json({
      success: true,
      data: {
        payment_id: payment.id,
        order_id: order.id,
        transaction_id: result.transaction_id,
        amount: authoritativeAmount,
        currency: 'PKR',
        status: payment.status,
        provider: result.provider,
        instructions: result.instructions,
        redirect_url: result.redirect_url
      }
    });
  } catch (error) {
    console.error('MongoDB createPayment error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to create payment. Please try again.' });
  }
}

async function verifyPayment(req, res) {
  const { order_id } = req.body;
  if (!order_id) return res.status(400).json({ success: false, message: 'Order ID is required.' });
  if (!mongoose.isValidObjectId(order_id)) return res.status(404).json({ success: false, message: 'Order not found.' });

  try {
    const order = await Order.findById(order_id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    const isLiveMerchantConfigured = process.env.PAYMENT_PROVIDER === 'nayapay_live' && Boolean(process.env.PAYMENT_API_KEY);
    if (!isLiveMerchantConfigured) {
      return res.status(200).json({
        success: false,
        is_live_configured: false,
        message: 'Live NayaPay merchant API is not configured. Payment status remains PENDING until admin verification.',
        data: { order_id: order.id, payment_status: order.payment_status || 'pending', total_amount: Number(order.total_amount) }
      });
    }
    if (order.payment_status === 'paid') {
      return res.status(200).json({ success: true, message: 'This payment has already been verified.', data: { order_id: order.id, payment_status: 'paid' } });
    }
    return res.status(200).json({
      success: false,
      message: 'Payment verification is pending gateway notification.',
      data: { order_id: order.id, payment_status: 'pending' }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to verify payment.' });
  }
}

async function handleWebhook(req, res) {
  const signature = req.headers['x-payment-signature'] || req.headers.signature;
  const { transaction_id, order_id, status, amount } = req.body;
  if (!await verifyGatewaySignature(req.body, signature)) {
    return res.status(401).json({ success: false, message: 'Invalid webhook signature.' });
  }
  if (!order_id || !transaction_id) return res.status(400).json({ success: false, message: 'Missing transaction details.' });
  if (!mongoose.isValidObjectId(order_id)) return res.status(404).json({ success: false, message: 'Order not found.' });

  try {
    const order = await Order.findById(order_id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.payment_status === 'paid') return res.status(200).json({ success: true, message: 'Webhook received. Payment already processed.' });
    if (amount !== undefined && amount !== null && Number(amount) !== Number(order.total_amount)) {
      return res.status(400).json({ success: false, message: 'Payment amount does not match order total.' });
    }

    const payment = [...order.payments].reverse().find((entry) => entry.transaction_id === transaction_id);
    if (!payment && order.payments.length) {
      return res.status(404).json({ success: false, message: 'Payment transaction not found.' });
    }
    if (payment && (status === 'success' || status === 'paid' || status === 'failed')) {
      const previousStatus = order.payment_status;
      payment.status = status === 'failed' ? 'failed' : 'paid';
      order.payment_status = payment.status;
      await order.save();
      if (previousStatus !== order.payment_status) {
        sendPaymentStatusEmail(order, order.payment_status).catch((error) => {
          console.warn('Brevo payment status email failed:', error.message);
        });
      }
    }
    return res.status(200).json({ success: true, message: 'Webhook processed successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Webhook processing error.' });
  }
}

async function getPaymentStatus(req, res) {
  const { orderId } = req.params;
  if (!mongoose.isValidObjectId(orderId)) {
    return res.status(200).json({ success: true, data: { order_id: orderId, payment_status: 'pending', payment_method: 'nayapay' } });
  }
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(200).json({ success: true, data: { order_id: orderId, payment_status: 'pending', payment_method: 'nayapay' } });
    }
    const payment = order.payments[order.payments.length - 1];
    return res.status(200).json({
      success: true,
      data: {
        order_id: order.id,
        payment_status: order.payment_status || 'pending',
        payment_method: payment?.payment_method || order.payment_method || 'nayapay',
        transaction_id: payment?.transaction_id || null,
        total_amount: Number(order.total_amount)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch payment status.' });
  }
}

module.exports = { createPayment, verifyPayment, handleWebhook, getPaymentStatus };