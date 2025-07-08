"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"

// API instance configured to connect to your backend
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://panalsbackend.onrender.com/api",
});

// Helper function to format date strings
const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleString();
};

const initialNewUserState = {
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "Customer",
    status: "Active",
    vehicle: "",
    licensePlate: ""
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);
  
  // State for the Add User Modal
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState(initialNewUserState);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Function to fetch users from the API based on current filters
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm,
        role: roleFilter === "All" ? "" : roleFilter,
        status: statusFilter === "All" ? "" : statusFilter === 'Verified' ? 'Active' : statusFilter === 'Blocked' ? 'Suspended' : 'Pending',
      };
      const response = await api.get("/users", { params });
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(handler);
  }, [fetchUsers, searchTerm]);
  
  useEffect(() => {
      if(!searchTerm) fetchUsers()
  },[roleFilter, statusFilter, searchTerm])


  const getDisplayStatus = (status) => {
    if (status === 'Active') return 'Verified';
    if (status === 'Suspended') return 'Blocked';
    return status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-green-600";
      case "Pending": return "bg-yellow-600";
      case "Suspended": return "bg-red-600";
      default: return "bg-gray-600";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Customer": return "border-blue-500 text-blue-400";
      case "Driver": return "border-green-500 text-green-400";
      case "Vendor": return "border-purple-500 text-purple-400";
      default: return "border-gray-500 text-gray-400";
    }
  };
  
  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
          // POST request to the backend endpoint from user.routes.js
          await api.post('/users', newUser);
          alert('User added successfully!');
          setIsAddUserModalOpen(false);
          setNewUser(initialNewUserState);
          fetchUsers(); // Refresh the user list
      } catch (error) {
          console.error('Failed to add user:', error);
          alert(`Failed to add user: ${error.response?.data?.message || error.message}`);
      } finally {
          setIsSubmitting(false);
      }
  };


  const handleView = (user) => {
    setSelectedUser(user);
  };
  
  // const handleSuspend = async (user) => {
  //   const action = user.status === "Suspended" ? "unblock" : "suspend";
  //   if (confirm(`Are you sure you want to ${action} ${user.name}?`)) {
  //     try {
  //       await api.patch(`/users/${user._id}/suspend`);
  //       alert(`User ${user.name} has been ${action}ed successfully!`);
  //       fetchUsers();
  //     } catch (error) {
  //       console.error(`Failed to ${action} user:`, error);
  //       alert(`Failed to ${action} user.`);
  //     }
  //   }
  // };
  
  const handleCall = (phone, name) => alert(`Calling ${name} at ${phone}`);
  const handleEmail = (email, name) => alert(`Opening email to ${name} at ${email}`);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white text-center md:text-left">User Management</h1>
          <p className="text-gray-400 mt-1 text-center md:text-left">Manage customers, drivers, and vendors</p>
        </div>
        {/* UPDATED: Button now opens the modal */}
        <button onClick={() => setIsAddUserModalOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white w-full md:w-auto px-4 py-2 rounded-md">
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1"><div className="relative"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-3 h-4 w-4 text-gray-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg><input placeholder="Search users by name, email, or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-gray-800 border border-gray-700 text-white w-full p-2 rounded-md" /></div></div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full md:w-[180px] bg-gray-800 border border-gray-700 text-white p-2 rounded-md"><option value="All">All Roles</option><option value="Customer">Customer</option><option value="Driver">Driver</option><option value="Vendor">Vendor</option></select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full md:w-[180px] bg-gray-800 border border-gray-700 text-white p-2 rounded-md"><option value="All">All Status</option><option value="Verified">Verified</option><option value="Pending">Pending</option><option value="Blocked">Blocked</option></select>
          </div>
        </div>
      </div>


      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg"><div className="p-6"><div className="text-center"><p className="text-2xl font-bold text-white">{users.length}</p><p className="text-gray-400 text-sm">Total Users</p></div></div></div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg"><div className="p-6"><div className="text-center"><p className="text-2xl font-bold text-blue-400">{users.filter((u) => u.role === "Customer").length}</p><p className="text-gray-400 text-sm">Customers</p></div></div></div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg"><div className="p-6"><div className="text-center"><p className="text-2xl font-bold text-green-400">{users.filter((u) => u.role === "Driver").length}</p><p className="text-gray-400 text-sm">Drivers</p></div></div></div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg"><div className="p-6"><div className="text-center"><p className="text-2xl font-bold text-purple-400">{users.filter((u) => u.role === "Vendor").length}</p><p className="text-gray-400 text-sm">Vendors</p></div></div></div>
      </div>

      
      {loading ? (
        <div className="text-center text-white text-lg p-10">Loading users...</div>
      ) : (
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user._id} className="bg-gray-900 border border-gray-800 hover:border-white transition-colors rounded-lg">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
                  <div>
                    <h3 className="text-white font-medium text-lg">{user.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className={`border ${getRoleColor(user.role)} px-2 py-1 rounded-full text-xs`}>{user.role}</span>
                      <span className={`${getStatusColor(user.status)} text-white px-2 py-1 rounded-full text-xs`}>{getDisplayStatus(user.status)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <div className="flex items-center space-x-1 mb-1 justify-start sm:justify-end"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-yellow-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    <span className="text-white font-medium">{user.rating || 0}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{user.rides || 0} trips</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-800 p-3 rounded-lg"><div className="flex items-center space-x-2 mb-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-green-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg><span className="text-green-400 font-medium">Contact</span></div><p className="text-white text-sm">{user.phone}</p><p className="text-gray-400 text-xs">{user.email}</p></div>
                <div className="bg-gray-800 p-3 rounded-lg"><div className="flex items-center space-x-2 mb-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-400"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg><span className="text-blue-400 font-medium">Location</span></div><p className="text-white text-sm">{user.location || 'N/A'}</p><p className="text-gray-400 text-xs">Last active: {formatDateTime(user.lastUpdate)}</p></div>
                <div className="bg-gray-800 p-3 rounded-lg"><div className="flex items-center space-x-2 mb-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-purple-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg><span className="text-purple-400 font-medium">Member Since</span></div><p className="text-white text-sm">{new Date(user.joinDate).toLocaleDateString()}</p>{user.role === "Driver" && user.vehicleDetails && <p className="text-gray-400 text-xs">{user.vehicleDetails}</p>}</div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <div><button className="border border-gray-700 text-gray-400 hover:bg-gray-800 w-full sm:w-auto px-3 py-1 rounded-md text-sm flex items-center" onClick={() => handleView(user)}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>View Profile</button></div>
                <button className="border border-gray-700 text-gray-400 hover:bg-gray-800 w-full sm:w-auto px-3 py-1 rounded-md text-sm flex items-center" onClick={() => handleCall(user.phone, user.name)}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>Call</button>
                <button className="border border-gray-700 text-gray-400 hover:bg-gray-800 w-full sm:w-auto px-3 py-1 rounded-md text-sm flex items-center" onClick={() => handleEmail(user.email, user.name)}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>Email</button>
              </div>
            </div>
          </div>
        ))}
        {users.length === 0 && !loading && (<div className="text-center py-10 bg-gray-900 rounded-lg"><p className="text-white text-lg">No users found.</p><p className="text-gray-400">Try adjusting your search or filter.</p></div>)}
      </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 text-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-800"><div className="flex justify-between items-center"><h2 className="text-xl font-bold">User Profile - {selectedUser.name}</h2><button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white text-2xl">&times;</button></div></div>
            <div className="p-6 overflow-y-auto"><div className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="bg-gray-800 p-4 rounded-lg"><h4 className="text-white font-medium mb-2">Personal Information</h4><div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Name:</span><span className="text-white">{selectedUser.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Email:</span><span className="text-white">{selectedUser.email}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Phone:</span><span className="text-white">{selectedUser.phone}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Role:</span><span className={`border ${getRoleColor(selectedUser.role)} px-2 py-1 rounded-full text-xs`}>{selectedUser.role}</span></div>
            </div></div><div className="bg-gray-800 p-4 rounded-lg"><h4 className="text-white font-medium mb-2">Account Status</h4><div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Status:</span><span className={`${getStatusColor(selectedUser.status)} text-white px-2 py-1 rounded-full text-xs`}>{getDisplayStatus(selectedUser.status)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Rating:</span><div className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-yellow-400 mr-1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg><span className="text-white">{selectedUser.rating}</span></div></div>
                <div className="flex justify-between"><span className="text-gray-400">Join Date:</span><span className="text-white">{new Date(selectedUser.joinDate).toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Last Active:</span><span className="text-white">{formatDateTime(selectedUser.lastUpdate)}</span></div>
            </div></div></div></div></div>
          </div>
        </div>
      )}

        {/* NEW: Add User Modal */}
        {isAddUserModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 border border-gray-800 text-white rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col">
                    <div className="p-6 border-b border-gray-800">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Add New User</h2>
                            <button onClick={() => setIsAddUserModalOpen(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                        </div>
                    </div>
                    <form onSubmit={handleAddUser} className="p-6 overflow-y-auto space-y-4">
                        {/* Form Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                <input type="text" name="name" value={newUser.name} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                                <input type="email" name="email" value={newUser.email} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                                <input type="password" name="password" value={newUser.password} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                                <input type="tel" name="phone" value={newUser.phone} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                                <select name="role" value={newUser.role} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2">
                                    <option>Customer</option>
                                    <option>Driver</option>
                                    <option>Vendor</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                                <select name="status" value={newUser.status} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2">
                                    <option value="Active">Active</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Suspended">Suspended</option>
                                </select>
                            </div>
                        </div>

                        {/* Conditional Fields for Driver */}
                        {newUser.role === 'Driver' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                                 <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Vehicle Details</label>
                                    <input type="text" name="vehicle" placeholder="e.g., Honda City - DL-01-AB-1234" value={newUser.vehicle} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">License Plate</label>
                                    <input type="text" name="licensePlate" placeholder="e.g., DL-01-AB-1234" value={newUser.licensePlate} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2" />
                                </div>
                            </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 pt-4">
                            <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="border border-gray-700 text-gray-400 px-4 py-2 rounded-md">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md disabled:bg-gray-500">
                                {isSubmitting ? 'Saving...' : 'Save User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  )
}