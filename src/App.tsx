import { useState, useEffect } from 'react'
import './App.css'
import VideoPlayer from './components/VideoPlayer'
import CommentSection from './components/CommentSection'
import UsernameModal from './components/UsernameModal'
import { hamsterImages } from './utils/hamsterImages'
import { createOrUpdateUser } from './services/firebaseService'

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



  const handleUsernameSet = async (newUsername: string) => {
    localStorage.setItem('hamster_username', newUsername)
    
    // Assign a random profile picture from hamster images if they don't have one
    let userPfp = localStorage.getItem('hamster_pfp')
    if (!userPfp) {
      const randomIndex = Math.floor(Math.random() * hamsterImages.length)
      userPfp = hamsterImages[randomIndex].url
      localStorage.setItem('hamster_pfp', userPfp)
    }
    
    // Save user to Firebase
    try {
      await createOrUpdateUser(newUsername, userPfp)
    } catch (error) {
      console.error('Error saving user to Firebase:', error)
    }
    
    setUsername(newUsername)
    setShowUsernameModal(false)
  }

  return (
    <div className="app">
      {/* Desktop layout with video + sidebar */}
      <div className="tiktok-layout">
        {/* Main video area */}
        <div className="video-container">
          <VideoPlayer />
        </div>

        {/* Right sidebar with comments */}
        <div className="sidebar">
          <CommentSection 
            username={username}
          />
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