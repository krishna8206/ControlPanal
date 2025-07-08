"use client";

import { useState, useEffect } from "react";
import io from "socket.io-client";

// Backend URL
const BACKEND_URL = "https://panalsbackend.onrender.com";

export default function ComplaintManagement() {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch complaints from backend
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/complaints`);
        if (!response.ok) throw new Error("Failed to fetch complaints");
        const data = await response.json();
        setComplaints(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const socket = io(BACKEND_URL, {
      path: "/socket.io",
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Connected to WebSocket");
      socket.emit("join-room", "complaints"); // Join the complaints room
    });

    socket.on("complaintsUpdate", (data) => {
      console.log("Received complaints update:", data);
      setComplaints(data.data);
    });

    socket.on("error", (err) => {
      console.error("WebSocket error:", err);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesTab = activeTab === "All" || complaint.status === activeTab;
    const matchesSearch =
      complaint.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.platform?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false; // Adjust fields based on backend response
    return matchesTab && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-green-600";
      case "Investigating":
        return "bg-yellow-600";
      case "Pending":
        return "bg-red-600";
      case "Refunded":
        return "bg-blue-600";
      default:
        return "bg-gray-600";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "text-red-400";
      case "Medium":
        return "text-yellow-400";
      case "Low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case "Uber":
        return "bg-black text-white";
      case "Swiggy":
        return "bg-orange-600 text-white";
      case "Porter":
        return "bg-blue-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  // Handle marking complaint with different statuses
  const handleUpdateStatus = async (complaintId, newStatus) => {
    try {
      const resolutionNotes = newStatus === "Resolved"
        ? "Issue resolved by support team"
        : newStatus === "Refunded"
        ? "Refund processed"
        : "Investigation started";
      const response = await fetch(`${BACKEND_URL}/api/complaints/${complaintId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Add Authorization header if auth is implemented
          // "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, resolutionNotes }),
      });
      if (!response.ok) throw new Error(`Failed to update complaint to ${newStatus}`);
      const data = await response.json();
      console.log("Complaint updated:", data);
      // Real-time update is handled by the backend via WebSocket
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-white text-center">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Complaint Management</h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">Manage customer complaints across all platforms</p>
        </div>
      </div>


      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-white">{complaints.length}</p>
            <p className="text-gray-400 text-xs sm:text-sm">Total Complaints</p>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-red-400">
              {complaints.filter((c) => c.status === "Pending").length}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">Pending</p>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-green-400">
              {complaints.filter((c) => c.status === "Resolved" || c.status === "Refunded").length}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">Resolved</p>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-blue-400">
              {complaints.filter((c) => c.refundStatus === "Completed").length}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">Refunded</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Complaints List */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-lg">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-white text-xl sm:text-2xl font-semibold">Customer Complaints</h2>
                <div className="relative w-full sm:w-64">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    placeholder="Search complaints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2"
                  />
                </div>
              </div>
              <div className="mt-4 w-full overflow-x-auto">
                <div className="flex space-x-2 pb-2">
                  <button
                    onClick={() => setActiveTab("All")}
                    className={`px-3 py-1 rounded-md text-sm ${activeTab === "All" ? "bg-orange-600" : "bg-gray-800"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab("Pending")}
                    className={`px-3 py-1 rounded-md text-sm ${activeTab === "Pending" ? "bg-orange-600" : "bg-gray-800"}`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setActiveTab("Investigating")}
                    className={`px-3 py-1 rounded-md text-sm ${activeTab === "Investigating" ? "bg-orange-600" : "bg-gray-800"}`}
                  >
                    Investigating
                  </button>
                  <button
                    onClick={() => setActiveTab("Resolved")}
                    className={`px-3 py-1 rounded-md text-sm ${activeTab === "Resolved" ? "bg-orange-600" : "bg-gray-800"}`}
                  >
                    Resolved
                  </button>
                  <button
                    onClick={() => setActiveTab("Refunded")}
                    className={`px-3 py-1 rounded-md text-sm ${activeTab === "Refunded" ? "bg-orange-600" : "bg-gray-800"}`}
                  >
                    Refunded
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="h-[calc(100vh-280px)] lg:h-[600px] overflow-y-auto pr-2">
                <div className="space-y-4">
                  {filteredComplaints.length > 0 ? (
                    filteredComplaints.map((complaint) => (
                      <div
                        key={complaint._id} // Use _id from backend
                        className={`p-3 sm:p-4 bg-gray-800 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedComplaint === complaint._id
                            ? "border-white"
                            : "border-transparent hover:border-gray-700"
                        }`}
                        onClick={() => setSelectedComplaint(complaint._id)}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2 sm:gap-0">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg
                                className="h-4 w-4 sm:h-5 sm:w-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-white font-medium text-base sm:text-lg">{complaint.customerName}</h3>
                              <div className="flex items-center flex-wrap gap-x-2 mt-1">
                                <span className={`text-xs sm:text-sm ${getPriorityColor("High")}`}>
                                  High Priority
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span
                              className={`${getStatusColor(complaint.status)} text-white px-2 py-1 rounded-full text-xs sm:text-sm mb-1 inline-block`}
                            >
                              {complaint.status}
                            </span>
                            <p className="text-gray-400 text-xs">
                              {new Date(complaint.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{complaint.description}</p>

                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <svg
                                className="h-4 w-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                              <span className="text-gray-400 text-xs sm:text-sm">
                                {complaint.messages?.length || 0} messages
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <svg
                                className="h-4 w-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="text-gray-400 text-xs sm:text-sm">₹{complaint.amount || 0}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`border px-2 py-1 rounded-full text-xs ${
                                complaint.refundStatus === "Completed"
                                  ? "border-green-500 text-green-400"
                                  : complaint.refundStatus === "Pending"
                                  ? "border-yellow-500 text-yellow-400"
                                  : "border-gray-500 text-gray-400"
                              }`}
                            >
                              {complaint.refundStatus || "Not Applicable"}
                            </span>
                            {complaint.status === "Investigating" && (
                              <span className="bg-orange-600 text-white px-2 py-1 rounded-full text-xs">
                                Live Support
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <svg
                        className="h-12 w-12 text-gray-400 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <p className="text-gray-400">No complaints found matching your criteria.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Complaint Detail Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-lg">
            <div className="p-6">
              <h2 className="text-white text-xl sm:text-2xl font-semibold">
                {selectedComplaint ? "Complaint Details" : "Select a Complaint"}
              </h2>
            </div>
            <div className="p-6 pt-0">
              {selectedComplaint ? (
                <div className="space-y-4">
                  {(() => {
                    const complaint = complaints.find((c) => c._id === selectedComplaint);
                    if (!complaint) return null;

                    return (
                      <>
                        {/* Customer Info */}
                        <div className="bg-gray-800 p-3 rounded-lg">
                          <h4 className="text-white font-medium mb-2 text-base sm:text-lg">
                            Customer Information
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Name:</span>
                              <span className="text-white">{complaint.customerName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Amount:</span>
                              <span className="text-white">₹{complaint.amount || 0}</span>
                            </div>
                          </div>
                        </div>

                        {/* Issue Summary */}
                        <div className="bg-gray-800 p-3 rounded-lg">
                          <h4 className="text-white font-medium mb-2 text-base sm:text-lg">
                            Issue Summary
                          </h4>
                          <p className="text-gray-300 text-sm">{complaint.description}</p>
                        </div>

                        {/* Chat History */}
                        <div className="bg-gray-800 p-3 rounded-lg">
                          <h4 className="text-white font-medium mb-2 text-base sm:text-lg">
                            Chat History
                          </h4>
                          <div className="h-48 sm:h-64 overflow-y-auto pr-2">
                            <div className="space-y-3">
                              {complaint.messages?.map((message, index) => (
                                <div
                                  key={index}
                                  className={`p-2 rounded text-sm ${
                                    message.sender === "Support"
                                      ? "bg-orange-600/20 border-l-2"
                                      : "bg-gray-700"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-white">{message.sender}</span>
                                    <span className="text-xs text-gray-400">{message.time}</span>
                                  </div>
                                  <p className="text-gray-300">{message.message}</p>
                                </div>
                              )) || <p className="text-gray-400">No messages available</p>}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              className="border border-gray-700 text-gray-400 hover:bg-gray-800 p-2 rounded-md text-xs sm:text-sm flex items-center justify-center"
                            >
                              <svg
                                className="h-3 w-3 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              Call
                            </button>
                            <button
                              className="border border-gray-700 text-gray-400 hover:bg-gray-800 p-2 rounded-md text-xs sm:text-sm flex items-center justify-center"
                            >
                              <svg
                                className="h-3 w-3 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              Email
                            </button>
                          </div>
                          {complaint.status !== "Resolved" && complaint.status !== "Refunded" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(complaint._id, "Resolved")}
                                className="w-full border border-green-600 text-green-400 hover:bg-green-600/10 p-2 rounded-md text-sm sm:text-base flex items-center justify-center"
                              >
                                <svg
                                  className="h-4 w-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Mark as Resolved
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(complaint._id, "Investigating")}
                                className="w-full border border-yellow-600 text-yellow-400 hover:bg-yellow-600/10 p-2 rounded-md text-sm sm:text-base flex items-center justify-center"
                              >
                                <svg
                                  className="h-4 w-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01"
                                  />
                                </svg>
                                Mark as Investigating
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(complaint._id, "Refunded")}
                                className="w-full border border-blue-600 text-blue-400 hover:bg-blue-600/10 p-2 rounded-md text-sm sm:text-base flex items-center justify-center"
                              >
                                <svg
                                  className="h-4 w-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                                  />
                                </svg>
                                Mark as Refunded
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg
                    className="h-12 w-12 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-400">Select a complaint to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}


