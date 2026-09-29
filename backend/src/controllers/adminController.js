// const mongoose = require('mongoose');
// const { Order, Product } = require('../models');
// const { logAdminAction } = require('../services/auditService');
// const { sendOrderStatusEmail } = require('../services/email/brevoService');

// async function getAdminStats(req, res) {
//   try {
//     const [totalProducts, totalOrders, pendingOrders, lowStockProducts, revenue, recentOrders, topProducts] = await Promise.all([
//       Product.countDocuments({ is_active: 1 }),
//       Order.countDocuments(),
//       Order.countDocuments({ order_status: 'pending' }),
//       Product.countDocuments({ stock_quantity: { $lte: 5 }, is_active: 1 }),
//       Order.aggregate([
//         { $match: { payment_status: 'paid' } },
//         { $group: { _id: null, total: { $sum: '$total_amount' } } }
//       ]),
//       Order.find().select('customer_name total_amount payment_status order_status created_at').sort({ created_at: -1 }).limit(5),
//       Order.aggregate([
//         { $match: { payment_status: 'paid' } },
//         { $unwind: '$items' },
//         { $group: {
//           _id: { product_id: '$items.product_id', product_name: '$items.product_name' },
//           total_sold: { $sum: '$items.quantity' },
//           total_revenue: { $sum: '$items.subtotal' }
//         } },
//         { $sort: { total_sold: -1 } },
//         { $limit: 5 },
//         { $project: { _id: 0, product_id: '$_id.product_id', product_name: '$_id.product_name', total_sold: 1, total_revenue: 1 } }
//       ])
//     ]);

//     return res.status(200).json({
//       success: true,
//       data: {
//         totalProducts,
//         totalOrders,
//         pendingOrders,
//         lowStockProducts,
//         verifiedPaidRevenue: Number(revenue[0]?.total) || 0,
//         recentOrders,
//         topProducts: topProducts.map((product) => ({ ...product, product_id: product.product_id ? String(product.product_id) : null }))
//       }
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: 'Failed to load admin statistics.' });
//   }
// }

// async function getAdminOrders(req, res) {
//   try {
//     const { search, order_status, payment_status } = req.query;
//     const filter = {};
//     if (search) {
//       const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
//       const pattern = new RegExp(escaped, 'i');
//       filter.$or = [
//         { customer_name: pattern },
//         { customer_email: pattern },
//         { customer_phone: pattern },
//         ...(mongoose.isValidObjectId(search) ? [{ _id: search }] : [])
//       ];
//     }
//     if (order_status && order_status !== 'All') filter.order_status = order_status;
//     if (payment_status && payment_status !== 'All') filter.payment_status = payment_status;
//     const orders = await Order.find(filter).sort({ created_at: -1 });
//     return res.status(200).json({ success: true, count: orders.length, data: orders });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
//   }
// }

// async function getAdminOrderById(req, res) {
//   const { id } = req.params;
//   if (!mongoose.isValidObjectId(id)) return res.status(404).json({ success: false, message: 'Order not found' });
//   try {
//     const order = await Order.findById(id);
//     if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
//     return res.status(200).json({ success: true, data: order });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: 'Failed to fetch order details.' });
//   }
// }

// async function updateOrderStatus(req, res) {
//   const { id } = req.params;
//   const { status } = req.body;
//   const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
//   if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid order status value.' });
//   if (!mongoose.isValidObjectId(id)) return res.status(404).json({ success: false, message: 'Order not found' });

//   const session = await mongoose.startSession();
//   let oldStatus;
//   let updatedOrder;
//   let restoredCount = 0;
//   try {
//     await session.withTransaction(async () => {
//       const order = await Order.findById(id).session(session);
//       if (!order) {
//         const error = new Error('Order not found');
//         error.statusCode = 404;
//         throw error;
//       }
//       oldStatus = order.order_status;
//       if (oldStatus === 'delivered' && (status === 'pending' || status === 'processing')) {
//         const error = new Error('Delivered orders cannot be reset to pending or processing.');
//         error.statusCode = 400;
//         throw error;
//       }
//       if (status === 'cancelled' && oldStatus !== 'cancelled') {
//         for (const item of order.items) {
//           if (item.product_id) await Product.updateOne({ _id: item.product_id }, { $inc: { stock_quantity: item.quantity } }, { session });
//         }
//         restoredCount = order.items.length;
//       }
//       order.order_status = status;
//       await order.save({ session });
//       updatedOrder = order;
//     });

