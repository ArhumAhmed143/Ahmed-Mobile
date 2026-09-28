import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import { ArrowLeft, ShieldCheck, ShoppingBag, AlertCircle, CheckCircle2, CreditCard, Landmark, Wallet, Truck, Lock, Copy, Check, Smartphone } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartSubtotal, cartTotal, deliveryFee, clearCart } = useShop();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    city: '',
    postal_code: '',
    order_notes: ''
  });

  // ====== MERCHANT PAYMENT DETAILS ======
  const MERCHANT = {
    jazzcash: {
      number: '03355708704',
      name: 'Muhammad Ahmed',
      label: 'JazzCash'
    },
    easypaisa: {
      number: '03355708704',
      name: 'Muhammad Ahmed',
      label: 'EasyPaisa'
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    });
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl gold-gradient-bg mx-auto flex items-center justify-center text-black shadow-[0_0_30px_rgba(212,175,55,0.4)]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Your cart is empty</h1>
        <p className="text-xs text-slate-400">Please add items to your cart before proceeding to checkout.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gold-gradient-bg text-black font-extrabold text-xs uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Shop Catalog</span>
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Client-side Input Validations
    if (!formData.customer_name.trim()) return setError('Please enter your full name.');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.customer_email.trim())) return setError('Please enter a valid email address.');
    if (!formData.customer_phone.trim()) return setError('Please enter your phone number.');
    if (!formData.shipping_address.trim()) return setError('Please enter your shipping address.');
    if (!formData.city.trim()) return setError('Please enter your city.');
    if (!formData.postal_code.trim()) return setError('Please enter your postal code.');

    setLoading(true);

    try {
      const orderPayload = {
        ...formData,
        payment_method: paymentMethod,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        }))
      };

      // 1. Create Order
      const res = await api.createOrder(orderPayload);

      if (res.success && res.data) {
        const orderId = res.data.order_id;

        // 2. Initiate Payment Session Record
        try {
          await api.createPayment(orderId, paymentMethod);
        } catch (payErr) {
          console.warn('Payment session record skipped:', payErr?.message);
        }

        clearCart();

        // 3. Redirect based on method
        if (paymentMethod === 'cod') {
          navigate(`/order-success/${orderId}`);
        } else {
          // JazzCash / EasyPaisa — manual transfer instructions page
          navigate(`/order-success/${orderId}?method=${paymentMethod}`);
        }
      } else {
        setError(res.message || 'Failed to place order. Please try again.');
      }
    } catch (err) {
      console.error('Checkout submit error:', err);
      const msg = err.response?.data?.message || err.message || 'Unable to place your order. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">

      {/* Back Link */}
      <Link
        to="/cart"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-violet-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Cart</span>
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight gold-gradient-text">
          GUEST CHECKOUT & PAYMENT
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete your delivery details and select your preferred secure payment method.
        </p>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

        {/* Left Column: Customer Details & Payment Method Selection */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">

          {/* Shipping Form Card */}
          <div className="glass-card gold-border-glow p-5 sm:p-8 rounded-2xl sm:rounded-3xl space-y-5 sm:space-y-6">
            <div className="border-b border-violet-500/20 pb-3 sm:pb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-100 uppercase tracking-wider">
                1. Customer Shipping Details
              </h2>
              <p className="text-[11px] text-slate-400">No account required. Enter delivery contact details below.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 text-xs">

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5 sm:mb-2 text-[11px] sm:text-xs">Full Name *</label>
                <input
                  type="text"
                  name="customer_name"
                  required
                  placeholder="e.g. Alexander Vance"
                  value={formData.customer_name}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-violet-500/30 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5 sm:mb-2 text-[11px] sm:text-xs">Email Address *</label>
                <input
                  type="email"
                  name="customer_email"
                  required
                  placeholder="e.g. alexander@example.com"
                  value={formData.customer_email}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-violet-500/30 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5 sm:mb-2 text-[11px] sm:text-xs">Phone Number *</label>
                <input
                  type="tel"
                  name="customer_phone"
                  required
                  placeholder="e.g. +92 300 1234567"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-violet-500/30 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5 sm:mb-2 text-[11px] sm:text-xs">Shipping Street Address *</label>
                <input
                  type="text"
                  name="shipping_address"
                  required
                  placeholder="e.g. House #14, Street 9, Sector F-7"
                  value={formData.shipping_address}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-violet-500/30 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5 sm:mb-2 text-[11px] sm:text-xs">City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="e.g. Islamabad"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-violet-500/30 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5 sm:mb-2 text-[11px] sm:text-xs">Postal / ZIP Code *</label>
                <input
                  type="text"
                  name="postal_code"
                  required
                  placeholder="e.g. 44000"
                  value={formData.postal_code}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-violet-500/30 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-400"
                />
              </div>

            </div>
          </div>

          {/* Payment Method Selector Card */}
          <div className="glass-card gold-border-glow p-5 sm:p-8 rounded-2xl sm:rounded-3xl space-y-5 sm:space-y-6">
            <div className="border-b border-violet-500/20 pb-3 sm:pb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-100 uppercase tracking-wider">
                2. Select Secure Payment Method
              </h2>
              <p className="text-[11px] text-slate-400">Choose Cash on Delivery or pay via JazzCash / EasyPaisa transfer.</p>
            </div>

            <div className="space-y-3 sm:space-y-4">

              {/* 1. Cash on Delivery (COD) */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  paymentMethod === 'cod'
                    ? 'bg-violet-500/10 border-violet-500/60 shadow-[0_0_15px_rgba(167,139,250,0.2)]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-violet-500/30'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl gold-gradient-bg flex items-center justify-center text-white font-bold shrink-0">
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h4 className="text-xs font-bold text-slate-100">Cash on Delivery (COD)</h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-extrabold uppercase">
                        Active & Ready
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Pay in cash when your parcel is delivered to your address.</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethodRadio"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="accent-[#a78bfa] shrink-0"
                />
              </div>

              {/* 2. JazzCash */}
              <div
                onClick={() => setPaymentMethod('jazzcash')}
                className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border cursor-pointer transition-all space-y-3 ${
                  paymentMethod === 'jazzcash'
                    ? 'bg-red-500/10 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-red-500/30'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold shrink-0">
                      <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <h4 className="text-xs font-bold text-slate-100">JazzCash Mobile Transfer</h4>
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-extrabold uppercase">
                          Instant
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Send payment via JazzCash app or *786# and share screenshot on WhatsApp.</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethodRadio"
                    checked={paymentMethod === 'jazzcash'}
                    onChange={() => setPaymentMethod('jazzcash')}
                    className="accent-red-400 shrink-0"
                  />
                </div>

                {/* JazzCash Account Details (shown when selected) */}
                {paymentMethod === 'jazzcash' && (
                  <div className="mt-3 pt-3 border-t border-red-500/30 space-y-2 text-[11px]">
                    <div className="flex items-center justify-between bg-slate-900/80 rounded-lg px-3 py-2 border border-red-500/20">
                      <span className="text-slate-400">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-red-200">{MERCHANT.jazzcash.number}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); copyToClipboard(MERCHANT.jazzcash.number, 'jc_num'); }}
                          className="text-red-300 hover:text-red-100 transition-colors"
                          title="Copy"
                        >
                          {copiedField === 'jc_num' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-slate-900/80 rounded-lg px-3 py-2 border border-red-500/20">
                      <span className="text-slate-400">Account Name:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-200">{MERCHANT.jazzcash.name}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); copyToClipboard(MERCHANT.jazzcash.name, 'jc_name'); }}
                          className="text-red-300 hover:text-red-100 transition-colors"
                          title="Copy"
                        >
                          {copiedField === 'jc_name' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-red-300/80 leading-relaxed pt-1">
                      💡 After placing order, send <b>{formatCurrency(cartTotal)}</b> to the above JazzCash account and share the screenshot on WhatsApp to confirm your order.
                    </p>
                  </div>
                )}
              </div>

              {/* 3. EasyPaisa */}
              <div
                onClick={() => setPaymentMethod('easypaisa')}
                className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border cursor-pointer transition-all space-y-3 ${
                  paymentMethod === 'easypaisa'
                    ? 'bg-emerald-500/10 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/30'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold shrink-0">
                      <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <h4 className="text-xs font-bold text-slate-100">EasyPaisa Mobile Transfer</h4>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-extrabold uppercase">
                          Instant
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Send payment via EasyPaisa app or *786# and share screenshot on WhatsApp.</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethodRadio"
                    checked={paymentMethod === 'easypaisa'}
                    onChange={() => setPaymentMethod('easypaisa')}
                    className="accent-emerald-400 shrink-0"
                  />
                </div>

                {/* EasyPaisa Account Details */}
                {paymentMethod === 'easypaisa' && (
                  <div className="mt-3 pt-3 border-t border-emerald-500/30 space-y-2 text-[11px]">
                    <div className="flex items-center justify-between bg-slate-900/80 rounded-lg px-3 py-2 border border-emerald-500/20">
                      <span className="text-slate-400">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-200">{MERCHANT.easypaisa.number}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); copyToClipboard(MERCHANT.easypaisa.number, 'ep_num'); }}
                          className="text-emerald-300 hover:text-emerald-100 transition-colors"
                          title="Copy"
                        >
                          {copiedField === 'ep_num' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-slate-900/80 rounded-lg px-3 py-2 border border-emerald-500/20">
                      <span className="text-slate-400">Account Name:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-200">{MERCHANT.easypaisa.name}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); copyToClipboard(MERCHANT.easypaisa.name, 'ep_name'); }}
                          className="text-emerald-300 hover:text-emerald-100 transition-colors"
                          title="Copy"
                        >
                          {copiedField === 'ep_name' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-emerald-300/80 leading-relaxed pt-1">
                      💡 After placing order, send <b>{formatCurrency(cartTotal)}</b> to the above EasyPaisa account and share the screenshot on WhatsApp to confirm your order.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Order Summary & Place Order Button */}
        <div className="lg:col-span-5 glass-card gold-border-glow p-5 sm:p-8 rounded-2xl sm:rounded-3xl space-y-5 sm:space-y-6 lg:sticky lg:top-28">

          <div className="border-b border-violet-500/20 pb-3 sm:pb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 uppercase tracking-wider">
              3. Payable Total (PKR)
            </h2>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 divide-y divide-slate-800">
            {cart.map(item => (
              <div key={item.product.id} className="flex items-center justify-between gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <span className="font-bold text-violet-300 font-mono shrink-0">{item.quantity}x</span>
                  <span className="text-slate-200 line-clamp-1">{item.product.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-300 shrink-0">
                  {formatCurrency(Number(item.product.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-violet-500/20 space-y-3 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Cart Subtotal</span>
              <span className="font-mono font-bold text-slate-200">{formatCurrency(cartSubtotal)}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Delivery Fee</span>
              <span className="font-mono font-bold text-slate-200">{formatCurrency(deliveryFee)}</span>
            </div>

            <div className="pt-3 border-t border-violet-500/20 flex justify-between text-slate-100 text-sm font-bold">
              <span>Final Payable Amount</span>
              <span className="font-mono text-violet-300 text-lg sm:text-xl">{formatCurrency(cartTotal)}</span>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 sm:py-4 rounded-xl gold-gradient-bg text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(167,139,250,0.3)] hover:shadow-[0_0_30px_rgba(167,139,250,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Placing Order...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{paymentMethod === 'cod' ? 'Place Order (COD)' : 'Place Order & Pay'}</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 text-[10px] text-slate-400 justify-center">
            <ShieldCheck className="w-4 h-4 text-[#a78bfa]" />
            <span>Zero Raw Credentials Stored &bull; Server Signature Verified</span>
          </div>

        </div>

      </form>

    </div>
  );
}