import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryProvider } from '@/providers/QueryProvider'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import App from './App.tsx'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<App />} />
            </Route>
          </Routes>
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  </StrictMode>,
)
