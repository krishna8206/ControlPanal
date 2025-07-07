import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Car,
  MapPin,
  MessageSquareMore,
  Route,
  Users,
  Settings,
  BarChart3,
  Globe,
  CreditCard,
  HeadphonesIcon,
  ChevronDown,
  User,
  LogOut,
  Bell,
  X,
  Menu
} from 'lucide-react';

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Fleet Management",
    url: "/fleet",
    icon: Car,
  },
  {
    title: "Live Tracking",
    url: "/tracking",
    icon: MapPin,
  },
  {
    title: "Complaints",
    url: "/complaints",
    icon: MessageSquareMore,
    badge: "12",
  },
  {
    title: "Trips Management",
    url: "/rides",
    icon: Route,
  },
  {
    title: "User Management",
    url: "/users",
    icon: Users,
  },
  {
    title: "Payments",
    url: "/payments",
    icon: CreditCard,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
  },
  // {
  //   title: "Support",
  //   url: "/support",
  //   icon: HeadphonesIcon,
  // },
  // {
  //   title: "Settings",
  //   url: "/settings",
  //   icon: Settings,
  // },
];

export default function Sidebar({ isOpen, onToggle }) {
  const pathname = useLocation().pathname;
  const { logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950 border-b border-gray-800 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggle}
              className="h-8 w-8 bg-transparent border-none text-white hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center rounded"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Globe className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">IdharUdhar</h1>
                <p className="text-xs text-gray-400">Control Panel</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Bell className="h-5 w-5 text-gray-400" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-600 text-white text-xs flex items-center justify-center rounded-full">
                3
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-950 border-r border-gray-800 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:block
      `}>
        <div className="flex h-full w-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-800 bg-[#050505] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-white truncate">IdharUdhar</h2>
                  <p className="text-xs text-gray-400">Control Panel</p>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="md:hidden h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto bg-gray-950 p-2">
            <div className="space-y-1">
              <div className="text-gray-400 text-xs uppercase tracking-wider px-3 py-2">
                Main Navigation
              </div>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.url;
                
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        onToggle();
                      }
                    }}
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group
                      ${isActive 
                        ? 'bg-green-600 text-white' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium truncate">{item.title}</span>
                    {/* {item.badge && (
                      <span className="ml-auto bg-red-600 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                        {item.badge}
                      </span>
                    )} */}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-800 bg-[#050505] p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Admin User</p>
                <p className="text-xs text-gray-400 truncate">Super Admin</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}