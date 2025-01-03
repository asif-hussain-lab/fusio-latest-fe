import './ErrorPage.scss'
import { NavLink } from 'react-router-dom'

const ErrorPage = () => {
  return (
    <div className="error_page">
      <h2>404</h2>
      <h3>The page you are looking for can’t be found</h3>
      <p>Check the web address and try again.</p>
      <NavLink to="/">Back To Home</NavLink>
    </div>
  )
}

export default ErrorPage
