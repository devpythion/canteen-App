import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { AlertCircle, Clock, CheckCircle2, MessageSquare } from "lucide-react";

const MyReports = () => {
  const { axios } = useContext(AppContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/reports/my-reports");
      if (data.success) {
        setReports(data.reports);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Reports</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Track status and admin responses for issues you have reported regarding your orders
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
          <p className="text-gray-500 text-sm">Loading your reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-xs">
          <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium text-sm">No reports submitted yet</p>
          <p className="text-gray-400 text-xs mt-1">
            You can report issues on any delivered order from your &quot;My Orders&quot; page.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="bg-white shadow-xs rounded-2xl p-5 border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold bg-red-50 text-red-700 px-2.5 py-0.5 rounded-md border border-red-200">
                    {report.issueType}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    Order #{report.order?._id ? report.order._id.slice(-6) : "N/A"}
                  </span>
                </div>

                {/* Status Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${
                    report.status === "Open"
                      ? "bg-yellow-100 text-yellow-800"
                      : report.status === "In Review"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {report.status === "Resolved" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  {report.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-700 my-3">
                <p className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="font-semibold text-gray-900 block text-xs uppercase tracking-wider mb-1">
                    Your Description:
                  </span>
                  &ldquo;{report.description}&rdquo;
                </p>

                {report.adminReply && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-900">
                    <span className="font-semibold flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1">
                      <MessageSquare size={13} /> Admin Reply:
                    </span>
                    <p className="text-xs sm:text-sm">{report.adminReply}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xs text-gray-400">
                <span>Submitted on: {new Date(report.createdAt).toLocaleDateString()}</span>
                {report.order && (
                  <span>Order Total: Rs. {report.order.totalAmount}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReports;