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

  // Password strength indicator (display only, doesn't affect submit)
  const strength = password.length === 0
    ? null
    : password.length < 6
      ? 'Lemah'
      : password.length < 10
        ? 'Cukup'
        : 'Kuat'

  return (
    <div className="container">
      <div className="envelope">
        <div className="masthead">
          <div className="crest">eS</div>
          <h1>eSurat</h1>
          <p className="tagline">Pelayanan Korespondensi Publik</p>
        </div>

        <p className="smallcaps" style={{ textAlign: 'center', marginBottom: 18 }}>
          — Buat Akun Baru —
        </p>

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
              <div className="preview-bar" style={{ marginTop: 6 }}>
                <span>Kekuatan: <em>{strength}</em></span>
                <span>{password.length} karakter</span>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Mendaftarkan…' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="benefits">
          <span className="smallcaps">Keuntungan Memiliki Akun</span>
          <ul>
            <li>Mengajukan surat permohonan kapan saja, di mana saja</li>
            <li>Melampirkan dokumen pendukung secara digital</li>
            <li>Memantau status surat secara langsung</li>
            <li>Riwayat pengajuan tersimpan rapi</li>
          </ul>
        </div>

        <div className="divider"><span>atau</span></div>

        <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--ink-muted)' }}>
          Sudah memiliki akun?{' '}
          <button className="linklike" onClick={onSwitch} disabled={loading}>
            Masuk di sini
          </button>
        </p>
      </div>
    </div>
  )
}