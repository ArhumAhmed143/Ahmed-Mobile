import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, Shield, ShoppingCart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import Logo from './Logo';

const navigation = [
  { label: 'Home', path: '/' },
  { label: 'Shop Catalog', path: '/shop' },
  { label: 'Special Deals', path: '/deals' },
  { label: 'About', path: '/about' }
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useShop();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu whenever user navigates
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const query = searchTerm.trim();
    if (!query) {
      setSuggestions([]);
      setIsSearching(false);
      return undefined;
    }

    setIsSearching(true);
    const searchTimer = window.setTimeout(async () => {
      try {
        const response = await api.getProducts({ search: query });
        setSuggestions((response.data || []).slice(0, 5));
      } catch (error) {
        console.warn('Product search suggestions error:', error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => window.clearTimeout(searchTimer);
  }, [searchTerm]);

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const openProduct = (productId) => {
    navigate(`/product/${productId}`);
    setSearchTerm('');
    setSuggestions([]);
    setMobileMenuOpen(false);
  };

  const searchDropdown = (
    <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#16161a] shadow-[0_8px_20px_rgba(0,0,0,0.3)] z-50">
      {isSearching ? (
        <p className="px-4 py-3 text-xs text-slate-400">Searching...</p>
      ) : suggestions.length > 0 ? (
        suggestions.map((product) => (
          <button
            type="button"
            key={product.id}
            onClick={() => openProduct(product.id)}
            className="flex w-full items-center gap-3 border-b border-white/5 px-3 py-2 text-left transition-colors last:border-0 hover:bg-violet-500/15"
          >
            <img src={product.primary_image || product.image_url} alt="" className="h-10 w-10 rounded-lg bg-[#1e1e2e] object-cover" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold text-[#f5f5f7]">{product.name}</span>
              <span className="mt-0.5 block text-[11px] font-mono text-violet-300">{formatCurrency(product.price)}</span>
            </span>
          </button>
        ))
      ) : (
        <p className="px-4 py-3 text-xs text-slate-400">No products found</p>
      )}
    </div>
  );

  const searchField = (mobile = false) => (
    <div className={`relative ${mobile ? 'w-full' : 'hidden w-52 xl:w-64 lg:block'}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Search products..."
        aria-label="Search products"
        className="w-full rounded-xl border border-violet-500/25 bg-white/5 py-2.5 pl-9 pr-3 text-xs text-white outline-none transition focus:border-violet-400 focus:bg-white/10 placeholder:text-slate-500"
      />
      {searchTerm.trim() && searchDropdown}
    </div>
  );

  return (
    <header className={`sticky top-0 z-40 border-b transition-all duration-300 ${isScrolled ? 'border-white/10 bg-[rgba(13,13,15,0.92)] shadow-md backdrop-blur-xl' : 'border-white/10 bg-[#0d0d0f]'}`}>
      <div className="mx-auto flex h-[70px] sm:h-[76px] max-w-7xl items-center justify-between gap-3 px-4 text-[#f5f5f7] sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-fit shrink-0 items-center gap-2.5 sm:gap-3" aria-label="Ahmed Moblie home">
          <Logo className="w-10 h-10 sm:w-11 sm:h-11" />
          <span className="flex min-w-fit shrink-0 flex-col">
            <span className="whitespace-nowrap text-[16px] sm:text-[19px] font-extrabold uppercase leading-tight tracking-tight text-[#f5f5f7]">
              <span className="whitespace-nowrap">AHMED</span> <span className="whitespace-nowrap text-[#a78bfa]">MOBLIE</span>
            </span>
            <span className="mt-0.5 whitespace-nowrap text-[7.5px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Luxury Tech Accessories
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden h-full items-center gap-6 lg:gap-8 md:flex" aria-label="Main navigation">
          {navigation.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              className={`group relative flex h-full items-center text-xs font-extrabold uppercase tracking-wide transition-colors ${
                isActive(path) ? 'text-[#a78bfa]' : 'text-slate-400 hover:text-[#a78bfa]'
              }`}
            >
              {label}
              <span className={`absolute bottom-4 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-violet-400 transition-all duration-300 ${isActive(path) ? 'w-8' : 'w-0 group-hover:w-8'}`} />
            </Link>
          ))}
        </nav>

        {/* Right Action Icons */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {searchField()}
          
          <Link
            to="/cart"
            className="relative rounded-full p-2.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            title="Shopping cart"
            aria-label={`Shopping cart, ${cartCount} items`}
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full gold-gradient-bg px-1 text-[9px] font-extrabold text-white">
              {cartCount}
            </span>
          </Link>
          
          <Link
            to="/cart"
            className="hidden items-center gap-2 rounded-full border border-[#a78bfa]/30 bg-transparent px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-[#a78bfa] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#a78bfa]/10 hover:shadow-md sm:flex"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Cart ({cartCount})
          </Link>
          
          <Link
            to="/admin-login"
            className="hidden rounded-full p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-violet-300 lg:flex"
            title="Admin login"
            aria-label="Admin login"
          >
            <Shield className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 md:hidden focus:outline-none"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Smooth Collapsible Mobile & Tablet Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-white/10 bg-[#0d0d0f] px-4 py-4 text-xs font-extrabold uppercase tracking-wide md:hidden shadow-xl"
            aria-label="Mobile navigation"
          >
            <div className="mb-3">
              {searchField(true)}
            </div>
            <div className="space-y-1">
              {navigation.map(({ label, path }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block rounded-xl px-4 py-3 transition-colors ${
                    isActive(path)
                      ? 'bg-violet-500/15 text-[#a78bfa] font-black'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <Link
                to="/admin-login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-violet-300 transition-colors"
              >
                <Shield className="h-4 w-4 text-violet-400" />
                <span>Admin Login</span>
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}