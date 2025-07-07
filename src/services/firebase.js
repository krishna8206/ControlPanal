"use client"

import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Only initialize Firebase on the client side
const initializeFirebase = () => {
  // Check if we're running on the client
  if (typeof window === "undefined") {
    return { app: null, auth: null, db: null, storage: null }
  }

  try {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }

    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const db = getFirestore(app)
    const storage = getStorage(app)

    return { app, auth, db, storage }
  } catch (error) {
    console.error("Firebase initialization error:", error)
    return { app: null, auth: null, db: null, storage: null }
  }
}

// Initialize Firebase only on client side
const { app, auth, db, storage } = initializeFirebase()

export { auth, db, storage }
export default app
