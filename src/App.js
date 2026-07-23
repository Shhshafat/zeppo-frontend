import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Order from './pages/Order';
import Track from './pages/Track';
import Admin from './pages/Admin';
import DeliveryBoy from './pages/DeliveryBoy';
import Profile from './pages/Profile';
import Location from './pages/Location';
import DeliverySignup from './pages/DeliverySignup';
import Stores from './pages/Stores';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Cart from './pages/Cart';

export const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  return token && role === 'admin' ? children : <Navigate to="/" />;
};

function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 2500);
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div style={bannerStyles.offline}>
        📡 No internet connection — some features may not work
      </div>
    );
  }
  if (showReconnected) {
    return (
      <div style={bannerStyles.online}>
        ✅ Back online!
      </div>
    );
  }
  return null;
}

const bannerStyles = {
  offline: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
    background: '#dc2626', color: 'white', textAlign: 'center',
    padding: '10px 16px', fontSize: '13px', fontWeight: '600',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  online: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
    background: '#16a34a', color: 'white', textAlign: 'center',
    padding: '10px 16px', fontSize: '13px', fontWeight: '600',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
};

function App() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );
  const toggleDark = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    localStorage.setItem('darkMode', newVal);
  };

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('zeppo_cart');
      return saved ? JSON.parse(saved) : { restaurantId: null, restaurantName: null, restaurantEmoji: null, items: [] };
    } catch {
      return { restaurantId: null, restaurantName: null, restaurantEmoji: null, items: [] };
    }
  });

  useEffect(() => {
    localStorage.setItem('zeppo_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (restaurantId, restaurantName, restaurantEmoji, item, label, price) => {
    setCart(prev => {
      if (prev.restaurantId && prev.restaurantId !== restaurantId && prev.items.length > 0) {
        const confirmSwitch = window.confirm(`Your cart has items from ${prev.restaurantName}. Clear cart and add from ${restaurantName} instead?`);
        if (!confirmSwitch) return prev;
      }
      const sameRestaurant = prev.restaurantId === restaurantId ? prev.items : [];
      const key = `${item.id}-${label}`;
      const existing = sameRestaurant.find(c => c.key === key);
      let newItems;
      if (existing) {
        newItems = sameRestaurant.map(c => c.key === key ? { ...c, qty: c.qty + 1 } : c);
      } else {
        newItems = [...sameRestaurant, { key, id: item.id, name: item.name, label, price, qty: 1, is_veg: item.is_veg }];
      }
      return { restaurantId, restaurantName, restaurantEmoji, items: newItems };
    });
  };

  const changeQty = (key, delta) => {
    setCart(prev => {
      const newItems = prev.items.map(c => c.key === key ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0);
      return newItems.length === 0 ? { restaurantId: null, restaurantName: null, restaurantEmoji: null, items: [] } : { ...prev, items: newItems };
    });
  };

  const removeItem = (key) => {
    setCart(prev => {
      const newItems = prev.items.filter(c => c.key !== key);
      return newItems.length === 0 ? { restaurantId: null, restaurantName: null, restaurantEmoji: null, items: [] } : { ...prev, items: newItems };
    });
  };

  const clearCart = () => setCart({ restaurantId: null, restaurantName: null, restaurantEmoji: null, items: [] });

  const cartCount = cart.items.reduce((sum, c) => sum + c.qty, 0);
  const cartTotal = cart.items.reduce((sum, c) => sum + (c.price * c.qty), 0);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDark }}>
      <CartContext.Provider value={{ cart, addToCart, changeQty, removeItem, clearCart, cartCount, cartTotal }}>
        <OfflineBanner />
        <div style={{ background: darkMode ? '#121212' : '#f7f7f7', minHeight: '100vh' }}>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
              <Route path="/order/:id" element={<PrivateRoute><Order /></PrivateRoute>} />
              <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
              <Route path="/track" element={<PrivateRoute><Track /></PrivateRoute>} />
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="/delivery" element={<PrivateRoute><DeliveryBoy /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/location" element={<PrivateRoute><Location /></PrivateRoute>} />
              <Route path="/delivery-signup" element={<DeliverySignup />} />
              <Route path="/stores" element={<PrivateRoute><Stores /></PrivateRoute>} />
            </Routes>
          </Router>
        </div>
      </CartContext.Provider>
    </ThemeContext.Provider>
  );
}
export default App;
