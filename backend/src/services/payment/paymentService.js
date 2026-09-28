const { createNayaPayPayment } = require('./nayapayService');
const { createGatewayPayment, verifyGatewaySignature } = require('./gatewayService');

async function processPaymentCreation({ orderId, paymentMethod, amount, customerInfo }) {
  const method = (paymentMethod || 'nayapay').toLowerCase();

  switch (method) {
    case 'nayapay':
      return await createNayaPayPayment({ orderId, amount, customerInfo });
    case 'online_gateway':
      return await createGatewayPayment({ orderId, amount });
    case 'raast':
    case 'bank_transfer':
    default:
      const txId = `RAAST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      return {
        success: true,
        provider: 'raast_bank_transfer',
        transaction_id: txId,
        provider_reference: `RAAST-REF-${orderId}`,
        instructions: `Payment channel is pending official gateway setup. Reference #NXH-${orderId}.`
      };
  }
}

module.exports = {
  processPaymentCreation,
  verifyGatewaySignature
};
