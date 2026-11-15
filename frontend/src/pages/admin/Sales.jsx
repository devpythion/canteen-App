import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";

const SalesStats = () => {
  const { admin, axios } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [dateFilter, setDateFilter] = useState("all"); // 'today' | 'week' | 'month' | 'custom' | 'all'

  // Custom date range state (YYYY-MM-DD format)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  useEffect(() => {
    if (admin) {
      fetchOrders();
    }
  }, [admin]);

  // 📅 1. Filter orders by selected date range
  const dateFilteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    const now = new Date();

    if (dateFilter === "today") {
      return orderDate.toDateString() === now.toDateString();
    }
    if (dateFilter === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return orderDate >= oneWeekAgo;
    }
    if (dateFilter === "month") {
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }
    if (dateFilter === "custom") {
      if (!startDate && !endDate) return true;

      const orderDay = new Date(
        orderDate.getFullYear(),
        orderDate.getMonth(),
        orderDate.getDate()
      );

      let matchesStart = true;
      let matchesEnd = true;

      if (startDate) {
        const start = new Date(startDate);
        const normalizedStart = new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate()
        );
        matchesStart = orderDay >= normalizedStart;
      }
      if (endDate) {
        const end = new Date(endDate);
        const normalizedEnd = new Date(
          end.getFullYear(),
          end.getMonth(),
          end.getDate()
        );
        matchesEnd = orderDay <= normalizedEnd;
      }

      return matchesStart && matchesEnd;
    }

    return true; // 'all'
  });

  // ✅ 2. Filter strictly Delivered orders for Realized Sales & CSV Export
  const deliveredOrders = dateFilteredOrders.filter(
    (order) => order.status === "Delivered"
  );

  // 📊 Calculate Metrics
  const realizedSales = deliveredOrders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0
  );
  const averageOrderValue =
    deliveredOrders.length > 0 ? realizedSales / deliveredOrders.length : 0;

  // Operational status counts for the selected date range
  const pendingCount = dateFilteredOrders.filter(
    (o) => o.status === "Pending"
  ).length;
  const preparingCount = dateFilteredOrders.filter(
    (o) => o.status === "Preparing"
  ).length;
  const deliveredCount = deliveredOrders.length;

  // 📥 Export Delivered Orders Only to CSV
  const exportToCSV = () => {
    if (deliveredOrders.length === 0) {
      alert("No delivered sales available to export for the selected timeframe.");
      return;
    }

    const headers = [
      "Order ID",
      "Customer Name",
      "Address",
      "Total Amount ($)",
      "Payment Method",
      "Status",
      "Date",
    ];

    const rows = deliveredOrders.map((order) => [
      order._id,
      `"${order?.user?.name || "N/A"}"`,
      `"${order?.address || ""}"`,
      order.totalAmount,
      order.paymentMethod,
      order.status,
      `"${new Date(order.createdAt).toLocaleString()}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const filenameLabel =
      dateFilter === "custom"
        ? `custom_${startDate || "start"}_to_${endDate || "end"}`
        : dateFilter;
    link.setAttribute("download", `delivered_sales_${filenameLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="py-12 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* 🧭 Top Header & Controls Panel */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Sales & Order Statistics
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Realized revenue and CSV exports include delivered orders only
            </p>
          </div>

          {/* 📥 CSV Export Button */}
          <button
            onClick={exportToCSV}
            className="w-full md:w-auto bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Export Sales</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
          {/* 🗓️ Preset Filter Buttons */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {[
              { label: "Today", value: "today" },
              { label: "Last 7 Days", value: "week" },
              { label: "This Month", value: "month" },
              { label: "All", value: "all" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setDateFilter(tab.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  dateFilter === tab.value
                    ? "bg-white text-black shadow-xs font-semibold"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Explicit Custom Date Pickers */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg">
              <span className="text-xs text-gray-500 font-medium">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDateFilter("custom");
                }}
                className="text-xs bg-white border border-gray-300 rounded px-2 py-1 outline-none text-gray-700"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg">
              <span className="text-xs text-gray-500 font-medium">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDateFilter("custom");
                }}
                className="text-xs bg-white border border-gray-300 rounded px-2 py-1 outline-none text-gray-700"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 📈 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-green-50/60 border border-green-200 p-5 rounded-xl shadow-xs">
          <p className="text-xs uppercase tracking-wider text-green-700 font-semibold">
            Realized Sales
          </p>
          <p className="text-3xl font-extrabold text-green-900 mt-2">
            ${realizedSales.toFixed(2)}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-xs">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
            Delivered Orders
          </p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">
            {deliveredCount}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-xs">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
            Avg. Order Value
          </p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">
            ${averageOrderValue.toFixed(2)}
          </p>
        </div>

        <div className="bg-amber-50/60 border border-amber-200 p-5 rounded-xl shadow-xs">
          <p className="text-xs uppercase tracking-wider text-amber-700 font-semibold">
            In-Progress Orders
          </p>
          <p className="text-3xl font-extrabold text-amber-800 mt-2">
            {pendingCount + preparingCount}
          </p>
        </div>
      </div>

      {/* Status Breakdown Pill Summary */}
      <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs flex flex-wrap justify-around items-center text-center gap-4">
        <div className="px-4">
          <span className="text-xs text-gray-500 font-medium block">Pending</span>
          <span className="text-lg font-bold text-amber-600">{pendingCount}</span>
        </div>
        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
        <div className="px-4">
          <span className="text-xs text-gray-500 font-medium block">Preparing</span>
          <span className="text-lg font-bold text-blue-600">{preparingCount}</span>
        </div>
        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
        <div className="px-4">
          <span className="text-xs text-gray-500 font-medium block">Delivered</span>
          <span className="text-lg font-bold text-green-600">{deliveredCount}</span>
        </div>
      </div>
    </div>
  );
};

export default SalesStats;