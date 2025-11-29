// Script to clear all Firebase comments, likes, and bookmarks
// Run with: npm run clear-firebase

import { initializeApp } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc,
  writeBatch
} from 'firebase/firestore'

// Firebase config (matching src/config/firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyCH6ZVqC8uJAJ3T2zV2ul1Mx3saNKh56DY",
  authDomain: "hampter-f9faa.firebaseapp.com",
  projectId: "hampter-f9faa",
  storageBucket: "hampter-f9faa.firebasestorage.app",
  messagingSenderId: "665013220158",
  appId: "1:665013220158:web:295b03039b861c7244f26f"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function clearAllData() {
  try {
    console.log('🚀 Starting Firebase data cleanup...\n')

    // 1. Delete all comments
    console.log('📝 Deleting all comments...')
    const commentsRef = collection(db, 'comments')
    const commentsSnapshot = await getDocs(commentsRef)
    
    let deletedComments = 0
    const batchSize = 500 // Firestore batch limit
    let batch = writeBatch(db)
    let batchCount = 0

    commentsSnapshot.forEach((commentDoc) => {
      batch.delete(commentDoc.ref)
      deletedComments++
      batchCount++

      if (batchCount >= batchSize) {
        batch.commit()
        batch = writeBatch(db)
        batchCount = 0
      }
    })

    if (batchCount > 0) {
      await batch.commit()
    }

    console.log(`✅ Deleted ${deletedComments} comments\n`)

    // 2. Reset videoStats
    console.log('📊 Resetting video stats (likes, comments, bookmarks)...')
    const statsRef = doc(db, 'videoStats', 'main')
    await setDoc(statsRef, {
      likes: { count: 0, likedBy: [] },
      comments: { count: 0 },
      bookmarks: { count: 0, bookmarkedBy: [] }
    }, { merge: true })
    console.log('✅ Video stats reset to zero\n')

    // 3. Clear userInteractions (optional - uncomment if you want to clear this too)
    // console.log('👤 Clearing user interactions...')
    // const interactionsRef = collection(db, 'userInteractions')
    // const interactionsSnapshot = await getDocs(interactionsRef)
    // 
    // let deletedInteractions = 0
    // batch = writeBatch(db)
    // batchCount = 0
    // 
    // interactionsSnapshot.forEach((interactionDoc) => {
    //   batch.delete(interactionDoc.ref)
    //   deletedInteractions++
    //   batchCount++
    // 
    //   if (batchCount >= batchSize) {
    //     batch.commit()
    //     batch = writeBatch(db)
    //     batchCount = 0
    //   }
    // })
    // 
    // if (batchCount > 0) {
    //   await batch.commit()
    // }
    // 
    // console.log(`✅ Deleted ${deletedInteractions} user interactions\n`)

    console.log('✨ Firebase data cleanup complete!')
    console.log('\nSummary:')
    console.log(`  - Comments deleted: ${deletedComments}`)
    console.log(`  - Video stats reset: ✓`)
    console.log('\n🎉 All done! Your Firebase is now fresh and clean.')

  } catch (error) {
    console.error('❌ Error clearing Firebase data:', error)
    process.exit(1)
  }
}

// Run the cleanup
clearAllData()
  .then(() => {
    console.log('\n✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })

