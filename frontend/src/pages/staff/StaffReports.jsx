import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";

const StaffReports = () => {
  const { staff, axios } = useContext(AppContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  // Selected report for reply/status update modal
  const [activeReport, setActiveReport] = useState(null);
  const [adminReply, setAdminReply] = useState("");
  const [status, setStatus] = useState("Open");
  const [updating, setUpdating] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/reports/all");
      if (data.success) {
        setReports(data.reports);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load customer reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (staff) {
      fetchReports();
    }
  }, [staff]);

  const handleUpdateReport = async (e) => {
    e.preventDefault();
    if (!activeReport) return;

    try {
      setUpdating(true);
      const { data } = await axios.put(`/api/reports/resolve/${activeReport._id}`, {
        status,
        adminReply,
      });

      if (data.success) {
        toast.success(data.message);
        setActiveReport(null);
        fetchReports();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update report");
    } finally {
      setUpdating(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    if (filter === "All") return true;
    return report.status === filter;
  });

  return (
    <div className="py-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customer Reports</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Review food quality issues and customer complaints submitted for orders
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {["All", "Open", "In Review", "Resolved"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-colors cursor-pointer ${
                filter === tab
                  ? "bg-emerald-700 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab}
              <span
                className={`ml-1.5 text-xs px-2 py-0.5 rounded-full ${
                  filter === tab ? "bg-white/20 text-white" : "bg-gray-200 text-gray-800"
                }`}
              >
                {tab === "All"
                  ? reports.length
                  : reports.filter((r) => r.status === tab).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table / List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-500 text-sm">Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">No reports found.</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReports.map((report) => (
              <div
                key={report._id}
                className="p-5 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        report.status === "Open"
                          ? "bg-yellow-100 text-yellow-800"
                          : report.status === "In Review"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {report.status}
                    </span>
                    <span className="text-xs font-medium bg-red-50 text-red-700 px-2.5 py-0.5 rounded-md border border-red-200">
                      {report.issueType}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      Order #{report.order?._id ? report.order._id.slice(-6) : "N/A"}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-gray-900">
                    Customer: <span className="font-normal text-gray-700">{report.user?.name} ({report.user?.email})</span>
                  </p>

                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    &ldquo;{report.description}&rdquo;
                  </p>

                  {report.adminReply && (
                    <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                      <span className="font-semibold">Staff Note:</span> {report.adminReply}
                    </p>
                  )}

                  <p className="text-xs text-gray-400">
                    Submitted on: {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveReport(report);
                    setStatus(report.status);
                    setAdminReply(report.adminReply || "");
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer self-end md:self-center shrink-0"
                >
                  Manage Report
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manage Report Modal */}
      {activeReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Update Report</h3>
            <p className="text-xs text-gray-500 mb-4">
              Customer: {activeReport.user?.name} &bull; Issue: {activeReport.issueType}
            </p>

            <form onSubmit={handleUpdateReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
                >
                  <option value="Open">Open</option>
                  <option value="In Review">In Review</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Staff Response / Note
                </label>
                <textarea
                  rows={4}
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                  placeholder="Write a response or note regarding this issue..."
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 resize-none"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveReport(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffReports;