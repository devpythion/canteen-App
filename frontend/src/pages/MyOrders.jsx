import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { AlertCircle, X } from "lucide-react";
import { toast } from "react-hot-toast";

const MyOrders = () => {
  const { axios } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  
  // Report Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [issueType, setIssueType] = useState("Wrong Item");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get("/api/order/my-orders");
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchMyOrders();
    const interval = setInterval(() => {
      fetchMyOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Please describe the issue");
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await axios.post("/api/reports/create", {
        orderId: selectedOrder._id,
        issueType,
        description,
      });

      if (data.success) {
        toast.success(data.message);
        setIsModalOpen(false);
        setDescription("");
        setSelectedOrder(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4 sm:p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">My Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
          <p className="text-gray-500 text-sm">You have no orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white shadow-xs rounded-2xl p-5 border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                <h3 className="text-base font-semibold text-gray-800">
                  Order ID:
                  <span className="text-green-600 font-mono"> #{order._id.slice(-6)} </span>
                </h3>

                {/* Fixed Status Pill Styling */}
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    order.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : order.status === "Preparing"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                <p>
                  <span className="font-medium text-gray-700">Remarks/Address: </span>
                  {order.address}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Payment:</span>{" "}
                  {order.paymentMethod}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Total:</span> Rs.{" "}
                  {order.totalAmount}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Date:</span>{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <p className="text-gray-500 text-xs">
                  <span className="font-medium">Items:</span> {order.items.length} product(s)
                </p>

                {/* Report Issue Button (Active only for delivered/completed orders) */}
                {order.status === "Delivered" && (
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <AlertCircle size={14} />
                    Report Issue
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Issue Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-1">Report an Issue</h3>
            <p className="text-xs text-gray-500 mb-4">
              Order #{selectedOrder?._id.slice(-6)}
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Issue Type
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="Wrong Item">Wrong Item Received</option>
                  <option value="Food Quality / Cold">Food Quality / Cold</option>
                  <option value="Missing Item">Missing Item in Order</option>
                  <option value="Late Delivery">Late Delivery</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Description *
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe what went wrong..."
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-black hover:bg-gray-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;