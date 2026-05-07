import React, { useState } from 'react'
import SubmitLetter from './SubmitLetter'
import LettersList from './LettersList'

export default function Dashboard({ user, onLogout }) {
  const role = user?.role === 'admin' ? 'officer' : (user?.role || 'citizen')
  const defaultView = role === 'citizen' ? 'submit' : 'list'
  const [view, setView] = useState(defaultView)

  const canSubmit = role === 'citizen'
  const canViewList = role === 'officer' || role === 'citizen'
  const listTitle = role === 'officer' ? 'Kelola Semua Surat' : 'Surat Saya'
  const displayName = user?.name || 'User'

  return (
    <div className="container">
      <h2>Welcome, {displayName}</h2>
      <p>Role: <b>{role}</b></p>
      <button onClick={onLogout}>Logout</button>

      <div>
        {canSubmit && <button onClick={() => setView('submit')}>Ajukan Surat</button>}
        {canViewList && <button onClick={() => setView('list')}>{listTitle}</button>}
      </div>

      {view === 'submit' && canSubmit ? (
        <SubmitLetter token={user.token} />
      ) : (
        <LettersList token={user.token} user={{ ...user, role }} title={listTitle} />
      )}
    </div>
  )
}
