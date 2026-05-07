import React, { useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

function normalizeAuth(data) {
  const user = data?.user && typeof data.user === 'object' ? data.user : data || {}
  const token = data?.token || user?.token || ''
  const role = user.role === 'admin' ? 'officer' : (user.role || '')

  return {
    id: user.id ?? null,
    name: user.name || user.username || '',
    email: user.email || '',
    role,
    token,
  }
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('esurat_auth')
      return stored ? normalizeAuth(JSON.parse(stored)) : null
    } catch (e) {
      return null
    }
  })
  const [view, setView] = useState('login')

  const handleLogin = (data) => {
    const normalized = normalizeAuth(data)
    setUser(normalized)
    try { localStorage.setItem('esurat_auth', JSON.stringify(normalized)) } catch (e) {}
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('esurat_auth')
  }

  if (!user) {
    return view === 'login'
      ? <Login onLogin={handleLogin} onSwitch={() => setView('register')} />
      : <Register onRegister={handleLogin} onSwitch={() => setView('login')} />
  }

  return <Dashboard user={user} onLogout={handleLogout} />
}
