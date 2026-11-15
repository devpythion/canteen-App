import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, Link, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Grid3x3,
  AlertCircle,
  X,
  Menu,
  Bell,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { AppContext } from "../../context/AppContext";

const StaffLayout = () => {
  const { staff, setStaff, axios, navigate, socket } = useContext(AppContext);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🔔 Staff Notification & Audio States
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // 🔊 Audio reference using the provided notification sound URL
  const audioRef = useRef(
    new Audio("https://cdn.pixabay.com/audio/2026/02/16/audio_28056f5b36.mp3")
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // 📥 Fetch persisted notifications from MongoDB
  const fetchStaffNotifications = async () => {
    try {
      const { data } = await axios.get("/api/notifications/get", {
        withCredentials: true,
      });
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(
          data.notifications.map((n) => ({
            id: n._id,
            orderId: n.orderId,
            message: n.message,
            time: n.createdAt
              ? new Date(n.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Just now",
            isRead: n.isRead,
          }))
        );
      }
    } catch (error) {
      console.error(
        "Error fetching staff notifications:",
        error.response?.data || error.message
      );
    }
  };

  // Re-fetch when staff authenticates OR when navigating across staff routes
  useEffect(() => {
    if (staff) {
      fetchStaffNotifications();
    }
  }, [staff, location.pathname]);

  // 🔌 Join management room and listen for real-time new orders
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      socket.emit("joinRoom", { role: "staff" });
    };

    socket.on("connect", handleConnect);
    if (socket.connected) {
      handleConnect();
    }

    const handleNewOrder = (order) => {
      // 🔊 Play audio chime safely
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.log(
          "Audio autoplay restricted by browser until first interaction:",
          err
        );
      });

      setNotifications((prev) => [
        {
          id: order._id || Date.now(),
          orderId: order._id,
          message:
            order.message ||
            `New order received from ${order.user?.name || "Customer"} (Rs. ${order.totalAmount})`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isRead: false,
        },
        ...prev,
      ]);
    };

    socket.on("newOrder", handleNewOrder);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("newOrder", handleNewOrder);
    };
  }, [socket, staff]);

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
        axios
          .put("/api/notifications/mark-read", {}, { withCredentials: true })
          .catch((err) => console.log("Error marking read:", err));
      }
      return nextState;
    });
  };

  const handleClearNotifications = async () => {
    setNotifications([]);
    try {
      await axios.delete("/api/notifications/clear", {
        withCredentials: true,
      });
    } catch (error) {
      console.log("Error clearing notifications:", error);
    }
  };

  const menuItems = [
    {
      path: "/staff",
      name: "Staff Dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    { path: "/staff/orders", name: "Live Orders", icon: ShoppingCart },
    { path: "/staff/menus", name: "Manage Menus", icon: Grid3x3 },
    { path: "/staff/add-menu", name: "Add Menu Item", icon: Package },
    { path: "/staff/reports", name: "Customer Reports", icon: AlertCircle },
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname === path;
  };

  const logout = async () => {
    try {
      const { data } = await axios.post("/api/auth/logout");
      if (data.success) {
        localStorage.removeItem("admin");
        localStorage.removeItem("staff");
        setStaff(null);
        setNotifications([]);
        toast.success("Logged out successfully");
        navigate("/staff");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
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
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 bg-emerald-800 text-white">
            <h1 className="text-xl font-bold">Staff Portal</h1>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    active
                      ? "bg-emerald-50 text-emerald-800 border-r-4 border-emerald-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-800 font-bold rounded-full flex items-center justify-center mr-3">
                {staff?.name?.charAt(0)?.toUpperCase() || "S"}
              </div>
              <div className="overflow-hidden">
                <div className="font-medium text-gray-900 truncate">
                  {staff?.name || "Staff Member"}
                </div>
                <div className="text-xs truncate">
                  {staff?.email || "staff@canteen.com"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        ></div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <header className="bg-white shadow-sm border-b border-gray-200 lg:pl-0 pl-16">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              {menuItems.find((item) => isActive(item.path, item.exact))?.name ||
                "Staff Portal"}
            </h2>

            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={handleToggleNotif}
                  className="relative p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                  aria-label="Staff Notifications"
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
                              navigate("/staff/orders");
                            }}
                            className={`px-4 py-3 hover:bg-emerald-50 transition-colors cursor-pointer ${
                              !notif.isRead ? "bg-emerald-50/40" : ""
                            }`}
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

              <button
                onClick={logout}
                className="cursor-pointer hover:underline text-red-500 text-sm sm:text-base font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;