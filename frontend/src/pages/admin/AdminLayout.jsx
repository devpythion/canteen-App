import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, Link, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Plus,
  Grid3x3,
  ShoppingCart,
  Package,
  X,
  Menu,
  DollarSign,
  FileWarning,
  Tag,
  Users,
  Bell,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { AppContext } from "../../context/AppContext";

const AdminLayout = () => {
  const { admin, setAdmin, axios, navigate, socket } = useContext(AppContext);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🔔 Admin Notification & Audio States
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // 🔊 Audio reference using the provided notification sound URL
  const audioRef = useRef(
    new Audio("https://cdn.pixabay.com/audio/2026/02/16/audio_28056f5b36.mp3")
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // 📥 Fetch persisted notifications from MongoDB on mount
  const fetchAdminNotifications = async () => {
    try {
      const { data } = await axios.get("/api/notifications/get");
      if (data.success) {
        setNotifications(
          data.notifications.map((n) => ({
            id: n._id,
            orderId: n.orderId,
            message: n.message,
            time: new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isRead: n.isRead,
          }))
        );
      }
    } catch (error) {
      console.log("Error fetching admin notifications:", error);
    }
  };

  useEffect(() => {
    if (admin) {
      fetchAdminNotifications();
    }
  }, [admin]);

  // Listen for real-time new orders
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (order) => {
      // 🔊 Play audio chime safely
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.log("Audio autoplay restricted by browser until first interaction:", err);
      });

      setNotifications((prev) => [
        {
          id: order._id || Date.now(),
          orderId: order._id,
          message: order.message || `New order received from ${order.user?.name || "Customer"} (Rs. ${order.totalAmount})`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isRead: false,
        },
        ...prev,
      ]);
    };

    socket.on("newOrder", handleNewOrder);

    return () => {
      socket.off("newOrder", handleNewOrder);
    };
  }, [socket]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleNotif = () => {
    setIsNotifOpen((prev) => {
      const nextState = !prev;
      if (nextState && unreadCount > 0) {
        setNotifications((nList) => nList.map((n) => ({ ...n, isRead: true })));
        // 🔄 Sync mark-as-read state with backend database
        axios.put("/api/notifications/mark-read").catch((err) => console.log(err));
      }
      return nextState;
    });
  };

  const handleClearNotifications = async () => {
    setNotifications([]);
    try {
      await axios.delete("/api/notifications/clear");
    } catch (error) {
      console.log("Error clearing notifications:", error);
    }
  };

  const menuItems = [
    { path: "/admin", name: "DashBoard", icon: LayoutDashboard, exact: true },
    { path: "/admin/add-category", name: "Add Category", icon: Plus },
    { path: "/admin/add-menu", name: "Add Menu", icon: Package },
    { path: "/admin/categories", name: "All Categories", icon: Grid3x3 },
    { path: "/admin/menus", name: "All Menus", icon: Grid3x3 },
    { path: "/admin/orders", name: "Orders", icon: ShoppingCart },
    { path: "/admin/sales", name: "Sales", icon: DollarSign },
    { path: "/admin/reports", name: "Reports", icon: FileWarning },
    { path: "/admin/promos", name: "Promo Codes", icon: Tag },
    { path: "/admin/staff", name: "Manage Staff", icon: Users },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname === path;
  };

  const logout = async () => {
    try {
      const { data } = await axios.post("/api/auth/logout");
      if (data.success) {
        localStorage.removeItem("admin");
        setAdmin(null);
        toast.success("Logged out successfully");
        navigate("/admin");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md bg-white shadow-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-center h-16 px-4 bg-secondary text-white">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${
                      active
                        ? "bg-blue-100 text-black border-r-4 border-black"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon size={20} className="mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-8 h-8 bg-blue-100 text-blue-800 font-bold rounded-full flex items-center justify-center mr-3 text-xs">
                A
              </div>
              <div>
                <div className="font-medium text-gray-900">Admin User</div>
                <div>admin@example.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        ></div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:pl-0 pl-16">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              {menuItems.find((item) => isActive(item.path, item.exact))
                ?.name || "Admin Panel"}
            </h2>

            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={handleToggleNotif}
                  className="relative p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                  aria-label="Admin Notifications"
                >
                  <Bell size={20} className="text-gray-700" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                      <span className="text-sm font-semibold text-gray-800">
                        New Order Alerts
                      </span>
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearNotifications}
                          className="text-xs text-red-600 hover:underline cursor-pointer"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-6">
                          No new order alerts
                        </p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              setIsNotifOpen(false);
                              navigate("/admin/orders");
                            }}
                            className="px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <p className="text-sm text-gray-800 font-medium">
                              {notif.message}
                            </p>
                            <span className="text-xs text-gray-400 mt-0.5 block">
                              {notif.time}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-500">
                <p
                  className="cursor-pointer hover:underline text-red-500 text-lg font-semibold"
                  onClick={logout}
                >
                  Logout
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;