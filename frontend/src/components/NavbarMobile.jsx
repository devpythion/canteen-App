import React from 'react'
import { Link } from 'react-router-dom'
import { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { House,ListOrdered,UtensilsCrossed,Settings} from 'lucide-react'

const navItems = [
    { id:'home', Icon: House, path: '/'},
    { id:'orders', Icon:ListOrdered, path: '/my-orders'},
    { id:'menu', Icon:UtensilsCrossed, path: '/menu'},
    { id:'setting', Icon:Settings, path:'/setting'}
]

const NavbarMobile = () => {
  const {naviagte,user,setUser} = useContext(AppContext)
  const [isMenuOpen,setIsMenuOpen] = useState(false)
  const [active,setActive] = useState('home')

  return (
    <nav>
        <div className='bg-gray-100 fixed bottom-0 w-full z-50 h-16 order-2 flex justify-center items-center'>
            <div className='flex justify-center items-center'>
                <div className=' flex justify-center items-center space-x-12'>
                   {navItems.map(({ id, Icon , path})=>(
                    <Link
                        key={id}
                        to={path}
                        onClick={()=>setActive(id)}
                        className = {`h-13 w-13 flex justify-center items-center rounded-4xl transition-transform duration-300 ${active === id? 'bg-primary animate-flash': ''}`}>
                        <Icon className={`h-8 w-8 transition-transform duration-300 ${active === id? 'scale-125': ''}`}/>
                    </Link>
                   ))}
                </div>
            </div>
        </div>
    </nav>
  )
}

export default NavbarMobile
 