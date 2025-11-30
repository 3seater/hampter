import { useState, useRef, useEffect } from 'react'
import './CommentSection.css'
import HamsterPicker from './HamsterPicker'
import { hamsterImages } from '../utils/hamsterImages'
import jumpToBottomIcon from '../assets/icons/images (2).png'
import xIcon from '../assets/socials/x2.png'
import pumpfunIcon from '../assets/socials/pumpfun2.png'
import knowyourmemeIcon from '../assets/socials/knowyourmeme.png'
import {
  addComment,
  subscribeToComments,
  toggleCommentLike as toggleCommentLikeFirebase,
  toggleVideoLike,
  toggleVideoBookmark,
  subscribeToVideoStats
} from '../services/firebaseService'

interface Comment {
  id: string
  username: string
  userPfp: string
  imageUrl?: string
  text?: string
  timestamp: Date | any
  likes: number
  liked: boolean
  likedBy?: string[]
  replies: Comment[]
  parentId?: string
}

interface CommentSectionProps {
  username: string | null
  inputRef?: React.RefObject<HTMLInputElement | null>
  onClose?: () => void
  onMinimize?: () => void
  onExpandComments?: () => void
}

const CommentSection = ({ username, inputRef, onClose, onMinimize, onExpandComments }: CommentSectionProps) => {
  const [isFollowing, setIsFollowing] = useState(false)
  const [videoStats, setVideoStats] = useState({
    likes: { count: 0, liked: false },
    comments: { count: 0 },
    bookmarks: { count: 0, bookmarked: false }
  })

  // Load follow state from localStorage
  useEffect(() => {
    const storedFollow = localStorage.getItem('hampter_is_following')
    if (storedFollow === 'true') {
      setIsFollowing(true)
    }
  }, [])

  const toggleFollow = () => {
    const next = !isFollowing
    setIsFollowing(next)
    localStorage.setItem('hampter_is_following', next ? 'true' : 'false')
  }
  // Subscribe to video stats
  useEffect(() => {
    if (!username) return

    const unsubscribe = subscribeToVideoStats((stats) => {
      if (stats) {
        const likedBy = stats.likes?.likedBy || []
        const bookmarkedBy = stats.bookmarks?.bookmarkedBy || []
        
        setVideoStats({
          likes: {
            count: stats.likes?.count || 0,
            liked: likedBy.includes(username)
          },
          comments: {
            count: stats.comments?.count || 0
          },
          bookmarks: {
            count: stats.bookmarks?.count || 0,
            bookmarked: bookmarkedBy.includes(username)
          }
        })
      }
    })

    return () => unsubscribe()
  }, [username])


  const toggleLike = async () => {
    if (!username) return
    const isLiked = videoStats.likes.liked
    await toggleVideoLike(username, isLiked)
  }

  const toggleBookmark = async () => {
    if (!username) return
    const isBookmarked = videoStats.bookmarks.bookmarked
    await toggleVideoBookmark(username, isBookmarked)
  }

  const [comments, setComments] = useState<Comment[]>([])
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [showHamsterPicker, setShowHamsterPicker] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [showJumpToBottom, setShowJumpToBottom] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [copyButtonText, setCopyButtonText] = useState('Copy link')
  const commentsListRef = useRef<HTMLDivElement>(null)
  const commentSectionRef = useRef<HTMLDivElement>(null)
  const localTextInputRef = useRef<HTMLInputElement>(null)
  const textInputRef = inputRef || localTextInputRef

  // Get the actual scroll container (comment-section on desktop, comments-list on mobile)
  const getScrollContainer = () => {
    // On desktop, comment-section is the scroll container
    // On mobile, comments-list might be, but comment-section handles it
    return commentSectionRef.current || commentsListRef.current
  }

  const createComment = async (imageUrl?: string, text?: string) => {
    if (!username || (!imageUrl && !text)) return

    setIsPosting(true)

    // Get or generate user's profile picture
    let userPfp = localStorage.getItem('hamster_pfp')
    if (!userPfp) {
      const randomIndex = Math.floor(Math.random() * hamsterImages.length)
      userPfp = hamsterImages[randomIndex].url
      localStorage.setItem('hamster_pfp', userPfp)
    }

    try {
      await addComment({
        username: username,
        userPfp: userPfp!,
        imageUrl: imageUrl,
        text: text,
        parentId: replyingTo || undefined
      })
      
      setReplyingTo(null)
      setCommentText('')
      setShowHamsterPicker(false)
    } catch (error: any) {
      console.error('Error adding comment:', error)
      alert(`Error posting comment: ${error.message || 'Please make sure Firestore is enabled in Firebase Console'}`)
    } finally {
      setIsPosting(false)
    }
  }

  const handleHamsterSelect = (imageUrl: string) => {
    createComment(imageUrl, undefined)
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (commentText.trim()) {
      createComment(undefined, commentText.trim())
    }
  }

  // Check if user is at bottom of scroll
  const checkIfAtBottom = () => {
    const scrollContainer = getScrollContainer()
    if (!scrollContainer) return false
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer
    // Consider "at bottom" if within 50px of the bottom
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
    setIsAtBottom(isAtBottom)
    setShowJumpToBottom(!isAtBottom)
    return isAtBottom
  }

  // Handle scroll events and initial check
  useEffect(() => {
    const scrollContainer = getScrollContainer()
    if (!scrollContainer) return

    // Initial check
    checkIfAtBottom()

    const handleScroll = () => {
      checkIfAtBottom()
    }

    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [])

  // Subscribe to comments from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToComments((firebaseComments) => {
      // Filter out replies (they'll be nested in parent comments)
      const topLevelComments = firebaseComments.filter((c: any) => !c.parentId)
      
      // Build comment tree with replies
      const commentsWithReplies = topLevelComments.map((comment: any) => {
        const replies = firebaseComments
          .filter((c: any) => c.parentId === comment.id)
          .map((reply: any) => ({
            ...reply,
            liked: (reply.likedBy || []).includes(username || '')
          }))
        
        return {
          ...comment,
          liked: (comment.likedBy || []).includes(username || ''),
          replies: replies
        }
      })
      
      setComments(commentsWithReplies)
    })

    return () => unsubscribe()
  }, [username])

  // Auto-scroll to bottom when new comments are added (only if user is at bottom)
  useEffect(() => {
    const scrollContainer = getScrollContainer()
    if (scrollContainer && isAtBottom && comments.length > 0) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (scrollContainer) {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
          })
          // Update state after scroll
          setTimeout(() => {
            checkIfAtBottom() // Re-check position after scroll
          }, 300)
        }
      })
    }
  }, [comments, isAtBottom]) // Trigger on comments array changes

  // Jump to bottom function
  const jumpToBottom = () => {
    const scrollContainer = getScrollContainer()
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      })
      setTimeout(() => {
        setIsAtBottom(true)
        setShowJumpToBottom(false)
      }, 300)
    }
  }

  const toggleCommentLike = async (commentId: string, isReply: boolean = false, parentId?: string) => {
    if (!username) return
    
    const comment = isReply 
      ? comments.find(c => c.id === parentId)?.replies.find(r => r.id === commentId)
      : comments.find(c => c.id === commentId)
    
    if (!comment) return
    
    const isLiked = comment.liked
    await toggleCommentLikeFirebase(commentId, username, isLiked)
  }

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  const formatTimestamp = (timestamp: Date | any) => {
    // Handle Firebase Timestamp
    const date = timestamp?.toDate ? timestamp.toDate() : (timestamp instanceof Date ? timestamp : new Date(timestamp))
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const copyLink = () => {
    navigator.clipboard.writeText('https://hampter.xyz')
    setCopyButtonText('Copied')
    setTimeout(() => {
      setCopyButtonText('Copy link')
    }, 5000)
  }

  return (
    <div className="comment-section" ref={commentSectionRef}>
      {/* Minimize button - always at top, centered */}
      {onMinimize && (
        <button 
          className="minimize-top-btn"
          onClick={onMinimize}
          title="Minimize comments"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 13H5v-2h14v2z" fill="white"/>
          </svg>
        </button>
      )}
      
      {/* Profile info section */}
      <div className="profile-section">
        <div className="profile-content">
          <div className="profile-header">
            <div className="profile-left">
              <div className="profile-avatar">
                <img src="/PFP.jpg" alt="Profile" />
              </div>
              <div className="profile-info">
                <div className="username">hampter</div>
                <div className="post-date">{new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}</div>
              </div>
            </div>
            <button
              className={`follow-btn ${isFollowing ? 'following' : ''}`}
              onClick={toggleFollow}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>

          <div className="caption">
            <div>the future of rodent finance</div>
            <div className="hashtag">#hampter</div>
          </div>
        </div>

        {/* Engagement stats */}
        <div className="engagement-stats">
          <div className="stat-item" onClick={toggleLike} style={{ cursor: 'pointer' }}>
            <div className="stat-icon-wrapper" style={{ background: videoStats.likes.liked ? '#fe2c55' : '#1b1b1b' }}>
              <svg className="stat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="white"/>
              </svg>
            </div>
            <div className="stat-count">{videoStats.likes.count}</div>
          </div>
              <div className="stat-item" onClick={() => {
                // Open comments for commenting
                if (onExpandComments) {
                  onExpandComments()
                }
              }} style={{ cursor: 'pointer' }}>
                <div className="stat-icon-wrapper">
                  <svg className="stat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="white"/>
                  </svg>
                </div>
                <div className="stat-count">{videoStats.comments.count}</div>
              </div>
          <div className="stat-item" onClick={toggleBookmark} style={{ cursor: 'pointer' }}>
            <div className="stat-icon-wrapper" style={{ background: videoStats.bookmarks.bookmarked ? '#fe2c55' : '#1b1b1b' }}>
              <svg className="stat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="white"/>
              </svg>
            </div>
            <div className="stat-count">{videoStats.bookmarks.count}</div>
          </div>
          {/* Social sharing icons */}
          <div className="social-sharing">
            <button className="social-icon-btn" onClick={() => window.open('https://twitter.com/hamptercoin', '_blank')} title="Follow on X">
              <img src={xIcon} alt="X" />
            </button>
            <button className="social-icon-btn" onClick={() => window.open('https://pump.fun', '_blank')} title="Visit Pump.fun">
              <img src={pumpfunIcon} alt="Pump.fun" />
            </button>
            <button className="social-icon-btn" onClick={() => window.open('https://knowyourmeme.com/memes/almarts27-hamster', '_blank')} title="Know Your Meme - Almarts27 Hamster">
              <img src={knowyourmemeIcon} alt="Know Your Meme" />
            </button>
          </div>
        </div>

        {/* Copy link section */}
        <div className="copy-link-section">
          <div className="link-display">https://hampter.xyz</div>
          <button className="copy-btn" onClick={copyLink}>{copyButtonText}</button>
        </div>
      </div>

      {/* Comments header */}
      <div className="comments-header">
        <span className="comments-count">{videoStats.comments.count} comments</span>
        <button className="close-comments-btn" onClick={() => {
          // Close comments and return to normal view
          if (onClose) {
            // Scroll to top to show profile section
            const commentSection = document.querySelector('.comment-section') as HTMLElement
            if (commentSection) {
              commentSection.scrollTo({ top: 0, behavior: 'smooth' })
            }
            onClose()
          }
        }}>
          ✕
        </button>
      </div>

      {/* Comments list */}
      <div className="comments-list" ref={commentsListRef}>
        {comments.map((comment) => (
          <div key={comment.id}>
            <div className="comment-item">
              <div className="comment-left">
                <div className="comment-header-row">
                  <img src={comment.userPfp} alt={comment.username} className="comment-pfp" />
                  <span className="comment-username">{comment.username}</span>
                </div>
                {comment.text && (
                  <div className="comment-text">
                    {comment.text}
                  </div>
                )}
                {comment.imageUrl && (
                  <div className="comment-image">
                    <img src={comment.imageUrl} alt="Hamster comment" />
                  </div>
                )}
                <div className="comment-meta">
                  <span className="comment-timestamp">{formatTimestamp(comment.timestamp)}</span>
                  <button 
                    className="reply-btn" 
                    onClick={() => {
                      setReplyingTo(comment.id)
                      setShowHamsterPicker(true)
                    }}
                  >
                    Reply
                  </button>
                  {comment.replies.length > 0 && !expandedReplies.has(comment.id) && (
                    <button 
                      className="view-replies-btn"
                      onClick={() => toggleReplies(comment.id)}
                    >
                      View {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                    </button>
                  )}
                  {expandedReplies.has(comment.id) && comment.replies.length > 0 && (
                    <button 
                      className="view-replies-btn"
                      onClick={() => toggleReplies(comment.id)}
                    >
                      Hide replies
                    </button>
                  )}
                </div>
              </div>
              <div className="comment-right">
                <button 
                  className="like-btn"
                  onClick={() => toggleCommentLike(comment.id)}
                >
                  <svg className="like-icon" viewBox="0 0 24 24" fill={comment.liked ? "#fe2c55" : "none"} xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke={comment.liked ? "#fe2c55" : "white"} stroke-width="2"/>
                  </svg>
                  {comment.likes > 0 && <span className="like-count" style={{ color: comment.liked ? "#fe2c55" : "rgba(255, 255, 255, 0.75)" }}>{comment.likes}</span>}
                </button>
              </div>
            </div>

            {/* Replies */}
            {expandedReplies.has(comment.id) && comment.replies.length > 0 && (
              <div className="replies-container">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="comment-item reply-item">
                    <div className="comment-left">
                      <div className="comment-header-row">
                        <img src={reply.userPfp} alt={reply.username} className="comment-pfp" />
                        <span className="comment-username">{reply.username}</span>
                      </div>
                      {reply.text && (
                        <div className="comment-text">
                          {reply.text}
                        </div>
                      )}
                      {reply.imageUrl && (
                        <div className="comment-image">
                          <img src={reply.imageUrl} alt="Hamster reply" />
                        </div>
                      )}
                      <div className="comment-meta">
                        <span className="comment-timestamp">{formatTimestamp(reply.timestamp)}</span>
                        <button 
                          className="reply-btn" 
                          onClick={() => {
                            setReplyingTo(comment.id)
                            setShowHamsterPicker(true)
                          }}
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                    <div className="comment-right">
                      <button 
                        className="like-btn"
                        onClick={() => toggleCommentLike(reply.id, true, comment.id)}
                      >
                        <svg className="like-icon" viewBox="0 0 24 24" fill={reply.liked ? "#fe2c55" : "none"} xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke={reply.liked ? "#fe2c55" : "white"} stroke-width="2"/>
                        </svg>
                        {reply.likes > 0 && <span className="like-count" style={{ color: reply.liked ? "#fe2c55" : "rgba(255, 255, 255, 0.75)" }}>{reply.likes}</span>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Jump to bottom button */}
      {showJumpToBottom && (
        <button className="jump-to-bottom-btn" onClick={jumpToBottom} title="Jump to bottom">
          <img src={jumpToBottomIcon} alt="Jump to bottom" />
        </button>
      )}

      {/* Comment input at bottom - TikTok style */}
      {username && (
        <form className="comment-input-bottom" onSubmit={handleTextSubmit}>
          <input
            ref={textInputRef}
            type="text"
            className="comment-text-input"
            placeholder={replyingTo ? "Add reply..." : "Add comment..."}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            type="button"
            className="comment-image-btn"
            onClick={() => setShowHamsterPicker(true)}
            title="Add image"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="white"/>
            </svg>
          </button>
          <button
            type="submit"
            className="comment-post-btn"
            disabled={!commentText.trim() || isPosting}
          >
            Post
          </button>
          {replyingTo && (
            <button 
              type="button"
              className="cancel-reply-btn"
              onClick={() => setReplyingTo(null)}
            >
              ✕
            </button>
          )}
        </form>
      )}

      {/* Hamster picker modal */}
      {showHamsterPicker && (
        <HamsterPicker
          onSelect={handleHamsterSelect}
          onClose={() => setShowHamsterPicker(false)}
        />
      )}
    </div>
  )
}

export default CommentSection