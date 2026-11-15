import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const Menus = () => {
  const { menus, fetchMenus, axios } = useContext(AppContext);

  const deleteMenu = async (id) => {
    try {
      const { data } = await axios.delete(`/api/menu/delete/${id}`);
      if (data.success) {
        toast.success(data.message);
        fetchMenus();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete menu item");
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Menus</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage your restaurant menu items and prices</p>
        </div>
        <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full">
          Total: {menus.length}
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-5 bg-gray-50 px-6 py-3 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-600">
          <div>Image</div>
          <div>Name</div>
          <div>Category</div>
          <div>Price</div>
          <div className="text-right">Action</div>
        </div>

        {/* Menu Items List */}
        <div className="divide-y divide-gray-200">
          {menus.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No menu items found.
            </div>
          ) : (
            menus.map((item) => (
              <div
                key={item._id}
                className="grid grid-cols-1 sm:grid-cols-5 items-center px-6 py-4 hover:bg-gray-50/60 transition-colors gap-4 sm:gap-0"
              >
                {/* Image */}
                <div className="flex items-center">
                  <img
                    src={item.image || "https://placehold.co/80"}
                    alt={item?.name}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200 shadow-2xs"
                  />
                </div>

                {/* Name */}
                <div>
                  <span className="sm:hidden text-xs text-gray-400 font-medium block">Name:</span>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">{item?.name}</p>
                </div>

                {/* Category */}
                <div>
                  <span className="sm:hidden text-xs text-gray-400 font-medium block">Category:</span>
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md font-medium">
                    {item?.category?.name || "Uncategorized"}
                  </span>
                </div>

                {/* Price */}
                <div>
                  <span className="sm:hidden text-xs text-gray-400 font-medium block">Price:</span>
                  <p className="font-bold text-gray-900 text-sm sm:text-base">Rs.{item.price}</p>
                </div>

                {/* Action */}
                <div className="flex sm:justify-end items-center">
                  <button
                    onClick={() => deleteMenu(item._id)}
                    className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    title="Delete Menu"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sm:hidden">Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Menus;