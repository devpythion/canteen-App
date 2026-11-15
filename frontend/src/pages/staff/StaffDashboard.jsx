import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";
import { Trash2 } from "lucide-react";

const StaffDashboard = () => {
  const { staff, admin, axios, loading, setLoading } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/order/order");
      if (data.success) {
        setOrders(data.orders);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const { data } = await axios.put(`/api/order/update-status/${orderId}`, {
        status: newStatus,
      });

      if (data.success) {
        toast.success(data.message);
        fetchOrders();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 🛠️ Fixed: Trigger fetch if either staff or admin is logged in
  useEffect(() => {
    if (staff || admin) {
      fetchOrders();
    }
  }, [staff, admin]);

  // Calculate Status Metrics for Dashboard Summary Cards
  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const preparingCount = orders.filter((o) => o.status === "Preparing").length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;

  // Filter orders based on the active tab
  const filteredOrders = orders.filter((order) => {
    if (filter === "All") return true;
    return order.status === filter;
  });

  return (
    <div className="py-2 px-3 sm:px-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Orders Dashboard</h1>

      {/* 📊 Dashboard Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm text-center">
          <p className="text-sm text-gray-500 font-medium">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm text-center">
          <p className="text-sm text-amber-600 font-medium">Pending</p>
          <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-sm text-center">
          <p className="text-sm text-blue-600 font-medium">Preparing</p>
          <p className="text-2xl font-bold text-blue-700">{preparingCount}</p>
        </div>
        <div className="bg-green-50 border border-green-200 p-4 rounded-xl shadow-sm text-center">
          <p className="text-sm text-green-600 font-medium">Delivered</p>
          <p className="text-2xl font-bold text-green-700">{deliveredCount}</p>
        </div>
      </div>

      {/* 🏷️ Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6">
        {["All", "Pending", "Preparing", "Delivered"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
              filter === tab
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab}
            <span className="ml-2 text-xs bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full">
              {tab === "All"
                ? totalCount
                : tab === "Pending"
                ? pendingCount
                : tab === "Preparing"
                ? preparingCount
                : deliveredCount}
            </span>
          </button>
        ))}
      </div>

      {/* 📋 Orders List Container */}
      <div className="border border-gray-300 p-3 sm:p-5 rounded-lg bg-white shadow-sm">
        {/* Table Header - 🛠️ Fixed to 5 columns matching content */}
        <div className="hidden md:grid grid-cols-5 font-semibold text-gray-700 mb-4 pb-2 border-b">
          <div>Customer Name</div>
          <div>Address</div>
          <div>Total Amount</div>
          <div>Payment</div>
          <div>Status</div>
        </div>

        {/* Order Items */}
        <ul className="space-y-4">
          {filteredOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No orders found for status: {filter}
            </p>
          ) : (
            filteredOrders.map((item) => (
              <li
                key={item._id}
                className="border rounded-lg p-4 md:p-3 bg-gray-50/50"
              >
                <div className="flex flex-col md:grid md:grid-cols-5 md:items-center gap-2 md:gap-0">
                  <p className="font-medium text-center md:text-left">
                    {item?.user?.name || "N/A"}
                  </p>
                  <p className="font-medium text-center md:text-left text-gray-600 text-sm">
                    {item?.address}
                  </p>
                  <p className="text-gray-800 font-semibold hidden md:block">
                    ${item?.totalAmount}
                  </p>
                  <p className="text-gray-600 hidden md:block capitalize">
                    {item?.paymentMethod}
                  </p>

                  <div className="flex justify-center md:justify-start items-center gap-2 mt-2 md:mt-0">
                    <select
                      name="status"
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(item._id, e.target.value)
                      }
                      disabled={loading}
                      className="border rounded-md px-3 py-1.5 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                {/* Nested Menu Items inside Each Order */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {item.items.map((menu, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 bg-white border rounded-lg p-2.5 shadow-xs"
                      >
                        <img
                          src={menu?.menuItem?.image}
                          alt={menu?.menuItem?.name || "Food Item"}
                          className="w-14 h-14 rounded-md object-cover"
                        />
                        <div className="overflow-hidden">
                          <p className="font-semibold text-sm truncate">
                            {menu?.menuItem?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            QTY: {menu?.quantity}
                          </p>
                          <p className="text-xs text-gray-600 font-medium">
                            ${menu?.menuItem?.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default StaffDashboard;