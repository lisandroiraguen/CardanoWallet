import { Buffer } from 'buffer';
window.Buffer = Buffer;

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Hide loading screen once React has mounted
const hideLoadingScreen = () => {
  const loadingScreen = document.getElementById('loading-screen')
  if (loadingScreen) {
    loadingScreen.classList.add('hidden')
    // Remove from DOM after animation completes
    setTimeout(() => {
      loadingScreen.remove()
    }, 500)
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Hide loading screen once React has rendered
// Use requestAnimationFrame to ensure DOM is ready
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    hideLoadingScreen()
  })
})

