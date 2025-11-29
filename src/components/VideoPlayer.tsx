import { useState, useRef, useEffect } from 'react'
import './VideoPlayer.css'
import tiktokVideo from '../assets/tiktok video/SnapTik-dot-Kim-199a6ac9c3aabdb7c0e12bf558a7186a.mp4'

interface VideoPlayerProps {
  onCommentsClick?: () => void
}

const VideoPlayer = ({ onCommentsClick }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true) // Start muted for autoplay
  const [progress, setProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Ensure video is muted for autoplay
    video.muted = true
    setIsMuted(true)

    // Sync playing state with video element
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    // Autoplay video when loaded
    const attemptAutoplay = () => {
      video.muted = true // Must be muted for autoplay
      video.play().then(() => {
        setIsPlaying(true)
      }).catch(() => {
        // Autoplay failed, will wait for user interaction
        setIsPlaying(false)
      })
    }

    if (video.readyState >= 3) {
      attemptAutoplay()
    } else {
      video.addEventListener('canplay', attemptAutoplay, { once: true })
      video.addEventListener('loadeddata', attemptAutoplay, { once: true })
    }

    const updateProgress = () => {
      const progress = (video.currentTime / video.duration) * 100
      setProgress(progress)
    }

    video.addEventListener('timeupdate', updateProgress)
    return () => {
      video.removeEventListener('timeupdate', updateProgress)
      video.removeEventListener('canplay', attemptAutoplay)
      video.removeEventListener('loadeddata', attemptAutoplay)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = pos * videoRef.current.duration
  }


  return (
    <div className="video-player">
      {/* TikTok video */}
      <video
        ref={videoRef}
        className="video-element"
        loop
        muted={isMuted}
        playsInline
        autoPlay
        onClick={togglePlay}
        src={tiktokVideo}
      >
        Your browser does not support the video tag.
      </video>

      {/* Video controls */}
      <div className="video-controls">
        {onCommentsClick && (
          <button
            className="control-button comments-button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onCommentsClick()
            }}
            title="Comments"
            type="button"
            style={{ touchAction: 'manipulation' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="white"/>
            </svg>
          </button>
        )}
        <button className="control-button mute-button" onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}>
          {isMuted ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.34 2.93L2.93 4.34 7.29 8.7 7 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81l2.04 2.04 1.41-1.41L4.34 2.93zM10 15.17L7.83 13H5v-2h2.83l.88-.88L10 11.41v3.76zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zm-7-8l-1.88 1.88L12 7.76zm4.5 8c0-1.77-1.02-3.29-2.5-4.03v1.79l2.48 2.48c.01-.08.02-.16.02-.24z" fill="white"/>
              <line x1="2" y1="2" x2="22" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="white"/>
            </svg>
          )}
        </button>
      </div>

      {/* Play button overlay when paused */}
      {!isPlaying && (
        <div className="play-overlay" onClick={togglePlay}>
          <div className="play-button"></div>
        </div>
      )}

      {/* Video progress bar on hover */}
      <div className="video-progress-container" onClick={handleProgressClick}>
        <div className="video-progress-bar" style={{ width: `${progress}%` }}></div>
      </div>

    </div>
  )
}

export default VideoPlayer
