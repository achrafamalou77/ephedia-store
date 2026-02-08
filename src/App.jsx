import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';

import ProductPage from './pages/ProductPage';
import AdminOrders from './pages/AdminOrders';
import CartPage from './pages/CartPage';
import ThankYou from './pages/ThankYou';
import SearchPage from './pages/SearchPage';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductPage />} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute>
                <AdminOrders />
              </ProtectedRoute>
            } />

            <Route path="/login" element={<Login />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/about" element={<div className="text-center py-20">About Section</div>} />
          </Routes>
        </Layout>
      </Router>
    </CartProvider>
  );
}

export default App;
