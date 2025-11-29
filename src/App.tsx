import { useState, useEffect, useRef } from 'react'
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
  const [commentsMinimized, setCommentsMinimized] = useState(false)
  const commentInputRef = useRef<HTMLInputElement>(null)

  // Function to close comments
  const closeComments = () => {
    setCommentsOpen(false)
    setCommentsMinimized(false) // Reset minimized state when closing
  }

  // Function to toggle minimize
  const toggleMinimize = () => {
    setCommentsMinimized(prev => !prev)
    if (!commentsMinimized) {
      setCommentsOpen(false) // Close expanded view when minimizing
    }
  }

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
      <div className={`tiktok-layout ${commentsOpen ? 'comments-open' : ''} ${commentsMinimized ? 'comments-minimized' : ''}`}>
        {/* Main video area */}
        <div className="video-container">
          <VideoPlayer />
        </div>

        {/* Right sidebar with comments */}
        <div className={`sidebar ${commentsOpen ? 'open' : ''} ${commentsMinimized ? 'minimized' : ''}`}>
          {commentsMinimized && (
            <button 
              className="maximize-tab"
              onClick={toggleMinimize}
              title="Maximize comments"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" fill="white"/>
              </svg>
            </button>
          )}
          {!commentsMinimized && (
            <CommentSection
              username={username}
              inputRef={commentInputRef}
              onClose={closeComments}
              onMinimize={toggleMinimize}
              onExpandComments={() => {
                setCommentsOpen(true)
                setCommentsMinimized(false) // Ensure not minimized when expanding
                // Focus input after a short delay to ensure sidebar is expanded
                setTimeout(() => {
                  commentInputRef.current?.focus()
                }, 300)
              }}
            />
          )}
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