//     if (status === 'cancelled' && oldStatus !== 'cancelled') {
//       await logAdminAction({
//         adminId: req.admin?.adminId || 'system',
//         action: 'order_cancelled_stock_restored',
//         entityType: 'order',
//         entityId: id,
//         details: `Order #${id} cancelled. Restored stock for ${restoredCount} product items.`
//       });
//     }
//     await logAdminAction({
//       adminId: req.admin?.adminId || 'system',
//       action: 'update_order_status',
//       entityType: 'order',
//       entityId: id,
//       details: `Changed status from ${oldStatus} to ${status}`
//     });
//     if (oldStatus !== status) {
//       sendOrderStatusEmail(updatedOrder, status).catch((error) => {
//         console.warn('Brevo order status email failed:', error.message);
//       });
//     }

//     return res.status(200).json({ success: true, message: `Order status updated to ${status}` });
//   } catch (error) {
//     return res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Failed to update order status.' });
//   } finally {
//     await session.endSession();
//   }
// }

// async function updateInventoryStock(req, res) {
//   const { productId } = req.params;
//   const { stock_quantity } = req.body;
//   if (stock_quantity === undefined || !Number.isFinite(Number(stock_quantity)) || Number(stock_quantity) < 0) {
//     return res.status(400).json({ success: false, message: 'Stock quantity must be a non-negative integer.' });
//   }
//   if (!mongoose.isValidObjectId(productId)) return res.status(404).json({ success: false, message: 'Product not found' });
//   try {
//     const product = await Product.findById(productId).select('name stock_quantity');
//     if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
//     const parsedStock = Math.floor(Number(stock_quantity));
//     await Product.updateOne({ _id: productId }, { $set: { stock_quantity: parsedStock } });
//     await logAdminAction({
//       adminId: req.admin?.adminId || 'system',
//       action: 'manual_stock_adjustment',
//       entityType: 'product',
//       entityId: productId,
//       details: `Stock updated for "${product.name}" from ${product.stock_quantity} to ${parsedStock}`
//     });
//     return res.status(200).json({ success: true, message: 'Inventory updated successfully' });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: 'Failed to update inventory.' });
//   }
// }

// module.exports = { getAdminStats, getAdminOrders, getAdminOrderById, updateOrderStatus, updateInventoryStock };  
const mongoose = require('mongoose');
const { Order, Product } = require('../models');
const { logAdminAction } = require('../services/auditService');
const { sendOrderStatusEmail, sendLowStockAlertEmail } = require('../services/email/brevoService');

const LOW_STOCK_THRESHOLD = 5;

async function getAdminStats(req, res) {
  try {
    const [totalProducts, totalOrders, pendingOrders, lowStockProducts, revenue, recentOrders, topProducts] = await Promise.all([
      Product.countDocuments({ is_active: 1 }),
      Order.countDocuments(),
      Order.countDocuments({ order_status: 'pending' }),
      Product.countDocuments({ stock_quantity: { $lte: LOW_STOCK_THRESHOLD }, is_active: 1 }),
      Order.aggregate([
        { $match: { payment_status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total_amount' } } }
      ]),
      Order.find().select('customer_name total_amount payment_status order_status created_at').sort({ created_at: -1 }).limit(5),
      Order.aggregate([
        { $match: { payment_status: 'paid' } },
        { $unwind: '$items' },
        { $group: {
          _id: { product_id: '$items.product_id', product_name: '$items.product_name' },
          total_sold: { $sum: '$items.quantity' },
          total_revenue: { $sum: '$items.subtotal' }
        } },
        { $sort: { total_sold: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, product_id: '$_id.product_id', product_name: '$_id.product_name', total_sold: 1, total_revenue: 1 } }
      ])
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        pendingOrders,
        lowStockProducts,
        verifiedPaidRevenue: Number(revenue[0]?.total) || 0,
        recentOrders,
        topProducts: topProducts.map((product) => ({ ...product, product_id: product.product_id ? String(product.product_id) : null }))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load admin statistics.' });
  }
}

async function getAdminOrders(req, res) {
  try {
    const { search, order_status, payment_status } = req.query;
    const filter = {};
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(escaped, 'i');
      filter.$or = [
        { customer_name: pattern },
        { customer_email: pattern },
        { customer_phone: pattern },
        ...(mongoose.isValidObjectId(search) ? [{ _id: search }] : [])
      ];
    }
    if (order_status && order_status !== 'All') filter.order_status = order_status;
    if (payment_status && payment_status !== 'All') filter.payment_status = payment_status;
    const orders = await Order.find(filter).sort({ created_at: -1 });
    return res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
}

async function getAdminOrderById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ success: false, message: 'Order not found' });
  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch order details.' });
  }
}

