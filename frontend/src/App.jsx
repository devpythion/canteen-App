import { Routes, Route, useLocation } from 'react-router-dom'
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
import Footer from './components/Footer'
import AdminLayout from './pages/admin/AdminLayout'
import { useContext } from 'react'
import { AppContext } from './context/AppContext'
import AdminLogin from './pages/admin/AdminLogin'
import Dashboard from './pages/admin/Dashboard'
import AddCategory from './pages/admin/AddCategory'
import AddMenu from './pages/admin/AddMenu'
import Categories from './pages/admin/Categories'
import Menus from './pages/admin/Menus'
import Orders from './pages/admin/Orders'
import Sales from './pages/admin/Sales'
import AdminReports from './pages/admin/AdminReports'
import MyReports from './pages/MyReports'
import AdminPromo from './pages/admin/AdminPromo'
import StaffLogin from './pages/staff/StaffLogin'
import StaffLayout from './pages/staff/StaffLayout'
import StaffOrders from './pages/staff/StaffOrders'
import StaffDashboard from './pages/staff/StaffDashboard'
import StaffReports from './pages/staff/StaffReports'
import AdminStaff from './pages/admin/AdminStaff'
const App = () => {
  const { pathname } = useLocation()
  
  // 👈 2. Hide Navbar & Footer on both admin and staff paths
  const hideLayout = pathname.includes("admin") || pathname.includes("staff")
  
  const { admin, staff } = useContext(AppContext)

  return (
    <div>
      <Toaster position='bottom-right'/>
      {!hideLayout && <Navbar/>}
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
        <Route path="/my-reports" element={<MyReports/>} />

        {/* 👈 3. Add Staff Portal Protected Routes */}
        <Route path='/staff' element={staff ? <StaffLayout/> : <StaffLogin/>}>
          <Route index element={staff ? <StaffDashboard/> : <StaffLogin/>}/>
          <Route path="orders" element={staff ? <StaffOrders/> : <StaffLogin/>}/>
          <Route path="menus" element={staff ? <Menus/> : <StaffLogin/>}/>
          <Route path="add-menu" element={staff ? <AddMenu/> : <StaffLogin/>}/>
          <Route path="reports" element={staff ? <StaffReports/> : <StaffLogin/>}/>
        </Route>

        {/* Admin Routes */}
        <Route path='/admin' element={admin ? <AdminLayout/> : <AdminLogin/>}>
          <Route index element={admin ? <Dashboard/> : <AdminLogin/>}/>
          <Route path="add-category" element={admin ? <AddCategory/> : <AdminLogin/>}/>
          <Route path="add-menu" element={admin ? <AddMenu/> : <AdminLogin/>}/>
          <Route path="categories" element={admin ? <Categories/> : <AdminLogin/>}/>
          <Route path="menus" element={admin ? <Menus/> : <AdminLogin/>}/>
          <Route path="orders" element={admin ? <Orders/> : <AdminLogin/>}/>
          <Route path="sales" element={admin ? <Sales/> : <AdminLogin/>}/>
          <Route path="reports" element={admin ? <AdminReports/> : <AdminLogin/>} /> 
          <Route path="promos" element={admin ? <AdminPromo/> : <AdminLogin/>} /> 
          <Route path="staff" element={admin ? <AdminStaff/> : <AdminLogin/>} /> 
        </Route>
      </Routes>
      
      {!hideLayout && <Footer/>}
    </div>
  )
}

export default App