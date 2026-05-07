import React, { useState } from 'react'
import axios from 'axios'

export default function SubmitLetter({ token }) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

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
      
      setMessage('✅ Surat berhasil diajukan!')
      setSubject('')
      setBody('')
      setFiles([])
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ''
    } catch (err) {
      setMessage('❌ Gagal: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h3>Ajukan Surat</h3>
      {message && <p style={{color: message.includes('✅') ? 'green' : 'red'}}>{message}</p>}
      <form onSubmit={submit}>
        <input 
          placeholder="Subject" 
          value={subject} 
          onChange={e => setSubject(e.target.value)}
          disabled={loading}
          required
        />
        <textarea 
          placeholder="Body" 
          value={body} 
          onChange={e => setBody(e.target.value)}
          disabled={loading}
          required
        />
        <input 
          type="file" 
          multiple 
          onChange={e => setFiles(Array.from(e.target.files))}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Mengirim...' : 'Kirim'}
        </button>
      </form>
    </div>
  )
}
