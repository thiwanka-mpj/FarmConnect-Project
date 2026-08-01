import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/orderService';
import { toast } from 'react-toastify';
import '../../styles/Orders.css';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !user.userId) {
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const data = await orderService.getOrdersByCustomer(user.userId, token);
        setOrders(data);
      } catch (error) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
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

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
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
                    <span className="label">Notes:</span>
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

              <div className="order-actions">
                <button
                  className="view-details-button"
                  onClick={() => setSelectedOrder(order)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button
                className="close-button"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <strong>Order ID:</strong> #{selectedOrder.orderId}
              </div>
              <div className="detail-row">
                <strong>Status:</strong>
                <span
                  className="status-badge"
                  style={{
                    backgroundColor: getStatusColor(selectedOrder.status),
                  }}
                >
                  {selectedOrder.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="detail-row">
                <strong>Order Date:</strong> {formatDate(selectedOrder.orderDate)}
              </div>
              <div className="detail-row">
                <strong>Total Amount:</strong> Rs.{' '}
                {selectedOrder.totalAmount.toFixed(2)}
              </div>
              <div className="detail-row">
                <strong>Delivery Address:</strong>{' '}
                {selectedOrder.deliveryAddress}
              </div>
              {selectedOrder.customerNotes && (
                <div className="detail-row">
                  <strong>Notes:</strong> {selectedOrder.customerNotes}
                </div>
              )}

              <div className="modal-items">
                <h3>Order Items:</h3>
                {selectedOrder.orderItems.map((item) => (
                  <div key={item.orderItemId} className="modal-item">
                    <div>
                      <strong>Product ID:</strong> {item.productId}
                    </div>
                    <div>
                      <strong>Quantity:</strong> {item.quantity}
                    </div>
                    <div>
                      <strong>Price:</strong> Rs. {item.priceAtPurchase.toFixed(2)}
                    </div>
                    <div>
                      <strong>Subtotal:</strong> Rs. {item.subtotal.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;