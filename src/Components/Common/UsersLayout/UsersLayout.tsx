import { Outlet } from 'react-router-dom'
import Footer from '../Footer/Footer'
import Header from '../Header/Header'
import "./UsersLayout.scss"
import { useState } from 'react'
import SidebarUser from '../Sidebar/SidebarUser'

const UsersLayout = () => {
  const [active, setActive] = useState(true)
  const handleSidebar = () => setActive(active)
  
  return (
    <>
      <Header />
      <main className="main-wrap">
        <SidebarUser handleSidebar={handleSidebar} />
        <div className="auth_layout_inner">
          <Outlet />
        </div>
      </main>
      <Footer />
    </>
  )
}

export default UsersLayout
