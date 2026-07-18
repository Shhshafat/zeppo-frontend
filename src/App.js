import React, { createContext, useContext, useState } from 'react';
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

export const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  return token && role === 'admin' ? children : <Navigate to="/" />;
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

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDark }}>
      <div style={{ background: darkMode ? '#121212' : '#f7f7f7', minHeight: '100vh' }}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/order/:id" element={<PrivateRoute><Order /></PrivateRoute>} />
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
    </ThemeContext.Provider>
  );
}

export default App;
