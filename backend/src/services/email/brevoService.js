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

module.exports = {
  addNewsletterContact,
  isBrevoConfigured,
  sendNewsletterWelcomeEmail,
  sendOrderConfirmation,
  sendOrderStatusEmail,
  sendPaymentStatusEmail
};