/**
 * Centralized Currency Formatter for Ahmed Moblie (PKR)
 * Formats numbers into Pakistani Rupees (e.g. ₨2,500, ₨12,000)
 */
export function formatCurrency(amount) {
  const num = Math.round(Number(amount) || 0);
  
  const formatted = new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(num);

  return `₨${formatted}`;
}

export default formatCurrency;
