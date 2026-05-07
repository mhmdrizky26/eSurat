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

  // password strength indicator (display only)
  const strength = password.length === 0
    ? null
    : password.length < 6
      ? 'Lemah'
      : password.length < 10
        ? 'Cukup'
        : 'Kuat'

  return (
    <div className="container">
      <div className="envelope-split">
        {/* ───── KIRI: branding & benefits ───── */}
        <aside className="pane pane-dark">
          <div>
            <div className="masthead left-aligned">
              <div className="crest">eS</div>
              <h1>eSurat</h1>
              <p className="tagline">Pelayanan Korespondensi Publik</p>
            </div>

            <p style={{ marginTop: 22, color: 'rgba(245,239,224,0.8)', fontStyle: 'italic' }}>
              Bergabunglah dengan layanan korespondensi yang menjembatani
              warga dan pemerintahan secara digital, rapi, dan terpercaya.
            </p>
          </div>

          <div className="benefits">
            <span className="smallcaps">Keuntungan Memiliki Akun</span>
            <ul>
              <li>Mengajukan surat permohonan kapan saja</li>
              <li>Melampirkan dokumen pendukung secara digital</li>
              <li>Memantau status surat secara langsung</li>
              <li>Riwayat pengajuan tersimpan rapi</li>
            </ul>
          </div>
        </aside>

        {/* ───── KANAN: form ───── */}
        <section className="pane pane-light">
          <p className="smallcaps" style={{ marginBottom: 4 }}>Mulai Sekarang</p>
          <h2 style={{ marginBottom: 18 }}>Buat Akun Baru</h2>

          {error && <div className="notice error">{error}</div>}

          <form onSubmit={submit}>
            <div className="field">
              <label>Nama Lengkap</label>
              <input
                placeholder="cth. Budi Santoso"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

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
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              {strength && (
                <div className="preview-bar">
                  <span>Kekuatan: <em>{strength}</em></span>
                  <span>{password.length} karakter</span>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
              {loading ? 'Mendaftarkan…' : 'Daftar Sekarang'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--ink-muted)', marginTop: 22 }}>
            Sudah memiliki akun?{' '}
            <button className="linklike" onClick={onSwitch} disabled={loading}>
              Masuk di sini
            </button>
          </p>
        </section>
      </div>
    </div>
  )
}