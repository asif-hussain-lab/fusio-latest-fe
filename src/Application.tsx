import React, { Suspense, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Dispatch } from 'redux'
import io from 'socket.io-client'
import AuthLayout from './Components/Common/AuthLayout/AuthLayout'
import { ErrorBoundary } from './Components/Common/ErrorBoundary/Errorboundary'
import Loader from './Components/Common/Loader'
import MainLayout from './Components/Common/MainLayout/MainLayout'
import UsersLayout from './Components/Common/UsersLayout/UsersLayout'
import Dashboard from './Components/Pages/admin/Dashboard/Dashboard'
import IncomeAnalysis from './Components/Pages/admin/IncomeAnalysis/IncomeAnalysis'
import Investors from './Components/Pages/admin/Investors/Investors'
import Login from './Components/Pages/admin/Login/Login'
import ManagePortfolio from './Components/Pages/admin/ManagePortfolio/ManagePortfolio'
import NFTManagement from './Components/Pages/admin/NFTManagement/NFTManagement'
import Orders from './Components/Pages/admin/Orders/Orders'
import Portfolio from './Components/Pages/admin/Portfolio/Portfolio'
import ReallocationRequests from './Components/Pages/admin/ReallocationRequests/ReallocationRequests'
import Settings from './Components/Pages/admin/Settings/Settings'
import WhitelistNft from './Components/Pages/admin/WhitelistNft/WhitelistNft'
import WhitelistToken from './Components/Pages/admin/WhitelistToken/WhitelistToken'
import AddPortfolioPage from './Components/Pages/commonpage/AddPortfolioPage/AddPortfolioPage'
import { EditPortfolioPage } from './Components/Pages/commonpage/EditPortfolioPage/EditPortfolioPage'
import ErrorPage from './Components/Pages/commonpage/ErrorPage/ErrorPage'
import MptPage from './Components/Pages/commonpage/MptPage/MptPage'
import UserDashboard from './Components/Pages/users/Dashboard/Dashboard'
import MainDashboard from './Components/Pages/users/MainDashboard/MainDashboard'
import Explore from './Components/Pages/users/Explore/Explore'
import LegacyPortfolio from './Components/Pages/users/LegacyPortfolio/LegacyPortfolio'
import NotificationView from './Components/Pages/users/NotificationView/NotificationView'
import { RebalancePortfolioPage } from './Components/Pages/users/RabalancePortfolioPage/RabalancePortfolioPage'
import { callContractGetMethod } from './Redux/Actions/contract.action'
import { clearLoader } from './Redux/Slices/loader.slice'
import { bnbDecimals, tokenDecimals, tokenSymbol } from './Redux/Slices/token.slice'
import { refreshUserData, setCountry, userBalance } from './Redux/Slices/user.slice'
import { RequireAuth, UserCountryAuth } from './Routes/Guard/AuthGuard'
import { getOrigin, versionManager } from './Services/common.service'
import { SERVER_URL, TOKEN_ADDRESS } from './Utils/constant'

