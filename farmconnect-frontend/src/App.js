import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './components/common/Home';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';

// Customer Components
import ProductList from './components/customer/ProductList';
import Cart from './components/customer/Cart';
import MyOrders from './components/customer/MyOrders';

// Farmer Components
import FarmerDashboard from './components/farmer/FarmerDashboard';
import MyProducts from './components/farmer/MyProducts';
import AddProduct from './components/farmer/AddProduct';
import FarmerOrders from './components/farmer/FarmerOrders';

// Rider Components
import RiderDashboard from './components/rider/RiderDashboard';
import MyDeliveries from './components/rider/MyDeliveries';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import OrderManagement from './components/admin/OrderManagement';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <div className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/products" element={<ProductList />} />

              {/* Customer Routes */}
              <Route
                path="/customer/cart"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/orders"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <MyOrders />
                  </ProtectedRoute>
                }
              />

              {/* Farmer Routes */}
              <Route
                path="/farmer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['FARMER']}>
                    <FarmerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/products"
                element={
                  <ProtectedRoute allowedRoles={['FARMER']}>
                    <MyProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/products/new"
                element={
                  <ProtectedRoute allowedRoles={['FARMER']}>
                    <AddProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/orders"
                element={
                  <ProtectedRoute allowedRoles={['FARMER']}>
                    <FarmerOrders />
                  </ProtectedRoute>
                }
              />

              {/* Rider Routes */}
              <Route
                path="/rider/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['RIDER']}>
                    <RiderDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rider/deliveries"
                element={
                  <ProtectedRoute allowedRoles={['RIDER']}>
                    <MyDeliveries />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <OrderManagement />
                  </ProtectedRoute>
                }
              />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Footer />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;