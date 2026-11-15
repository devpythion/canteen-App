import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";

const AddCategory = () => {
  const { axios, navigate, loading, setLoading } = useContext(AppContext);
  const [formData, setFormData] = useState({ name: "", image: null });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFormData({ ...formData, image: selectedFile });
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post("/api/category/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        toast.success(data.message);
        navigate("/admin/categories");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Category</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Create a new category for your menu items</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-xs flex flex-col gap-6"
      >
        {/* Category Name Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
            Category Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            placeholder="e.g., Fast Food, Beverages, Desserts"
          />
        </div>

        {/* Category Image Upload & Preview */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
            Category Image *
          </label>
          <input
            type="file"
            id="fileUpload"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            required={!file}
          />

          {preview ? (
            <div className="relative w-full h-40 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
              <img src={preview} alt="preview" className="h-full w-full object-cover" />
              <label
                htmlFor="fileUpload"
                className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white text-xs px-3 py-1.5 rounded-md cursor-pointer transition-colors backdrop-blur-xs"
              >
                Change Image
              </label>
            </div>
          ) : (
            <label
              htmlFor="fileUpload"
              className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors group"
            >
              <Upload className="w-8 h-8 text-gray-400 group-hover:text-black mb-2 transition-colors" />
              <span className="text-gray-600 text-sm font-medium">Click to upload category image</span>
              <span className="text-gray-400 text-xs mt-1">PNG, JPG, WEBP up to 5MB</span>
            </label>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white hover:bg-gray-800 font-medium py-3 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Adding Category...</span>
            </>
          ) : (
            "Add Category"
          )}
        </button>
      </form>
    </div>
  );
};

export default AddCategory;