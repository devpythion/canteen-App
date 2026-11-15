import { Lock, Mail } from "lucide-react";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from 'react-hot-toast';
import { AppContext } from "../context/AppContext";

const Login = () => {
    const { navigate, loading, setLoading, axios, setUser } = useContext(AppContext);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { data } = await axios.post("/api/auth/login", formData);
            
            if (data.success) {
                // 🛠️ Fixed: Pass data.user instead of data.success boolean
                setUser(data.user);
                toast.success(data.message);
                navigate("/");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            // 🛠️ Fixed: Safely catch backend error messages (like 403 Forbidden for Staff/Admin)
            const errorMessage = error.response?.data?.message || "Something went wrong";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="py-12 flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="sm:w-87.5 w-full text-center bg-white border border-black rounded-2xl px-8"
            >
                <h1 className="text-black text-3xl mt-10 font-medium">
                    Login
                </h1>

                <p className="text-black text-sm mt-2">Please login to continue</p>

                <div className="flex items-center w-full mt-4 border border-gray-700 h-12 rounded-full overflow-hidden pl-6 gap-2">
                    <Mail />
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email Id" 
                        className="w-full text-black border-none outline-none" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div className="flex items-center mt-4 w-full border border-gray-700 h-12 rounded-full overflow-hidden pl-6 gap-2">
                    <Lock />
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        className="w-full text-black border-none outline-none" 
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="mt-2 w-full h-11 rounded-full text-black bg-primary hover:bg-black hover:text-white transition cursor-pointer disabled:opacity-50"
                >
                    {loading ? "Loading..." : "Login"}
                </button>
                
                <p className="text-black text-sm mt-3 mb-11 cursor-pointer">
                    Don't have an account?
                    <Link to={"/signup"}>
                        <span className="text-indigo-400 hover:underline ml-1">click here</span>
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default Login;