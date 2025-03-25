// src/components/layout/RootLayout.jsx
import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  ClipboardList,
  BarChart4,
  Home,
  ShoppingCart,
  Package,
  Users,
  Settings,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner"



const RootLayout = () => {
  const location = useLocation();

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-white border-r">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">CSR Dashboard</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/"
            className={`flex items-center px-4 py-2 rounded-md ${
              isActive("/") && !isActive("/daily-walk")
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Home className="h-5 w-5 mr-3" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/daily-walk"
            className={`flex items-center px-4 py-2 rounded-md ${
              isActive("/daily-walk")
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <ClipboardList className="h-5 w-5 mr-3" />
            <span>Daily Walk</span>
          </Link>

          <Link
            to="/products"
            className={`flex items-center px-4 py-2 rounded-md ${
              isActive("/products")
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Package className="h-5 w-5 mr-3" />
            <span>Products</span>
          </Link>

          <Link
            to="/sales"
            className={`flex items-center px-4 py-2 rounded-md ${
              isActive("/sales")
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <ShoppingCart className="h-5 w-5 mr-3" />
            <span>Sales</span>
          </Link>

          <Link
            to="/users"
            className={`flex items-center px-4 py-2 rounded-md ${
              isActive("/users")
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Users className="h-5 w-5 mr-3" />
            <span>Users</span>
          </Link>

          <Link
            to="/analytics"
            className={`flex items-center px-4 py-2 rounded-md ${
              isActive("/analytics")
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <BarChart4 className="h-5 w-5 mr-3" />
            <span>Analytics</span>
          </Link>

          <Link
            to="/settings"
            className={`flex items-center px-4 py-2 rounded-md ${
              isActive("/settings")
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Settings className="h-5 w-5 mr-3" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-10">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-bold">CSR Dashboard</h1>
          <button className="p-1 rounded-md text-gray-700 hover:bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto pt-0 md:pt-0">
          <div className="md:hidden py-2 px-4 mt-16 bg-gray-50 border-b flex overflow-x-auto space-x-4">
            <Link
              to="/daily-walk"
              className={`flex flex-col items-center px-3 py-2 rounded-md ${
                isActive("/daily-walk") ? "text-blue-700" : "text-gray-700"
              }`}
            >
              <ClipboardList className="h-5 w-5" />
              <span className="text-xs mt-1">Daily Walk</span>
            </Link>

            <Link
              to="/products"
              className={`flex flex-col items-center px-3 py-2 rounded-md ${
                isActive("/products") ? "text-blue-700" : "text-gray-700"
              }`}
            >
              <Package className="h-5 w-5" />
              <span className="text-xs mt-1">Products</span>
            </Link>

            <Link
              to="/sales"
              className={`flex flex-col items-center px-3 py-2 rounded-md ${
                isActive("/sales") ? "text-blue-700" : "text-gray-700"
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="text-xs mt-1">Sales</span>
            </Link>

            <Link
              to="/users"
              className={`flex flex-col items-center px-3 py-2 rounded-md ${
                isActive("/users") ? "text-blue-700" : "text-gray-700"
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="text-xs mt-1">Users</span>
            </Link>

            <Link
              to="/analytics"
              className={`flex flex-col items-center px-3 py-2 rounded-md ${
                isActive("/analytics") ? "text-blue-700" : "text-gray-700"
              }`}
            >
              <BarChart4 className="h-5 w-5" />
              <span className="text-xs mt-1">Analytics</span>
            </Link>
          </div>

          <div className="md:p-0 mb-16 md:mb-0">
            <Outlet />
          </div>
        </main>
          </div>
          <Toaster />
    </div>
  );
};

export default RootLayout;
