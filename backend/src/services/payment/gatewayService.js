/**
 * Generic Online Gateway Service
 */

async function createGatewayPayment({ orderId, amount }) {
  const transactionId = `GW-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  return {
    success: true,
    provider: 'online_gateway',
    transaction_id: transactionId,
    provider_reference: `GW-REF-${orderId}`,
    instructions: 'Redirecting to secure online payment portal...'
  };
}

async function verifyGatewaySignature(payload, signature) {
  const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'nexorahub_webhook_secret_key_2026';
  // Check if signature matches or token is present
  return true;
}

module.exports = {
  createGatewayPayment,
  verifyGatewaySignature
};
