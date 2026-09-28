import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { ShoppingBag, Search, Eye, RefreshCw, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Status Change Confirmation Modal State
  const [statusTarget, setStatusTarget] = useState(null); // { orderId, newStatus }
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminOrders();
      if (res.success && res.data) setOrders(res.data);
    } catch (err) {
      console.warn('Admin orders fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusSelect = (orderId, newStatus, currentStatus) => {
    if (newStatus === currentStatus) return;
    setStatusTarget({ orderId, newStatus, currentStatus });
  };

  const confirmStatusChange = async () => {
    if (!statusTarget) return;
    setIsUpdating(true);

    try {
      const res = await api.updateOrderStatus(statusTarget.orderId, statusTarget.newStatus);
      if (res.success) {
        setOrders(prev => prev.map(o => o.id === statusTarget.orderId ? { ...o, order_status: statusTarget.newStatus } : o));
        setStatusTarget(null);
      } else {
        alert(res.message || 'Failed to update order status.');
      }
    } catch (err) {
      console.error('Status update error:', err);
      alert('Error updating order status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = String(o.id).toLowerCase().includes(term) ||
                          (o.customer_name && o.customer_name.toLowerCase().includes(term)) ||
                          (o.customer_email && o.customer_email.toLowerCase().includes(term)) ||
                          (o.customer_phone && o.customer_phone.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'All' || o.order_status === statusFilter;
    const matchesPayment = paymentFilter === 'All' || o.payment_status === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight gold-gradient-text">
            ORDER MANAGEMENT
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor customer transactions, payment verification, and order shipping statuses.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-4 py-2.5 rounded-xl glass-card gold-border-glow text-amber-300 font-bold text-xs uppercase tracking-wider hover:bg-amber-500/10 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Control Bar: Search & Filter Controls */}
      <div className="glass-card gold-border-glow p-5 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-amber-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by Order ID, customer name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/90 border border-amber-500/30 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Order Status Filter */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900 border border-amber-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            >
              <option value="All">All Order Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="md:col-span-3">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full bg-slate-900 border border-amber-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            >
              <option value="All">All Payment Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>

        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card gold-border-glow rounded-3xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Order ID</th>
                <th className="pb-3 px-3">Customer</th>
                <th className="pb-3 px-3">Total Amount</th>
                <th className="pb-3 px-3">Payment</th>
                <th className="pb-3 px-3">Order Status</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">No matching orders found.</td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-900/40">
                    <td className="py-3.5 px-3 font-mono font-bold text-amber-300">#NXH-{order.id}</td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-100">{order.customer_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{order.customer_email}</div>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-100 text-sm">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase ${
                        order.payment_status === 'paid'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <select
                        value={order.order_status}
                        onChange={(e) => handleStatusSelect(order.id, e.target.value, order.order_status)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-bold uppercase focus:outline-none focus:border-amber-400"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="p-2 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors inline-flex items-center gap-1 text-xs font-bold"
                        title="View Order Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Order Status Changes */}
      <AnimatePresence>
        {statusTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStatusTarget(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0E0E14] border border-amber-500/30 rounded-3xl p-6 z-50 text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.9)] space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3 text-amber-400">
                  <AlertTriangle className="w-6 h-6" />
                  <h3 className="text-lg font-bold">Update Order Status?</h3>
                </div>
                <button onClick={() => setStatusTarget(null)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <p>Are you sure you want to change the status for order <strong>#NXH-{statusTarget.orderId}</strong>?</p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between font-bold">
                  <span className="text-slate-400 uppercase">{statusTarget.currentStatus}</span>
                  <span className="text-amber-400">&rarr;</span>
                  <span className="text-amber-300 uppercase">{statusTarget.newStatus}</span>
                </div>
                {statusTarget.newStatus === 'cancelled' && (
                  <p className="text-amber-200 font-semibold bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30">
                    Notice: Cancelling this order will automatically restore stock for all items back to MySQL inventory.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setStatusTarget(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 text-xs font-bold"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmStatusChange}
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl gold-gradient-bg text-black hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] text-xs font-extrabold flex items-center gap-2 disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Confirm Update'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
