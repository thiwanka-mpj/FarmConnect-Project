import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import { toast } from 'react-toastify';
import '../../styles/Dashboard.css';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await adminService.getDashboardStatistics(token);
      setStats(data);
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>System Overview and Management</p>
      </div>

      <div className="admin-stats-section">
        <h2 className="section-title">User Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#6f42c1' }}>
              👥
            </div>
            <div className="stat-info">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#17a2b8' }}>
              🛒
            </div>
            <div className="stat-info">
              <h3>{stats.totalCustomers}</h3>
              <p>Customers</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#52b788' }}>
              👨‍🌾
            </div>
            <div className="stat-info">
              <h3>{stats.totalFarmers}</h3>
              <p>Farmers</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fd7e14' }}>
              🚴
            </div>
            <div className="stat-info">
              <h3>{stats.totalRiders}</h3>
              <p>Riders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-stats-section">
        <h2 className="section-title">Product Statistics</h2>
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
            <div className="stat-icon" style={{ backgroundColor: '#28a745' }}>
              ✅
            </div>
            <div className="stat-info">
              <h3>{stats.availableProducts}</h3>
              <p>Available Products</p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-stats-section">
        <h2 className="section-title">Order Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#17a2b8' }}>
              🛍️
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
              ✅
            </div>
            <div className="stat-info">
              <h3>{stats.deliveredOrders}</h3>
              <p>Delivered Orders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-stats-section">
        <h2 className="section-title">Revenue Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card large">
            <div className="stat-icon" style={{ backgroundColor: '#28a745' }}>
              💰
            </div>
            <div className="stat-info">
              <h3>Rs. {stats.totalRevenue.toFixed(2)}</h3>
              <p>Total Revenue</p>
            </div>
          </div>

          <div className="stat-card large">
            <div className="stat-icon" style={{ backgroundColor: '#007bff' }}>
              💵
            </div>
            <div className="stat-info">
              <h3>Rs. {stats.deliveredRevenue.toFixed(2)}</h3>
              <p>Delivered Revenue</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/admin/users" className="action-button primary">
          Manage Users
        </Link>
        <Link to="/admin/products" className="action-button secondary">
          View Products
        </Link>
        <Link to="/admin/orders" className="action-button secondary">
          View Orders
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;