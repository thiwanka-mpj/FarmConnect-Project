import axios from '../utils/axios';

const API_URL = '/api/users';

const userService = {
  // Get user profile
  getUserProfile: async (userId) => {
    const response = await axios.get(`${API_URL}/profile/${userId}`);
    return response.data;
  },

  // Update user profile
  updateUserProfile: async (userId, userData) => {
    const response = await axios.put(`${API_URL}/profile/${userId}`, userData);
    return response.data;
  },

  // Get users by role
  getUsersByRole: async (role) => {
    const response = await axios.get(`${API_URL}/role/${role}`);
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await axios.get(`${API_URL}/${userId}`);
    return response.data;
  },
};

export default userService;