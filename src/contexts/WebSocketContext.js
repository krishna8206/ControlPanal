"use client"

import { createContext, useContext, useEffect, useState } from "react"
import io from "socket.io-client"

const WebSocketContext = createContext()

export function useWebSocket() {
  return useContext(WebSocketContext)
}

export function WebSocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [liveData, setLiveData] = useState({
    drivers: [],
    rides: [],
    notifications: [],
  })

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io(process.env.REACT_APP_WEBSOCKET_URL || "ws://localhost:3001", {
      transports: ["websocket"],
    })

    newSocket.on("connect", () => {
      setConnected(true)
      console.log("WebSocket connected")
    })

    newSocket.on("disconnect", () => {
      setConnected(false)
      console.log("WebSocket disconnected")
    })

    // Real-time driver location updates
    newSocket.on("driver_location_update", (data) => {
      setLiveData((prev) => ({
        ...prev,
        drivers: prev.drivers.map((driver) =>
          driver.id === data.driverId ? { ...driver, location: data.location, lastUpdate: new Date() } : driver,
        ),
      }))
    })

    // Real-time ride updates
    newSocket.on("ride_status_update", (data) => {
      setLiveData((prev) => ({
        ...prev,
        rides: prev.rides.map((ride) =>
          ride.id === data.rideId ? { ...ride, status: data.status, lastUpdate: new Date() } : ride,
        ),
      }))
    })

    // Real-time notifications
    newSocket.on("new_notification", (notification) => {
      setLiveData((prev) => ({
        ...prev,
        notifications: [notification, ...prev.notifications.slice(0, 49)],
      }))
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const emitDriverLocation = (driverId, location) => {
    if (socket && connected) {
      socket.emit("update_driver_location", { driverId, location })
    }
  }

  const emitRideUpdate = (rideId, status) => {
    if (socket && connected) {
      socket.emit("update_ride_status", { rideId, status })
    }
  }

  const sendMessage = (to, message) => {
    if (socket && connected) {
      socket.emit("send_message", { to, message, timestamp: new Date() })
    }
  }

  const value = {
    socket,
    connected,
    liveData,
    emitDriverLocation,
    emitRideUpdate,
    sendMessage,
  }

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
}
