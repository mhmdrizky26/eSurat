import React, { useEffect, useState } from 'react'
import axios from 'axios'
import SubmitLetter from './SubmitLetter'
import LettersList from './LettersList'

export default function Dashboard({ user, onLogout }) {
  const role = user?.role === 'admin' ? 'officer' : (user?.role || 'citizen')
  const defaultView = role === 'citizen' ? 'submit' : 'list'
  const [view, setView] = useState(defaultView)

  // Stats fetched from same endpoint LettersList uses — display-only
  const [stats, setStats] = useState({ total: 0, submitted: 0, processing: 0, approved: 0, rejected: 0 })
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    axios.get('/api/letters', { headers: { Authorization: `Bearer ${user.token}` } })
      .then(res => {
        if (!active) return
        const list = res.data || []
        const tally = { total: list.length, submitted: 0, processing: 0, approved: 0, rejected: 0 }
        list.forEach(l => { if (tally[l.status] !== undefined) tally[l.status]++ })
        setStats(tally)
      })
      .catch(() => {})
    return () => { active = false }
  }, [user.token, refreshKey])

  const canSubmit = role === 'citizen'
  const canViewList = role === 'officer' || role === 'citizen'
  const listTitle = role === 'officer' ? 'Kelola Semua Surat' : 'Surat Saya'
  const displayName = user?.name || 'User'
  const initials = displayName
    .split(' ')
    .map(s => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="container">
      <div className="letter-sheet">
        <div className="dash-header">
          <div className="avatar">{initials}</div>
          <div className="who">
            <h2>
              Selamat datang, {displayName}
              <span className="role-pill">{role === 'officer' ? 'Petugas' : 'Warga'}</span>
            </h2>
            <div className="meta">
              {user?.email && <>📧 {user.email} · </>}
              📅 {today}
            </div>
          </div>
          <button className="ghost danger" onClick={onLogout}>Keluar</button>
        </div>

        <div className="stats">
          <div className="stat-card">
            <div className="label">Total Surat</div>
            <div className="value">{stats.total}</div>
          </div>
          <div className="stat-card blue">
            <div className="label">Diajukan</div>
            <div className="value">{stats.submitted}</div>
          </div>
          <div className="stat-card amber">
            <div className="label">Diproses</div>
            <div className="value">{stats.processing}</div>
          </div>
          <div className="stat-card green">
            <div className="label">Disetujui</div>
            <div className="value">{stats.approved}</div>
          </div>
        </div>

        <div className="nav-tabs">
          {canSubmit && (
            <button
              className={view === 'submit' ? 'active' : ''}
              onClick={() => setView('submit')}
            >
              ✎ Ajukan Surat
            </button>
          )}
          {canViewList && (
            <button
              className={view === 'list' ? 'active' : ''}
              onClick={() => setView('list')}
            >
              ✉ {listTitle}
            </button>
          )}
        </div>

        {view === 'submit' && canSubmit ? (
          <SubmitLetter
            token={user.token}
            onSubmitted={() => { setRefreshKey(k => k + 1); setView('list') }}
          />
        ) : (
          <LettersList
            token={user.token}
            user={{ ...user, role }}
            title={listTitle}
            refreshKey={refreshKey}
            onChanged={() => setRefreshKey(k => k + 1)}
          />
        )}
      </div>
    </div>
  )
}