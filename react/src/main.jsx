import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { MenuCima, Live ,BlocoMeio } from './Futs/home.jsx'  


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="bg-gray-900 p-1 h-screen w-screen overflow-hidden">
    <MenuCima />
    <BlocoMeio/>
    <Live />
    </div>
  </StrictMode>,
)
