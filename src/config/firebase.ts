import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Firebase configuration
// Note: Firebase web API keys are safe to expose - security is handled by Firestore rules
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

// Initialize Firestore
export const db = getFirestore(app)

export default app

