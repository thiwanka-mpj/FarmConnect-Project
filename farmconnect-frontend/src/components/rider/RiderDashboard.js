import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import deliveryService from '../../services/deliveryService';
import { toast } from 'react-toastify';
import '../../styles/Dashboard.css';

const RiderDashboard = () => {
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    inProgressDeliveries: 0,
  });
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // 1. The data fetching logic is now inside the effect
    const fetchDashboardData = async () => {
      if (!user || !user.userId) {
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const deliveries = await deliveryService.getDeliveriesByRider(
          user.userId,
          token
        );

        const pending = deliveries.filter((d) => d.status === 'ASSIGNED').length;
        const completed = deliveries.filter((d) => d.status === 'DELIVERED').length;
        const inProgress = deliveries.filter(
          (d) => d.status === 'PICKED_UP' || d.status === 'IN_TRANSIT'
        ).length;

        setStats({
          totalDeliveries: deliveries.length,
          pendingDeliveries: pending,
          completedDeliveries: completed,
          inProgressDeliveries: inProgress,
        });

        setRecentDeliveries(deliveries.slice(0, 5));
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]); // 2. `user` is now correctly listed as a dependency

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#6c757d',
      ASSIGNED: '#ffc107',
      PICKED_UP: '#17a2b8',
      IN_TRANSIT: '#007bff',
      DELIVERED: '#28a745',
      FAILED: '#dc3545',
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

  // ... The rest of your component's JSX remains the same
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Rider Dashboard</h1>
        <p>Welcome back, {user.fullName}!</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#17a2b8' }}>
            📦
          </div>
          <div className="stat-info">
            <h3>{stats.totalDeliveries}</h3>
            <p>Total Deliveries</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ffc107' }}>
            ⏳
          </div>
          <div className="stat-info">
            <h3>{stats.pendingDeliveries}</h3>
            <p>Pending Deliveries</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#007bff' }}>
            🚚
          </div>
          <div className="stat-info">
            <h3>{stats.inProgressDeliveries}</h3>
            <p>In Progress</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#28a745' }}>
            ✅
          </div>
          <div className="stat-info">
            <h3>{stats.completedDeliveries}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/rider/deliveries" className="action-button primary">
          View All Deliveries
        </Link>
      </div>

      <div className="recent-section">
        <h2>Recent Deliveries</h2>

        {recentDeliveries.length === 0 ? (
          <p className="no-data">No deliveries assigned yet</p>
        ) : (
          <div className="recent-orders">
            {recentDeliveries.map((delivery) => (
              <div key={delivery.deliveryId} className="recent-order-card">
                <div className="order-header-simple">
                  <span className="order-id-simple">
                    Delivery #{delivery.deliveryId}
                  </span>
                  <span
                    className="order-status-simple"
                    style={{ backgroundColor: getStatusColor(delivery.status) }}
                  >
                    {delivery.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="order-details-simple">
                  <span>Order ID: #{delivery.orderId}</span>
                  {delivery.assignedAt && (
                    <span>
                      Assigned:{' '}
                      {new Date(delivery.assignedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <Link to="/rider/deliveries" className="view-order-link">
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

export default RiderDashboard;