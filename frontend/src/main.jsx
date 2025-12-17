import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserProvider } from './components/Utils/userContext'
import { FormsProvider } from './components/Utils/formsContext'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <UserProvider>
      <FormsProvider>
        <App />
        <Toaster/>
      </FormsProvider>
    </UserProvider>
  // </StrictMode>,
)