const Application: React.FC = () => {
  /**CREATE DISPATCH OBJECT */
  const dispatch: Dispatch<any> = useDispatch()
  /**GET STATES FROM STORE */
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const [socket, setSocket] = useState<any>(null)

  useEffect(() => {
    const newSocket: any = io(SERVER_URL)
    setSocket(newSocket)
    if (walletAddress) {
      if (socket && !socket?.connected) {
        socket.connect()
      }
      newSocket.on('connect', () => {
        console.log('Connected to server')
      })
      newSocket.on(walletAddress?.toLowerCase(), (data: string) => {
        if (data === 'refreshUserData') {
          refreshData()
        }
      })
      newSocket.on('disconnect', () => {
        console.log('Disconnected from server')
      })
    } else if (newSocket) {
      newSocket.disconnect()
    }
    return () => {
      if (newSocket) {
        newSocket.disconnect()
      }
    }
  }, [walletAddress])

  const refreshData = () => {
    dispatch(refreshUserData(Date.now()))
  }

  const getCountry = async () => {
    let origin: any = await getOrigin()
    dispatch(setCountry(origin.country))
  }

  useEffect(() => {
    /**FUNCTION FOR SET DECIMALS ON PAGE LOAD */
    const getDecimals = async () => {
      const result: any = await dispatch(callContractGetMethod('decimals', [], 'dynamic', false, TOKEN_ADDRESS))
      dispatch(tokenDecimals(result))
      dispatch(bnbDecimals(18))
    }

    const getSymbol = async () => {
      const result: any = await dispatch(callContractGetMethod('symbol', [], 'dynamic', false, TOKEN_ADDRESS))
      dispatch(tokenSymbol(result))
    }

    const getUserBalance = async () => {
      if (walletAddress) {
        let balance: any = await dispatch(
          callContractGetMethod('balanceOf', [walletAddress], 'dynamic', false, TOKEN_ADDRESS)
        )
        dispatch(userBalance(balance))
      }
    }
    dispatch(clearLoader())
    walletAddress && getDecimals()
    walletAddress && getSymbol()
    walletAddress && getUserBalance()
  }, [dispatch, walletAddress])

  useEffect(() => {
    versionManager()
    getCountry()
  }, [])

  const router = createBrowserRouter([
    {
      path: '/',
      element: <UsersLayout />,
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '/',
          element: <Navigate to="dashboard" replace />,
        },
        {
          path: 'dashboard',
          element: <MainDashboard />,
        },
        {
          path: 'user-dashboard',
          element: <UserDashboard />,
        },
        {
          path: 'explore',
          element: <Explore />,
        },
        {
          path: 'portfolioView',
          element: <LegacyPortfolio />,
        },
        {
          path: 'rebalancePortfolio',
          element: (
            <UserCountryAuth>
              <RebalancePortfolioPage />
            </UserCountryAuth>
          ),
        },
        {
          path: 'addPortfolio',
          element: <AddPortfolioPage />,
        },
        {
          path: 'editPortfolio',
          element: <EditPortfolioPage />,
        },
        {
          path: 'mpt',
          element: <MptPage />,
        },
        {
          path: 'notification',
          element: (
            <UserCountryAuth>
              <NotificationView />
            </UserCountryAuth>
          ),
        },
        {
          path: '*',
          element: <ErrorPage />,
        },
      ],
    },
    {
      path: '/',
      element: <MainLayout />,
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: 'admin/login',
          element: <Login />,
        },
        {
          path: '*',
          element: <ErrorPage />,
        },
      ],
    },

    {
      path: '/',
      element: <AuthLayout />,
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: 'admin/dashboard',
          element: (
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          ),
        },
        {
          path: 'admin/settings',
          element: (
            <RequireAuth>
              <Settings />
            </RequireAuth>
          ),
        },
        {
          path: 'admin/portfolioView',
          element: (
            <RequireAuth>
              <LegacyPortfolio admin={true} />
            </RequireAuth>
          ),
        },
        {
          path: 'admin/income-analysis',
          element: (
            <RequireAuth>
              <IncomeAnalysis />
            </RequireAuth>
          ),
        },
        {
          path: 'admin/whitelist-token',
          element: (
            <RequireAuth>
              <WhitelistToken />
            </RequireAuth>
          ),
        },
        {
          path: 'admin/whitelist-nft',
          element: (
            <RequireAuth>
              <WhitelistNft />
            </RequireAuth>
          ),
        },
        {
          path: 'admin/portfolio',
          element: (
            <RequireAuth>
              <Portfolio />
            </RequireAuth>
          ),
        },

        {
          path: 'admin/investor',
          element: (
            <RequireAuth>
              <Investors />
            </RequireAuth>
          ),
        },
        {
          path: 'admin/nft-management',
          element: (
            <RequireAuth>
              <NFTManagement />
            </RequireAuth>
          ),
        },
        {
          path: 'admin/orders',
          element: (
            <RequireAuth>
              <Orders />
            </RequireAuth>
          ),
        },
        {
          path: 'admin/reallocation',
          element: (
            <RequireAuth>
              <ReallocationRequests />
            </RequireAuth>
          ),
        },
      ],
    },
    {
      path: '/admin/portfolio',
      element: <AuthLayout />,
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: 'manage-portfolio',
          element: (
            <RequireAuth>
              <ManagePortfolio />
            </RequireAuth>
          ),
        },
      ],
    },
    {
      path: '/admin/portfolio/manage-portfolio',
      element: <AuthLayout />,
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: 'addPortfolio',
          element: (
            <RequireAuth>
              <AddPortfolioPage />
            </RequireAuth>
          ),
        },
        {
          path: 'editPortfolio',
          element: (
            <RequireAuth>
              <EditPortfolioPage />
            </RequireAuth>
          ),
        },
      ],
    },
  ])

  return (
    <Suspense fallback={<Loader />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}

export default Application
