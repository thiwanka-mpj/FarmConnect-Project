import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { toast } from 'react-toastify';
import '../../styles/AdminTables.css';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await adminService.getAllOrders(token);
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
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
    return date.toLocaleString('en-US', {
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
    <div className="admin-table-container">
      <div className="admin-table-header">
        <h1>Order Management</h1>
        <p>Total Orders: {orders.length}</p>
      </div>

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer ID</th>
              <th>Farmer ID</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Order Date</th>
              <th>Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId}>
                <td>#{order.orderId}</td>
                <td>{order.customerId}</td>
                <td>{order.farmerId}</td>
                <td>Rs. {order.totalAmount.toFixed(2)}</td>
                <td>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td>{formatDate(order.orderDate)}</td>
                <td>{order.orderItems?.length || 0} items</td>
                <td>
                  <button
                    className="view-button"
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div className="no-data">
          <p>No orders found</p>
        </div>
      )}

      {/* Order Details Modal */}
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
              <div className="detail-section">
                <h3>Order Information</h3>
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
              </div>

              <div className="detail-section">
                <h3>Customer & Delivery</h3>
                <div className="detail-row">
                  <strong>Customer ID:</strong> {selectedOrder.customerId}
                </div>
                <div className="detail-row">
                  <strong>Farmer ID:</strong> {selectedOrder.farmerId}
                </div>
                <div className="detail-row">
                  <strong>Delivery Address:</strong>{' '}
                  {selectedOrder.deliveryAddress}
                </div>
                {selectedOrder.customerNotes && (
                  <div className="detail-row">
                    <strong>Customer Notes:</strong> {selectedOrder.customerNotes}
                  </div>
                )}
              </div>

              {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
                <div className="detail-section">
                  <h3>Order Items</h3>
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item.orderItemId} className="modal-item">
                      <div>
                        <strong>Product ID:</strong> {item.productId}
                      </div>
                      <div>
                        <strong>Quantity:</strong> {item.quantity}
                      </div>
                      <div>
                        <strong>Price:</strong> Rs.{' '}
                        {item.priceAtPurchase.toFixed(2)}
                      </div>
                      <div>
                        <strong>Subtotal:</strong> Rs. {item.subtotal.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;