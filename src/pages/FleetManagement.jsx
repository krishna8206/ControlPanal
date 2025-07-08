"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";

const socket = io("https://panalsbackend.onrender.com", {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default function FleetManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [linkingDriver, setLinkingDriver] = useState(null);
  const [driverIdInput, setDriverIdInput] = useState("");
  const [currentVehicles, setCurrentVehicles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    registrationNumber: "",
    model: "",
    vehicleType: "Car",
    category: "Trip",
    fuelType: "Petrol",
    capacity: "",
    year: "",
    color: "",
    status: "Active",
    // lastMaintenanceDate: "",
    assignedDriver: null,
  });
  const [errors, setErrors] = useState({});

  // Validate input fields
  const validateVehicle = (vehicle) => {
    const errors = {};
    if (!vehicle.registrationNumber.match(/^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/)) {
      errors.registrationNumber = "Invalid registration number format (e.g., XX00XX0000)";
    }
    if (!vehicle.model) errors.model = "Model is required";
    if (!vehicle.capacity || vehicle.capacity < 1 || vehicle.capacity > 50) {
      errors.capacity = "Capacity must be between 1 and 50";
    }
    if (!vehicle.year || vehicle.year < 1900 || vehicle.year > new Date().getFullYear() + 1) {
      errors.year = `Year must be between 1900 and ${new Date().getFullYear() + 1}`;
    }
    if (!vehicle.color) errors.color = "Color is required";
    return errors;
  };

  // Fetch vehicles from backend
  async function fetchVehicles() {
    try {
      const response = await axios.get("https://panalsbackend.onrender.com/api/vehicles", {
        params: { status: statusFilter !== "All" ? statusFilter : undefined },
      });

      // Check if response.data exists and has the expected structure
      if (!response.data || !response.data.success) {
        throw new Error("Invalid response from server: Success flag missing or false");
      }

      // Ensure response.data.data is an array
      if (!Array.isArray(response.data.data)) {
        throw new Error("Expected an array of vehicles, but received: " + JSON.stringify(response.data.data));
      }

      setCurrentVehicles(
        response.data.data.map((v) => ({
          ...v,
          driver: v.assignedDriver || {
            name: "Unassigned",
            _id: "N/A",
            verified: false,
            phone: "N/A",
          },
        }))
      );
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      alert(`Failed to fetch vehicles: ${error.message}`);
    }
  }

  // Initialize Socket.IO and fetch initial data
  useEffect(() => {
    fetchVehicles();

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
      socket.emit("join-room", "vehicles");
      socket.emit("getLatestVehicles");
    });

    socket.on("vehiclesUpdate", ({ data }) => {
      if (!Array.isArray(data)) {
        console.error("Invalid vehiclesUpdate data:", data);
        return;
      }
      setCurrentVehicles(
        data.map((v) => ({
          ...v,
          driver: v.assignedDriver || {
            name: "Unassigned",
            _id: "N/A",
            verified: false,
            phone: "N/A",
          },
        }))
      );
    });

    socket.on("vehicleStatusChanged", ({ vehicle }) => {
      setCurrentVehicles((prev) =>
        prev.map((v) =>
          v._id === vehicle._id
            ? {
              ...vehicle,
              driver: vehicle.assignedDriver || {
                name: "Unassigned",
                _id: "N/A",
                verified: false,
                phone: "N/A",
              },
            }
            : v
        )
      );
    });

    socket.on("error", ({ message }) => {
      console.error("Socket.IO error:", message);
      alert(message);
    });

    return () => {
      socket.off("vehiclesUpdate");
      socket.off("vehicleStatusChanged");
      socket.off("error");
    };
  }, []);

  // Refetch vehicles when filters change
  useEffect(() => {
    fetchVehicles();
  }, [statusFilter]);

  const filteredVehicles = currentVehicles.filter((vehicle) => {
    if (!vehicle._id) {
      console.warn("Vehicle missing _id:", vehicle);
      return false;
    }
    const matchesSearch =
      (vehicle.model || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.registrationNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.driver?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "All" || vehicle.category === typeFilter;
    const matchesStatus = statusFilter === "All" || vehicle.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getVehicleIcon = (category) => {
    switch (category) {
      case "Trip":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
            <circle cx="7" cy="17" r="2"></circle>
            <path d="M9 17h6"></path>
            <circle cx="17" cy="17" r="2"></circle>
          </svg>
        );
      case "Food Delivery":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 2a10 10 0 0 0-10 10"></path>
          </svg>
        );
      case "Courier Delivery":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
            <circle cx="7" cy="17" r="2"></circle>
            <path d="M9 17h6"></path>
            <circle cx="17" cy="17" r="2"></circle>
          </svg>
        );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-orange-600";
      case "Inactive":
        return "bg-gray-600";
      // case "Maintenance":
      //   return "bg-yellow-600";
      default:
        return "bg-gray-600";
    }
  };

  const handleView = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle({
      ...vehicle,
      // lastMaintenanceDate: vehicle.lastMaintenanceDate
      //   ? new Date(vehicle.lastMaintenanceDate).toISOString().split("T")[0]
      //   : "",
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    const validationErrors = validateVehicle(editingVehicle);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      const response = await axios.put(`https://panalsbackend.onrender.com/api/vehicles/${editingVehicle._id}`, {
        ...editingVehicle,
        // lastMaintenanceDate: editingVehicle.lastMaintenanceDate
        //   ? new Date(editingVehicle.lastMaintenanceDate)
        //   : null,
      });
      setCurrentVehicles((prev) =>
        prev.map((v) => (v._id === editingVehicle._id ? { ...response.data, driver: response.data.assignedDriver || { name: "Unassigned", _id: "N/A", verified: false, phone: "N/A" } } : v))
      );
      setEditingVehicle(null);
      setIsEditModalOpen(false);
      setErrors({});
      alert(`Vehicle ${editingVehicle.model} updated successfully!`);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      alert(`Failed to update vehicle: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleLinkDriver = (vehicle) => {
    setLinkingDriver(vehicle);
    setDriverIdInput("");
  };

  const handleSaveDriverLink = async () => {
    if (!driverIdInput.match(/^[0-9a-fA-F]{24}$/)) {
      alert("Invalid driver ID format");
      return;
    }
    try {
      const response = await axios.put(`https://panalsbackend.onrender.com/api/vehicles/${linkingDriver._id}/driver`, {
        driverId: driverIdInput,
      });
      setCurrentVehicles((prev) =>
        prev.map((v) => (v._id === linkingDriver._id ? { ...response.data, driver: response.data.assignedDriver || { name: "Unassigned", _id: "N/A", verified: false, phone: "N/A" } } : v))
      );
      setLinkingDriver(null);
      setDriverIdInput("");
      alert(`Driver linked to ${linkingDriver.model} successfully!`);
    } catch (error) {
      console.error("Error linking driver:", error);
      alert(`Failed to link driver: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleSuspend = async (vehicleId) => {
    try {
      const response = await axios.put(`https://panalsbackend.onrender.com/api/vehicles/${vehicleId}/status`, {
        status: "Inactive",
      });
      setCurrentVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle._id === vehicleId ? { ...vehicle, status: "Inactive" } : vehicle
        )
      );
      alert("Vehicle suspended successfully!");
    } catch (error) {
      console.error("Error suspending vehicle:", error);
      alert(`Failed to suspend vehicle: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAddVehicle = async () => {
    const validationErrors = validateVehicle(newVehicle);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      const response = await axios.post("https://panalsbackend.onrender.com/api/vehicles", {
        ...newVehicle,
        // lastMaintenanceDate: newVehicle.lastMaintenanceDate ? new Date(newVehicle.lastMaintenanceDate) : null,
      });
      setCurrentVehicles((prev) => [
        ...prev,
        {
          ...response.data,
          driver: response.data.assignedDriver || {
            name: "Unassigned",
            _id: "N/A",
            verified: false,
            phone: "N/A",
          },
        },
      ]);
      setIsAddModalOpen(false);
      setNewVehicle({
        registrationNumber: "",
        model: "",
        vehicleType: "Car",
        category: "Trip",
        fuelType: "Petrol",
        capacity: "",
        year: "",
        color: "",
        status: "Active",
        // lastMaintenanceDate: "",
        assignedDriver: null,
      });
      setErrors({});
      alert("Vehicle added successfully!");
    } catch (error) {
      console.error("Error adding vehicle:", error);
      alert(`Failed to add vehicle: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Fleet Management</h1>
          <p className="text-gray-400 mt-1">Manage all vehicles across Trip, Food Delivery, and Courier services</p>
        </div>
        <button
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md"
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Vehicle
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
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
                  className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  placeholder="Search vehicles, numbers, or drivers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border border-gray-700 text-white p-2 rounded-md w-full"
                />
              </div>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white p-2 rounded-md w-full md:w-[180px]"
            >
              <option value="All">All Types</option>
              <option value="Ride">Trip</option>
              <option value="Food Delivery">Food Delivery</option>
              <option value="Courier Delivery">Courier</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white p-2 rounded-md w-full md:w-[180px]"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              {/* <option value="Maintenance">Maintenance</option> */}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          <div className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{currentVehicles.length}</p>
              <p className="text-gray-400 text-sm">Total Vehicles</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          <div className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {currentVehicles.filter((v) => v.status === "Active").length}
              </p>
              <p className="text-gray-400 text-sm">Active</p>
            </div>
          </div>
        </div>
        {/* <div className="bg-gray-900 border border-gray-800 rounded-lg">
          <div className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {currentVehicles.filter((v) => v.status === "Maintenance").length}
              </p>
              <p className="text-gray-400 text-sm">Maintenance</p>
            </div>
          </div>
        </div> */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          <div className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-400">
                {currentVehicles.filter((v) => v.status === "Inactive").length}
              </p>
              <p className="text-gray-400 text-sm">Inactive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle._id} className="bg-gray-900 border border-gray-800 hover:border-white transition-colors rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getVehicleIcon(vehicle.category)}
                  <h2 className="text-white text-lg font-bold">{vehicle.model || "Unknown"}</h2>
                </div>
                <span className={`${getStatusColor(vehicle.status)} text-white px-2 py-1 rounded-full text-xs`}>
                  {vehicle.status || "Unknown"}
                </span>
              </div>
              <p className="text-gray-400 font-mono">{vehicle.registrationNumber || "N/A"}</p>

              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Type</p>
                    <p className="text-white">{vehicle.vehicleType || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Year</p>
                    <p className="text-white">{vehicle.year || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Fuel</p>
                    <p className="text-white flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3 w-3 mr-1"
                      >
                        <path d="M3 2h6l2 4h9a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"></path>
                        <path d="M8 22V2"></path>
                        <path d="M16 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2"></path>
                      </svg>
                      {vehicle.fuelType || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Color</p>
                    <p className="text-white">{vehicle.color || "N/A"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Capacity</p>
                  <p className="text-white">{vehicle.capacity || "N/A"}</p>
                </div>

                <div className="bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-400 text-sm">Linked Driver</p>
                    <span className={`${vehicle.driver?.verified ? "bg-orange-600" : "bg-gray-600"} text-white px-2 py-1 rounded-full text-xs`}>
                      {vehicle.driver?.verified ? "Verified" : "Pending"}
                    </span>
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
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <div>
                      <p className="text-white font-medium">{vehicle.driver?.name || "Unassigned"}</p>
                      <p className="text-gray-400 text-sm">ID: {vehicle.driver?._id || "N/A"}</p>
                    </div>
                  </div>
                  <button
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                    onClick={() => handleLinkDriver(vehicle)}
                  >
                    Link Driver
                  </button>
                </div>

                <div className="flex items-center space-x-2 text-sm">
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
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  {/* <span className="text-gray-400">Last Service:</span>
                  <span className="text-white">{vehicle.lastMaintenanceDate ? new Date(vehicle.lastMaintenanceDate).toLocaleDateString() : "N/A"}</span> */}
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    className="flex-1 border border-gray-700 text-gray-400 hover:bg-gray-800 px-3 py-1 rounded-md text-sm flex items-center justify-center"
                    onClick={() => handleView(vehicle)}
                  >
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
                      className="h-3 w-3 mr-1"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    View
                  </button>
                  <button
                    className="flex-1 border border-gray-700 text-blue-400 hover:bg-gray-800 hover:text-blue-300 px-3 py-1 rounded-md text-sm flex items-center justify-center"
                    onClick={() => handleEdit(vehicle)}
                  >
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
                      className="h-3 w-3 mr-1"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit
                  </button>
                  <button
                    className="flex-1 border border-gray-700 text-red-400 hover:bg-gray-800 hover:text-red-300 px-3 py-1 rounded-md text-sm flex items-center justify-center"
                    onClick={() => handleSuspend(vehicle._id)}
                    disabled={vehicle.status === "Inactive"}
                  >
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
                      className="h-3 w-3 mr-1"
                    >
                      <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                      <line x1="12" y1="2" x2="12" y2="12"></line>
                    </svg>
                    Suspend
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Vehicle Details Modal */}
      {isModalOpen && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 text-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Vehicle Details - {selectedVehicle.model || "Unknown"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Vehicle Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Model:</span>
                        <span className="text-white">{selectedVehicle.model || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Registration Number:</span>
                        <span className="text-white">{selectedVehicle.registrationNumber || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span
                          className="text-white">{selectedVehicle.vehicleType || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Category:</span>
                        <span className="text-white">{selectedVehicle.category || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={`${getStatusColor(selectedVehicle.status)} text-white px-2 py-1 rounded-full text-xs`}>
                          {selectedVehicle.status || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Driver Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Name:</span>
                        <span className="text-white">{selectedVehicle.driver?.name || "Unassigned"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ID:</span>
                        <span className="text-white">{selectedVehicle.driver?._id || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Phone:</span>
                        <span className="text-white">{selectedVehicle.driver?.phone || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={`${selectedVehicle.driver?.verified ? "bg-orange-600" : "bg-gray-600"} text-white px-2 py-1 rounded-full text-xs`}>
                          {selectedVehicle.driver?.verified ? "Verified" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 text-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add New Vehicle</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Registration Number</label>
                    <input
                      type="text"
                      value={newVehicle.registrationNumber}
                      onChange={(e) => setNewVehicle({ ...newVehicle, registrationNumber: e.target.value.toUpperCase() })}
                      className={`w-full bg-gray-800 border ${errors.registrationNumber ? "border-red-500" : "border-gray-700"} text-white p-2 rounded-md`}
                      placeholder="XX00XX0000"
                    />
                    {errors.registrationNumber && <p className="text-red-500 text-xs">{errors.registrationNumber}</p>}
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Model</label>
                    <input
                      type="text"
                      value={newVehicle.model}
                      onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                      className={`w-full bg-gray-800 border ${errors.model ? "border-red-500" : "border-gray-700"} text-white p-2 rounded-md`}
                    />
                    {errors.model && <p className="text-red-500 text-xs">{errors.model}</p>}
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Vehicle Type</label>
                    <select
                      value={newVehicle.vehicleType}
                      onChange={(e) => setNewVehicle({ ...newVehicle, vehicleType: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded-md"
                    >
                      <option value="Car">Car</option>
                      <option value="Bike">Bike</option>
                      <option value="Electric vehicle">Electric Vehicle</option>
                      <option value="Truck">Truck</option>
                      <option value="Van">Van</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Category</label>
                    <select
                      value={newVehicle.category}
                      onChange={(e) => setNewVehicle({ ...newVehicle, category: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded-md"
                    >
                      <option value="Ride">Trip</option>
                      <option value="Food Delivery">Food Delivery</option>
                      <option value="Courier Delivery">Courier</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Fuel Type</label>
                    <select
                      value={newVehicle.fuelType}
                      onChange={(e) => setNewVehicle({ ...newVehicle, fuelType: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded-md"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="CNG">CNG</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Capacity</label>
                    <input
                      type="number"
                      value={newVehicle.capacity}
                      onChange={(e) => setNewVehicle({ ...newVehicle, capacity: parseInt(e.target.value) || "" })}
                      className={`w-full bg-gray-800 border ${errors.capacity ? "border-red-500" : "border-gray-700"} text-white p-2 rounded-md`}
                    />
                    {errors.capacity && <p className="text-red-500 text-xs">{errors.capacity}</p>}
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Year</label>
                    <input
                      type="number"
                      value={newVehicle.year}
                      onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) || "" })}
                      className={`w-full bg-gray-800 border ${errors.year ? "border-red-500" : "border-gray-700"} text-white p-2 rounded-md`}
                    />
                    {errors.year && <p className="text-red-500 text-xs">{errors.year}</p>}
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Color</label>
                    <input
                      type="text"
                      value={newVehicle.color}
                      onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                      className={`w-full bg-gray-800 border ${errors.color ? "border-red-500" : "border-gray-700"} text-white p-2 rounded-md`}
                    />
                    {errors.color && <p className="text-red-500 text-xs">{errors.color}</p>}
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Status</label>
                    <select
                      value={newVehicle.status}
                      onChange={(e) => setNewVehicle({ ...newVehicle, status: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded-md"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      {/* <option value="Maintenance">Maintenance</option> */}
                    </select>
                  </div>
                  {/* <div>
                    <label className="text-gray-400 text-sm">Last Maintenance Date</label>
                    <input
                      type="date"
                      value={newVehicle.lastMaintenanceDate}
                      onChange={(e) => setNewVehicle({ ...newVehicle, lastMaintenanceDate: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded-md"
                    />
                  </div> */}
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setErrors({});
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md"
                    onClick={handleAddVehicle}
                  >
                    Add Vehicle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {isEditModalOpen && editingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 text-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edit Vehicle - {editingVehicle.model}</h2>
                <button onClick={() => {
                  setIsEditModalOpen(false);
                  setErrors({});
                }} className="text-gray-400 hover:text-white">
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Registration Number</label>
                    <input
                      type="text"
                      value={editingVehicle.registrationNumber}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, registrationNumber: e.target.value.toUpperCase() })}
                      className={`w-full bg-gray-800 border ${errors.registrationNumber ? "border-red-500" : "border-gray-700"} text-white p-2 rounded-md`}
                      placeholder="XX00XX0000"
                    />
                    {errors.registrationNumber && <p className="text-red-500 text-xs">{errors.registrationNumber}</p>}
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Model</label>
                    <input
                      type="text"
                      value={editingVehicle.model}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, model: e.target.value })}
                      className={`w-full bg-gray-800 border ${errors.model ? "border-red-500" : "border-gray-700"} text-white p-2 rounded-md`}
                    />
                    {errors.model && <p className="text-red-500 text-xs">{errors.model}</p>}
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Vehicle Type</label>
                    <select
                      value={editingVehicle.vehicleType}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, vehicleType: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded-md"
                    >
                      <option value="Car">Car</option>
                      <option value="Bike">Bike</option>
                      <option value="Electric vehicle">Electric Vehicle</option>
                      <option value="Truck">Truck</option>
                      <option value="Van">Van</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Category</label>
                    <select
                      value={editingVehicle.category}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, category: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded-md"
                    >
                      <option value="Ride">Trip</option>
                      <option value="Food Delivery">Food Delivery</option>
                      <option value="Courier Delivery">Courier</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Fuel Type</label>
                    <select
                      value={editingVehicle.fuelType}
                      onChange={(e) => setEditingVehicle({ ...newVehicle, fuelType: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded-md"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="CNG">CNG</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Capacity</label>
                    <input
                      type="number"
                      value={editingVehicle.capacity}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, capacity: parseInt(e.target.value) || "" })}
                      className={`w-full bg-gray-800 border ${errors.capacity ? "border-red-500" : "border-gray-700"} text-white p-2 rounded-md`}
                    />
                    {errors.capacity && <p className="text-red-500 text-xs">{errors.capacity}</p>}
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Year</label>
                    <input
                      type="number"
                      value={editingVehicle.year}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, year: parseInt(e.target.value) || "" })}
                      className={`w-full bg-gray-800 border ${errors.year ? "border-red-500" : "border-gray-700"} text-white p-2 rounded-md`}
                    />
                    {errors.year && <p className="text-red-500 text-xs">{errors.year}</p>}
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Color</label>
                    <input
                      type="text"
                      value={editingVehicle.color}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, color: e.target.value })}
                      className={`w-full bg-gray-800 border ${errors.color ? "border-red-500" : "border-gray-700"} text-white p-2 rounded-md`}
                    />
                    {errors.color && <p className="text-red-500 text-xs">{errors.color}</p>}
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Status</label>
                    <select
                      value={editingVehicle.status}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, status: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded-md"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      {/* <option value="Maintenance">Maintenance</option> */}
                    </select>
                  </div>
                  {/* <div>
                    <label className="text-gray-400 text-sm">Last Maintenance Date</label>
                    <input
                      type="date"
                      value={editingVehicle.lastMaintenanceDate}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, lastMaintenanceDate: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded-md"
                    />
                  </div> */}
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setErrors({});
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md"
                    onClick={handleSaveEdit}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Driver Modal */}
      {linkingDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 text-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Link Driver to {linkingDriver.model}</h2>
                <button onClick={() => setLinkingDriver(null)} className="text-gray-400 hover:text-white">
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm">Driver ID</label>
                  <input
                    type="text"
                    value={driverIdInput}
                    onChange={(e) => setDriverIdInput(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded-md"
                    placeholder="Enter 24-character MongoDB ObjectId"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                    onClick={() => setLinkingDriver(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md"
                    onClick={handleSaveDriverLink}
                  >
                    Link Driver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}