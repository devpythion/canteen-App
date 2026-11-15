import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

const Orders = () => {
  const { staff, axios, loading, setLoading } = useContext(AppContext);
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
      toast.error(error?.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this order? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      const { data } = await axios.delete(`/api/order/delete/${orderId}`);

      if (data.success) {
        toast.success(data.message);
        setOrders((prev) => prev.filter((order) => order._id !== orderId));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to delete order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (staff) {
      fetchOrders();
    }
  }, [staff]);

  const filteredOrders = orders.filter((order) => {
    if (filter === "All") return true;
    return order.status === filter;
  });

  return (
    <div className="py-12 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            All Orders
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage order statuses and remove canceled or invalid orders
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {["All", "Pending", "Preparing", "Delivered"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-colors cursor-pointer ${
                filter === tab
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab}
              <span
                className={`ml-1.5 text-xs px-2 py-0.5 rounded-full ${
                  filter === tab
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {tab === "All"
                  ? orders.length
                  : orders.filter((o) => o.status === tab).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders Container */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-6 bg-gray-50 px-6 py-3 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-600">
          <div>Customer</div>
          <div>Address / Remarks</div>
          <div>Total Amount</div>
          <div>Payment</div>
          <div>Status</div>
          <div className="text-right">Action</div>
        </div>

        {/* Orders List */}
        <div className="divide-y divide-gray-200">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No orders found.
            </div>
          ) : (
            filteredOrders.map((item) => (
              <div
                key={item._id}
                className="p-4 sm:px-6 hover:bg-gray-50/50 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-6 items-center gap-3 md:gap-0">
                  <div>
                    <span className="md:hidden text-xs text-gray-400 block">
                      Customer:
                    </span>
                    <p className="font-semibold text-gray-900 text-sm">
                      {item?.user?.name || "N/A"}
                    </p>
                  </div>

                  <div>
                    <span className="md:hidden text-xs text-gray-400 block">
                      Address:
                    </span>
                    <p className="text-gray-600 text-sm truncate pr-2">
                      {item?.address}
                    </p>
                  </div>

                  <div>
                    <span className="md:hidden text-xs text-gray-400 block">
                      Total:
                    </span>
                    <p className="font-bold text-gray-900 text-sm">
                      Rs.{item?.totalAmount}
                    </p>
                  </div>

                  <div>
                    <span className="md:hidden text-xs text-gray-400 block">
                      Payment:
                    </span>
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md font-medium capitalize">
                      {item?.paymentMethod}
                    </span>
                  </div>

                  <div>
                    <select
                      name="status"
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(item._id, e.target.value)
                      }
                      disabled={loading}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>

                  {/* Delete Action */}
                  <div className="flex md:justify-end items-center">
                    <button
                      onClick={() => handleDeleteOrder(item._id)}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
                      title="Delete Order"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="md:hidden">Delete Order</span>
                    </button>
                  </div>
                </div>

                {/* Ordered Menu Items */}
                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {item.items.map((menu, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-gray-50 border border-gray-200/80 rounded-lg p-2"
                    >
                      <img
                        src={menu?.menuItem?.image}
                        alt={menu?.menuItem?.name}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                      <div className="overflow-hidden">
                        <p className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                          {menu?.menuItem?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          QTY: {menu?.quantity} &bull; Rs.{menu?.menuItem?.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;