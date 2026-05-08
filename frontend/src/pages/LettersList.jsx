import React, { useEffect, useState } from 'react'
import axios from 'axios'

const STATUS_LABELS = {
  submitted:  'Diajukan',
  processing: 'Diproses',
  approved:   'Disetujui',
  rejected:   'Ditolak',
}

function formatDate(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return String(d) }
}

export default function LettersList({ token, user, title = 'Daftar Pengajuan', refreshKey, onChanged }) {
  const [letters, setLetters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchList() /* eslint-disable-line */ }, [refreshKey])

  async function fetchList() {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(`/api/letters`, { headers: { Authorization: `Bearer ${token}` } })
      setLetters(res.data || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load letters')
    }
    setLoading(false)
  }

  async function fetchDetails(id) {
    const res = await axios.get(`/api/letters/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  }

  async function changeStatus(id, status) {
    try {
      await axios.put(`/api/letters/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } })
      fetchList()
      if (onChanged) onChanged()
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message))
    }
  }

  const counts = letters.reduce((acc, l) => {
    acc.all = (acc.all || 0) + 1
    acc[l.status] = (acc[l.status] || 0) + 1
    return acc
  }, { all: 0, submitted: 0, processing: 0, approved: 0, rejected: 0 })

  const filtered = filter === 'all' ? letters : letters.filter(l => l.status === filter)

  if (loading) return <p style={{ fontStyle: 'italic', color: 'var(--ink-muted)' }}>Memuat daftar surat…</p>
  if (error) return <div className="notice error">Galat: {error}</div>

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 4 }}>✉ {title}</h3>
        <p style={{ color: 'var(--ink-muted)', fontStyle: 'italic', margin: 0 }}>
          {user?.role === 'officer'
            ? 'Tinjau dan perbarui status setiap surat yang masuk.'
            : 'Pantau perkembangan surat yang Anda ajukan.'}
        </p>
      </div>

      <div className="nav-tabs">
        {['all', 'submitted', 'processing', 'approved', 'rejected'].map(key => (
          <button
            key={key}
            className={filter === key ? 'active' : ''}
            onClick={() => setFilter(key)}
          >
            {key === 'all' ? 'Semua' : STATUS_LABELS[key]} ({counts[key] || 0})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="ornament">✦ ✦ ✦</div>
          <p>
            {filter === 'all'
              ? 'Belum ada surat yang tercatat.'
              : `Tidak ada surat dengan status "${STATUS_LABELS[filter]}".`}
          </p>
        </div>
      ) : (
        filtered.map(l => (
          <div key={l.id} className="letter-card">
            <div className="head">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="id">№ Surat: {String(l.id).padStart(6, '0')}</div>
                <div className="subject">{l.subject}</div>
              </div>
              <span className={`status ${l.status}`}>{STATUS_LABELS[l.status] || l.status}</span>
            </div>

            <p className="body-text">{l.body}</p>

            <div className="footer">
              <span>📅 {formatDate(l.createdAt || l.created_at || l.date)}</span>
              {l.sender_name || l.user_name ? (
                <span>✍ {l.sender_name || l.user_name}</span>
              ) : null}
            </div>

            <Details
              id={l.id}
              token={token}
              isOfficer={user?.role === 'officer'}
              currentStatus={l.status}
              fetchDetails={fetchDetails}
              onStatusChange={changeStatus}
            />
          </div>
        ))
      )}
    </div>
  )
}

function Details({ id, token, isOfficer, currentStatus, fetchDetails, onStatusChange }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    fetchDetails(id)
      .then(d => mounted && setData(d))
      .catch(err => mounted && setError(err.response?.data?.message || err.message))
    return () => { mounted = false }
  }, [id, fetchDetails])

  if (error) return <div className="notice error" style={{ marginTop: 10 }}>Galat: {error}</div>
  if (!data) {
    return (
      <p style={{ fontStyle: 'italic', color: 'var(--ink-muted)', marginTop: 10, fontSize: '0.9rem' }}>
        Memuat lampiran…
      </p>
    )
  }

  const attachments = data.attachments || []

  async function openPreview(url, filename) {
    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      window.open(res.data.url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      alert('Gagal membuka lampiran: ' + (err.response?.data?.message || err.message || filename))
    }
  }

  return (
    <div className="details">
      <span className="smallcaps">
        Lampiran ({attachments.length})
      </span>
      {attachments.length === 0 ? (
        <p style={{ margin: '4px 0 0', fontStyle: 'italic', color: 'var(--ink-muted)', fontSize: '0.92rem' }}>
          Tidak ada lampiran pada surat ini.
        </p>
      ) : (
        <ul>
          {attachments.map(a => (
            <li key={a.id}>
              📎 <button
                type="button"
                onClick={() => openPreview(a.url, a.filename)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  color: 'inherit',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  font: 'inherit',
                }}
              >
                {a.filename}
              </button>
            </li>
          ))}
        </ul>
      )}

      {isOfficer && (
        <div className="officer-actions">
          <span className="smallcaps">Ubah status</span>
          <select
            defaultValue={data.letter?.status || currentStatus}
            onChange={e => onStatusChange(id, e.target.value)}
          >
            <option value="submitted">Diajukan</option>
            <option value="processing">Diproses</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
      )}
    </div>
  )
}