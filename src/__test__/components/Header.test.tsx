import { cleanup, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter as Routes } from 'react-router-dom'

import Header from '../../Components/Common/AdminHeader'
import { store } from '../TestCommon'

jest.mock('axios')

afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})

test('Header Component Has Login Text', async () => {
  render(
    <Provider store={store}>
      <Routes>
        <Header />
      </Routes>
    </Provider>
  )

  const checkText = screen.getByText('Login', { exact: true })
  expect(checkText).toBeInTheDocument()
})
