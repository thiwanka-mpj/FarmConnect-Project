import axios from '../utils/axios';

const API_URL = '/api/orders';

const orderService = {
  // Create order
  createOrder: async (orderData, token) => {
    const response = await axios.post(API_URL, orderData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get all orders
  getAllOrders: async (token) => {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId, token) => {
    const response = await axios.get(`${API_URL}/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get orders by customer
  getOrdersByCustomer: async (customerId, token) => {
    const response = await axios.get(`${API_URL}/customer/${customerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get orders by farmer
  getOrdersByFarmer: async (farmerId, token) => {
    const response = await axios.get(`${API_URL}/farmer/${farmerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get orders by status
  getOrdersByStatus: async (status, token) => {
    const response = await axios.get(`${API_URL}/status/${status}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId, status, token) => {
    const response = await axios.put(
      `${API_URL}/${orderId}/status?status=${status}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId, token) => {
    const response = await axios.put(
      `${API_URL}/${orderId}/cancel`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },
};

export default orderService;