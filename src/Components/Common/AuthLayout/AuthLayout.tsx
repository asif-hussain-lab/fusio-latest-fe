import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminHeader from '../AdminHeader'
import Footer from '../Footer/Footer'
import Sidebar from '../Sidebar/Sidebar'
import './AuthLayout.scss'

const AuthLayout = () => {
  const [active, setActive] = useState(false)
  const handleSidebar = () => setActive(!active)
  return (
      <div className={`auth_layout ${active ? 'expanded_sidebar' : ''}`}>
        <Sidebar handleSidebar={handleSidebar} />
        <div className="auth_layout_inner">
          <AdminHeader active={active} handleSidebar={handleSidebar} afterLogin />
          <div className='auth_layout_inner_Right'>
            <Outlet />
          </div>
          <Footer />
        </div>
      </div>
  )
}

export default AuthLayout
