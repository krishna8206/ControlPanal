import axios from 'axios';

const API_BASE_URL = 'https://panalsbackend.onrender.com/api'; // Update with your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

// Request interceptor to update token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Keep your existing dashboard service
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentRides: () => api.get('/dashboard/recent-rides'),
  getRevenueData: () => api.get('/dashboard/revenue-data')
};

// Add user service with all required endpoints
export const userService = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  suspendUser: (id) => api.patch(`/users/${id}/suspend`),
  // Add more user-related endpoints as needed
};