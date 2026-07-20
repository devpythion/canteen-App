import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios'
export const AppContext = createContext();

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL
axios.defaults.withCredentials = true
const AppContextProvider = ({children})=>{
    const navigate = useNavigate()
    const [loading,setLoading] = useState(false)
    const [user,setUser] = useState(null)
    const value = { navigate,loading, setLoading, user,setUser ,axios} 

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContextProvider