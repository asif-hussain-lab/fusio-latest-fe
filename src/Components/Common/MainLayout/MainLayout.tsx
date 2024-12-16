import './MainLayout.scss'
import { Outlet } from 'react-router-dom'


const MainLayout = () => {
  return (
    <>
      <main className="main-wrap">
        <Outlet />
      </main>
    </>
  )
}

export default MainLayout
