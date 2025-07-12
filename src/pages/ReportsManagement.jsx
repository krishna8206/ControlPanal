import { useState, useEffect, useRef, useCallback } from "react"

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

import {
  FiCalendar,
  FiDollarSign,
  FiDownload,
  FiRefreshCw,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertCircle,
  FiWifi,
  FiWifiOff,
  FiDatabase,
} from "react-icons/fi"

import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { io } from "socket.io-client"
import { IndianRupee } from "lucide-react"

// Skeleton loading components
const CardSkeleton = () => (
  <div className="bg-gray-800 rounded-lg shadow p-4 border border-gray-700 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-700 rounded w-32 mb-2"></div>
      </div>
      <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
    </div>
    <div className="mt-2 flex items-center">
      <div className="w-4 h-4 bg-gray-700 rounded mr-2"></div>
      <div className="h-4 bg-gray-700 rounded w-16 mr-2"></div>
      <div className="h-4 bg-gray-700 rounded w-20"></div>
    </div>
  </div>
)

const ChartSkeleton = ({ height = "h-80" }) => (
  <div className={`${height} bg-gray-700 rounded-lg animate-pulse flex items-center justify-center`}>
    <div className="text-center">
      <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-4"></div>
      <div className="h-4 bg-gray-600 rounded w-32 mx-auto mb-2"></div>
      <div className="h-3 bg-gray-600 rounded w-24 mx-auto"></div>
    </div>
  </div>
)

