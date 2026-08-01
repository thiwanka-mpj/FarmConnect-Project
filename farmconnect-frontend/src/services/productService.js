import axios from '../utils/axios';

const API_URL = '/api/products';

const productService = {
  // Create new product
  createProduct: async (productData, token) => {
    const response = await axios.post(API_URL, productData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get all products
  getAllProducts: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // Get available products
  getAvailableProducts: async () => {
    const response = await axios.get(`${API_URL}/available`);
    return response.data;
  },

  // Get product by ID
  getProductById: async (productId) => {
    const response = await axios.get(`${API_URL}/${productId}`);
    return response.data;
  },

  // Get products by farmer
  getProductsByFarmer: async (farmerId) => {
    const response = await axios.get(`${API_URL}/farmer/${farmerId}`);
    return response.data;
  },

  // Search products
  searchProducts: async (keyword) => {
    const response = await axios.get(`${API_URL}/search?keyword=${keyword}`);
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (category) => {
    const response = await axios.get(`${API_URL}/category/${category}`);
    return response.data;
  },

  // Update product
  updateProduct: async (productId, productData, token) => {
    const response = await axios.put(`${API_URL}/${productId}`, productData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Delete product
  deleteProduct: async (productId, token) => {
    const response = await axios.delete(`${API_URL}/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Update product quantity
  updateProductQuantity: async (productId, quantity, token) => {
    const response = await axios.put(
      `${API_URL}/${productId}/quantity?quantity=${quantity}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },
};

export default productService;