import { cleanup, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter as Routes } from 'react-router-dom'

import { store } from '../TestCommon'
import Login from '../../Components/Pages/admin/Login/Login'

jest.mock('axios')

afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})

test('Landing Page Has Enter your email Text', async () => {
  render(
    <Provider store={store}>
      <Routes>
        <Login />
      </Routes>
    </Provider>
  )

  const checkText = screen.getByText('Enter your email', { exact: true })
  expect(checkText).toBeInTheDocument()
})
