import { NavLink } from 'react-router-dom'
import { RebalncingIcon, SettingsIcon } from '../../../Assets/Images/Icons/SvgIcons'
import {
  DashboardIcon,
  DollarIcon,
  InvestorIcon,
  NftIcon,
  OrderIcon,
  PortfolioIcon,
  WhiteListNftIcon,
  WhitelistIcon,
} from '../../../Assets/svgImgs/svgImgs'
import './Sidebar.scss'
import logoAdmin from '../../../Assets/Images/LogoIcon.png'

const Sidebar = ({ handleSidebar }: { handleSidebar?: () => void }) => {
  return (
    <aside className="sidebar">
      <div className="mb-5">
        <img src={logoAdmin} className="d-inline-block sidebarLogo" alt="logo" />
      </div>
      <ul className="sidebar_inner">
        <li>
          <NavLink to="/admin/dashboard" className="nav_link" onClick={handleSidebar}>
            <span className="nav_link_icon">
              <DashboardIcon />
            </span>{' '}
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/portfolio" className="nav_link" onClick={handleSidebar}>
            <span className="nav_link_icon">
              <PortfolioIcon />
            </span>{' '}
            Portfolio
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/investor" className="nav_link" onClick={handleSidebar}>
            <span className="nav_link_icon">
              <InvestorIcon />
            </span>{' '}
            Investor
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/nft-management" className="nav_link" onClick={handleSidebar}>
            <span className="nav_link_icon">
              <NftIcon />
            </span>{' '}
            BGF Management
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/orders" className="nav_link" onClick={handleSidebar}>
            <span className="nav_link_icon">
              <OrderIcon />
            </span>{' '}
            Orders
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/income-analysis" className="nav_link" onClick={handleSidebar}>
            <span className="nav_link_icon">
              <DollarIcon />
            </span>{' '}
            Income Analysis
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/whitelist-token" className="nav_link" onClick={handleSidebar}>
            <span className="nav_link_icon">
              <WhitelistIcon />
            </span>{' '}
            Whitelist Token
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/whitelist-nft" className="nav_link" onClick={handleSidebar}>
            <span className="nav_link_icon">
              <WhiteListNftIcon />
            </span>{' '}
            Whitelist NFT
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/reallocation" className="nav_link" onClick={handleSidebar}>
            <span className="nav_link_icon">
              <RebalncingIcon />
            </span>{' '}
            Reallocation
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/settings" className="nav_link" onClick={handleSidebar}>
            <span className="nav_link_icon">
              <SettingsIcon />
            </span>{' '}
            Settings
          </NavLink>
        </li>
      </ul>
    </aside>
  )
}

export default Sidebar
