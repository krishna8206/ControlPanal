"use client"

import { useState } from "react"

const supportTickets = [
  {
    id: "SUP001",
    user: "John Doe",
    userType: "Customer",
    subject: "Payment not processed",
    priority: "High",
    status: "Open",
    category: "Payment",
    createdAt: "2024-01-15 14:30",
    lastUpdate: "2024-01-15 16:45",
    assignedTo: "Sarah Wilson",
    messages: [
      { sender: "John Doe", message: "My payment was deducted but ride wasn't confirmed", time: "14:30" },
      {
        sender: "Sarah Wilson",
        message: "I'm looking into this issue. Can you provide the transaction ID?",
        time: "14:45",
      },
      { sender: "John Doe", message: "Transaction ID: TXN123456789", time: "15:00" },
    ],
  },
  {
    id: "SUP002",
    user: "Rajesh Kumar",
    userType: "Driver",
    subject: "Account verification pending",
    priority: "Medium",
    status: "In Progress",
    category: "Account",
    createdAt: "2024-01-14 10:20",
    lastUpdate: "2024-01-15 09:15",
    assignedTo: "Mike Johnson",
    messages: [
      {
        sender: "Rajesh Kumar",
        message: "My documents were uploaded 3 days ago but still pending verification",
        time: "10:20",
      },
      {
        sender: "Mike Johnson",
        message: "We're reviewing your documents. You'll hear back within 24 hours.",
        time: "11:30",
      },
    ],
  },
  {
    id: "SUP003",
    user: "Pizza Palace",
    userType: "Vendor",
    subject: "Commission rate inquiry",
    priority: "Low",
    status: "Resolved",
    category: "Billing",
    createdAt: "2024-01-13 16:45",
    lastUpdate: "2024-01-14 12:20",
    assignedTo: "Lisa Chen",
    messages: [
      { sender: "Pizza Palace", message: "Can you explain the commission structure for food delivery?", time: "16:45" },
      {
        sender: "Lisa Chen",
        message: "Our commission is 15% for food delivery. I'll send you the detailed breakdown.",
        time: "17:00",
      },
      { sender: "Pizza Palace", message: "Thank you for the clarification!", time: "17:15" },
    ],
  },
]

const supportStats = {
  totalTickets: 156,
  openTickets: 23,
  resolvedToday: 18,
  averageResponseTime: "2.5 hours",
}

