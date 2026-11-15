import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";
import { Tag, Plus, Trash2, Calendar, Percent, DollarSign } from "lucide-react";

const AdminPromo = () => {
  const { axios } = useContext(AppContext);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/promo/all");
      if (data.success) {
        setPromos(data.promos);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load promo codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    if (!code || !discountValue || !expiryDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setCreating(true);
      const { data } = await axios.post("/api/promo/create", {
        code,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
        expiryDate,
        usageLimit: usageLimit ? Number(usageLimit) : null,
      });

      if (data.success) {
        toast.success(data.message);
        setCode("");
        setDiscountValue("");
        setMinOrderAmount("");
        setExpiryDate("");
        setUsageLimit("");
        fetchPromos();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to create promo code");
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm("Are you sure you want to delete this promo code?")) return;

    try {
      const { data } = await axios.delete(`/api/promo/delete/${id}`);
      if (data.success) {
        toast.success(data.message);
        fetchPromos();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete promo code");
    }
  };

  return (
    <div className="py-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Promo Code Management</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Create and manage server-validated discount coupons for user checkouts
        </p>
      </div>

      {/* Create Promo Form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Tag size={20} /> Create New Promo Code
        </h2>

        <form onSubmit={handleCreatePromo} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Promo Code *
            </label>
            <input
              type="text"
              value={code}
              placeholder="e.g., SAVE20"
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm uppercase focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Discount Type *
            </label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-black focus:outline-none"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (Rs.)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Discount Value * ({discountType === "percentage" ? "%" : "Rs."})
            </label>
            <input
              type="number"
              value={discountValue}
              placeholder={discountType === "percentage" ? "e.g., 15" : "e.g., 100"}
              onChange={(e) => setDiscountValue(e.target.value)}
              required
              min="1"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Min Order Amount (Rs.)
            </label>
            <input
              type="number"
              value={minOrderAmount}
              placeholder="e.g., 500 (Optional)"
              onChange={(e) => setMinOrderAmount(e.target.value)}
              min="0"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Expiry Date *
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Usage Limit
            </label>
            <input
              type="number"
              value={usageLimit}
              placeholder="e.g., 100 (Leave blank for unlimited)"
              onChange={(e) => setUsageLimit(e.target.value)}
              min="1"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              disabled={creating}
              className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={16} /> {creating ? "Creating..." : "Create Promo Code"}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Promo Codes Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Active & Existing Promo Codes</h2>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500 text-sm">Loading promo codes...</div>
        ) : promos.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">No promo codes found. Create your first one above!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Code</th>
                  <th className="p-4 font-semibold">Discount</th>
                  <th className="p-4 font-semibold">Min Order</th>
                  <th className="p-4 font-semibold">Usage / Limit</th>
                  <th className="p-4 font-semibold">Expiry Date</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {promos.map((promo) => (
                  <tr key={promo._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-black">{promo.code}</td>
                    <td className="p-4 font-semibold text-green-600">
                      {promo.discountType === "percentage" ? `${promo.discountValue}%` : `Rs. ${promo.discountValue}`}
                    </td>
                    <td className="p-4">Rs. {promo.minOrderAmount || 0}</td>
                    <td className="p-4">
                      <span className="font-medium text-gray-900">{promo.usedCount}</span> /{" "}
                      {promo.usageLimit !== null ? promo.usageLimit : "∞"}
                    </td>
                    <td className="p-4">{new Date(promo.expiryDate).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeletePromo(promo._id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Promo"
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

export default AdminPromo;