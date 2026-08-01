import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/orderService';
import { toast } from 'react-toastify';
import '../../styles/Cart.css';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
    if (user && user.address) {
      setDeliveryAddress(user.address);
    }
  }, [user]);

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = cart.map((item) =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );

    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success('Item removed from cart');
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const groupByFarmer = () => {
    const grouped = {};
    cart.forEach((item) => {
      if (!grouped[item.farmerId]) {
        grouped[item.farmerId] = [];
      }
      grouped[item.farmerId].push(item);
    });
    return grouped;
  };

  const handleCheckout = async () => {
    if (!deliveryAddress.trim()) {
      toast.error('Please enter delivery address');
      return;
    }

    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setLoading(true);

    try {
      const groupedCart = groupByFarmer();
      const token = localStorage.getItem('token');

      // Create separate orders for each farmer
      for (const farmerId in groupedCart) {
        const items = groupedCart[farmerId];

        const orderData = {
          customerId: user.userId,
          farmerId: parseInt(farmerId),
          deliveryAddress,
          customerNotes,
          orderItems: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.price,
          })),
        };

        await orderService.createOrder(orderData, token);
      }

      toast.success('Orders placed successfully!');
      localStorage.removeItem('cart');
      setCart([]);
      navigate('/customer/orders');
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your Cart is Empty</h2>
        <p>Add some products to your cart to continue shopping</p>
        <button onClick={() => navigate('/products')} className="continue-shopping">
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Shopping Cart</h1>

      <div className="cart-content">
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.productId} className="cart-item">
              <div className="cart-item-image">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.productName}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="cart-item-placeholder">🌾</div>';
                    }}
                  />
                ) : (
                  <div className="cart-item-placeholder">🌾</div>
                )}
              </div>

              <div className="cart-item-details">
                <h3>{item.productName}</h3>
                <p className="cart-item-price">Rs. {item.price.toFixed(2)}</p>
              </div>

              <div className="cart-item-actions">
                <div className="quantity-controls">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <p className="cart-item-subtotal">
                  Rs. {(item.price * item.quantity).toFixed(2)}
                </p>

                <button
                  className="remove-button"
                  onClick={() => removeItem(item.productId)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Total Items:</span>
            <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>

          <div className="summary-row total">
            <span>Total Amount:</span>
            <span>Rs. {calculateTotal().toFixed(2)}</span>
          </div>

          <div className="delivery-form">
            <h3>Delivery Details</h3>
            <div className="form-group">
              <label>Delivery Address *</label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your delivery address"
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label>Customer Notes (Optional)</label>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Any special instructions..."
                rows="2"
              />
            </div>
          </div>

          <button
            className="checkout-button"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>

          <p className="cart-note">
            Note: Separate orders will be created for products from different farmers
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;