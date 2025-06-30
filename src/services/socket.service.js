import { io } from "socket.io-client"

// Create a singleton socket instance
let socket

export const initSocket = (token) => {
  if (socket) return socket

  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "https://panalsbackend-production.up.railway.app"

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
  })

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id)
  })

  socket.on("disconnect", () => {
    console.log("Socket disconnected")
  })

  socket.on("error", (error) => {
    console.error("Socket error:", error)
  })

  return socket
}

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not initialized. Call initSocket first.")
  }
  return socket
}

export const closeSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Driver events
export const connectAsDriver = (driverId) => {
  if (!socket) return
  socket.emit("driver-connect", { driverId })
}

export const updateDriverLocation = (driverId, location, speed, batteryLevel) => {
  if (!socket) return
  socket.emit("location-update", { driverId, location, speed, batteryLevel })
}

export const updateDriverStatus = (driverId, status) => {
  if (!socket) return
  socket.emit("status-change", { driverId, status })
}

export const updateTripStatus = (tripId, status) => {
  if (!socket) return
  socket.emit("trip-status-update", { tripId, status })
}

// Admin events
export const subscribeToDriverUpdates = (callback) => {
  if (!socket) return
  socket.on("driver-location-update", callback)
  return () => socket.off("driver-location-update", callback)
}

export const subscribeToDriverStatusUpdates = (callback) => {
  if (!socket) return
  socket.on("driver-status-update", callback)
  return () => socket.off("driver-status-update", callback)
}

export const subscribeToTripUpdates = (callback) => {
  if (!socket) return
  socket.on("trip-update", callback)
  return () => socket.off("trip-update", callback)
}

export const subscribeToNotifications = (callback) => {
  if (!socket) return
  socket.on("notification", callback)
  return () => socket.off("notification", callback)
}

export const subscribeToEmergencyAlerts = (callback) => {
  if (!socket) return
  socket.on("emergency-alert", callback)
  return () => socket.off("emergency-alert", callback)
}