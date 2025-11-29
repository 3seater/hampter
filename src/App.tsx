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
  const commentInputRef = useRef<HTMLInputElement>(null)

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
      <div className={`tiktok-layout ${commentsOpen ? 'comments-open' : ''}`}>
        {/* Main video area */}
        <div className="video-container">
          <VideoPlayer 
            onCommentsClick={() => {
              setCommentsOpen(true)
              // Focus input after a short delay to ensure sidebar is expanded
              setTimeout(() => {
                commentInputRef.current?.focus()
              }, 300)
            }} 
          />
        </div>

        {/* Right sidebar with comments */}
        <div className={`sidebar ${commentsOpen ? 'open' : ''}`}>
          <CommentSection
            username={username}
            inputRef={commentInputRef}
            onOpen={() => {
              setCommentsOpen(true)
              // Focus input after a short delay to ensure sidebar is expanded
              setTimeout(() => {
                commentInputRef.current?.focus()
              }, 300)
            }}
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