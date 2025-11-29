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
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    // Check if user has a username stored
    const storedUsername = localStorage.getItem('hamster_username')
    if (!storedUsername) {
      setShowUsernameModal(true)
    } else {
      setUsername(storedUsername)
    }

    // Handle window resize
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) {
        setCommentsOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    // Lock body scroll when comments are open on mobile
    if (commentsOpen && isMobile) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [commentsOpen, isMobile])



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
          <VideoPlayer 
            onCommentsClick={isMobile ? () => setCommentsOpen(true) : undefined}
            isMobile={isMobile}
          />
        </div>

        {/* Right sidebar with comments */}
        <div className={`sidebar ${commentsOpen && isMobile ? 'open' : ''}`}>
          <CommentSection 
            username={username} 
            onClose={isMobile ? () => setCommentsOpen(false) : undefined}
            isMobile={isMobile}
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