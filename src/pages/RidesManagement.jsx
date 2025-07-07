"use client"

import { useState, useEffect } from "react"
import axios from "axios"

// API instance configured to connect to your backend
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://panalsbackend-production.up.railway.app/api",
});

// Helper function to format date strings
const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleString();
};

export default function RidesManagement() {
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRideId, setSelectedRideId] = useState(null)
  const [modalTab, setModalTab] = useState("Details");

  // useEffect now fetches live data from your backend API
  useEffect(() => {
    const fetchRides = async () => {
      setLoading(true);
      try {
        // The API call to the endpoint defined in rides.js
        const response = await api.get("/rides");
        setRides(response.data);
      } catch (error) {
        console.error("Failed to fetch trips:", error);
        setRides([]); // Set to empty array on error to prevent crashes
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  const filteredRides = rides.filter((ride) => {
    // Logic uses lowercase status values ('ongoing', 'completed', etc.)
    const matchesTab = activeTab === "All" || ride.status === activeTab.toLowerCase();

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (ride._id && ride._id.toLowerCase().includes(searchLower)) ||
      (ride.riderName && ride.riderName.toLowerCase().includes(searchLower)) ||
      (ride.driverName && ride.driverName.toLowerCase().includes(searchLower)) ||
      (ride.pickup && ride.pickup.toLowerCase().includes(searchLower)) ||
      (ride.drop && ride.drop.toLowerCase().includes(searchLower));

    return matchesTab && matchesSearch
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-600";
      case "ongoing": return "bg-blue-600";
      case "cancelled": return "bg-red-600";
      default: return "bg-gray-600";
    }
  }

  const selectedRideData = rides.find((ride) => ride._id === selectedRideId)

  if (loading) {
    return <div className="text-center text-white text-lg p-10">Loading trips...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Trips Management</h1>
          <p className="text-gray-400 mt-1">Monitor and manage all trip bookings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  placeholder="Search Trips, riders, drivers, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border border-gray-700 text-white rounded-md p-2 w-full"
                />
              </div>
            </div>
            <div className="flex bg-gray-800 border border-gray-700 rounded-md">
              {["All", "Ongoing", "Completed", "Cancelled"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-md ${activeTab === tab ? "bg-green-600" : ""}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rides List */}
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center"><p className="text-2xl font-bold text-white">{rides.length}</p><p className="text-gray-400 text-sm">Total Trips</p></div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center"><p className="text-2xl font-bold text-blue-400">{rides.filter((r) => r.status === "ongoing").length}</p><p className="text-gray-400 text-sm">Ongoing</p></div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center"><p className="text-2xl font-bold text-green-400">{rides.filter((r) => r.status === "completed").length}</p><p className="text-gray-400 text-sm">Completed</p></div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center"><p className="text-2xl font-bold text-red-400">{rides.filter((r) => r.status === "cancelled").length}</p><p className="text-gray-400 text-sm">Cancelled</p></div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center"><p className="text-2xl font-bold text-red-400">{rides.filter((r) => r.status === "cancelled").length}</p><p className="text-gray-400 text-sm">Cancel By Driver</p></div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center"><p className="text-2xl font-bold text-red-400">{rides.filter((r) => r.status === "cancelled").length}</p><p className="text-gray-400 text-sm">Cancel By Customer</p></div>
        </div>
        {filteredRides.length > 0 ? (
          filteredRides.map((ride) => (
            <div key={ride._id} className="bg-gray-900 border border-gray-800 rounded-lg hover:border-green-500 transition-colors">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-lg">Ride {ride._id}</h3>
                      <p className="text-gray-400 text-sm">{ride.date} {ride.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`${getStatusColor(ride.status)} text-white px-2 py-1 rounded-full text-xs capitalize`}>
                      {ride.status}
                    </span>
                    <div className="text-right">
                      <p className="text-white font-bold text-lg">{ride.price}</p>
                      <p className="text-gray-400 text-sm">Payment N/A</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="space-y-3">
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2"><svg className="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg><span className="text-green-400 font-medium">Rider</span></div>
                      <p className="text-white font-medium">{ride.riderName}</p>
                      <p className="text-gray-400 text-sm">ID: {ride.riderId}</p>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2"><svg className="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg><span className="text-blue-400 font-medium">Driver</span></div>
                      <p className="text-white font-medium">{ride.driverName}</p>
                      <p className="text-gray-400 text-sm">ID: {ride.driverId}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2"><svg className="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg><span className="text-green-400 font-medium">Pickup</span></div>
                      <p className="text-white text-sm">{ride.pickup}</p>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2"><svg className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg><span className="text-red-400 font-medium">Drop-off</span></div>
                      <p className="text-white text-sm">{ride.drop}</p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => { setSelectedRideId(ride._id); setModalTab("Details"); }} className="border border-gray-700 text-gray-400 hover:bg-gray-800 rounded-md px-3 py-1 text-sm flex items-center"><svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-gray-900 rounded-lg">
            <p className="text-white text-lg">No trips found.</p>
            <p className="text-gray-400">Try adjusting your search or filter, or check if the backend is running.</p>
          </div>
        )}
      </div>



      {/* ENHANCED MODAL */}
      {selectedRideId && selectedRideData && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-800">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Trip Details - {selectedRideData._id}</h2>
                <button onClick={() => setSelectedRideId(null)} className="text-gray-400 hover:text-white"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
            </div>

            <div className="p-6 border-b border-gray-800">
              <div className="flex bg-gray-800 border border-gray-700 rounded-md">
                <button onClick={() => setModalTab("Details")} className={`flex-1 px-4 py-2 rounded-l-md ${modalTab === 'Details' ? 'bg-green-600' : ''}`}>Details</button>
                <button onClick={() => setModalTab("Logs")} className={`flex-1 px-4 py-2 ${modalTab === 'Logs' ? 'bg-green-600' : ''}`}>Logs</button>
                <button onClick={() => setModalTab("Chat")} className={`flex-1 px-4 py-2 rounded-r-md ${modalTab === 'Chat' ? 'bg-green-600' : ''}`}>Chat</button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              {modalTab === 'Details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
                      <h4 className="text-white font-medium mb-2">Trip Information</h4>
                      <div className="flex justify-between"><span className="text-gray-400">Distance:</span><span className="text-white">{selectedRideData.distance}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Duration:</span><span className="text-white">{selectedRideData.duration}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Price:</span><span className="text-white">{selectedRideData.price}</span></div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
                      <h4 className="text-white font-medium mb-2">Participants</h4>
                      <div className="flex justify-between"><span className="text-gray-400">Rider:</span><span className="text-white">{selectedRideData.riderName}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Driver:</span><span className="text-white">{selectedRideData.driverName}</span></div>
                    </div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-3">Live Location</h4>
                    <div className="h-48 bg-gray-700 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <svg className="h-12 w-12 text-green-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <p className="text-white">{selectedRideData.currentLocation?.address || "Not Available"}</p>
                        <p className="text-gray-400 text-sm">Last Updated: {selectedRideData.currentLocation?.updatedAt || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {modalTab === 'Logs' && (
                <div className="space-y-3">
                  {(selectedRideData.logs || []).map((log, index) => (
                    <div key={index} className="flex items-center space-x-3 text-sm">
                      <span className="text-gray-500">{formatDateTime(log.timestamp)}</span>
                      <span className="text-white">{log.event}</span>
                    </div>
                  ))}
                </div>
              )}
              {modalTab === 'Chat' && (
                <div className="space-y-4">
                  {(selectedRideData.chatMessages || []).map((chat, index) => (
                    <div key={index} className={`flex ${chat.sender === 'rider' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${chat.sender === 'rider' ? 'bg-blue-900 text-white' : 'bg-gray-700 text-gray-200'}`}>
                        <p>{chat.message}</p>
                        <p className="text-xs text-gray-400 mt-1 text-right">{formatDateTime(chat.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}