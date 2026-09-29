const BREVO_API_URL = 'https://api.brevo.com/v3';

function isBrevoConfigured() {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

async function brevoRequest(endpoint, payload) {
  if (!isBrevoConfigured()) {
    throw new Error('Brevo is not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL.');
  }

  const response = await fetch(`${BREVO_API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Brevo request failed (${response.status}): ${details.slice(0, 500)}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

async function sendTransactionalEmail({ to, subject, htmlContent, textContent }) {
  return brevoRequest('/smtp/email', {
    sender: {
      name: process.env.BREVO_SENDER_NAME || 'Ahmed Moblie',
      email: process.env.BREVO_SENDER_EMAIL
    },
    to: [{ email: to }],
    subject,
    htmlContent,
    textContent
  });
}

async function addNewsletterContact(email) {
  const listId = Number(process.env.BREVO_NEWSLETTER_LIST_ID);
  const payload = {
    email,
    updateEnabled: true,
    attributes: { SOURCE: 'Ahmed Moblie website' }
  };
  if (Number.isInteger(listId) && listId > 0) payload.listIds = [listId];
  return brevoRequest('/contacts', payload);
}

async function sendNewsletterWelcomeEmail(email) {
  const messageReference = Date.now();
  return sendTransactionalEmail({
    to: email,
    subject: `Welcome to Ahmed Moblie updates #${messageReference}`,
    htmlContent: emailShell('You are subscribed', `
      <p>Thank you for subscribing to Ahmed Moblie updates.</p>
      <p>We will email you about new products, exclusive deals, and special offers.</p>
      <p>You can unsubscribe at any time using the link in our emails.</p>`),
    textContent: 'Thank you for subscribing to Ahmed Moblie updates. We will email you about new products, exclusive deals, and special offers. You can unsubscribe at any time using the link in our emails.'
  });
}

function formatAmount(amount) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(Number(amount) || 0);
}

function orderItemsHtml(items = []) {
  return items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e5e7eb">${escapeHtml(item.product_name)} × ${Number(item.quantity) || 0}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right">${formatAmount(item.subtotal)}</td>
    </tr>`).join('');
}

function orderSummary(order) {
  return `
    <table role="presentation" style="width:100%;border-collapse:collapse;margin:24px 0">
      <tbody>${orderItemsHtml(order.items)}</tbody>
      <tfoot>
        <tr><td style="padding:10px 0;color:#64748b">Delivery</td><td style="padding:10px 0;text-align:right">${formatAmount(order.delivery_fee)}</td></tr>
        <tr><td style="padding:10px 0;font-weight:bold">Total</td><td style="padding:10px 0;text-align:right;font-weight:bold">${formatAmount(order.total_amount)}</td></tr>
      </tfoot>
    </table>`;
}

function emailShell(title, body) {
  return `<!doctype html><html><body style="margin:0;background:#f4f5f9;font-family:Arial,sans-serif;color:#172033">
    <div style="max-width:600px;margin:32px auto;padding:32px;background:#fff;border-radius:12px">
      <p style="margin:0 0 8px;color:#7c3aed;font-size:12px;font-weight:bold;letter-spacing:2px">AHMED MOBLIE</p>
      <h1 style="margin:0 0 20px;font-size:24px">${escapeHtml(title)}</h1>
      ${body}
      <p style="margin-top:28px;color:#64748b;font-size:12px">Thank you for shopping with Ahmed Moblie.</p>
    </div></body></html>`;
}

async function sendOrderConfirmation(order) {
  if (!isBrevoConfigured()) return;
  const name = escapeHtml(order.customer_name);
  const orderId = escapeHtml(order.id || order._id);
  const summary = orderSummary(order);
  const htmlContent = emailShell('Order received', `
    <p>Hello ${name},</p>
    <p>Your order <strong>#${orderId}</strong> has been received. We will update you when its status changes.</p>
    ${summary}`);
  const textContent = `Hello ${order.customer_name}, your order #${orderId} has been received. Total: ${formatAmount(order.total_amount)}.`;
  const messages = [sendTransactionalEmail({ to: order.customer_email, subject: `Order received #${orderId}`, htmlContent, textContent })];

  if (process.env.BREVO_ADMIN_EMAIL) {
    messages.push(sendTransactionalEmail({
      to: process.env.BREVO_ADMIN_EMAIL,
      subject: `New order #${orderId}`,
      htmlContent: emailShell('New order received', `<p>Order #${orderId} from ${name}.</p>${summary}`),
      textContent: `New order #${orderId} from ${order.customer_name}. Total: ${formatAmount(order.total_amount)}.`
    }));
  }

  const results = await Promise.allSettled(messages);
  results.filter((result) => result.status === 'rejected').forEach((result) => {
    console.warn('Brevo order email failed:', result.reason.message);
  });
}