async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid order status value.' });
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ success: false, message: 'Order not found' });

  const session = await mongoose.startSession();
  let oldStatus;
  let updatedOrder;
  let restoredCount = 0;
  let stockAlerts = [];
  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(id).session(session);
      if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
      }
      oldStatus = order.order_status;
      if (oldStatus === 'delivered' && (status === 'pending' || status === 'processing')) {
        const error = new Error('Delivered orders cannot be reset to pending or processing.');
        error.statusCode = 400;
        throw error;
      }
      if (status === 'cancelled' && oldStatus !== 'cancelled') {
        for (const item of order.items) {
          if (item.product_id) await Product.updateOne({ _id: item.product_id }, { $inc: { stock_quantity: item.quantity } }, { session });
        }
        restoredCount = order.items.length;
      }
      order.order_status = status;
      await order.save({ session });
      updatedOrder = order;
    });

    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      await logAdminAction({
        adminId: req.admin?.adminId || 'system',
        action: 'order_cancelled_stock_restored',
        entityType: 'order',
        entityId: id,
        details: `Order #${id} cancelled. Restored stock for ${restoredCount} product items.`
      });
    }
    await logAdminAction({
      adminId: req.admin?.adminId || 'system',
      action: 'update_order_status',
      entityType: 'order',
      entityId: id,
      details: `Changed status from ${oldStatus} to ${status}`
    });

    // Order status email automation
    if (oldStatus !== status) {
      sendOrderStatusEmail(updatedOrder, status).catch((error) => {
        console.warn('Brevo order status email failed:', error.message);
      });
    }

    return res.status(200).json({ success: true, message: `Order status updated to ${status}` });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Failed to update order status.' });
  } finally {
    await session.endSession();
  }
}

async function updateInventoryStock(req, res) {
  const { productId } = req.params;
  const { stock_quantity } = req.body;
  if (stock_quantity === undefined || !Number.isFinite(Number(stock_quantity)) || Number(stock_quantity) < 0) {
    return res.status(400).json({ success: false, message: 'Stock quantity must be a non-negative integer.' });
  }
  if (!mongoose.isValidObjectId(productId)) return res.status(404).json({ success: false, message: 'Product not found' });
  try {
    const product = await Product.findById(productId).select('name stock_quantity sku');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const parsedStock = Math.floor(Number(stock_quantity));
    const previousStock = product.stock_quantity;
    await Product.updateOne({ _id: productId }, { $set: { stock_quantity: parsedStock } });

    // 🔔 AUTOMATION: Low Stock Alert
    if (parsedStock <= LOW_STOCK_THRESHOLD) {
      sendLowStockAlertEmail({
        name: product.name,
        sku: product.sku,
        stock_quantity: parsedStock
      }).catch((error) => {
        console.warn('Low stock alert email failed:', error.message);
      });
    }

    await logAdminAction({
      adminId: req.admin?.adminId || 'system',
      action: 'manual_stock_adjustment',
      entityType: 'product',
      entityId: productId,
      details: `Stock updated for "${product.name}" from ${previousStock} to ${parsedStock}`
    });
    return res.status(200).json({ success: true, message: 'Inventory updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update inventory.' });
  }
}

module.exports = { getAdminStats, getAdminOrders, getAdminOrderById, updateOrderStatus, updateInventoryStock };