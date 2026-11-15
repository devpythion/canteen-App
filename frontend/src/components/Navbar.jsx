import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Bell,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  UserCircle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const Navbar = () => {
  const {
    navigate,
    user,
    setUser,
    axios,
    cartCount,
    notifications = [],
    markAllNotificationsRead,
    clearNotifications,
  } = useContext(AppContext);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // 🔊 Audio reference using the provided notification sound URL
  const audioRef = useRef(
    new Audio("https://cdn.pixabay.com/audio/2026/02/16/audio_28056f5b36.mp3")
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Play audio chime whenever a new notification arrives
  useEffect(() => {
    if (notifications.length > 0 && !notifications[0].isRead) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.log("Audio autoplay restricted by browser until first interaction:", err);
      });
    }
  }, [notifications]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
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
      if (nextState && unreadCount > 0 && markAllNotificationsRead) {
        markAllNotificationsRead();
      }
      return nextState;
    });
    setIsProfileOpen(false);
  };

  const logout = async () => {
    try {
      const { data } = await axios.post("/api/auth/logout");
      if (data.success) {
        setUser(null);
        setIsProfileOpen(false);
        setIsMenuOpen(false);
        toast.success(data.message);
        navigate("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <nav className="shadow-md sticky top-0 z-50 py-1 bg-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left - Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              <img src="/logo.png" alt="Logo" className="w-15" />
            </Link>
          </div>

          {/* Center - Menu Items (Desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/menu"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Menus
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Contact
            </Link>
          </div>

          {/* Right - Notifications, Cart, Profile & Mobile Toggle */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell (Visible when logged in as customer) */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={handleToggleNotif}
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell size={22} className="text-gray-700" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                      <span className="text-sm font-semibold text-gray-800">
                        Order Notifications
                      </span>
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={clearNotifications}
                          className="text-xs text-red-600 hover:underline cursor-pointer"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-6">
                          No new notifications
                        </p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              setIsNotifOpen(false);
                              navigate("/my-orders");
                            }}
                            className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
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
            )}

            {/* Cart Button */}
            <button
              onClick={() => navigate("/cart")}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <ShoppingCart size={22} className="text-gray-700" />
              <span className="absolute -top-1 -right-1 bg-primary text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {cartCount > 0 ? cartCount : 0}
              </span>
            </button>

            {/* Login/Profile - Desktop */}
            <div className="hidden md:block">
              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    onClick={() => {
                      setIsProfileOpen((prev) => !prev);
                      setIsNotifOpen(false);
                    }}
                  >
                    <UserCircle size={30} className="text-gray-700" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-100 z-50">
                      <Link
                        to="/my-reports"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <AlertCircle size={18} className="mr-3" />
                        My Reports
                      </Link>
                      <Link
                        to="/my-orders"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Package size={18} className="mr-3" />
                        My Orders
                      </Link>
                      <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <LogOut size={18} className="mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="bg-primary text-black px-6 py-2 rounded-lg hover:bg-black hover:text-white transition-colors font-medium cursor-pointer"
                >
                  Login
                </button>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-300">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Home
              </Link>
              <Link
                to="/menu"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Menus
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Contact
              </Link>

              {user ? (
                <div className="pt-3 border-t border-gray-300 flex flex-col space-y-2">
                  <Link
                    to="/my-reports"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center py-1.5 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  >
                    <AlertCircle size={18} className="mr-3" />
                    My Reports
                  </Link>
                  <Link
                    to="/my-orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center py-1.5 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  >
                    <Package size={18} className="mr-3" />
                    My Orders
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center py-1.5 text-red-600 hover:text-red-700 transition-colors font-medium cursor-pointer"
                  >
                    <LogOut size={18} className="mr-3" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate("/login");
                  }}
                  className="bg-primary text-black px-6 py-2 rounded-lg hover:bg-black hover:text-white transition-colors font-medium cursor-pointer w-full text-center"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;