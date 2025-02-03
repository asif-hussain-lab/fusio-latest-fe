import { useFormik } from 'formik'
import { Dispatch, useEffect } from 'react'
import { Container, Form } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import { callApiPostMethod } from '../../../../Redux/Actions/api.action'
import { isAdmin, token } from '../../../../Redux/Slices/admin.slice'
import logoAdmin from '../../../../Assets/Images/LogoIcon.png'
import CommonButton from '../../../Common/Button/CommonButton'
import ConnectWallet from '../../../Common/ConnectWallet'
import InputCustom from '../../../Common/Inputs/InputCustom'
import toaster from '../../../Common/Toast'
import './Login.scss'

const Login = () => {
  /**CREATE DISPATCH OBJECT */
  const dispatch: Dispatch<any> = useDispatch();
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const admin = useSelector((state: any) => state.admin.isAdmin)
  const tokenValue = useSelector((state: any) => state.admin.token)
  const navigate: any = useNavigate()

  useEffect(() => {
    if (admin && tokenValue) {
      navigate('/admin/dashboard')
    }
  }, [admin, navigate, tokenValue])

  // CREATE LOGIN SCHEMA USING YUP
  const loginSchema = Yup.object().shape({
    // EMAIL & PASSWORD VALIDATION
    email: Yup.string()
      .email('Please enter valid email')
      .required('*This Field is required')
      .matches(/^[\w+.-]+@[a-zA-Z0-9.-]+$/, 'Enter valid email address'),
    password: Yup.string()
      .required('*This Field is required')
  })
  // Set up useFormik hook with initial values, validationSchema, and submit function
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      const data = {
        email: values.email.toLowerCase(),
        password: values.password,
      }
      if (data && walletAddress) {
        const response: any = await dispatch(
          callApiPostMethod("ADMIN_LOGIN", {
            "walletAddress": walletAddress,
            "email": data.email,
            "password": data.password
          }, true)
        );
        if (response?.success) {
          dispatch(isAdmin(true))
          dispatch(token(response?.data.token))
          navigate("/admin/dashboard")
        }

      } else if (walletAddress || data) {
        toaster.error("Please connect wallet")
      }
    },
  })

  return (
    <div className="login_page">
      <Container fluid>
        <div className="loginBox">
          <div className="login_page_box commonCardbox">
            <img src={logoAdmin} className="d-inline-block sidebarLogo" alt="logo" />
            <h2>Login to Fusio</h2>
            <Form onSubmit={formik.handleSubmit}>
              <InputCustom
                label="Email"
                className=""
                id="email"
                name="email"
                type="text"
                placeholder="Enter email"
                onChange={(e: any) => {
                  formik.handleChange(e)
                }}
                autoFocus={true}
                value={formik.values.email}
                isInvalid={formik.touched.email && !!formik.errors.email}
                error={
                  formik.errors.email && formik.touched.email ? (
                    <span className="error-message">{formik.errors.email}</span>
                  ) : null
                }
              />
              <InputCustom
                label="Password"
                id="password"
                className="passwordInput"
                type="password"
                placeholder="Enter password"
                onChange={(e: any) => {
                  formik.handleChange(e)
                }}
                value={formik.values.password}
                isInvalid={formik.touched.password && !!formik.errors.password}
                error={
                  formik.errors.password && formik.touched.password ? (
                    <span className="error-message">{formik.errors.password}</span>
                  ) : null
                }
              />
              <div className="text-center">
                <ConnectWallet />
                <CommonButton type="submit" title="Login" />
              </div>
            </Form>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Login