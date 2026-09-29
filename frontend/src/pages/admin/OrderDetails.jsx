import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { 
  ArrowLeft, 
  ShoppingBag, 
  ShieldCheck, 
  UserCheck, 
  MapPin, 
  CreditCard, 
  Save,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import ProductImage from '../../components/ProductImage';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('pending');
  
  // 🔔 NEW: Payment verification states
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [rejectingPayment, setRejectingPayment] = useState(false);
  const [paymentTxId, setPaymentTxId] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchOrder = () => {
    api.getAdminOrderById(id)
      .then(res => {
        if (res.success && res.data) {
          setOrder(res.data);
          setStatus(res.data.order_status || 'pending');
          // Pre-fill transaction ID if exists
          if (res.data.payments && res.data.payments.length > 0) {
            setPaymentTxId(res.data.payments[res.data.payments.length - 1].transaction_id || '');
          }
        }
      })
      .catch(err => console.warn('Order details fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async () => {
    setSaving(true);
    try {
      const res = await api.updateOrderStatus(id, status);
      if (res.success) {
        alert(`Order status updated to "${status}"`);
      } else {
        alert(res.message || 'Failed to update status.');
      }
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update status.');
    } finally {
      setSaving(false);
    }
  };

  // 🔔 NEW: Verify Payment Handler
  const handleVerifyPayment = async () => {
    if (!window.confirm(
      `Mark this payment as PAID?\n\n` +
      `Order Total: ${formatCurrency(order.total_amount)}\n` +
      `Customer will receive a confirmation email.`
    )) return;

    setVerifyingPayment(true);
    try {
      const res = await api.adminVerifyPayment(id, paymentTxId);
      if (res.success) {
        alert('✅ Payment verified! Confirmation email sent to customer.');
        fetchOrder(); // Refresh order data
      } else {
        alert(res.message || 'Failed to verify payment.');
      }
    } catch (err) {
      console.error('Verify payment error:', err);
      alert(err.response?.data?.message || 'Failed to verify payment.');
    } finally {
      setVerifyingPayment(false);
    }
  };

  // 🔔 NEW: Reject Payment Handler
  const handleRejectPayment = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    if (!window.confirm(
      `Mark payment as FAILED?\n\n` +
      `Reason: ${rejectReason}\n\n` +
      `Customer will be notified via email.`
    )) return;

    setRejectingPayment(true);
    try {
      const res = await api.adminRejectPayment(id, rejectReason);
      if (res.success) {
        alert('Payment marked as failed. Customer notified.');
        setShowRejectForm(false);
        setRejectReason('');
        fetchOrder();
      } else {
        alert(res.message || 'Failed to reject payment.');
      }
    } catch (err) {
      console.error('Reject payment error:', err);
      alert(err.response?.data?.message || 'Failed to reject payment.');
    } finally {
      setRejectingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading order records...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-xs text-slate-400">Order not found.</p>
        <Link to="/admin/orders" className="text-violet-300 font-bold text-xs">Back to Orders</Link>
      </div>
    );
  }

  const isPaid = order.payment_status === 'paid';
  const isFailed = order.payment_status === 'failed';
  const paymentMethod = order.payments?.[0]?.payment_method || order.payment_method || 'COD';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-violet-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Orders</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-violet-500/20 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black font-mono gold-gradient-text">
              #NXH-{order.id?.slice(-8).toUpperCase()}
            </h1>
            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${
              isPaid
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                : isFailed
                ? 'bg-red-950 text-red-300 border border-red-500/40'
                : 'bg-amber-950 text-amber-300 border border-amber-500/40'
            }`}>
              Payment: {order.payment_status || 'pending'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Placed on: {new Date(order.created_at).toLocaleString()}
          </p>
        </div>

        {/* Status Dropdown Controls */}
        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-[#16161a] border border-violet-500/30 rounded-xl px-4 py-2.5 text-xs text-violet-300 font-bold uppercase focus:outline-none focus:border-violet-400 cursor-pointer"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={handleStatusUpdate}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl gold-gradient-bg text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(167,139,250,0.3)] hover:shadow-[0_0_25px_rgba(167,139,250,0.5)] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Status'}</span>
          </button>
        </div>
      </div>

      {/* 🔔 NEW: PAYMENT VERIFICATION PANEL */}
      {!isPaid && (
        <div className={`p-6 rounded-3xl border-2 ${
          isFailed 
            ? 'bg-red-950/30 border-red-500/40' 
            : 'bg-amber-950/30 border-amber-500/40'
        } space-y-4`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl ${isFailed ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
              <AlertCircle className={`w-5 h-5 ${isFailed ? 'text-red-400' : 'text-amber-400'}`} />
            </div>
            <div className="flex-1">
              <h3 className={`text-sm font-black uppercase tracking-wider ${isFailed ? 'text-red-200' : 'text-amber-200'}`}>
                {isFailed ? '⚠️ Payment Failed' : '⏳ Payment Pending Verification'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isFailed 
                  ? 'Payment was marked as failed. Customer has been notified.' 
                  : `Payment method: ${paymentMethod.toUpperCase()}. Please verify the payment and confirm.`}
              </p>
            </div>
          </div>

          {!isFailed && (
            <>
              {/* Transaction ID Input */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Transaction ID / Reference (Optional)
                </label>
                <input
                  type="text"
                  value={paymentTxId}
                  onChange={(e) => setPaymentTxId(e.target.value)}
                  placeholder="e.g. TXN-123456789 or JazzCash Ref"
                  className="w-full bg-[#16161a] border border-violet-500/30 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={handleVerifyPayment}
                  disabled={verifyingPayment || rejectingPayment}
                  className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifyingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>✅ Verify Payment as Paid</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowRejectForm(!showRejectForm)}
                  disabled={verifyingPayment || rejectingPayment}
                  className="py-3 px-5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 font-extrabold text-xs uppercase tracking-wider hover:bg-red-900/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Payment</span>
                </button>
              </div>

              {/* Reject Form */}
              {showRejectForm && (
                <div className="pt-4 border-t border-red-500/30 space-y-3">
                  <label className="block text-[11px] font-bold text-red-300 uppercase tracking-wider">
                    Reason for Rejection *
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows="3"
                    placeholder="e.g. Payment amount mismatch, fake screenshot, no transaction found..."
                    className="w-full bg-[#16161a] border border-red-500/30 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-400 resize-none"
                  />
                  <button
                    onClick={handleRejectPayment}
                    disabled={rejectingPayment || !rejectReason.trim()}
                    className="w-full py-3 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rejectingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Rejecting...</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>Confirm Rejection & Notify Customer</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Paid Confirmation Banner */}
      {isPaid && (
        <div className="p-5 rounded-3xl bg-emerald-950/30 border-2 border-emerald-500/40 flex items-center gap-4">
          <div className="p-2 rounded-xl bg-emerald-500/20">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-emerald-200">
              ✅ Payment Verified & Confirmed
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Payment received via {paymentMethod.toUpperCase()}. Confirmation email sent to customer.
            </p>
          </div>
        </div>
      )}

      {/* Grid: Order Info (Left) + Financial Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <div className="lg:col-span-8 space-y-6">
          
          {/* Customer Contact & Delivery Info */}
          <div className="glass-card gold-border-glow p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3 text-violet-400">
              <UserCheck className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Customer Shipping Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Full Name</span>
                <p className="font-bold text-slate-100">{order.customer_name}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Email & Phone</span>
                <p className="font-mono text-violet-300 truncate">{order.customer_email}</p>
                <p className="font-mono text-slate-300">{order.customer_phone}</p>
              </div>

              <div className="sm:col-span-2 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Shipping Address</span>
                <p className="text-slate-200">{order.shipping_address}, {order.city} ({order.postal_code})</p>
              </div>

              {order.order_notes && (
                <div className="sm:col-span-2 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Order Delivery Notes</span>
                  <p className="text-slate-300 italic">{order.order_notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Itemized Products Table */}
          <div className="glass-card gold-border-glow p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3 text-violet-400">
              <ShoppingBag className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Ordered Items</h3>
            </div>

            <div className="divide-y divide-slate-800/60">
              {order.items && order.items.map(item => (
                <div key={item.id || item._id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-violet-300">{item.quantity}x</span>
                    <div>
                      <h4 className="font-bold text-slate-100">{item.product_name}</h4>
                      <span className="text-[10px] font-mono text-slate-500">Unit: {formatCurrency(item.unit_price)}</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-100">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-4 glass-card gold-border-glow p-6 rounded-3xl space-y-6 lg:sticky lg:top-28">
          <div className="border-b border-slate-800 pb-3 text-violet-400 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Financial Breakdown</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono font-bold text-slate-200">{formatCurrency(order.subtotal || 0)}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Delivery Fee</span>
              <span className="font-mono font-bold text-slate-200">{formatCurrency(order.delivery_fee || 200)}</span>
            </div>

            <div className="pt-3 border-t border-violet-500/20 flex justify-between text-slate-100 text-sm font-bold">
              <span>Total Amount</span>
              <span className="font-mono text-violet-300 text-lg">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>

          {/* Payment Record Summary */}
          {order.payments && order.payments.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] font-extrabold uppercase text-violet-400">Payment Reference Record</span>
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Method:</span>
                <span className="font-mono font-bold uppercase">{order.payments[0].payment_method}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Status:</span>
                <span className={`font-mono font-bold uppercase ${
                  order.payments[0].status === 'paid' ? 'text-emerald-400' : 
                  order.payments[0].status === 'failed' ? 'text-red-400' : 
                  'text-amber-400'
                }`}>
                  {order.payments[0].status}
                </span>
              </div>
              {order.payments[0].transaction_id && (
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Transaction:</span>
                  <span className="font-mono font-bold truncate ml-2">{order.payments[0].transaction_id}</span>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}