// 1. Import useCallback
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import deliveryService from '../../services/deliveryService';
import orderService from '../../services/orderService';
import { toast } from 'react-toastify';
import '../../styles/Deliveries.css';

const MyDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const { user } = useAuth();

  const statusOptions = ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];

  // 2. Wrap fetchDeliveries in useCallback with `user` as a dependency
  const fetchDeliveries = useCallback(async () => {
    if (!user || !user.userId) return;
    try {
      const token = localStorage.getItem('token');
      const data = await deliveryService.getDeliveriesByRider(user.userId, token);
      setDeliveries(data);
    } catch (error) {
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 3. Add the stable `fetchDeliveries` function to the dependency array
  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const handleStatusUpdate = async (deliveryId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await deliveryService.updateDeliveryStatus(deliveryId, newStatus, token);
      toast.success('Delivery status updated successfully');
      fetchDeliveries(); // This now calls the memoized function
    } catch (error) {
      toast.error('Failed to update delivery status');
    }
  };

  const handleViewDetails = async (delivery) => {
    setSelectedDelivery(delivery);
    try {
      const token = localStorage.getItem('token');
      const order = await orderService.getOrderById(delivery.orderId, token);
      setOrderDetails(order);
    } catch (error) {
      toast.error('Failed to load order details');
    }
  };

  // ... The rest of your component code remains the same
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredDeliveries =
    filter === 'ALL'
      ? deliveries
      : deliveries.filter((d) => d.status === filter);

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Loading deliveries...</h2>
      </div>
    );
  }

  return (
    <div className="deliveries-container">
      <h1>My Deliveries</h1>

      <div className="delivery-filters">
        <button
          className={`filter-button ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          All ({deliveries.length})
        </button>
        <button
          className={`filter-button ${filter === 'ASSIGNED' ? 'active' : ''}`}
          onClick={() => setFilter('ASSIGNED')}
        >
          Assigned ({deliveries.filter((d) => d.status === 'ASSIGNED').length})
        </button>
        <button
          className={`filter-button ${filter === 'PICKED_UP' ? 'active' : ''}`}
          onClick={() => setFilter('PICKED_UP')}
        >
          Picked Up ({deliveries.filter((d) => d.status === 'PICKED_UP').length})
        </button>
        <button
          className={`filter-button ${filter === 'IN_TRANSIT' ? 'active' : ''}`}
          onClick={() => setFilter('IN_TRANSIT')}
        >
          In Transit ({deliveries.filter((d) => d.status === 'IN_TRANSIT').length})
        </button>
        <button
          className={`filter-button ${filter === 'DELIVERED' ? 'active' : ''}`}
          onClick={() => setFilter('DELIVERED')}
        >
          Delivered ({deliveries.filter((d) => d.status === 'DELIVERED').length})
        </button>
      </div>

      {filteredDeliveries.length === 0 ? (
        <div className="no-deliveries">
          <p>No deliveries found</p>
        </div>
      ) : (
        <div className="deliveries-list">
          {filteredDeliveries.map((delivery) => (
            <div key={delivery.deliveryId} className="delivery-card">
              <div className="delivery-header">
                <div className="delivery-id">
                  <span className="label">Delivery ID:</span>
                  <span className="value">#{delivery.deliveryId}</span>
                </div>

                <div
                  className="delivery-status"
                  style={{ backgroundColor: getStatusColor(delivery.status) }}
                >
                  {delivery.status.replace(/_/g, ' ')}
                </div>
              </div>

              <div className="delivery-info">
                <div className="info-row">
                  <span className="label">Order ID:</span>
                  <span>#{delivery.orderId}</span>
                </div>

                <div className="info-row">
                  <span className="label">Assigned At:</span>
                  <span>{formatDate(delivery.assignedAt)}</span>
                </div>

                {delivery.pickupTime && (
                  <div className="info-row">
                    <span className="label">Picked Up At:</span>
                    <span>{formatDate(delivery.pickupTime)}</span>
                  </div>
                )}

                {delivery.deliveryTime && (
                  <div className="info-row">
                    <span className="label">Delivered At:</span>
                    <span>{formatDate(delivery.deliveryTime)}</span>
                  </div>
                )}

                {delivery.deliveryNotes && (
                  <div className="info-row">
                    <span className="label">Notes:</span>
                    <span>{delivery.deliveryNotes}</span>
                  </div>
                )}
              </div>

              <div className="delivery-actions">
                <button
                  className="view-details-button"
                  onClick={() => handleViewDetails(delivery)}
                >
                  View Order Details
                </button>

                {delivery.status !== 'DELIVERED' && delivery.status !== 'FAILED' && (
                  <>
                    <label>Update Status:</label>
                    <select
                      value={delivery.status}
                      onChange={(e) =>
                        handleStatusUpdate(delivery.deliveryId, e.target.value)
                      }
                      className="status-select"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedDelivery && orderDetails && (
        <div
          className="modal-overlay"
          onClick={() => {
            setSelectedDelivery(null);
            setOrderDetails(null);
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button
                className="close-button"
                onClick={() => {
                  setSelectedDelivery(null);
                  setOrderDetails(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Delivery Information</h3>
                <div className="detail-row">
                  <strong>Delivery ID:</strong> #{selectedDelivery.deliveryId}
                </div>
                <div className="detail-row">
                  <strong>Status:</strong>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusColor(selectedDelivery.status),
                    }}
                  >
                    {selectedDelivery.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Assigned At:</strong>{' '}
                  {formatDate(selectedDelivery.assignedAt)}
                </div>
              </div>

              <div className="detail-section">
                <h3>Order Information</h3>
                <div className="detail-row">
                  <strong>Order ID:</strong> #{orderDetails.orderId}
                </div>
                <div className="detail-row">
                  <strong>Total Amount:</strong> Rs.{' '}
                  {orderDetails.totalAmount.toFixed(2)}
                </div>
                <div className="detail-row">
                  <strong>Delivery Address:</strong>{' '}
                  {orderDetails.deliveryAddress}
                </div>
                {orderDetails.customerNotes && (
                  <div className="detail-row">
                    <strong>Customer Notes:</strong> {orderDetails.customerNotes}
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h3>Order Items</h3>
                {orderDetails.orderItems.map((item) => (
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

export default MyDeliveries;