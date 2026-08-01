import React, { useState, useEffect, useCallback  } from 'react';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/orderService';
import { toast } from 'react-toastify';
import '../../styles/Orders.css';

const FarmerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const { user } = useAuth();

  const statusOptions = [
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'READY_FOR_DELIVERY',
    'SHIPPED',
    'DELIVERED',
  ];

const fetchOrders = useCallback(async () => {
    if (!user || !user.userId) return;
    try {
      const token = localStorage.getItem('token');
      const data = await orderService.getOrdersByFarmer(user.userId, token);
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await orderService.updateOrderStatus(orderId, newStatus, token);
      toast.success('Order status updated successfully');
      fetchOrders(); 
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOrders =
    filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Loading orders...</h2>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h1>My Orders</h1>

      <div className="order-filters">
        <button
          className={`filter-button ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          All ({orders.length})
        </button>
        <button
          className={`filter-button ${filter === 'PENDING' ? 'active' : ''}`}
          onClick={() => setFilter('PENDING')}
        >
          Pending ({orders.filter((o) => o.status === 'PENDING').length})
        </button>
        <button
          className={`filter-button ${filter === 'CONFIRMED' ? 'active' : ''}`}
          onClick={() => setFilter('CONFIRMED')}
        >
          Confirmed ({orders.filter((o) => o.status === 'CONFIRMED').length})
        </button>
        <button
          className={`filter-button ${filter === 'PREPARING' ? 'active' : ''}`}
          onClick={() => setFilter('PREPARING')}
        >
          Preparing ({orders.filter((o) => o.status === 'PREPARING').length})
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <p>No orders found</p>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div key={order.orderId} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <span className="label">Order ID:</span>
                  <span className="value">#{order.orderId}</span>
                </div>

                <div
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status.replace(/_/g, ' ')}
                </div>
              </div>

              <div className="order-info">
                <div className="info-row">
                  <span className="label">Order Date:</span>
                  <span>{formatDate(order.orderDate)}</span>
                </div>

                <div className="info-row">
                  <span className="label">Total Amount:</span>
                  <span className="amount">Rs. {order.totalAmount.toFixed(2)}</span>
                </div>

                <div className="info-row">
                  <span className="label">Delivery Address:</span>
                  <span>{order.deliveryAddress}</span>
                </div>

                {order.customerNotes && (
                  <div className="info-row">
                    <span className="label">Customer Notes:</span>
                    <span>{order.customerNotes}</span>
                  </div>
                )}
              </div>

              <div className="order-items">
                <h4>Items:</h4>
                {order.orderItems.map((item) => (
                  <div key={item.orderItemId} className="order-item">
                    <span className="item-quantity">{item.quantity}x</span>
                    <span className="item-name">Product ID: {item.productId}</span>
                    <span className="item-price">
                      Rs. {item.priceAtPurchase.toFixed(2)} each
                    </span>
                    <span className="item-subtotal">
                      Rs. {item.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                <div className="order-actions">
                  <label>Update Status:</label>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusUpdate(order.orderId, e.target.value)
                    }
                    className="status-select"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerOrders;