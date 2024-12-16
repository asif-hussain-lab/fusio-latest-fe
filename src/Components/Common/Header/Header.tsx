import { useRef, useState } from 'react'
import { Container, NavDropdown, Navbar } from 'react-bootstrap'
import { Link, NavLink } from 'react-router-dom'
import LoadingBar from 'react-top-loading-bar'
import logo from '../../../Assets/Images/LogoIcon.png'
import { PORTFOLIO_TYPE } from '../../../Utils/Utils'
import ConnectWallet from '../ConnectWallet'
import Notification from '../Notification/Notification'
import './Header.scss'

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
            <NavLink onClick={onclick} to="/explore" className="btn-style">
              Explore
            </NavLink>
            <NavDropdown
              title="Build Portfolio"
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
                Portfolio Builder
              </Link>
              <Link onClick={onclick} data-rr-ui-dropdown-item="" className="dropdown-item" to="/mpt">
                Portfolio Manager
              </Link>
            </NavDropdown>
          </Navbar.Collapse>
          <div className="d-flex align-items-center justify-content-between">
            <ConnectWallet />
            <Notification />
            <Navbar.Toggle ref={ref} onClick={toggleClass} />
          </div>
        </Container>
      </Navbar>
    </header>
  )
}

export default Header