async function sendPaymentStatusEmail(order, paymentStatus) {
  if (!isBrevoConfigured()) return;
  const orderId = escapeHtml(order.id || order._id);
  const statusLabel = paymentStatus === 'paid' ? 'Payment confirmed' : 'Payment update';
  await sendTransactionalEmail({
    to: order.customer_email,
    subject: `${statusLabel} for order #${orderId}`,
    htmlContent: emailShell(statusLabel, `<p>Hello ${escapeHtml(order.customer_name)}, the payment status for order <strong>#${orderId}</strong> is now <strong>${escapeHtml(paymentStatus)}</strong>.</p><p>Order total: ${formatAmount(order.total_amount)}.</p>`),
    textContent: `Payment status for order #${orderId} is ${paymentStatus}.`
  });
}

async function sendOrderStatusEmail(order, orderStatus) {
  if (!isBrevoConfigured()) return;
  const orderId = escapeHtml(order.id || order._id);
  await sendTransactionalEmail({
    to: order.customer_email,
    subject: `Order #${orderId} status update`,
    htmlContent: emailShell('Order status update', `<p>Hello ${escapeHtml(order.customer_name)}, your order <strong>#${orderId}</strong> is now <strong>${escapeHtml(orderStatus)}</strong>.</p>`),
    textContent: `Order #${orderId} is now ${orderStatus}.`
  });
}

// ============================================================
// 🔔 AUTOMATION: Low Stock Alert Email (Admin ke liye)
// ============================================================
async function sendLowStockAlertEmail(product) {
  if (!isBrevoConfigured()) return;

  const adminEmail = process.env.BREVO_ADMIN_EMAIL || process.env.BREVO_SENDER_EMAIL;
  if (!adminEmail) {
    console.warn('Low stock alert skipped: No admin email configured.');
    return;
  }

  const productName = escapeHtml(product.name || 'Unknown Product');
  const productSku = escapeHtml(product.sku || 'N/A');
  const currentStock = Number(product.stock_quantity) || 0;
  const threshold = 5;

  // Color based on stock level
  const stockColor = currentStock === 0 ? '#dc2626' : currentStock <= 2 ? '#f59e0b' : '#eab308';
  const urgencyLabel = currentStock === 0 ? '🚨 OUT OF STOCK' : currentStock <= 2 ? '⚠️ CRITICAL' : '⚡ LOW STOCK';

  const htmlContent = emailShell('Low Stock Alert', `
    <p style="font-size:16px;font-weight:bold;color:${stockColor};margin:0 0 16px">
      ${urgencyLabel}
    </p>
    <p>One of your products is running low on stock and needs your attention:</p>
    
    <table role="presentation" style="width:100%;border-collapse:collapse;margin:24px 0;background:#f8fafc;border-radius:8px">
      <tbody>
        <tr>
          <td style="padding:12px 16px;color:#64748b;font-size:13px">Product Name</td>
          <td style="padding:12px 16px;font-weight:bold;text-align:right">${productName}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;color:#64748b;font-size:13px;border-top:1px solid #e5e7eb">SKU</td>
          <td style="padding:12px 16px;text-align:right;font-family:monospace;border-top:1px solid #e5e7eb">${productSku}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;color:#64748b;font-size:13px;border-top:1px solid #e5e7eb">Current Stock</td>
          <td style="padding:12px 16px;text-align:right;font-weight:bold;font-size:18px;color:${stockColor};border-top:1px solid #e5e7eb">${currentStock} units</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;color:#64748b;font-size:13px;border-top:1px solid #e5e7eb">Alert Threshold</td>
          <td style="padding:12px 16px;text-align:right;border-top:1px solid #e5e7eb">${threshold} units</td>
        </tr>
      </tbody>
    </table>

    <p style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:4px;font-size:13px;margin:16px 0">
      <strong>Action Required:</strong> Please restock this product soon to avoid missing out on sales.
    </p>

    <p style="text-align:center;margin:24px 0">
      <a href="${process.env.FRONTEND_URL || 'https://ahmed-mobile.vercel.app'}/admin/inventory" 
         style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">
        Manage Inventory
      </a>
    </p>
  `);

  const textContent = `
LOW STOCK ALERT ${urgencyLabel}

Product: ${product.name}
SKU: ${product.sku || 'N/A'}
Current Stock: ${currentStock} units
Threshold: ${threshold} units

Please restock soon.

Manage inventory: ${process.env.FRONTEND_URL || 'https://ahmed-mobile.vercel.app'}/admin/inventory
  `.trim();

  try {
    await sendTransactionalEmail({
      to: adminEmail,
      subject: `${urgencyLabel}: ${product.name} (${currentStock} left)`,
      htmlContent,
      textContent
    });
    console.log(`✅ Low stock alert sent for "${product.name}" (${currentStock} units)`);
  } catch (error) {
    console.warn('❌ Low stock alert email failed:', error.message);
  }
}

module.exports = {
  addNewsletterContact,
  isBrevoConfigured,
  sendNewsletterWelcomeEmail,
  sendOrderConfirmation,
  sendOrderStatusEmail,
  sendPaymentStatusEmail,
  sendLowStockAlertEmail
};