import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

export const AppContext = createContext();

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
axios.defaults.withCredentials = true;

const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [staff, setStaff] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menus, setMenus] = useState([]);

  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // 🔔 Socket & Notification States
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // 1. Initialize Socket.io connection once
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_BASE_URL, {
      withCredentials: true,
    });
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // 2. Join role-based or user-specific room whenever auth state changes
  useEffect(() => {
    if (!socket) return;

    if (admin) {
      socket.emit("joinRoom", { role: "admin" });
    } else if (staff) {
      socket.emit("joinRoom", { role: "staff" });
    } else if (user) {
      socket.emit("joinRoom", { role: "customer", userId: user._id || user.id });
    }
  }, [socket, user, staff, admin]);

  // 3. Global real-time toast notifications & bell state listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("newOrder", (order) => {
      toast.success(`New order received! (Rs. ${order.totalAmount})`, {
        icon: "🔔",
        duration: 5000,
      });
    });

    socket.on("orderStatusUpdated", (data) => {
      toast.success(data.message, {
        icon: "🍽️",
        duration: 5000,
      });

      // Append to Navbar bell notifications dropdown
      setNotifications((prev) => [
        {
          id: Date.now(),
          orderId: data.orderId,
          message: data.message,
          status: data.status,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isRead: false,
        },
        ...prev,
      ]);
    });

    return () => {
      socket.off("newOrder");
      socket.off("orderStatusUpdated");
    };
  }, [socket]);

  const fetchCartData = async () => {
    try {
      const { data } = await axios.get("/api/cart/get");
      if (data.success) {
        setCart(data.cart);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (cart?.items) {
      const total = cart.items.reduce(
        (sum, item) => sum + item.menuItem.price * item.quantity,
        0
      );
      setTotalPrice(total);
    }
  }, [cart]);

  const cartCount =
    cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  // Add to Cart function
  const addToCart = async (menuId) => {
    try {
      const { data } = await axios.post("/api/cart/add", {
        menuId,
        quantity: 1,
      });
      if (data.success) {
        toast.success(data.message);
        fetchCartData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Login to add items to Cart");
    }
  };

  const removeFromCart = async (menuId) => {
    try {
      const { data } = await axios.delete(`/api/cart/remove/${menuId}`);
      if (data.success) {
        toast.success(data.message);
        fetchCartData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Remove from cart error:", error);
      toast.error("Something went wrong!");
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/category/all");
      if (data.success) {
        setCategories(data.categories);
      } else {
        console.log("Failed to fetch categories");
      }
    } catch (error) {
      console.log("Error fetching categories:", error);
    }
  };

  const fetchMenus = async () => {
    try {
      const { data } = await axios.get("/api/menu/all");
      if (data.success) {
        setMenus(data.menuItems);
      } else {
        console.log("Failed to fetch menus");
      }
    } catch (error) {
      console.log("Error fetching menus:", error);
    }
  };

  // Persist user, staff, or admin session on page refresh
  const isAuth = async () => {
    try {
      // 1. Check backend session for regular users / staff
      const { data } = await axios.get("/api/auth/is-auth");
      if (data.success) {
        if (data.user?.role === "staff") {
          setStaff(data.user);
          setUser(null);
          setAdmin(null);
        } else {
          setUser(data.user);
          setStaff(null);
          setAdmin(null);
        }
      }
    } catch (error) {
      console.log("Not authenticated via token");
    }

    // 2. Fallback check for Master Admin stored in localStorage
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
  };

  useEffect(() => {
    isAuth();
    fetchCategories();
    fetchMenus();
    fetchCartData();
  }, []);

  const value = {
    navigate,
    loading,
    setLoading,
    user,
    setUser,
    staff,
    setStaff,
    axios,
    admin,
    setAdmin,
    categories,
    fetchCategories,
    menus,
    fetchMenus,
    addToCart,
    cartCount,
    cart,
    totalPrice,
    fetchCartData,
    removeFromCart,
    socket,
    notifications,
    markAllNotificationsRead,
    clearNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;