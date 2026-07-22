import React, { useContext } from 'react'
import {LayoutDashboard, Plus, Grid3x3, ShoppingCart, BookIcon} from 'lucide-react'
const AdminLayout = () => {
  const {setAdmin} =  useContext(AppContext)
  const menuItems = [
    {
      path:"/admin",
      name:"DashBoard",
      icon: LayoutDashboard,
      exact: true
    },
    {
      path:"/admin/add-category",
      name:"Add Category",
      icon: Plus,
    },
    {
      path:"/admin/add-menu",
      name:"Add Menu",
      icon: Package
    },
    {
      path:"/admin/categories",
      name:"All Categories",
      icon: Grid3x3,
    },
    {

    }
  ]
  return (
    <div>
      Hello
    </div>
  )
}

export default AdminLayout
