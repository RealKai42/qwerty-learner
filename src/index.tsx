import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import './icon'
import reportWebVitals from './reportWebVitals'
import 'react-app-polyfill/stable'
import { AppStateProvider } from 'store/AppState'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import GalleryPage from './pages/Gallery'
import TypingPage from './pages/Typing'
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { firebaseConfig } from './firebase.config'

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)

ReactDOM.render(
  <React.StrictMode>
    <AppStateProvider>
      <Router basename={process.env.REACT_APP_DEPLOY_ENV === 'travis' ? '/qwerty-learner' : ''}>
        <Switch>
          <Route path="/gallery">
            <GalleryPage />
          </Route>
          <Route path="/">
            <TypingPage />
          </Route>
        </Switch>
      </Router>
    </AppStateProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log)
reportWebVitals()
