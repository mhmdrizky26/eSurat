import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function LettersList({ token, user, title = 'Daftar Pengajuan' }) {
  const [letters, setLetters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchList() }, [])

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
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message))
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p style={{color: 'red'}}>Error: {error}</p>

  return (
    <div>
      <h3>{title}</h3>
      {letters.length === 0 ? <p>Tidak ada pengajuan</p> : letters.map(l => (
        <div key={l.id} style={{border:'1px solid #ddd', padding:8, margin:8}}>
          <b>{l.subject}</b> — <i>{l.status}</i>
          <p>{l.body}</p>
          <Details id={l.id} token={token} isOfficer={user?.role === 'officer'} fetchDetails={fetchDetails} onStatusChange={changeStatus} />
        </div>
      ))}
    </div>
  )
}

function Details({ id, token, isOfficer, fetchDetails, onStatusChange }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { 
    let mounted = true
    fetchDetails(id)
      .then(d => mounted && setData(d))
      .catch(err => mounted && setError(err.response?.data?.message || err.message))
    return () => mounted = false 
  }, [id, fetchDetails])

  if (error) return <p style={{color: 'red'}}>Error: {error}</p>
  if (!data) return <p>Loading details...</p>

  return (
    <div>
      <div>
        <b>Attachments:</b>
        {data.attachments.length === 0 ? <p>No attachments</p> : (
          <ul>
            {data.attachments.map(a => (
              <li key={a.id}><a href={a.url} target="_blank" rel="noreferrer">{a.filename}</a></li>
            ))}
          </ul>
        )}
      </div>
      {isOfficer ? (
        <div>
          <select defaultValue={data.letter.status} onChange={e => onStatusChange(id, e.target.value)}>
            <option value="submitted">submitted</option>
            <option value="processing">processing</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
          </select>
        </div>
      ) : null}
    </div>
  )
}
