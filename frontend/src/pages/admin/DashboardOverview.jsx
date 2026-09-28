import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { Package, ShoppingBag, Clock, AlertTriangle, DollarSign, ArrowUpRight, TrendingUp, RefreshCw, Eye } from 'lucide-react';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    verifiedPaidRevenue: 0,
    recentOrders: [],
    topProducts: []
  });

  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    setLoading(true);
    api.getAdminStats()
      .then(res => {
        if (res.success && res.data) {
          setStats(res.data);
        }
      })
      .catch(err => console.warn('Admin stats fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight gold-gradient-text">
            DASHBOARD OVERVIEW
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics, order volume, catalog status, and verified revenue.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="px-4 py-2.5 rounded-xl glass-card gold-border-glow text-amber-300 font-bold text-xs uppercase tracking-wider hover:bg-amber-500/10 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* 5 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Products */}
        <div className="glass-card gold-border-glow p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Products</span>
            <Package className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-100">{stats.totalProducts}</div>
          <p className="text-[10px] text-slate-500">Active catalog items</p>
        </div>

        {/* Total Orders */}
        <div className="glass-card gold-border-glow p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Orders</span>
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-100">{stats.totalOrders}</div>
          <p className="text-[10px] text-slate-500">Customer transactions</p>
        </div>

        {/* Pending Orders */}
        <div className="glass-card gold-border-glow p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Pending Orders</span>
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-300">{stats.pendingOrders}</div>
          <p className="text-[10px] text-slate-500">Awaiting processing</p>
        </div>

        {/* Low Stock Products */}
        <div className="glass-card gold-border-glow p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Low Stock</span>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black font-mono text-red-400">{stats.lowStockProducts}</div>
          <p className="text-[10px] text-slate-500">&le; 5 units remaining</p>
        </div>

        {/* Verified Paid Revenue */}
        <div className="glass-card gold-border-glow p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Paid Revenue</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-300">
            {formatCurrency(stats.verifiedPaidRevenue)}
          </div>
          <p className="text-[10px] text-slate-500">Verified paid orders only</p>
        </div>

      </div>

      {/* Main Grid: Recent Orders (Left) + Top Selling Products (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 glass-card gold-border-glow p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">Recent Orders</h2>
            </div>
            <Link to="/admin/orders" className="text-xs font-bold text-amber-300 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-3">Order ID</th>
                  <th className="pb-3 px-3">Customer</th>
                  <th className="pb-3 px-3">Total</th>
                  <th className="pb-3 px-3">Payment</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">Loading recent orders...</td>
                  </tr>
                ) : stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">No orders recorded yet.</td>
                  </tr>
                ) : (
                  stats.recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-3 font-mono font-bold text-amber-300">#NXH-{order.id}</td>
                      <td className="py-3 px-3 font-bold text-slate-100">{order.customer_name}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-200">{formatCurrency(order.total_amount)}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          order.payment_status === 'paid'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                        }`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-3 uppercase text-[10px] font-bold text-slate-300">{order.order_status}</td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-amber-300 transition-colors inline-block"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-4 glass-card gold-border-glow p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 border-b border-amber-500/20 pb-4 text-amber-400">
            <TrendingUp className="w-5 h-5" />
            <h2 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">Top Selling Products</h2>
          </div>

          <div className="space-y-3">
            {stats.topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No sales data available yet.</p>
            ) : (
              stats.topProducts.map((prod, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-200 line-clamp-1">{prod.product_name}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">{prod.total_sold} units sold</span>
                  </div>
                  <span className="font-mono font-bold text-amber-300">{formatCurrency(prod.total_revenue)}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
