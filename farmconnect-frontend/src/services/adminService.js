import axios from '../utils/axios';

const API_URL = '/api/admin';

const adminService = {
  // Get dashboard statistics
  getDashboardStatistics: async (token) => {
    const response = await axios.get(`${API_URL}/statistics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get all users
  getAllUsers: async (token) => {
    const response = await axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId, token) => {
    const response = await axios.get(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Delete user
  deleteUser: async (userId, token) => {
    const response = await axios.delete(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get all products
  getAllProducts: async (token) => {
    const response = await axios.get(`${API_URL}/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get product by ID
  getProductById: async (productId, token) => {
    const response = await axios.get(`${API_URL}/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Delete product
  deleteProduct: async (productId, token) => {
    const response = await axios.delete(`${API_URL}/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get all orders
  getAllOrders: async (token) => {
    const response = await axios.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId, token) => {
    const response = await axios.get(`${API_URL}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export default adminService;