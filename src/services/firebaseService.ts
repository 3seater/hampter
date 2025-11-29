import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  setDoc,
  Timestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'

// User management
export const createOrUpdateUser = async (username: string, pfp: string) => {
  const userRef = doc(db, 'users', username)
  await setDoc(userRef, {
    username,
    pfp,
    createdAt: serverTimestamp()
  }, { merge: true })
}

export const getUser = async (username: string) => {
  const userRef = doc(db, 'users', username)
  const userSnap = await getDoc(userRef)
  return userSnap.exists() ? userSnap.data() : null
}

// Comments
export const addComment = async (comment: {
  username: string
  userPfp: string
  text?: string
  imageUrl?: string
  parentId?: string
}) => {
  try {
    const commentsRef = collection(db, 'comments')
    
    // Build comment object, only including defined fields
    const newComment: any = {
      username: comment.username,
      userPfp: comment.userPfp,
      timestamp: serverTimestamp(),
      likes: 0,
      likedBy: [],
      replies: []
    }
    
    // Only add text if it exists
    if (comment.text) {
      newComment.text = comment.text
    }
    
    // Only add imageUrl if it exists
    if (comment.imageUrl) {
      newComment.imageUrl = comment.imageUrl
    }
    
    // Only add parentId if it exists
    if (comment.parentId) {
      newComment.parentId = comment.parentId
    }
    
    const docRef = await addDoc(commentsRef, newComment)
    
    // Initialize videoStats if it doesn't exist
    const statsRef = doc(db, 'videoStats', 'main')
    const statsSnap = await getDoc(statsRef)
    
    if (!statsSnap.exists()) {
      await setDoc(statsRef, {
        likes: { count: 0, likedBy: [] },
        comments: { count: 0 },
        bookmarks: { count: 0, bookmarkedBy: [] }
      })
    }
    
    // Update comment count
    await updateDoc(statsRef, {
      'comments.count': increment(1)
    })
    
    // If it's a reply, add to parent's replies array
    if (comment.parentId) {
      const parentRef = doc(db, 'comments', comment.parentId)
      await updateDoc(parentRef, {
        replies: arrayUnion(docRef.id)
      })
    }
    
    return docRef.id
  } catch (error) {
    console.error('Firebase error adding comment:', error)
    throw error
  }
}

export const subscribeToComments = (callback: (comments: any[]) => void) => {
  const commentsRef = collection(db, 'comments')
  const q = query(commentsRef, orderBy('timestamp', 'asc'))
  
  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : (data.timestamp || new Date()),
        likedBy: data.likedBy || [],
        replies: data.replies || []
      }
    })
    callback(comments)
  })
}

export const toggleCommentLike = async (commentId: string, username: string, isLiked: boolean) => {
  const commentRef = doc(db, 'comments', commentId)
  
  if (isLiked) {
    await updateDoc(commentRef, {
      likes: increment(-1),
      likedBy: arrayRemove(username)
    })
  } else {
    await updateDoc(commentRef, {
      likes: increment(1),
      likedBy: arrayUnion(username)
    })
  }
}

// Video stats
export const getVideoStats = async () => {
  try {
    const statsRef = doc(db, 'videoStats', 'main')
    const statsSnap = await getDoc(statsRef)
    
    if (statsSnap.exists()) {
      return statsSnap.data()
    } else {
      // Initialize stats if they don't exist
      const initialStats = {
        likes: { count: 0, likedBy: [] },
        comments: { count: 0 },
        bookmarks: { count: 0, bookmarkedBy: [] }
      }
      await setDoc(statsRef, initialStats)
      return initialStats
    }
  } catch (error) {
    console.error('Firebase error getting video stats:', error)
    // Return default stats on error
    return {
      likes: { count: 0, likedBy: [] },
      comments: { count: 0 },
      bookmarks: { count: 0, bookmarkedBy: [] }
    }
  }
}

export const subscribeToVideoStats = (callback: (stats: any) => void) => {
  const statsRef = doc(db, 'videoStats', 'main')
  
  return onSnapshot(statsRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data())
    }
  })
}

export const toggleVideoLike = async (username: string, isLiked: boolean) => {
  const statsRef = doc(db, 'videoStats', 'main')
  
  if (isLiked) {
    await updateDoc(statsRef, {
      'likes.count': increment(-1),
      'likes.likedBy': arrayRemove(username)
    })
  } else {
    await updateDoc(statsRef, {
      'likes.count': increment(1),
      'likes.likedBy': arrayUnion(username)
    })
  }
}

export const toggleVideoBookmark = async (username: string, isBookmarked: boolean) => {
  const statsRef = doc(db, 'videoStats', 'main')
  
  if (isBookmarked) {
    await updateDoc(statsRef, {
      'bookmarks.count': increment(-1),
      'bookmarks.bookmarkedBy': arrayRemove(username)
    })
  } else {
    await updateDoc(statsRef, {
      'bookmarks.count': increment(1),
      'bookmarks.bookmarkedBy': arrayUnion(username)
    })
  }
}

// User interactions
export const getUserInteractions = async (username: string) => {
  const interactionsRef = doc(db, 'userInteractions', username)
  const interactionsSnap = await getDoc(interactionsRef)
  
  if (interactionsSnap.exists()) {
    return interactionsSnap.data()
  } else {
    return {
      likedComments: [],
      bookmarkedVideo: false,
      likedVideo: false
    }
  }
}

export const subscribeToUserInteractions = (username: string, callback: (interactions: any) => void) => {
  const interactionsRef = doc(db, 'userInteractions', username)
  
  return onSnapshot(interactionsRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data())
    } else {
      callback({
        likedComments: [],
        bookmarkedVideo: false,
        likedVideo: false
      })
    }
  })
}

