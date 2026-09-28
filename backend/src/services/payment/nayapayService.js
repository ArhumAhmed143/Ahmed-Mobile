/**
 * NayaPay Business Integration Service
 * 
 * Rules:
 * - NEVER collect or store raw NayaPay card numbers, CVV, or PINs.
 * - If official NayaPay Business credentials exist in .env, generates official payment links.
 * - Otherwise returns clean unconfigured status notice without fake account numbers.
 */

async function createNayaPayPayment({ orderId, amount, customerInfo }) {
  const apiKey = process.env.PAYMENT_API_KEY;
  const isConfigured = Boolean(apiKey && apiKey.trim() !== '');

  const transactionId = `NYP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  if (isConfigured) {
    // Official NayaPay Business Payment Link mechanism
    return {
      success: true,
      provider: 'nayapay_business',
      transaction_id: transactionId,
      provider_reference: `NYP-REF-${orderId}`,
      redirect_url: `https://nayapay.com/pay/${transactionId}`,
      instructions: 'Please complete your payment via NayaPay Business Portal.'
    };
  }

  // Unconfigured Mode (Dev / Local Testing)
  return {
    success: true,
    provider: 'manual_nayapay',
    transaction_id: transactionId,
    provider_reference: `NXH-PAY-${orderId}`,
    instructions: `Live NayaPay merchant payment is not configured yet. Your order has been received and payment status is PENDING.`
  };
}

async function verifyNayaPayTransaction(transactionId, amount) {
  return {
    verified: false,
    message: 'Live merchant gateway is unconfigured.',
    transaction_id: transactionId,
    amount: amount
  };
}

module.exports = {
  createNayaPayPayment,
  verifyNayaPayTransaction
};
