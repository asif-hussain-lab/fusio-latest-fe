import { Dispatch, useState } from 'react'
import { Container, Navbar, Offcanvas } from 'react-bootstrap'
import { useDispatch } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import LoadingBar from 'react-top-loading-bar'
import { useDisconnect } from 'wagmi'
import { LoginIcon, MenuIcon } from '../../../Assets/svgImgs/svgImgs'
import { logoutAdmin } from '../../../Redux/Slices/admin.slice'
import { logoutUser } from '../../../Redux/Slices/user.slice'
import { AdminHeaderProps } from '../../../Utils/Interfaces'
import { ROUTES } from '../../../Utils/Utils'
import logo from '../../../Assets/Images/LogoIcon.png'
import CommonHeading from '../CommonHeading/CommonHeading'
import { ConfirmationModal } from '../CommonModal/ConfirmationModal/ConfirmationModal'
import ConnectWallet from '../ConnectWallet'
import Sidebar from '../Sidebar/Sidebar'
import toaster from '../Toast'
import './index.scss'

const AdminHeader = ({
  afterLogin,
  handleSidebar,
  active,
}: AdminHeaderProps) => {
  /**CREATE useNavigate OBJECT */
  const dispatch: Dispatch<any> = useDispatch()
  const location = useLocation()
  const { disconnect } = useDisconnect()

  const [show, setShow] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)
  const [showConfModal, setShowConfModal] = useState(false)
  const handleCloseConfModal = () => setShowConfModal(false)
  const handleShowConfModal = () => {
    setShowConfModal(true)
  }

  const [progress, setProgress] = useState(0)

  const logout = async () => {
    dispatch(logoutAdmin())
    dispatch(logoutUser())
    disconnect();
    handleCloseConfModal()
    toaster.success('Logout Successfully')
  }

  function renderSwitch() {
    switch (location.pathname.split('/admin/')[1]) {
      case ROUTES.DASHBOARD:
        return 'Dashboard'
      case ROUTES.PORTFOLIO:
        return 'Portfolio fund management and info'
      case ROUTES.MANAGE_PORTFOLIO:
        return 'Portfolio fund management and info'
      case ROUTES.INVESTOR:
        return 'Investors Info and Management'
      case ROUTES.INCOME_ANALYSIS:
        return 'Income Analysis'
      case ROUTES.NFT_MANAGEMENT:
        return 'BG Funds Management'
      case ROUTES.ORDERS:
        return 'Orders Management'
      case ROUTES.WHITELIST_TOKEN:
        return 'Whitelist Token'
      case ROUTES.WHITELIST_NFT:
        return 'Whitelist NFT'
      case ROUTES.REALLOCATION:
        return 'Reallocation Requests'
      case ROUTES.SETTINGS:
        return 'Settings'
    }
  }

  return (
    <>
      {active && <div onClick={handleSidebar} className={`${active ? 'active' : ''} sidebar_backdrop d-lg-none`} />}

      <header className="header">
        <LoadingBar color={'#0D9DDC'} progress={progress} height={4} onLoaderFinished={() => setProgress(0)} />
        <Navbar className="app-header">
          <Container fluid={afterLogin ? true : 'lg'} className="px-0">
            <Link to="/" className="headerLogo d-block d-xl-none">
              <img src={logo} alt="logo" className="d-inline-block" />
            </Link>
            <CommonHeading heading={renderSwitch()} />

            <Navbar.Collapse className="justify-content-end">
              <div className="d-flex align-items-center">
                <ConnectWallet />

                <div className="logoutLink ms-3 ms-sm-4" onClick={handleShowConfModal}>
                  <Link to={window?.location?.href}>
                    <LoginIcon />
                    <span className='red_text'>Logout</span>
                  </Link>
                </div>
                <div className="Mobile_toggleBtn d-block d-xl-none" onClick={handleShow}>
                  <MenuIcon />
                </div>
              </div>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </header>
      <ConfirmationModal
        text="Are you sure you want to logout?"
        show={showConfModal}
        handleClose={handleCloseConfModal}
        callBack={logout}
      />

      <Offcanvas className="SideBar_Menu" show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton></Offcanvas.Header>
        <Offcanvas.Body>
          <Sidebar />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}

export default AdminHeader
