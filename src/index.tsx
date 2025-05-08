// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import 'bootstrap/dist/css/bootstrap.min.css'
import ReactDOM from 'react-dom/client'
import 'react-dropdown/style.css'
import App from './App'
import './index.scss'
import reportWebVitals from './reportWebVitals'
import { DisclaimerProvider } from './DisclaimerContext'

import { ThemeProvider } from './Utils/ThemeContext'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <DisclaimerProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </DisclaimerProvider>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
