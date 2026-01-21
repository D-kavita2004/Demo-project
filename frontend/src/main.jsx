import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserProvider } from './components/Utils/userContext'
import { FormsProvider } from './components/Utils/formsContext'
import { Toaster } from 'sonner'
import Footer from './components/ReusableComponents/Footer'
import Header from './components/ReusableComponents/Header'
// import { Router } from 'react-router-dom'
createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <UserProvider>
      <FormsProvider>
        <div>
          {/* <Header /> */}
          <App />
          <Footer />
        </div>
        <Toaster/>
      </FormsProvider>
    </UserProvider>
  // </StrictMode>,
)
