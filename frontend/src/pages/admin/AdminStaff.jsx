import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";
import { Users, UserPlus, Trash2, Mail, Lock, User } from "lucide-react";

const AdminStaff = () => {
  const { axios } = useContext(AppContext);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/staff/all");
      if (data.success) {
        setStaffList(data.staff);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load staff accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setCreating(true);
      const { data } = await axios.post("/api/staff/create", {
        name,
        email,
        password,
      });

      if (data.success) {
        toast.success(data.message);
        setName("");
        setEmail("");
        setPassword("");
        fetchStaff();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to create staff account");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm("Are you sure you want to remove this staff account?")) return;

    try {
      const { data } = await axios.delete(`/api/staff/delete/${id}`);
      if (data.success) {
        toast.success(data.message);
        fetchStaff();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete staff account");
    }
  };

  return (
    <div className="py-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Staff Management</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Create and manage canteen staff accounts with kitchen and order permissions
        </p>
      </div>

      {/* Create Staff Form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <UserPlus size={20} /> Create New Staff Account
        </h2>

        <form onSubmit={handleCreateStaff} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Full Name *
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-black">
              <User size={16} className="text-gray-400 mr-2" />
              <input
                type="text"
                value={name}
                placeholder="Staff name"
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full text-sm outline-none bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Email Address *
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-black">
              <Mail size={16} className="text-gray-400 mr-2" />
              <input
                type="email"
                value={email}
                placeholder="staff@canteen.com"
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-sm outline-none bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Password *
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-black">
              <Lock size={16} className="text-gray-400 mr-2" />
              <input
                type="password"
                value={password}
                placeholder="Secure password"
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-sm outline-none bg-transparent"
              />
            </div>
          </div>

          <div className="sm:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              disabled={creating}
              className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <UserPlus size={16} /> {creating ? "Creating..." : "Create Staff Member"}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Staff Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center gap-2">
          <Users size={20} className="text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-800">Active Staff Accounts</h2>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500 text-sm">Loading staff accounts...</div>
        ) : staffList.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">No staff accounts found. Create your first one above!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Created At</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {staffList.map((staffMember) => (
                  <tr key={staffMember._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-black">{staffMember.name}</td>
                    <td className="p-4 text-gray-600">{staffMember.email}</td>
                    <td className="p-4">
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {staffMember.role}
                      </span>
                    </td>
                    <td className="p-4">{new Date(staffMember.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteStaff(staffMember._id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Staff"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStaff;