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
      <div className="envelope">
        <div className="masthead">
          <div className="crest">eS</div>
          <h1>eSurat</h1>
          <p className="tagline">Pelayanan Korespondensi Publik</p>
        </div>

        <p className="smallcaps" style={{ textAlign: 'center', marginBottom: 18 }}>
          — Masuk ke Akun Anda —
        </p>

        {error && <div className="notice error">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label>Alamat Surel</label>
            <input
              type="email"
              placeholder="nama@contoh.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="field">
            <label>Kata Sandi</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Memverifikasi…' : 'Masuk'}
          </button>
        </form>

        <div className="demo-creds">
          <span className="smallcaps">Akun Demonstrasi</span>
          <div className="row">
            <span><em>Petugas</em></span>
            <code>officer@gmail.com</code>
          </div>
          <div className="row">
            <span><em>Warga</em></span>
            <code>citizen@gmail.com</code>
          </div>
          <div className="row" style={{ marginTop: 6 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
              Gunakan kata sandi sesuai akun yang dibuat.
            </span>
          </div>
        </div>

        <div className="divider"><span>atau</span></div>

        <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--ink-muted)' }}>
          Belum memiliki akun?{' '}
          <button className="linklike" onClick={onSwitch} disabled={loading}>
            Daftarkan diri di sini
          </button>
        </p>
      </div>
    </div>
  )
}