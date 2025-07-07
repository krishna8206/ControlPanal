"use client"

import { useEffect, useRef, useState } from "react"
import { useWebSocket } from "../contexts/WebSocketContext"

const GoogleMap = ({ drivers = [], selectedDriver, onDriverSelect, height = "400px" }) => {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [markers, setMarkers] = useState({})
  const { liveData } = useWebSocket()

  useEffect(() => {
    // Initialize Google Maps
    if (window.google && mapRef.current && !map) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 28.6139, lng: 77.209 }, // Delhi center
        zoom: 12,
        styles: [
          {
            elementType: "geometry",
            stylers: [{ color: "#1f2937" }],
          },
          {
            elementType: "labels.text.stroke",
            stylers: [{ color: "#1f2937" }],
          },
          {
            elementType: "labels.text.fill",
            stylers: [{ color: "#8b5cf6" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#374151" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#0f172a" }],
          },
        ],
      })
      setMap(newMap)
    }
  }, [map])

  useEffect(() => {
    if (map && drivers.length > 0) {
      // Clear existing markers
      Object.values(markers).forEach((marker) => marker.setMap(null))
      const newMarkers = {}

      drivers.forEach((driver) => {
        const position = {
          lat: driver.location.lat,
          lng: driver.location.lng,
        }

        const marker = new window.google.maps.Marker({
          position,
          map,
          title: driver.name,
          icon: {
            url: getMarkerIcon(driver.status),
            scaledSize: new window.google.maps.Size(40, 40),
          },
        })

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="color: black; padding: 10px;">
              <h3>${driver.name}</h3>
              <p><strong>Status:</strong> ${driver.status}</p>
              <p><strong>Vehicle:</strong> ${driver.vehicle}</p>
              <p><strong>ETA:</strong> ${driver.eta}</p>
              <button onclick="window.selectDriver(${driver.id})" 
                      style="background: #10b981; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                Select Driver
              </button>
            </div>
          `,
        })

        marker.addListener("click", () => {
          infoWindow.open(map, marker)
        })

        newMarkers[driver.id] = marker

        // Highlight selected driver
        if (selectedDriver === driver.id) {
          marker.setAnimation(window.google.maps.Animation.BOUNCE)
          setTimeout(() => marker.setAnimation(null), 2000)
        }
      })

      setMarkers(newMarkers)
    }
  }, [map, drivers, selectedDriver])

  // Global function for info window button
  useEffect(() => {
    window.selectDriver = (driverId) => {
      if (onDriverSelect) {
        onDriverSelect(driverId)
      }
    }

    return () => {
      delete window.selectDriver
    }
  }, [onDriverSelect])

  const getMarkerIcon = (status) => {
    const colors = {
      "En Route": "#3b82f6",
      Pickup: "#f59e0b",
      Delivery: "#8b5cf6",
      "Drop Off": "#10b981",
      Available: "#6b7280",
    }

    const color = colors[status] || "#6b7280"

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="${color}" stroke="#ffffff" stroke-width="2"/>
        <circle cx="20" cy="20" r="8" fill="#ffffff"/>
      </svg>
    `)}`
  }

  return (
    <div className="google-map-container">
      <div ref={mapRef} style={{ width: "100%", height }} className="google-map" />
      {!window.google && (
        <div className="map-loading">
          <p>Loading Google Maps...</p>
        </div>
      )}
    </div>
  )
}

export default GoogleMap
