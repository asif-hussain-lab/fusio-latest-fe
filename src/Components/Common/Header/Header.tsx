import { useRef, useState } from 'react'
import { Container, NavDropdown, Navbar } from 'react-bootstrap'
import { Link, NavLink } from 'react-router-dom'
import LoadingBar from 'react-top-loading-bar'
import logo from '../../../Assets/Images/LogoIcon.png'
import { PORTFOLIO_TYPE } from '../../../Utils/Utils'
import ConnectWallet from '../ConnectWallet'
import Notification from '../Notification/Notification'
import './Header.scss'
import SidebarUser from '../Sidebar/SidebarUser'
import { DashboardIcon } from '../../../Assets/svgImgs/svgImgs'
import { useTheme } from '../../../Utils/ThemeContext'
import { FaSun, FaMoon } from 'react-icons/fa'

const Header = () => {
  /**CREATE useNavigate OBJECT */

  const [isActive, setIsActive] = useState(false)
  const [progress, setProgress] = useState(0)

  const toggleClass = () => {
    setIsActive(!isActive)
  }

  const [showhover, setShowhover] = useState(false)
  const showDropdown = () => {
    setShowhover(!showhover)
  }
  const hideDropdown = () => {
    setShowhover(false)
  }

  const ref: any = useRef()

  const onclick = () => {
    if (ref.current && document.body.clientWidth < 1199) {
      ref.current.click()
    }
  }

  const { theme, toggleTheme } = useTheme()

  return (
    <header className={isActive ? 'header userHeader openmenu' : 'header userHeader'}>
      <LoadingBar color={'#0D9DDC'} progress={progress} height={4} onLoaderFinished={() => setProgress(0)} />
      <Navbar expand="xl" className="app-header">
        <Container className="">
          <Link to="/" className="brandLogo">
            <img src={logo} alt="logo" className="d-inline-block " />
          </Link>
          {isActive && <div onClick={onclick} className={`${isActive ? 'active' : ''} sidebar_backdrop d-xl-none`} />}
          <Navbar.Collapse className="justify-content-end">
            <Link onClick={onclick} to="/" className="brandLogo d-bloc d-xl-none">
              <img src={logo} alt="logo" className="d-inline-block " />
            </Link>

            <NavLink onClick={onclick} to="/dashboard" className="btn-style">
              Dashboard
            </NavLink>
            <NavDropdown className="custom-dropdown" title={
                <>
                    Invest
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor" style={{ marginLeft: '0.5rem' }}>
                        <path d="M6 8L0 0H12L6 8Z" />
                    </svg>
                </>
            }
               // title="Invest"
              id="basic-nav-dropdown"
              show={showhover}
              onMouseEnter={showDropdown}
              onMouseLeave={hideDropdown}
              onClick={showDropdown}
              onDoubleClick={hideDropdown}
            >
              <Link
                onClick={onclick}
                data-rr-ui-dropdown-item=""
                className="dropdown-item"
                to={`/addPortfolio?type=${PORTFOLIO_TYPE.cf}`}
              >
                Curated Portfolio
              </Link>
              <Link
                onClick={onclick}
                data-rr-ui-dropdown-item=""
                className="dropdown-item"
                to={`/addPortfolio?type=${PORTFOLIO_TYPE.byop}`}
              >
                Build your Own
              </Link>
            </NavDropdown>

            <NavLink onClick={onclick} to="/mpt" className="btn-style">
            Portfolio Manager
            </NavLink>
            <NavLink
            to="/user-dashboard?tab=portfolio"
            className="block d-xl-none btn-style"
            onClick={onclick}
          >
            My Investments
          </NavLink>
           
            <NavLink
            to="/user-dashboard?tab=transactionhistory"
            className="block d-xl-none btn-style"
            onClick={onclick}
          >
            Transaction History
           
          </NavLink>
            <NavLink
            to="/user-dashboard?tab=withdrawRequests"
            className="block d-xl-none btn-style"
            onClick={onclick}
          >
            Withdraw Requests
            
          </NavLink>
            <NavLink
            to="/user-dashboard?tab=myorders"
            className="block d-xl-none btn-style"
            onClick={onclick}
          >
            My Orders
          </NavLink>
            <NavLink
            to="/user-dashboard?tab=rebalanceRequests"
            className="block d-xl-none btn-style"
            onClick={onclick}
          >
            Rebalance Requests
          </NavLink>
            <NavLink
            to="/explore"
            className="block d-xl-none btn-style"
            onClick={onclick}
          >
          Explore
          </NavLink>
          </Navbar.Collapse>
          <div className="d-flex align-items-center justify-content-between">
            <ConnectWallet />
            <Notification />
            <button
              aria-label="Toggle Dark Mode"
              onClick={toggleTheme}
              className="theme-toggle-btn"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: theme === 'dark' ? '#FFD700' : '#333',
                fontSize: '1.5rem',
                marginLeft: '1rem',
              }}
            >
              {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </button>
            <Navbar.Toggle ref={ref} onClick={toggleClass} />
          </div>
        </Container>
      </Navbar>
    </header>
  )
}

export default Header
