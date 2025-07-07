"use client"

import { useState, useEffect, useCallback } from "react"
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

// Initial state for stats to prevent errors on first render
const initialStats = {
  totalRevenue: 0,
  totalCommission: 0,
  totalPayouts: 0,
  pendingPayments: 0,
};

export default function PaymentsManagement() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // --- Data Fetching and Merging ---
  const fetchAndCombineData = useCallback(async () => {
    setLoading(true);
    try {
      const rideParams = { status: statusFilter !== 'All' ? statusFilter.toLowerCase() : '' };
      const invoiceParams = { 
        search: searchTerm,
        status: statusFilter !== 'All' ? statusFilter.toLowerCase() : '',
        limit: 100 
      };

      // Fetch data from both rides and invoices endpoints in parallel
      const [rideRes, invoiceRes, statsRes] = await Promise.all([
        api.get('/rides', { params: rideParams }),
        api.get('/invoices', { params: invoiceParams }),
        api.get('/invoices/stats')
      ]);

      // Transform ride data into a common transaction format
      const transformedRides = rideRes.data.map(ride => ({
        id: ride._id,
        user: ride.riderName || 'Unknown User',
        userType: 'Customer',
        amount: ride.amount,
        type: 'Trip Payment',
        method: 'Card', 
        status: ride.status,
        date: ride.date || ride.createdAt,
        transactionId: ride._id,
        commission: (ride.amount || 0) * 0.10, 
      }));

      // Transform invoice data into the same common format
      const transformedInvoices = invoiceRes.data.data.map(invoice => ({
        id: invoice._id,
        user: invoice.customerName,
        userType: 'Vendor', 
        amount: invoice.amount,
        type: 'Invoice Payout',
        method: 'Bank Transfer', 
        status: invoice.status,
        date: invoice.date,
        transactionId: invoice.invoiceNumber,
        commission: (invoice.amount || 0) * 0.10, 
      }));

      const allTransactions = [...transformedRides, ...transformedInvoices].sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(allTransactions);

      // Set stats from the dedicated endpoint
      if (statsRes.data.success) {
        setStats({
            totalRevenue: statsRes.data.data?.totalRevenue || 0,
            totalCommission: allTransactions.reduce((acc, t) => acc + (t.commission || 0), 0),
            totalPayouts: transformedInvoices.reduce((acc, t) => acc + (t.amount || 0), 0),
            pendingPayments: allTransactions.filter(t => t.status === 'pending' || t.status === 'processing').length,
        });
      }

    } catch (error) {
      console.error("Failed to fetch payment data:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
        fetchAndCombineData();
    }, 500);
    return () => clearTimeout(handler);
  }, [fetchAndCombineData]);


  const getStatusColor = (status) => {
    const s = status.toLowerCase();
    switch (s) {
      case "completed":
      case "paid":
        return "bg-green-600"
      case "processing":
      case "pending":
        return "bg-yellow-600"
      case "failed":
      case "cancelled":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  const getTypeColor = (type) => {
    if (type.includes("Payout")) return "border border-green-500 text-green-400"
    if (type.includes("Payment") || type.includes("Order")) return "border border-blue-500 text-blue-400"
    return "border border-gray-500 text-gray-400"
  }

  const handleView = (payment) => {
    setSelectedPayment(payment)
    setIsModalOpen(true)
  }
  
  const handleExport = () => {
    if (transactions.length === 0) {
        alert("No data to export.");
        return;
    }

    const headers = ["ID", "User", "User Type", "Amount", "Type", "Method", "Status", "Date", "Transaction ID", "Commission"];
    const rows = transactions.map(t => [
        t.id,
        `"${t.user.replace(/"/g, '""')}"`,
        t.userType,
        t.amount,
        t.type,
        t.method,
        t.status,
        formatDateTime(t.date),
        t.transactionId,
        t.commission.toFixed(2)
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "payments.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };


  const filteredTransactions = transactions.filter(t => typeFilter === 'All' || t.type.includes(typeFilter));

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Payments Management</h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">Monitor and manage all payments and payouts</p>
        </div>
        <button onClick={handleExport} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center w-full sm:w-auto justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export to CSV
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400">Total Revenue</h3>
            <div className="text-2xl font-bold text-white mt-2">₹{(stats?.totalRevenue || 0).toLocaleString()}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400">Commission Earned</h3>
            <div className="text-2xl font-bold text-white mt-2">₹{(stats?.totalCommission || 0).toLocaleString()}</div>
          </div>
           <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400">Total Payouts</h3>
            <div className="text-2xl font-bold text-white mt-2">₹{(stats?.totalPayouts || 0).toLocaleString()}</div>
          </div>
           <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400">Pending Payments</h3>
            <div className="text-2xl font-bold text-white mt-2">{stats?.pendingPayments || 0}</div>
          </div>
      </div>

       {/* Filters */}
       <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input placeholder="Search by payment ID, user, or transaction ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-gray-800 border border-gray-700 text-white p-2 rounded-md w-full"/>
            </div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-gray-800 border border-gray-700 text-white p-2 rounded-md w-full md:w-[180px]">
                <option value="All">All Types</option>
                <option value="Payment">Payments</option>
                <option value="Payout">Payouts</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-gray-800 border border-gray-700 text-white p-2 rounded-md w-full md:w-[180px]">
                <option value="All">All Status</option>
                <option value="Completed">Completed/Paid</option>
                <option value="Processing">Processing</option>
                <option value="Failed">Failed/Cancelled</option>
                <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {loading ? (
             <div className="text-center text-gray-400 py-8">Loading transactions...</div>
        ) : filteredTransactions.length > 0 ? (
          filteredTransactions.map((payment) => (
            <div key={payment.id} className="bg-gray-900 border border-gray-800 hover:border-green-500 transition-colors rounded-lg">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white"><rect x="2" y="4" width="20" height="16" rx="2"></rect><rect x="6" y="8" width="8" height="8"></rect><line x1="18" y1="12" x2="18.01" y2="12"></line></svg></div>
                    <div>
                      <h3 className="text-white font-medium text-lg capitalize">{payment.type}</h3>
                      <div className="flex items-center flex-wrap gap-2 mt-1">
                        <span className={`${getTypeColor(payment.type)} px-2 py-1 rounded-full text-xs`}>{payment.type}</span>
                        <span className={`${getStatusColor(payment.status)} text-white px-2 py-1 rounded-full text-xs capitalize`}>{payment.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    {/* FIXED: Added fallback to 0 to prevent error on undefined amount */}
                    <p className="text-white font-bold text-xl">₹{(payment.amount || 0).toLocaleString()}</p>
                    <p className="text-gray-400 text-sm">{payment.method}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-800 p-3 rounded-lg"><div className="flex items-center space-x-2 mb-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-400"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg><span className="text-blue-400 font-medium">User Details</span></div><p className="text-white font-medium">{payment.user}</p><p className="text-gray-400 text-sm">{payment.userType}</p></div>
                  <div className="bg-gray-800 p-3 rounded-lg"><div className="flex items-center space-x-2 mb-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-green-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg><span className="text-green-400 font-medium">Transaction</span></div><p className="text-white text-sm break-all">{payment.transactionId}</p><p className="text-gray-400 text-xs">{formatDateTime(payment.date)}</p></div>
                  <div className="bg-gray-800 p-3 rounded-lg"><div className="flex items-center space-x-2 mb-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-purple-400"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg><span className="text-purple-400 font-medium">Commission</span></div><p className="text-white font-medium">₹{payment.commission.toFixed(2)}</p><p className="text-gray-400 text-xs">{payment.amount ? ((payment.commission / payment.amount) * 100).toFixed(1) : 0}% of total</p></div>
                </div>
                <div className="flex flex-wrap gap-2"><button className="border border-gray-700 text-gray-400 hover:bg-gray-800 px-3 py-1 rounded-md text-sm flex items-center" onClick={() => handleView(payment)}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>View Details</button></div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8">No payments found matching your criteria.</div>
        )}
      </div>

      {/* Payment Details Modal */}
      {isModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 text-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Payment Details - {selectedPayment.id}</h2><button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">&times;</button></div><div className="flex border-b border-gray-800 mb-4"><button className={`px-4 py-2 ${activeTab === "details" ? "border-b-2 border-green-600 text-white" : "text-gray-400"}`} onClick={() => setActiveTab("details")}>Details</button><button className={`px-4 py-2 ${activeTab === "history" ? "border-b-2 border-green-600 text-white" : "text-gray-400"}`} onClick={() => setActiveTab("history")}>History</button></div>
              {activeTab === "details" && (
                <div className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="bg-gray-800 p-4 rounded-lg"><h4 className="text-white font-medium mb-2">Payment Information</h4><div className="space-y-2 text-sm">
                    <div className="flex justify-between flex-wrap gap-2"><span className="text-gray-400">Payment ID:</span><span className="text-white">{selectedPayment.id}</span></div>
                    <div className="flex justify-between flex-wrap gap-2"><span className="text-gray-400">Amount:</span><span className="text-white">₹{(selectedPayment.amount || 0).toLocaleString()}</span></div>
                    <div className="flex justify-between flex-wrap gap-2"><span className="text-gray-400">Method:</span><span className="text-white">{selectedPayment.method}</span></div>
                    <div className="flex justify-between flex-wrap gap-2"><span className="text-gray-400">Status:</span><span className={`${getStatusColor(selectedPayment.status)} text-white px-2 py-1 rounded-full text-xs capitalize`}>{selectedPayment.status}</span></div>
                </div></div><div className="bg-gray-800 p-4 rounded-lg"><h4 className="text-white font-medium mb-2">Transaction Details</h4><div className="space-y-2 text-sm">
                    <div className="flex justify-between flex-wrap gap-2"><span className="text-gray-400">Transaction ID:</span><span className="text-white break-all">{selectedPayment.transactionId}</span></div>
                    <div className="flex justify-between flex-wrap gap-2"><span className="text-gray-400">Date:</span><span className="text-white">{formatDateTime(selectedPayment.date)}</span></div>
                    <div className="flex justify-between flex-wrap gap-2"><span className="text-gray-400">Commission:</span><span className="text-white">₹{selectedPayment.commission.toFixed(2)}</span></div>
                    <div className="flex justify-between flex-wrap gap-2"><span className="text-gray-400">Net Amount:</span><span className="text-white">₹{(selectedPayment.amount - selectedPayment.commission).toFixed(2)}</span></div>
                </div></div></div></div>
              )}
              {activeTab === "history" && (
                <div className="space-y-4"><div className="bg-gray-800 p-4 rounded-lg"><h4 className="text-white font-medium mb-3">Payment Timeline</h4><div className="space-y-3"><div className="flex items-start space-x-3"><div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0 mt-1.5"></div><div><p className="text-white text-sm">Payment initiated</p><p className="text-gray-400 text-xs">{formatDateTime(selectedPayment.date)}</p></div></div><div className="flex items-start space-x-3"><div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 mt-1.5"></div><div><p className="text-white text-sm">Payment processed</p><p className="text-gray-400 text-xs">2 mins after initiation</p></div></div>
                  {selectedPayment.status === "Completed" && (<div className="flex items-start space-x-3"><div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0 mt-1.5"></div><div><p className="text-white text-sm">Payment completed</p><p className="text-gray-400 text-xs">5 mins after initiation</p></div></div>)}
                  {selectedPayment.status === "Failed" && (<div className="flex items-start space-x-3"><div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0 mt-1.5"></div><div><p className="text-white text-sm">Payment failed</p><p className="text-gray-400 text-xs">Reason: Insufficient funds</p></div></div>)}
                </div></div></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}