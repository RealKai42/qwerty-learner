import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './pages/App'
import './icon'
import reportWebVitals from './reportWebVitals'
import { CookiesProvider } from 'react-cookie'
import 'react-app-polyfill/stable'

ReactDOM.render(
  <React.StrictMode>
    <CookiesProvider>
      <App />
    </CookiesProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log)
reportWebVitals()
