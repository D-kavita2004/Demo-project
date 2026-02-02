import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserProvider } from './components/Utils/userContext'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <UserProvider>
          <App />
        <Toaster/>
    </UserProvider>
  // </StrictMode>,
)
