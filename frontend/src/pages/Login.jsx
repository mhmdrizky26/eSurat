import React, { useState } from 'react'
import axios from 'axios'

export default function Login({ onLogin, onSwitch }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post(`/api/auth/login`, { email, password })
      onLogin(res.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h2>Login</h2>
      {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}
      <form onSubmit={submit}>
        <input placeholder="officer@gamil.com / citizen@gamil.com" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
        <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
        <button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Login'}</button>
      </form>
      <p>Belum punya akun? <button onClick={onSwitch}>Daftar</button></p>
    </div>
  )
}
