import React, { useState } from 'react'
import axios from 'axios'

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`
}

export default function SubmitLetter({ token, onSubmitted }) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const SUBJECT_MAX = 120
  const BODY_MAX = 2000

  const submit = async e => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const fd = new FormData()
      fd.append('subject', subject)
      fd.append('body', body)
      for (const f of files) fd.append('attachments', f)

      await axios.post(`/api/letters`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      })

      setMessage('✦ Surat berhasil diajukan!')
      setSubject('')
      setBody('')
      setFiles([])
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ''

      if (onSubmitted) setTimeout(onSubmitted, 800)
    } catch (err) {
      setMessage('✗ Gagal: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0)
  const isSuccess = message.startsWith('✦')

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h3 style={{ marginBottom: 4 }}>✎ Ajukan Surat Baru</h3>
        <p style={{ color: 'var(--ink-muted)', fontStyle: 'italic', margin: 0 }}>
          Tuliskan permohonan Anda dengan jelas. Lampirkan dokumen pendukung bila perlu.
        </p>
      </div>

      {message && (
        <div className={`notice ${isSuccess ? 'success' : 'error'}`}>{message}</div>
      )}

      <form onSubmit={submit}>
        <div className="field">
          <label>Perihal Surat</label>
          <input
            placeholder="cth. Permohonan Surat Keterangan Domisili"
            value={subject}
            onChange={e => setSubject(e.target.value.slice(0, SUBJECT_MAX))}
            disabled={loading}
            maxLength={SUBJECT_MAX}
            required
          />
          <div className="preview-bar">
            <span>Singkat dan jelas</span>
            <span>{subject.length} / {SUBJECT_MAX}</span>
          </div>
        </div>

        <div className="field">
          <label>Isi Surat</label>
          <textarea
            placeholder="Dengan hormat,&#10;&#10;Saya yang bertanda tangan di bawah ini bermaksud mengajukan permohonan…"
            value={body}
            onChange={e => setBody(e.target.value.slice(0, BODY_MAX))}
            disabled={loading}
            maxLength={BODY_MAX}
            required
          />
          <div className="preview-bar">
            <span>{body.trim() ? `${body.trim().split(/\s+/).length} kata` : 'Belum ada teks'}</span>
            <span>{body.length} / {BODY_MAX}</span>
          </div>
        </div>

        <div className="field">
          <label>Lampiran (Opsional)</label>
          <input
            type="file"
            multiple
            onChange={e => setFiles(Array.from(e.target.files))}
            disabled={loading}
          />
          {files.length > 0 && (
            <>
              <div className="preview-bar">
                <span>{files.length} berkas dilampirkan</span>
                <span>Total: {formatBytes(totalSize)}</span>
              </div>
              <ul className="file-list">
                {files.map((f, i) => (
                  <li key={i}>
                    <span className="fname">📎 {f.name}</span>
                    <span className="fsize">{formatBytes(f.size)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <button type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Mengirim…' : '✉ Kirim Surat'}
        </button>
      </form>

      <div className="guide">
        <span className="smallcaps">Panduan Penulisan</span>
        <ul>
          <li>Gunakan bahasa formal dan sopan</li>
          <li>Sertakan identitas dan keperluan dengan jelas</li>
          <li>Lampirkan dokumen pendukung dalam format PDF/JPG/PNG</li>
          <li>Pastikan data yang diisi benar sebelum mengirim</li>
        </ul>
      </div>
    </div>
  )
}