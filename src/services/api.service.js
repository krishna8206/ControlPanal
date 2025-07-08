import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL || "https://panalsbackend.onrender.com/api"

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  adminLogin: (data) => api.post("/auth/admin/login", data),
  getMe: () => api.get("/auth/me"),
}

// Driver API
export const driverAPI = {
  updateLocation: (data) => api.post("/driver/update-location", data),
  updateStatus: (data) => api.post("/driver/update-status", data),
  getAllDrivers: (params) => api.get("/driver", { params }),
  getDriverById: (id) => api.get(`/driver/${id}`),
  getNearbyDrivers: (params) => api.get("/driver/nearby", { params }),
  getCurrentTrip: () => api.get("/driver/current-trip"),
}

// Trip API
export const tripAPI = {
  createTrip: (data) => api.post("/trips", data),
  getTripById: (id) => api.get(`/trips/${id}`),
  getActiveTrips: () => api.get("/trips/active"),
  updateTripStatus: (id, data) => api.put(`/trips/${id}/status`, data),
  getTripHistory: (params) => api.get("/trips/history", { params }),
}

// Emergency API
export const emergencyAPI = {
  triggerEmergency: () => api.post("/emergency/trigger"),
  respondToEmergency: (driverId) => api.post(`/emergency/${driverId}/respond`),
  getActiveEmergencies: () => api.get("/emergency/active"),
}

// Dashboard API
export const dashboardAPI = {
  getDashboardStats: () => api.get("/dashboard/stats"),
  getDriverPerformance: (driverId) => api.get(`/dashboard/driver/${driverId}/performance`),
  getRecentRides: (params) => api.get("/dashboard/trip-analytics", { params }),
}

// Communication API
export const communicationAPI = {
  callDriver: (driverId) => api.post(`/communication/${driverId}/call`),
  sendSMS: (driverId, data) => api.post(`/communication/${driverId}/sms`, data),
  emergencyContact: (driverId) => api.post(`/communication/${driverId}/emergency`),
}