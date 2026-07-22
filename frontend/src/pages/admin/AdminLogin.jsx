import { Lock, Mail, User2Icon } from "lucide-react"
import { useContext, useState } from "react"
import {toast} from 'react-hot-toast'
import { Link } from "react-router-dom"

import { AppContext } from "../../context/AppContext"
const AdminLogin = () => {
    const {navigate, loading, setLoading,axios,setAdmin } = useContext(AppContext)

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const handleSubmit = async(e) => {
        e.preventDefault()
        try {
          setLoading(true)
          const {data} = await axios.post("/api/auth/admin/login",formData);
          if(data.success){
            setAdmin(data.success)
            localStorage.setItem("admin", JSON.stringify(data.admin))
            toast.success(data.message)
            navigate("/admin")
          }
        } catch (error) {
            toast.error(data.message)
        }
        finally{
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    return (
      <div className="py-12 flex items-center justify-center">
        <form
            onSubmit={handleSubmit}
            className="sm:w-87.5 w-full text-center bg-white border border-black rounded-2xl px-8">
            <h1 className="text-black text-3xl mt-10 font-medium">
                Login
            </h1>

            <p className="text-black text-sm mt-2">Please login to continue</p>

            <div className="flex items-center w-full mt-4 border border-gray-700 h-12 rounded-full overflow-hidden pl-6 gap-2 ">
                <Mail/>
                <input type="email" name="email" placeholder="Email Id" className="w-full  text-black border-none outline-none " value={formData.email} onChange={handleChange} required />
            </div>

            <div className=" flex items-center mt-4 w-full border border-gray-700 h-12 rounded-full overflow-hidden pl-6 gap-2 ">
                <Lock/>
                <input type="password" name="password" placeholder="Password" className="w-full  text-black border-none outline-none" value={formData.password} onChange={handleChange} required />
            </div>

            <button type="submit" className="mt-5 mb-10 w-full h-11 rounded-full text-black bg-primary hover:bg-black hover:text-white transition " >
                {loading? "Loading...":"Login"}
            </button>
        </form>
        </ div>
    )
}

export default AdminLogin