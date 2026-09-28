import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  Layers, 
  ShoppingBag, 
  Boxes, 
  Tag, 
  Zap, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  UserCheck, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: '⚡ Flash Deals', path: '/admin/flash-deals', icon: Zap },
    { name: 'Deals Management', path: '/admin/deals', icon: Tag },
    { name: 'Categories', path: '/admin/categories', icon: Layers },
    { name: 'Add Product', path: '/admin/products/add', icon: PlusCircle },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Inventory', path: '/admin/inventory', icon: Boxes },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-[#08080A] text-slate-100 flex selection:bg-[#D4AF37] selection:text-black">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#0C0C10] border-r border-amber-500/20 flex-col justify-between p-6 shrink-0 sticky top-0 h-screen">
        <div className="space-y-8">
          
          {/* Admin Logo */}
          <Link to="/admin" className="flex min-w-fit shrink-0 items-center gap-3">
            <Logo className="w-10 h-10" />
            <div className="flex flex-col min-w-fit shrink-0">
              <span className="whitespace-nowrap text-lg font-black tracking-tight gold-gradient-text">
                <span className="whitespace-nowrap">AHMED</span> <span className="whitespace-nowrap">MOBLIE</span>
              </span>
              <span className="whitespace-nowrap text-[9px] uppercase tracking-widest text-amber-300/80 font-bold -mt-1">
                Admin Panel
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5 font-semibold text-xs">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'gold-gradient-bg text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                      : 'text-slate-300 hover:text-amber-300 hover:bg-amber-500/10'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-4 pt-6 border-t border-amber-500/10">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-amber-300 transition-colors py-2 px-3 rounded-lg hover:bg-slate-900"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Main Store</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 hover:bg-red-900/40 text-xs font-bold transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 glass-card border-b border-amber-500/20 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-slate-900 transition-colors"
              aria-label="Toggle admin navigation"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            <h2 className="text-sm sm:text-base md:text-lg font-extrabold uppercase tracking-wider gold-gradient-text truncate">
              Ahmed Moblie Control Center
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full glass-card gold-border-glow flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
              <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37]" />
              <span className="font-mono text-slate-200 font-bold truncate max-w-[100px] sm:max-w-none">{admin?.username || 'Admin'}</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </header>

        {/* Mobile Collapsible Sidebar */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileSidebarOpen(false)}
                className="fixed inset-0 bg-black/80 z-40 lg:hidden"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 w-64 bg-[#0C0C10] border-r border-amber-500/20 z-50 p-6 flex flex-col justify-between overflow-y-auto"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
                    <div className="flex items-center gap-2.5">
                      <Logo className="w-8 h-8" />
                      <span className="whitespace-nowrap font-bold tracking-tight gold-gradient-text">
                        <span className="whitespace-nowrap">AHMED</span> <span className="whitespace-nowrap">MOBLIE</span>
                      </span>
                    </div>
                    <button onClick={() => setIsMobileSidebarOpen(false)} className="text-slate-400 p-1">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="space-y-1.5 text-xs font-semibold">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          location.pathname === item.path
                            ? 'gold-gradient-bg text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                            : 'text-slate-300 hover:text-amber-300 hover:bg-amber-500/10'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </nav>
                </div>

                <div className="space-y-3 pt-6 border-t border-amber-500/10">
                  <Link
                    to="/"
                    target="_blank"
                    className="flex items-center gap-2 text-xs text-slate-400 hover:text-amber-300 transition-colors py-2 px-3 rounded-lg hover:bg-slate-900"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Main Store</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <main className="p-4 sm:p-6 md:p-8 flex-1 min-w-0 overflow-x-hidden">
          <Outlet />
        </main>

      </div>

    </div>
  );
}