const TableSkeleton = () => (
  <div className="overflow-x-auto animate-pulse">
    <table className="min-w-full divide-y divide-gray-700">
      <thead className="bg-gray-800">
        <tr>
          {[1, 2, 3, 4].map((i) => (
            <th key={i} className="px-6 py-3">
              <div className="h-4 bg-gray-700 rounded w-20"></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-gray-800 divide-y divide-gray-700">
        {[1, 2, 3, 4, 5].map((i) => (
          <tr key={i}>
            {[1, 2, 3, 4].map((j) => (
              <td key={j} className="px-6 py-4">
                <div className="h-4 bg-gray-700 rounded w-16"></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6"]

// Empty state component for charts
const EmptyChartState = ({ message = "No trips data available" }) => (
  <div className="flex flex-col items-center justify-center h-full text-gray-400">
    <FiAlertCircle size={48} className="mb-4 opacity-50" />
    <p className="text-lg font-medium">{message}</p>
    <p className="text-sm mt-2">Data will appear here when trips are recorded</p>
  </div>
)

export default function ReportsEarning() {
  const [timeRange, setTimeRange] = useState("week")
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 6)
    return date
  })
  const [endDate, setEndDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [activeTab, setActiveTab] = useState("earnings")
  const [chartData, setChartData] = useState([])
  const [summaryData, setSummaryData] = useState({
    totalEarnings: 0,
    earningsChange: 0,
    totalRides: 0,
    ridesChange: 0,
    averageEarningPerRide: 0,
    avgPerRideChange: 0,
    cancellationRate: 0,
    cancellationRateChange: 0,
    drivers: [],
  })
  const [driverFilter, setDriverFilter] = useState("all")
  const [connectionStatus, setConnectionStatus] = useState("connecting")
  const [lastDataUpdate, setLastDataUpdate] = useState(null)
  const [dataSource, setDataSource] = useState("loading") // 'socket', 'api', 'cached', 'loading'

  // Use refs to maintain socket connection and prevent multiple connections
  const socketRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const dataRequestTimeoutRef = useRef(null)
  const lastValidDataRef = useRef({
    summary: null,
    earnings: null,
    drivers: null,
  })

  // Validate data before updating state
  const validateData = useCallback((data, type) => {
    if (!data || typeof data !== "object") {
      console.warn(`⚠ Invalid ${type} data:`, data)
      return false
    }
    switch (type) {
      case "summary":
        return data.totalEarnings !== undefined && data.totalRides !== undefined
      case "earnings":
        return data.chartData && Array.isArray(data.chartData) && data.summary
      case "drivers":
        return data.tableData && Array.isArray(data.tableData)
      default:
        return true
    }
  }, [])

  // Update state with validated data
  const updateStateWithValidation = useCallback(
    (data, type) => {
      if (!validateData(data, type)) {
        console.warn(`⚠ Rejecting invalid ${type} data, keeping current state`)
        return false
      }

      // Cache valid data
      lastValidDataRef.current[type] = data

      switch (type) {
        case "summary":
          setSummaryData((prevData) => ({
            ...prevData,
            totalEarnings: data.totalEarnings || 0,
            earningsChange: data.earningsChange || 0,
            totalRides: data.totalRides || 0,
            ridesChange: data.ridesChange || 0,
            averageEarningPerRide: data.averageEarningPerRide || data.avgPerRide || 0,
            avgPerRideChange: data.avgPerRideChange || 0,
            cancellationRate: data.cancellationRate || 0,
            cancellationRateChange: data.cancellationRateChange || 0,
          }))
          break
        case "earnings":
          if (data.chartData) {
            setChartData(data.chartData)
          }
          if (data.summary) {
            setSummaryData((prevData) => ({
              ...prevData,
              totalEarnings: data.summary.totalEarnings || 0,
              totalRides: data.summary.totalRides || 0,
              averageEarningPerRide: data.summary.avgEarningPerRide || 0,
              cancellationRate: data.summary.cancellationRate || 0,
            }))
          }
          break
        case "drivers":
          if (data.tableData) {
            setSummaryData((prevData) => ({
              ...prevData,
              drivers: data.tableData,
            }))
          }
          break
      }

      setLastDataUpdate(new Date())
      setIsInitialLoad(false) // Mark that we've loaded data at least once
      return true
    },
    [validateData],
  )

  // Fetch data via HTTP API as fallback
  const fetchDataViaAPI = useCallback(async () => {
    try {
      console.log("🔄 Fetching data via API...")
      setDataSource("api")
      const params = new URLSearchParams({
        timeRange,
        driverFilter,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })

      const [summaryResponse, earningsResponse, driverResponse] = await Promise.all([
        fetch(`https://panalsbackend.onrender.com/api/reports/summary?${params}`).catch((e) => {
          console.error("Summary API error:", e)
          return null
        }),
        fetch(`https://panalsbackend.onrender.com/api/reports/earnings?${params}`).catch((e) => {
          console.error("Earnings API error:", e)
          return null
        }),
        fetch(`https://panalsbackend.onrender.com/api/reports/driver-performance?${params}`).catch((e) => {
          console.error("Rider API error:", e)
          return null
        }),
      ])

      let hasValidData = false

      if (summaryResponse && summaryResponse.ok) {
        const summaryData = await summaryResponse.json()
        console.log("📊 API Summary data:", summaryData)
        if (updateStateWithValidation(summaryData, "summary")) {
          hasValidData = true
        }
      }

      if (earningsResponse && earningsResponse.ok) {
        const earningsData = await earningsResponse.json()
        console.log("💰 API Earnings data:", earningsData)
        if (updateStateWithValidation(earningsData, "earnings")) {
          hasValidData = true
        }
      }

      if (driverResponse && driverResponse.ok) {
        const driverData = await driverResponse.json()
        console.log("👥 API Rider data:", driverData)
        if (updateStateWithValidation(driverData, "drivers")) {
          hasValidData = true
        }
      }

      if (hasValidData) {
        setDataSource("api")
      } else {
        setDataSource("cached")
      }

      setIsLoading(false)
    } catch (error) {
      console.error("❌ API fetch error:", error)
      setDataSource("cached")
      setIsLoading(false)
    }
  }, [timeRange, driverFilter, startDate, endDate, updateStateWithValidation])

  // Initialize and manage Socket.IO connection
  const initializeSocket = useCallback(() => {
    // Clean up existing socket
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    console.log("🔌 Initializing Socket.IO connection...")
    const newSocket = io("https://panalsbackend.onrender.com", {
      transports: ["websocket", "polling"],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 3,
      forceNew: true,
    })

    socketRef.current = newSocket

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id)
      setConnectionStatus("connected")
      setDataSource("socket")

      // Clear any pending reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }

      // Request initial data after connection
      setTimeout(() => {
        console.log("📡 Requesting initial data via socket...")
        newSocket.emit("requestReportsSummary")
        newSocket.emit("requestEarningsReport", {
          timeRange,
          driverFilter,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
        newSocket.emit("requestDriverPerformance", {
          timeRange,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
      }, 500)
    })

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error)
      setConnectionStatus("error")
      // Fallback to API after connection error
      setTimeout(() => {
        fetchDataViaAPI()
      }, 1000)
    })

    newSocket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason)
      setConnectionStatus("disconnected")
      // Auto-reconnect after disconnect (but limit attempts)
      if (reason === "io server disconnect" || reason === "transport close") {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("🔄 Attempting to reconnect...")
          initializeSocket()
        }, 5000)
      }
    })

    newSocket.on("reconnect_error", (error) => {
      console.error("❌ Socket reconnection error:", error)
      setConnectionStatus("error")
      fetchDataViaAPI()
    })

    // Listen for real-time updates with validation
    newSocket.on("reportsSummaryUpdate", (data) => {
      console.log("📊 Socket summary update:", data)
      if (updateStateWithValidation(data, "summary")) {
        setDataSource("socket")
      }
    })

    newSocket.on("reportsSummaryData", (data) => {
      console.log("📊 Socket summary data:", data)
      if (updateStateWithValidation(data, "summary")) {
        setDataSource("socket")
      }
    })

    newSocket.on("earningsReportUpdate", (data) => {
      console.log("💰 Socket earnings update:", data)
      if (updateStateWithValidation(data, "earnings")) {
        setDataSource("socket")
        setIsLoading(false)
      }
    })

    newSocket.on("earningsReportData", (data) => {
      console.log("💰 Socket earnings data:", data)
      if (updateStateWithValidation(data, "earnings")) {
        setDataSource("socket")
        setIsLoading(false)
      }
    })

    newSocket.on("driverPerformanceUpdate", (data) => {
      console.log("👥 Socket rider update:", data)
      if (updateStateWithValidation(data, "drivers")) {
        setDataSource("socket")
      }
    })

    newSocket.on("driverPerformanceData", (data) => {
      console.log("👥 Socket driver data:", data)
      if (updateStateWithValidation(data, "drivers")) {
        setDataSource("socket")
      }
    })

    newSocket.on("reportError", (error) => {
      console.error("📊 Socket reports error:", error)
      setIsLoading(false)
      fetchDataViaAPI()
    })

    return newSocket
  }, [timeRange, driverFilter, startDate, endDate, fetchDataViaAPI, updateStateWithValidation])

  // Initialize socket connection on mount
  useEffect(() => {
    initializeSocket()
    // Also fetch data via API as backup
    fetchDataViaAPI()

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (dataRequestTimeoutRef.current) {
        clearTimeout(dataRequestTimeoutRef.current)
      }
    }
  }, [])

  // Handle filter changes with debouncing
  useEffect(() => {
    if (dataRequestTimeoutRef.current) {
      clearTimeout(dataRequestTimeoutRef.current)
    }

    // Debounce data requests
    dataRequestTimeoutRef.current = setTimeout(() => {
      // Only show loading if this is not the initial load
      if (!isInitialLoad) {
        setIsLoading(true)
      }

      if (socketRef.current && connectionStatus === "connected") {
        console.log("📡 Requesting data via Socket...")
        socketRef.current.emit("requestReportsSummary")
        socketRef.current.emit("requestEarningsReport", {
          timeRange,
          driverFilter,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
        socketRef.current.emit("requestDriverPerformance", {
          timeRange,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
      } else {
        console.log("📡 Socket not available, using API...")
        fetchDataViaAPI()
      }
    }, 500)
  }, [timeRange, driverFilter, startDate, endDate, connectionStatus, fetchDataViaAPI, isInitialLoad])

  const handleTimeRangeChange = (range) => {
    setTimeRange(range)
    const now = new Date()

    if (range === "day") {
      // For day view, show today's data
      setStartDate(new Date(now))
      setEndDate(new Date(now))
      handleRefresh()
    } else if (range === "week") {
      // For week view, show last 7 days (including today)
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 6)
      setStartDate(weekAgo)
      setEndDate(new Date(now))
      handleRefresh()
    } else if (range === "month") {
      // For month view, show last 30 days (including today)
      const monthAgo = new Date(now)
      monthAgo.setDate(monthAgo.getDate() - 29)
      setStartDate(monthAgo)
      setEndDate(new Date(now))
      handleRefresh()
    }
  }

  const handleRefresh = () => {
    setIsLoading(true)
    // Don't reset data, just show loading state
    // Try socket first, fallback to API
    if (socketRef.current && connectionStatus === "connected") {
      console.log("🔄 Refreshing via Socket...")
      socketRef.current.emit("requestReportsSummary")
      socketRef.current.emit("requestEarningsReport", {
        timeRange,
        driverFilter,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })
      socketRef.current.emit("requestDriverPerformance", {
        timeRange,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })
    } else {
      console.log("🔄 Refreshing via API...")
      fetchDataViaAPI()
    }
  }

  const handleExport = () => {
    // Create CSV data
    const csvData = [
      ["Date", "Earnings", "Trips", "Cancellations"],
      ...chartData.map((item) => [item.name, item.earnings || 0, item.rides || 0, item.cancellations || 0]),
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reports_${startDate.toISOString().split("T")[0]}to${endDate.toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatPercentageChange = (value) => {
    if (value === undefined || value === null || isNaN(value)) return "0.0"
    // Always show the actual percentage value
    const formattedValue = Math.abs(value).toFixed(1)
    return value > 0 ? `+${formattedValue}` : value < 0 ? `-${formattedValue}` : "0.0"
  }

  const getChangeIcon = (value) => {
    if (value > 0) return <FiTrendingUp className="text-green-500 mr-1" />
    if (value < 0) return <FiTrendingDown className="text-red-500 mr-1" />
    return <FiTrendingUp className="text-gray-500 mr-1" />
  }

  const getChangeColor = (value) => {
    if (value > 0) return "text-green-500"
    if (value < 0) return "text-red-500"
    return "text-gray-500"
  }

  const getDataSourceIcon = () => {
    switch (dataSource) {
      case "socket":
        return <FiWifi className="w-4 h-4 text-green-500" />
      case "api":
        return <FiDatabase className="w-4 h-4 text-blue-500" />
      case "cached":
        return <FiDatabase className="w-4 h-4 text-yellow-500" />
      default:
        return <FiWifiOff className="w-4 h-4 text-gray-500" />
    }
  }

  const hasData = chartData && chartData.length > 0

  return (
    <div className="p-4 md:p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section - Updated with gradient */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
            <p className="text-sm text-gray-400 mt-1">Track your earnings and trip performance metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            {lastDataUpdate && (
              <span className="text-xs text-gray-400">Last updated: {lastDataUpdate.toLocaleTimeString()}</span>
            )}
            <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1 rounded-full">
              {getDataSourceIcon()}
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-500"
                    : connectionStatus === "connecting"
                      ? "bg-yellow-500 animate-pulse"
                      : "bg-red-500"
                }`}
              ></div>
              <span className="text-xs text-gray-300 capitalize">
                {dataSource === "socket"
                  ? "Live"
                  : dataSource === "api"
                    ? "API"
                    : dataSource === "cached"
                      ? "Cached"
                      : connectionStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Filters and Controls - Updated with card styling */}
        <div className="bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleTimeRangeChange("day")}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  timeRange === "day"
                    ? "bg-orange-600 text-white shadow-md"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => handleTimeRangeChange("week")}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  timeRange === "week"
                    ? "bg-orange-600 text-white shadow-md"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => handleTimeRangeChange("month")}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  timeRange === "month"
                    ? "bg-orange-600 text-white shadow-md"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                This Month
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-600 rounded-lg px-3 py-1 bg-gray-700">
                <FiCalendar className="text-gray-400 mr-2" />
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="bg-transparent text-sm w-24 text-white focus:outline-none"
                  dateFormat="MMM d"
                />
                <span className="mx-2 text-gray-400">-</span>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="bg-transparent text-sm w-24 text-white focus:outline-none"
                  dateFormat="MMM d"
                />
              </div>

              <select
                value={driverFilter}
                onChange={(e) => setDriverFilter(e.target.value)}
                className="border border-gray-600 rounded-lg px-3 py-1 bg-gray-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Riders</option>
                {summaryData.drivers?.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleRefresh}
                className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                disabled={isLoading}
              >
                <FiRefreshCw className={`${isLoading ? "animate-spin" : ""}`} />
              </button>

              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors shadow-sm"
                disabled={!hasData}
              >
                <FiDownload className="mr-2" /> Export
              </button>
            </div>
          </div>
        </div>

        {/* Tabs - Updated with better styling */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab("earnings")}
            className={`px-6 py-3 font-medium text-sm relative ${
              activeTab === "earnings" ? "text-orange-600" : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Earnings
            {activeTab === "earnings" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("rides")}
            className={`px-6 py-3 font-medium text-sm relative ${
              activeTab === "rides" ? "text-orange-600" : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Trips
            {activeTab === "rides" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("drivers")}
            className={`px-6 py-3 font-medium text-sm relative ${
              activeTab === "drivers" ? "text-orange-600" : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Riders
            {activeTab === "drivers" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-full"></div>
            )}
          </button>
        </div>

        {/* Summary Cards - Updated with modern design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {isInitialLoad && isLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              <div className="bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Earnings</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      ₹{summaryData.totalEarnings?.toLocaleString() || "0.00"}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-indigo-900/30 text-indigo-300">
                     <IndianRupee className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  {getChangeIcon(summaryData.earningsChange)}
                  <span className={`${getChangeColor(summaryData.earningsChange)} font-medium`}>
                    {formatPercentageChange(summaryData.earningsChange)}%
                  </span>
                  <span className="text-gray-400 ml-2">vs last period</span>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Trips</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {summaryData.totalRides?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-900/30 text-emerald-300">
                    <FiTrendingUp size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  {getChangeIcon(summaryData.ridesChange)}
                  <span className={`${getChangeColor(summaryData.ridesChange)} font-medium`}>
                    {formatPercentageChange(summaryData.ridesChange)}%
                  </span>
                  <span className="text-gray-400 ml-2">vs last period</span>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Avg. per Trip</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      ₹{summaryData.averageEarningPerRide?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-900/30 text-amber-300">
                     <IndianRupee className="h-4 w-4" />  
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  {getChangeIcon(summaryData.avgPerRideChange)}
                  <span className={`${getChangeColor(summaryData.avgPerRideChange)} font-medium`}>
                    {formatPercentageChange(summaryData.avgPerRideChange)}%
                  </span>
                  <span className="text-gray-400 ml-2">vs last period</span>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Cancellation Rate</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {summaryData.cancellationRate?.toFixed(1) || "0.0"}%
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-red-900/30 text-red-300">
                    <FiTrendingDown size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  {getChangeIcon(summaryData.cancellationRateChange)}
                  <span className={`${getChangeColor(summaryData.cancellationRateChange)} font-medium`}>
                    {formatPercentageChange(summaryData.cancellationRateChange)}%
                  </span>
                  <span className="text-gray-400 ml-2">vs last period</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Main Content - Charts */}
        {isInitialLoad && isLoading ? (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-700">
              <div className="h-6 bg-gray-700 rounded w-48 mb-4 animate-pulse"></div>
              <ChartSkeleton />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-700">
                <div className="h-6 bg-gray-700 rounded w-40 mb-4 animate-pulse"></div>
                <ChartSkeleton height="h-64" />
              </div>
              <div className="bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-700">
                <div className="h-6 bg-gray-700 rounded w-36 mb-4 animate-pulse"></div>
                <ChartSkeleton height="h-64" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "earnings" && (
              <div className="space-y-6">
                {/* Earnings Overview Chart - Updated with better styling */}
                <div className="bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-semibold text-white">Earnings Overview</h2>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                      <span className="text-xs text-gray-400">Total Earnings</span>
                    </div>
                  </div>
                  <div className="h-80">
                    {hasData ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" strokeOpacity={0.1} />
                          <XAxis dataKey="name" stroke="#6B7280" tick={{ fontSize: 12 }} />
                          <YAxis stroke="#6B7280" tickFormatter={(value) => `₹${value}`} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1F2937",
                              borderColor: "#374151",
                              borderRadius: "0.5rem",
                              color: "#F9FAFB",
                              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                            }}
                            formatter={(value) => [`₹${value}`, "Earnings"]}
                          />
                          <Area
                            type="monotone"
                            dataKey="earnings"
                            stroke="orange"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="orange"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyChartState message="No earnings data available" />
                    )}
                  </div>
                </div>

                {/* Bottom Row Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Earnings by Time Period */}
                  <div className="bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-700 hover:shadow-md transition-shadow">
                    <h2 className="text-lg font-semibold text-white mb-5">
                      Earnings by {timeRange === "day" ? "Hour" : "Day"}
                    </h2>
                    <div className="h-64">
                      {hasData ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="name" stroke="#6B7280" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#6B7280" tickFormatter={(value) => `₹${value}`} />
                            <Tooltip
                              formatter={(value) => [`₹${value}`, "Earnings"]}
                              contentStyle={{
                                backgroundColor: "#1F2937",
                                borderColor: "#374151",
                                borderRadius: "0.5rem",
                              }}
                            />
                            <Bar dataKey="earnings" fill="orange" radius={[4, 4, 0, 0]} animationDuration={1500} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <EmptyChartState message="No earnings data to display" />
                      )}
                    </div>
                  </div>

                  {/* Earnings vs Rides */}
                  <div className="bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-700 hover:shadow-md transition-shadow">
                    <h2 className="text-lg font-semibold text-white mb-5">Earnings vs Trips</h2>
                    <div className="h-64">
                      {hasData ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="name" stroke="#6B7280" tick={{ fontSize: 12 }} />
                            <YAxis yAxisId="left" stroke="green" tickFormatter={(value) => `₹${value}`} />
                            <YAxis yAxisId="right" orientation="right" stroke="orange" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1F2937",
                                borderColor: "#374151",
                                borderRadius: "0.5rem",
                              }}
                              formatter={(value, name) => [name === "Earnings" ?` ₹${value}` : value, name]}
                            />
                            <Legend />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="earnings"
                              stroke="green"
                              strokeWidth={2}
                              dot={{ r: 3 }}
                              name="Earnings (₹)"
                              animationDuration={1500}
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="rides"
                              stroke="orange"
                              strokeWidth={2}
                              dot={{ r: 3 }}
                              name="Rides"
                              animationDuration={1500}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <EmptyChartState message="No data to compare" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "drivers" && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg shadow p-4 border border-gray-700">
                  <h2 className="text-lg font-semibold text-white mb-4">Rider Earnings Distribution</h2>
                  <div className="h-80">
                    {isLoading ? (
                      <ChartSkeleton />
                    ) : summaryData.drivers && summaryData.drivers.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={summaryData.drivers}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="orange"
                            dataKey="earnings"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {summaryData.drivers.map((entry, index) => (
                              <Cell key={`cell-${index}} fill={COLORS[index % COLORS.length]`} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyChartState message="No rider data available" />
                    )}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg shadow p-4 border border-gray-700">
                  <h2 className="text-lg font-semibold text-white mb-4">Rider Performance</h2>
                  <div className="overflow-x-auto">
                    {isLoading ? (
                      <TableSkeleton />
                    ) : summaryData.drivers && summaryData.drivers.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Rider
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Trips
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Earnings
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Avg. per Trip
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                          {summaryData.drivers.map((driver) => (
                            <tr key={driver.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                                {driver.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{driver.rides}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                ${driver.earnings?.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                ${driver.rides > 0 ? (driver.earnings / driver.rides).toFixed(2) : "0.00"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <EmptyChartState message="No rider performance data available" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}