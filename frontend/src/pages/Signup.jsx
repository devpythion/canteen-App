import { Lock, Mail, User2Icon } from "lucide-react"
import { useContext, useState } from "react"
import { Link } from "react-router-dom"
import {toast} from 'react-hot-toast'
import { AppContext } from "../context/AppContext"
const Signup = () => {

    const {navigate, axios,loading, setLoading} = useContext(AppContext)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    })
    const handleChange = (e) => {
            const { name, value } = e.target
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    const handleSubmit = async(e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const {data}= await axios.post("/api/auth/register",formData)
            if(data.success){
                toast.success(data.message)
                navigate('/login')
                console.log("yes")
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response.data.message)
        }
        finally{
            setLoading(false)
        }
    }

    

    return (
      <div className="py-12 flex items-center justify-center">
        <form
            onSubmit={handleSubmit}
            className="sm:w-87.5 w-full text-center bg-white border border-black rounded-2xl px-8">
            <h1 className="text-black text-3xl mt-10 font-medium">
                Sign up
            </h1>

            <p className="text-black text-sm mt-2">Please sign up to continue</p>

            
                <div className="flex items-center mt-6 w-full border border-gray-700 h-12 rounded-full overflow-hidden pl-6 gap-2 ">
                    <User2Icon/>
                    <input type="text" name="name" placeholder="Name" className="w-full  text-black border-none outline-none " value={formData.name} onChange={handleChange} required />
                </div>
            

            <div className="flex items-center w-full mt-4 border border-gray-700 h-12 rounded-full overflow-hidden pl-6 gap-2 ">
                <Mail/>
                <input type="email" name="email" placeholder="Email Id" className="w-full  text-black border-none outline-none " value={formData.email} onChange={handleChange} required />
            </div>

            <div className=" flex items-center mt-4 w-full border border-gray-700 h-12 rounded-full overflow-hidden pl-6 gap-2 ">
                <Lock/>
                <input type="password" name="password" placeholder="Password" className="w-full  text-black border-none outline-none" value={formData.password} onChange={handleChange} required />
            </div>

            <button type="submit" className="mt-6 w-full h-11 rounded-full text-black bg-primary hover:bg-black hover:text-white transition " >
                {loading? "Loading":"Register"}
            </button>
            <p className="text-black text-sm mt-3 mb-11 cursor-pointer" >
                Already have an account?
                <Link to={"/login"}>
                <span className="text-indigo-400 hover:underline ml-1">click here</span>
                </Link>
            </p>
        </form>
        </ div>
    )
}

export default Signup