export default function SupportManagement() {
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [newMessage, setNewMessage] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [filterPriority, setFilterPriority] = useState("All")
  const [activeTab, setActiveTab] = useState("details")

  const filteredTickets = supportTickets.filter((ticket) => {
    const matchesStatus = filterStatus === "All" || ticket.status === filterStatus
    const matchesPriority = filterPriority === "All" || ticket.priority === filterPriority
    return matchesStatus && matchesPriority
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-red-600"
      case "In Progress":
        return "bg-yellow-600"
      case "Resolved":
        return "bg-green-600"
      case "Closed":
        return "bg-gray-600"
      default:
        return "bg-gray-600"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "text-red-400"
      case "Medium":
        return "text-yellow-400"
      case "Low":
        return "text-green-400"
      default:
        return "text-gray-400"
    }
  }

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedTicket) {
      alert(`Message sent to ${selectedTicket.user}: ${newMessage}`)
      setNewMessage("")
    }
  }

  const handleCall = (ticket) => {
    alert(`Initiating call to ${ticket.user}`)
  }

  const handleEmail = (ticket) => {
    alert(`Opening email to ${ticket.user}`)
  }

  const handleStatusChange = (ticket, newStatus) => {
    alert(`Ticket ${ticket.id} status changed to ${newStatus}`)
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Support Management</h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">Manage customer support tickets and communications</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium text-gray-400">Total Tickets</span>
            <svg className="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{supportStats.totalTickets}</div>
            <div className="text-xs text-gray-400">All time</div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium text-gray-400">Open Tickets</span>
            <svg className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{supportStats.openTickets}</div>
            <div className="text-xs text-red-400">Requires attention</div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium text-gray-400">Resolved Today</span>
            <svg className="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{supportStats.resolvedToday}</div>
            <div className="text-xs text-green-400">Great progress!</div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium text-gray-400">Avg Response Time</span>
            <svg className="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{supportStats.averageResponseTime}</div>
            <div className="text-xs text-blue-400">Within SLA</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-[180px] bg-gray-800 border border-gray-700 text-white rounded-md p-2"
              >
                <option value="All">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="relative">
              <select 
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full sm:w-[180px] bg-gray-800 border border-gray-700 text-white rounded-md p-2"
              >
                <option value="All">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Support Tickets - Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-lg">
            <div className="p-6">
              <h2 className="text-white text-lg font-semibold">Support Tickets</h2>
            </div>
            <div className="p-6 pt-0">
              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-4 bg-gray-800 rounded-lg border-2 cursor-pointer transition-colors
                        flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3
                        ${ selectedTicket?.id === ticket.id ? "border-green-500" : "border-transparent hover:border-gray-700" }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="w-full sm:w-auto">
                      <h3 className="text-white font-medium text-lg">{ticket.subject}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="border border-blue-500 text-blue-400 px-2 py-1 rounded-full text-xs">
                          {ticket.id}
                        </span>
                        <span className={`${getStatusColor(ticket.status)} text-white px-2 py-1 rounded-full text-xs`}>
                          {ticket.status}
                        </span>
                        <span className={`text-sm ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <p className="text-gray-400 text-sm">{ticket.createdAt}</p>
                      <p className="text-gray-500 text-xs">Updated: {ticket.lastUpdate}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mt-2 sm:mt-0">
                      <div className="flex items-center space-x-2">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-white">{ticket.user}</span>
                        <span className="text-gray-400 text-sm">({ticket.userType})</span>
                      </div>
                      <div className="flex items-center space-x-2 sm:ml-auto mt-2 sm:mt-0">
                        <span className="text-gray-400 text-sm">Assigned to:</span>
                        <span className="text-white text-sm">{ticket.assignedTo}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-lg">
            <div className="p-6">
              <h2 className="text-white text-lg font-semibold">
                {selectedTicket ? `Ticket ${selectedTicket.id}` : "Select a Ticket"}
              </h2>
            </div>
            <div className="p-6 pt-0">
              {selectedTicket ? (
                <div className="w-full">
                  <div className="bg-gray-800 border border-gray-700 rounded-md grid w-full grid-cols-2">
                    <button
                      onClick={() => setActiveTab("details")}
                      className={`p-2 text-sm ${activeTab === "details" ? "bg-green-600" : ""}`}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => setActiveTab("messages")}
                      className={`p-2 text-sm ${activeTab === "messages" ? "bg-green-600" : ""}`}
                    >
                      Messages
                    </button>
                  </div>
                  
                  {activeTab === "details" && (
                    <div className="space-y-4 mt-4">
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <h4 className="text-white font-medium mb-2">Ticket Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Subject:</span>
                            <span className="text-white text-right">{selectedTicket.subject}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Category:</span>
                            <span className="text-white text-right">{selectedTicket.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Priority:</span>
                            <span className={`${getPriorityColor(selectedTicket.priority)} text-right`}>
                              {selectedTicket.priority}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <span className={`${getStatusColor(selectedTicket.status)} text-white px-2 py-1 rounded-full text-xs`}>
                              {selectedTicket.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => handleCall(selectedTicket)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded-md flex items-center justify-center"
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Call Customer
                        </button>
                        <button
                          onClick={() => handleEmail(selectedTicket)}
                          className="w-full border border-gray-700 text-gray-400 hover:bg-gray-800 p-2 rounded-md flex items-center justify-center"
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Send Email
                        </button>
                      </div>

                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">Change Status</label>
                        <select
                          value={selectedTicket.status}
                          onChange={(e) => handleStatusChange(selectedTicket, e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded-md"
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {activeTab === "messages" && (
                    <div className="space-y-4 mt-4">
                      <div className="bg-gray-800 p-3 rounded-lg max-h-64 overflow-y-auto">
                        <div className="space-y-3">
                          {selectedTicket.messages.map((message, index) => (
                            <div
                              key={index}
                              className={`p-2 rounded text-sm ${
                                message.sender === selectedTicket.user
                                  ? "bg-gray-700"
                                  : "bg-green-600/20 border-l-2 border-green-500"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-white">{message.sender}</span>
                                <span className="text-xs text-gray-400">{message.time}</span>
                              </div>
                              <p className="text-gray-300">{message.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <textarea
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="bg-gray-800 border border-gray-700 text-white w-full p-2 rounded-md"
                          rows={3}
                        />
                        <button 
                          onClick={handleSendMessage}
                          className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded-md flex items-center justify-center"
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Send Message
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <p className="text-gray-400">Select a ticket to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}