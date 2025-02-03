import { NavLink, useLocation } from 'react-router-dom'
import { DollarIcon, InvestorIcon, NftIcon, OrderIcon, PortfolioIcon } from '../../../Assets/svgImgs/svgImgs'
import './SidebarUser.scss'
import { RebalncingIcon,DashboardIcon } from '../../../Assets/Images/Icons/SvgIcons'
import {SuitcaseIcon} from '../../../Assets/svgImgs/svgImgs'

const SidebarUser = ({ handleSidebar }: { handleSidebar?: () => void }) => {
  const location = useLocation() // Access current location

  // Helper function to determine active state
  const isActiveLink = (path: string, query: string) => {
    return location.pathname === path && location.search === query
  }

  return (
    <aside className="sidebar">
      <div className="mb-5"></div>
      <ul className="sidebar_inner" style={{ marginTop: '106px' }}>
        <li>
          <NavLink
            to="/user-dashboard?tab=portfolio"
            className={`nav_link ${isActiveLink('/user-dashboard', '?tab=portfolio') ? 'activel' : ''}`}
            onClick={handleSidebar}
          >
            <span className="nav_link_icon">
              <DashboardIcon />
            </span>{' '}
            My Investments
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/user-dashboard?tab=transactionhistory"
            className={`nav_link ${isActiveLink('/user-dashboard', '?tab=transactionhistory') ? 'activel' : ''}`}
            onClick={handleSidebar}
          >
            <span className="nav_link_icon">
              <InvestorIcon />
            </span>{' '}
            Transaction History
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/user-dashboard?tab=withdrawRequests"
            className={`nav_link ${isActiveLink('/user-dashboard', '?tab=withdrawRequests') ? 'activel' : ''}`}
            onClick={handleSidebar}
          >
            <span className="nav_link_icon">
              <RebalncingIcon />
            </span>{' '}
            Withdraw Requests
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/user-dashboard?tab=mynft"
            className={`nav_link ${isActiveLink('/user-dashboard', '?tab=mynft') ? 'activel' : ''}`}
            onClick={handleSidebar}
          >
            <span className="nav_link_icon">
              <SuitcaseIcon />
            </span>{' '}
            Manage & Rebalance
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/user-dashboard?tab=myorders"
            className={`nav_link ${isActiveLink('/user-dashboard', '?tab=myorders') ? 'activel' : ''}`}
            onClick={handleSidebar}
          >
            <span className="nav_link_icon">
              <OrderIcon />
            </span>{' '}
            My Orders
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/user-dashboard?tab=rebalanceRequests"
            className={`nav_link ${isActiveLink('/user-dashboard', '?tab=rebalanceRequests') ? 'activel' : ''}`}
            onClick={handleSidebar}
          >
            <span className="nav_link_icon">
              <DollarIcon />
            </span>{' '}
            Rebalance Requests
          </NavLink>
        </li>
        <li>
        <NavLink
            to="/explore"
            className='btn-style btn-sidebar'
            onClick={handleSidebar}
          >
            Explore
          </NavLink>
        </li>
      </ul>
    </aside>
  )
}

export default SidebarUser
