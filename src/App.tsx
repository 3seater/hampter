import { useState, useEffect } from 'react'
import './App.css'
import VideoPlayer from './components/VideoPlayer'
import CommentSection from './components/CommentSection'
import UsernameModal from './components/UsernameModal'
import { hamsterImages } from './utils/hamsterImages'

function App() {
  const [username, setUsername] = useState<string | null>(null)
  const [showUsernameModal, setShowUsernameModal] = useState(false)

  useEffect(() => {
    // Check if user has a username stored
    const storedUsername = localStorage.getItem('hamster_username')
    if (!storedUsername) {
      setShowUsernameModal(true)
    } else {
      setUsername(storedUsername)
    }
  }, [])

  const handleUsernameSet = (newUsername: string) => {
    localStorage.setItem('hamster_username', newUsername)
    
    // Assign a random profile picture from hamster images if they don't have one
    if (!localStorage.getItem('hamster_pfp')) {
      const randomIndex = Math.floor(Math.random() * hamsterImages.length)
      const randomPfp = hamsterImages[randomIndex].url
      localStorage.setItem('hamster_pfp', randomPfp)
    }
    
    setUsername(newUsername)
    setShowUsernameModal(false)
  }

  return (
    <div className="app">
      {/* TikTok-style layout */}
      <div className="tiktok-layout">
        {/* Main video area */}
        <div className="video-container">
          <VideoPlayer />
        </div>

        {/* Right sidebar with comments */}
        <div className="sidebar">
          <CommentSection username={username} />
        </div>
      </div>

      {/* Username modal for first-time visitors */}
      {showUsernameModal && (
        <UsernameModal onUsernameSet={handleUsernameSet} />
      )}
    </div>
  )
}

export default App