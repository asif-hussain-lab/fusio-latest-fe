import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { COUNTRY_TO_RESTRICT } from '../../Utils/Utils'

/**AUTHGAURD FOR INNER PAGES */
export const RequireAuth = (props: any) => {
  const admin = useSelector((state: any) => state.admin)
  const user = useSelector((state: any) => state.user)
  return admin.token && admin.isAdmin && user?.walletAddress ? props?.children : <Navigate to="/admin/login" />
}

export const UserCountryAuth = (props: any) => {
  const user = useSelector((state: any) => state.user)
  return user.country !== COUNTRY_TO_RESTRICT ? props?.children : <Navigate to="/" />
}
