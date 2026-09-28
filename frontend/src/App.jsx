import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ShopProvider, useShop } from './context/ShopContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Layout Components & Customer Pages
import Navbar from './components/Navbar';
import AnnouncementBar from './components/AnnouncementBar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Deals from './pages/Deals';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import PaymentProcessing from './pages/PaymentProcessing';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import About from './pages/About';

// Admin Components & Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './layouts/AdminLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import AdminProducts from './pages/admin/AdminProducts';
import AdminDeals from './pages/admin/AdminDeals';
import AdminFlashDeals from './pages/admin/AdminFlashDeals';
import AdminCategories from './pages/admin/AdminCategories';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import AdminOrders from './pages/admin/AdminOrders';
import OrderDetails from './pages/admin/OrderDetails';
import AdminInventory from './pages/admin/AdminInventory';
import AdminSettings from './pages/admin/AdminSettings';

import { CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Toast Notification Overlay
function ToastNotification() {
  const { toast } = useShop();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 glass-card gold-border-glow px-5 py-3 rounded-2xl flex items-center gap-3 text-slate-100 shadow-[0_0_30px_rgba(212,175,55,0.3)] bg-[#0C0C10]/95"
        >
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs font-semibold">{toast}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Scroll to top helper on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            
            {/* Admin Login Route */}
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* Protected Admin Dashboard Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="flash-deals" element={<AdminFlashDeals />} />
              <Route path="deals" element={<AdminDeals />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="products/edit/:id" element={<EditProduct />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<OrderDetails />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Public Customer Routes */}
            <Route
              path="/*"
              element={
                <div className="min-h-screen bg-[#0d0d0f] text-[#f5f5f7] flex flex-col justify-between selection:bg-violet-500 selection:text-[#0d0d0f]">
                  <AnnouncementBar />
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/deals" element={<Deals />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/product/:id" element={<ProductDetails />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                      <Route path="/payment-processing" element={<PaymentProcessing />} />
                      <Route path="/payment-success/:orderId" element={<PaymentSuccess />} />
                      <Route path="/payment-failed/:orderId" element={<PaymentFailed />} />
                    </Routes>
                  </main>
                  <Footer />
                  <CartDrawer />
                  <WhatsAppButton />
                  <ToastNotification />
                </div>
              }
            />

          </Routes>
        </Router>
      </ShopProvider>
    </AuthProvider>
  );
}
