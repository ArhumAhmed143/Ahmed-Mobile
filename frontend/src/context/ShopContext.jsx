import React, { createContext, useContext, useState, useEffect } from 'react';

const ShopContext = createContext();

export const DELIVERY_FEE = 200;

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('nexorahub_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('nexorahub_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Sync cart with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nexorahub_cart', JSON.stringify(cart));
    } catch (err) {
      console.warn('LocalStorage save cart error:', err);
    }
  }, [cart]);

  // Sync wishlist with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nexorahub_wishlist', JSON.stringify(wishlist));
    } catch (err) {
      console.warn('LocalStorage save wishlist error:', err);
    }
  }, [wishlist]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const addToCart = (product, quantity = 1) => {
    const availableStock = Number(product.stock_quantity ?? product.stock ?? 10);

    if (availableStock <= 0) {
      showToast(`" ${product.name} " is out of stock`);
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > availableStock) {
          showToast(`Only ${availableStock} units available in stock`);
          return prevCart.map(item =>
            item.product.id === product.id ? { ...item, quantity: availableStock } : item
          );
        }
        showToast(`Updated "${product.name}" quantity in cart`);
        return prevCart.map(item =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        const initialQty = Math.min(quantity, availableStock);
        showToast(`Added "${product.name}" to cart`);
        return [...prevCart, { product, quantity: initialQty }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    showToast('Removed item from cart');
  };

  const updateQuantity = (productId, newQuantity) => {
    setCart(prevCart => {
      const target = prevCart.find(item => item.product.id === productId);
      if (!target) return prevCart;

      const availableStock = Number(target.product.stock_quantity ?? target.product.stock ?? 10);

      if (newQuantity <= 0) {
        return prevCart.filter(item => item.product.id !== productId);
      }

      if (newQuantity > availableStock) {
        showToast(`Maximum ${availableStock} units available in stock`);
        return prevCart.map(item =>
          item.product.id === productId ? { ...item, quantity: availableStock } : item
        );
      }

      return prevCart.map(item =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('nexorahub_cart');
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from wishlist');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Added to wishlist');
        return [...prev, productId];
      }
    });
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + (Number(item.product.price) * item.quantity), 0);
  const cartTotal = cartSubtotal > 0 ? cartSubtotal + DELIVERY_FEE : 0;

  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        cartCount,
        cartSubtotal,
        cartTotal,
        deliveryFee: DELIVERY_FEE,
        toast
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  return useContext(ShopContext);
}
