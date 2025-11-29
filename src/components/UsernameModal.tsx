import { useState } from 'react'
import './UsernameModal.css'

interface UsernameModalProps {
  onUsernameSet: (username: string) => void
}

const UsernameModal = ({ onUsernameSet }: UsernameModalProps) => {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      setError('Please enter a username')
      return
    }

    if (username.length > 20) {
      setError('Username must be less than 20 characters')
      return
    }

    // Check for valid characters (letters, numbers, underscores)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores')
      return
    }

    onUsernameSet(username.trim())
  }

  return (
    <div className="username-modal-overlay">
      <div className="username-modal">
        <div className="modal-header">
          <h2>Welcome!</h2>
          <p>Choose your username to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError('')
              }}
              placeholder="Enter your username"
              autoFocus
              maxLength={20}
            />
            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="modal-actions">
            <button type="submit" className="submit-btn">
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UsernameModal
