import {Routes, Route, useLocation} from 'react-router-dom'
import Home from './pages/Home'
import MenuDetails from './pages/MenuDetails'
import Menu from './pages/Menu'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/Signup'
import MyOrders from './pages/MyOrders'
import Navbar from './components/Navbar'
import Setting from './pages/Setting'
import { Toaster } from 'react-hot-toast'


const App = () => {

  const adminPath  = useLocation().pathname.includes("admin")

  return (
    <div>
      <Toaster position='bottom-right'/>
      {!adminPath && <Navbar/>}
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/menu" element={<Menu/>}/>
        <Route path="/menu-details/:id" element={<MenuDetails/>}/>
        <Route path="/contact" element={<Contact/>}/>
        <Route path="/cart" element={<Cart/>}/>
        <Route path="/checkout" element={<Checkout/>}/>
        <Route path="/my-orders" element={<MyOrders/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/setting" element={<Setting/>}/>
      </Routes>
    </div>
  )
}

export default App
