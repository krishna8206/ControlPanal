import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Car,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Navigation,
  TrendingDown,
  IndianRupee
} from 'lucide-react';
import { dashboardAPI, driverAPI } from '../services/api.service.js';
import { useDashboardSocket, useDriverSocket } from '../hooks/useSocket.js';

// Helper function to format time difference
const formatTimeAgo = (isoString) => {
  if (!isoString) return "just now";
  const now = new Date();
  const past = new Date(isoString);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} secs ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
};

// NEW: Function to generate placeholder data if API returns empty
const generatePlaceholderRides = () => {
  const now = new Date();
  return [
    { _id: 'ph1', service: 'Trip', user: { name: 'Aarav Sharma' }, rideTime: new Date(now.getTime() - 2 * 60000).toISOString(), amount: 250.75, status: 'completed' },
    { _id: 'ph2', service: 'Courier', user: { name: 'Saanvi Patel' }, rideTime: new Date(now.getTime() - 15 * 60000).toISOString(), amount: 150.00, status: 'completed' },
    { _id: 'ph3', service: 'Trip', user: { name: 'Vivaan Mehta' }, rideTime: new Date(now.getTime() - 35 * 60000).toISOString(), amount: 450.50, status: 'in-progress' },
    { _id: 'ph4', service: 'Trip', user: { name: 'Ananya Gupta' }, rideTime: new Date(now.getTime() - 65 * 60000).toISOString(), amount: 180.25, status: 'cancelled' },
    { _id: 'ph5', service: 'Courier', user: { name: 'Advik Singh' }, rideTime: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(), amount: 300.00, status: 'completed' },
  ];
};


export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [liveDrivers, setLiveDrivers] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Real-time Data Handling ---

  // Dashboard data handler
  const handleDashboardEvent = useCallback((type, data) => {
    if (type === 'stats') {
      console.log("📊 Received dashboard stats update:", data);
      setStats(data);
    }
    if (type === 'rides') {
      console.log("🚗 Received recent trips update:", data);
      setRecentActivities(data);
    }
  }, []);

  // Driver data handler
  const handleDriverEvent = useCallback((type, data) => {
    console.log(`🚚 Received driver event '${type}':`, data);
    if (type === 'update') {
      // Full update, replace all drivers
      setLiveDrivers(data.data || []);
    } else if (type === 'location' || type === 'status') {
      // Partial update for a single driver
      setLiveDrivers(prevDrivers =>
        prevDrivers.map(driver =>
          driver._id === data.driverId ? { ...driver, ...data } : driver
        )
      );
    }
  }, []);

  // Initialize socket connections
  useDashboardSocket(handleDashboardEvent);
  useDriverSocket(handleDriverEvent);

  // --- Initial Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, ridesData, driversData] = await Promise.all([
          dashboardAPI.getDashboardStats(),
          dashboardAPI.getRecentRides(),
          driverAPI.getAllDrivers({ isOnline: true })
        ]);
        setStats(statsData);

        // UPDATED: Check if ridesData is valid, otherwise use placeholders
        if (ridesData && ridesData.length > 0) {
          setRecentActivities(ridesData);
        } else {
          console.warn("API returned no recent trips. Displaying placeholder data.");
          setRecentActivities(generatePlaceholderRides());
        }

        setLiveDrivers(driversData.drivers || []);
      } catch (error) {
        console.error("Failed to fetch initial dashboard data:", error);
        // Fallback to placeholders on API error as well
        setRecentActivities(generatePlaceholderRides());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredActivities =
    activeFilter === "All" ? recentActivities : recentActivities.filter((activity) => activity.service === activeFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-blue-600";     // Interpreted as "On-Trip"
      case "idle": return "bg-orange-600";     // Interpreted as "Online"
      case "offline": return "bg-gray-600";
      case "emergency": return "bg-red-600";
      default: return "bg-yellow-600";
    }
  };

  const handleCall = (phone, name) => {
    alert(`Calling ${name} at ${phone || 'N/A'}`);
  };

  const handleTrack = (driverId) => {
    setSelectedDriver(driverId);
  };

  // Growth component for stats cards
  const GrowthIndicator = ({ value }) => {
    const isPositive = value >= 0;
    return (
      <>
        <div className={`flex items-center text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
          {Math.abs(value)}% from yesterday
        </div>
        <div className={`flex mt-2 items-center text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
          {Math.abs(value)}% From SDLW
        </div>
      </>
    );
  };

  if (loading) {
    return <div className="text-center text-white">Loading Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Current Time</p>
          <p className="text-lg font-mono text-orange-600">{currentTime}</p>
        </div>
      </div>

      {/* Live Tracking Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-white flex items-center text-xl">
            <MapPin className="h-5 w-5 mr-2 text-orange-600" />
            Live Driver Tracking
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Map Placeholder */}
            <div className="h-80 bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-blue-900/20"></div>
              <div className="text-center z-10">
                <MapPin className="h-16 w-16 text-orange-600 mx-auto mb-4" />
                <p className="text-white text-lg font-medium">Interactive Map</p>
                <p className="text-gray-400">Real-time driver locations will appear here</p>
              </div>
              {/* Pulsing dots representing live drivers */}
              {liveDrivers.slice(0, 5).map(driver => (
                <div key={driver._id} className="absolute w-3 h-3 bg-orange-600 rounded-full animate-pulse" style={{ top: `${Math.random() * 80 + 10}%`, left: `${Math.random() * 80 + 10}%` }}></div>
              ))}
            </div>

            {/* Driver List */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {liveDrivers.length > 0 ? liveDrivers.map((driver) => (
                <div
                  key={driver._id}
                  className={`p-3 bg-gray-800 rounded-lg border-2 transition-colors ${selectedDriver === driver._id ? "border-white" : "border-transparent"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-white font-medium">{driver.name}</h4>
                      <p className="text-gray-400 text-sm">{driver.vehicle || 'N/A'} - {driver.licensePlate || 'N/A'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-white text-xs capitalize ${getStatusColor(driver.status)}`}>
                      {driver.status}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">Location: {driver.location ? `${driver.location.lat}, ${driver.location.lng}` : 'Not available'}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCall(driver.phone, driver.name)}
                      className="flex items-center px-3 py-1 text-xs border border-gray-700 text-gray-400 hover:bg-gray-700 rounded"
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </button>
                    <button
                      onClick={() => handleTrack(driver._id)}
                      className="flex items-center px-3 py-1 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded"
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      Track
                    </button>
                  </div>
                </div>
              )) : <p className="text-gray-400 text-center mt-10">No live drivers found.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400">Today's Trips</h3>
              <Car className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.todayRides}</div>
            <GrowthIndicator value={stats.ridesPercentageChange} />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400">Online Drivers</h3>
              <Users className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalDrivers}</div>
            <div className="text-xs text-gray-400">+{stats.newDriversThisWeek} New This Week</div>
            <div className="text-xs mt-2 text-gray-400">+{stats.newDriversThisWeek} New Last Week</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400">Today's Income</h3>
           <IndianRupee className="h-4 w-4 text-orange-600" />  
            </div>
            <div className="text-2xl font-bold text-white">₹{parseFloat(stats.todayIncome).toLocaleString()}</div>
            <GrowthIndicator value={stats.incomePercentageChange} />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400">Completed Trips</h3>
              <CheckCircle className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.completedRides}</div>
            <div className="text-xs ">{stats.successRate}% From Yesterday</div>
            <div className="text-xs mt-2 ">{stats.successRate}% From SDLW</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400">Cancelled Trips</h3>
              <XCircle className="h-4 w-4 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.cancelledRides}</div>
            <div className="text-xs text-red-400">{stats.cancellationRate}% From Yesterday</div>
            <div className="text-xs mt-2 text-red-400">{stats.cancellationRate}% From SDLW</div>
          </div>
        </div>
      )}

      {/* Recent Activities */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-xl">Recent Activities</h2>
            <div className="flex space-x-2">
              {["All", "Trip", "Courier"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 text-sm rounded ${activeFilter === filter
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : "border border-gray-700 text-gray-400 hover:bg-gray-800"
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {filteredActivities.length > 0 ? filteredActivities.slice(0, 5).map((activity) => (
              <div key={activity._id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold capitalize ${activity.service === "Ride" ? "border border-blue-500 text-blue-400" : "border border-purple-500 text-purple-400"
                      }`}
                  >
                    {activity.service}
                  </span>
                  <div>
                    <p className="text-white font-medium">{activity.user?.name || 'Unknown User'}</p>
                    <p className="text-gray-400 text-sm">{formatTimeAgo(activity.rideTime)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="text-white font-medium">₹{activity.amount}</p>
                  <span
                    className={`px-2 py-1 rounded text-xs capitalize ${activity.status === "completed" ? "bg-green-600 text-white" : ""
                      } ${activity.status === "in-progress" ? "bg-yellow-600 text-white" : ""} ${activity.status === "pending" ? "bg-gray-600 text-white" : ""
                      } ${activity.status === "cancelled" ? "bg-red-600 text-white" : ""}`}
                  >
                    {activity.status}
                  </span>
                </div>
              </div>
            )) : <p className="text-gray-400">No recent activities found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}