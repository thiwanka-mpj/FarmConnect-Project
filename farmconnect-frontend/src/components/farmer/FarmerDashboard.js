import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import productService from '../../services/productService';
import orderService from '../../services/orderService';
import { toast } from 'react-toastify';
import '../../styles/Dashboard.css';

const FarmerDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !user.userId) {
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const products = await productService.getProductsByFarmer(user.userId);
        const orders = await orderService.getOrdersByFarmer(user.userId, token);

        const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;
        const totalRevenue = orders
          .filter((o) => o.status === 'DELIVERED')
          .reduce((sum, o) => sum + o.totalAmount, 0);

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          pendingOrders,
          totalRevenue,
        });

        setRecentOrders(orders.slice(0, 5));
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#ffc107',
      CONFIRMED: '#17a2b8',
      PREPARING: '#fd7e14',
      READY_FOR_DELIVERY: '#6f42c1',
      SHIPPED: '#007bff',
      DELIVERED: '#28a745',
      CANCELLED: '#dc3545',
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Farmer Dashboard</h1>
        <p>Welcome back, {user.fullName}!</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#52b788' }}>
            📦
          </div>
          <div className="stat-info">
            <h3>{stats.totalProducts}</h3>
            <p>Total Products</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#17a2b8' }}>
            🛒
          </div>
          <div className="stat-info">
            <h3>{stats.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ffc107' }}>
            ⏳
          </div>
          <div className="stat-info">
            <h3>{stats.pendingOrders}</h3>
            <p>Pending Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#28a745' }}>
            💰
          </div>
          <div className="stat-info">
            <h3>Rs. {stats.totalRevenue.toFixed(2)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/farmer/products/new" className="action-button primary">
          + Add New Product
        </Link>
        <Link to="/farmer/products" className="action-button secondary">
          Manage Products
        </Link>
        <Link to="/farmer/orders" className="action-button secondary">
          View All Orders
        </Link>
      </div>

      <div className="recent-section">
        <h2>Recent Orders</h2>

        {recentOrders.length === 0 ? (
          <p className="no-data">No orders yet</p>
        ) : (
          <div className="recent-orders">
            {recentOrders.map((order) => (
              <div key={order.orderId} className="recent-order-card">
                <div className="order-header-simple">
                  <span className="order-id-simple">Order #{order.orderId}</span>
                  <span
                    className="order-status-simple"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="order-details-simple">
                  <span>Items: {order.orderItems.length}</span>
                  <span className="order-amount-simple">
                    Rs. {order.totalAmount.toFixed(2)}
                  </span>
                </div>

                <Link
                  to="/farmer/orders"
                  className="view-order-link"
                >
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;