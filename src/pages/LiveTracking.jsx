"use client"

import { useState, useEffect } from "react"

const liveDrivers = [
  {
    id: 1,
    name: "Rajesh Kumar",
    vehicle: "Honda City - DL-01-AB-1234",
    location: { lat: 28.6139, lng: 77.209, address: "Connaught Place, Delhi" },
    passenger: "John Doe",
    tripId: "TR001",
    eta: "8 mins",
    status: "En Route",
    phone: "+91-9876543210",
  },
  {
    id: 2,
    name: "Amit Singh",
    vehicle: "Royal Enfield - DL-02-CD-5678",
    location: { lat: 28.5355, lng: 77.391, address: "Sector 18, Noida" },
    passenger: "Sarah Khan",
    tripId: "FD002",
    eta: "12 mins",
    status: "Pickup",
    phone: "+91-9876543211",
  },
  {
    id: 3,
    name: "Suresh Yadav",
    vehicle: "Tata Ace - DL-03-EF-9012",
    location: { lat: 28.4595, lng: 77.0266, address: "Gurgaon Sector 29" },
    passenger: "Mike Wilson",
    tripId: "CR003",
    eta: "15 mins",
    status: "Delivery",
    phone: "+91-9876543212",
  },
  {
    id: 4,
    name: "Priya Sharma",
    vehicle: "Maruti Swift - DL-04-GH-3456",
    location: { lat: 28.7041, lng: 77.1025, address: "Rohini, Delhi" },
    passenger: "Ahmed Ali",
    tripId: "TR004",
    eta: "5 mins",
    status: "Drop Off",
    phone: "+91-9876543213",
  },
  {
    id: 5,
    name: "Vikash Gupta",
    vehicle: "Honda Activa - DL-05-IJ-7890",
    location: { lat: 28.6692, lng: 77.4538, address: "Laxmi Nagar, Delhi" },
    passenger: "Priya Patel",
    tripId: "FD005",
    eta: "20 mins",
    status: "En Route",
    phone: "+91-9876543214",
  },
]

const trackingStats = {
  activeTrips: 127,
  totalDrivers: 342,
  averageETA: "12 mins",
  coverageArea: "450 km",
}

export default function LiveTracking() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedDriver, setSelectedDriver] = useState(null)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case "En Route":
        return "bg-blue-600"
      case "Pickup":
        return "bg-yellow-600"
      case "Delivery":
        return "bg-purple-600"
      case "Drop Off":
        return "bg-orange-600"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Live Tracking Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time monitoring of all active riders and trips</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Last Updated</p>
          <p className="text-lg font-mono text-orange-600">{currentTime.toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          {
            title: "Active Trips",
            value: trackingStats.activeTrips,
            icon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-orange-600"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            ),
            desc: "Live tracking enabled",
          },
          {
            title: "Total Riders",
            value: trackingStats.totalDrivers,
            icon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-orange-600"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            ),
            desc: "Online and available",
          },
          {
            title: "Average ETA",
            value: trackingStats.averageETA,
            icon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-orange-600"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            ),
            desc: "Across all trips",
          },
          {
            title: "Coverage Area",
            value: trackingStats.coverageArea,
            icon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-orange-600"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M2 12h20"></path>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            ),
            desc: "Service coverage",
          },
        ].map((stat, index) => (
          <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-gray-400">{stat.title}</h3>
              {stat.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Map Placeholder */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <div className="p-6">
          <h2 className="text-white text-xl font-bold">Live Map View</h2>
        </div>
        <div className="px-6 pb-6">
          <div className="h-96 bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-blue-900/20"></div>
            <div className="text-center z-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-16 w-16 text-orange-600 mx-auto mb-4"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <p className="text-white text-lg font-medium">Interactive Map</p>
              <p className="text-gray-400">Real-time rider locations and routes</p>
              <button className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 mr-2"
                >
                  <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                </svg>
                View Full Map
              </button>
            </div>
            <div className="absolute top-20 left-20 w-3 h-3 bg-orange-600 rounded-full animate-pulse"></div>
            <div className="absolute top-32 right-32 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-24 left-40 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-40 right-20 w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Live Driver Status */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <div className="p-6">
          <h2 className="text-white text-xl font-bold">Live Rider Status</h2>
        </div>
        <div className="px-6 pb-6">
          <div className="space-y-4">
            {liveDrivers.map((driver) => (
              <div
                key={driver.id}
                className={`p-4 bg-gray-800 rounded-lg border-2 transition-colors cursor-pointer ${
                  selectedDriver === driver.id ? "border-orange" : "border-transparent hover:border-gray-700"
                }`}
                onClick={() => setSelectedDriver(selectedDriver === driver.id ? null : driver.id)}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">
                        {driver.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{driver.name}</h3>
                      <p className="text-gray-400 text-sm">{driver.vehicle}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`${getStatusColor(driver.status)} text-white px-2 py-1 rounded-full text-xs`}>
                      {driver.status}
                    </span>
                    <div className="text-right">
                      <p className="text-white font-medium">ETA: {driver.eta}</p>
                      <p className="text-gray-400 text-sm">Trip: {driver.tripId}</p>
                    </div>
                  </div>
                </div>

                {selectedDriver === driver.id && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-white font-medium mb-2">Trip Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 text-gray-400"
                            >
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span className="text-gray-400">Passenger:</span>
                            <span className="text-white">{driver.passenger}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 text-gray-400"
                            >
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span className="text-gray-400">Location:</span>
                            <span className="text-white">{driver.location.address}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-2">Actions</h4>
                        <div className="flex flex-wrap gap-2">
                          {[
                            {
                              icon: (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                              ),
                              label: "Call",
                              primary: false,
                            },
                            {
                              icon: (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                              ),
                              label: "Chat",
                              primary: false,
                            },
                            {
                              icon: (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                                </svg>
                              ),
                              label: "Track",
                              primary: true,
                            },
                          ].map(({ icon, label, primary }, index) => (
                            <button
                              key={index}
                              className={`p-2 sm:px-4 sm:py-2 rounded-full sm:rounded-md flex items-center ${
                                primary
                                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                                  : "border border-gray-700 text-gray-400 hover:bg-gray-700"
                              }`}
                            >
                              {icon}
                              <span className="hidden sm:inline ml-1">{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}