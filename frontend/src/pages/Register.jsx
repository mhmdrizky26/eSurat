import React, { useState } from 'react'
import axios from 'axios'

export default function Register({ onRegister, onSwitch }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post(`/api/auth/register`, { name, email, password })
      onRegister(res.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Register failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h2>Register</h2>
      {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}
      <form onSubmit={submit}>
        <input placeholder="name" value={name} onChange={e => setName(e.target.value)} disabled={loading} />
        <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
        <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
        <button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Register'}</button>
      </form>
      <p>Sudah punya akun? <button onClick={onSwitch}>Login</button></p>
    </div>
  )
}
