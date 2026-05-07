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
      <div className="envelope-split">
        {/* ───── KIRI: branding & info ───── */}
        <aside className="pane pane-dark">
          <div>
            <div className="masthead left-aligned">
              <div className="crest">eS</div>
              <h1>eSurat</h1>
              <p className="tagline">Pelayanan Korespondensi Publik</p>
            </div>

            <blockquote className="pane-quote" style={{ marginTop: 22 }}>
              "Surat adalah jembatan kata — penghubung warga dan lembaga
              dalam satu lembar kepercayaan."
              <span className="attr">— Tradisi Korespondensi Resmi</span>
            </blockquote>
          </div>

          <div className="demo-creds">
            <span className="smallcaps">Akun Demonstrasi</span>
            <div className="row">
              <span><em>Petugas</em></span>
              <code>officer@gamil.com</code>
            </div>
            <div className="row">
              <span><em>Warga</em></span>
              <code>citizen@gamil.com</code>
            </div>
          </div>
        </aside>

        {/* ───── KANAN: form ───── */}
        <section className="pane pane-light">
          <p className="smallcaps" style={{ marginBottom: 4 }}>Selamat Datang Kembali</p>
          <h2 style={{ marginBottom: 18 }}>Masuk ke Akun Anda</h2>

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

          <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--ink-muted)', marginTop: 22 }}>
            Belum memiliki akun?{' '}
            <button className="linklike" onClick={onSwitch} disabled={loading}>
              Daftarkan diri di sini
            </button>
          </p>
        </section>
      </div>
    </div>
  )
}