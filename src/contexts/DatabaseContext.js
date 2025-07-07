"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { db } from "../services/firebase"
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore"

const DatabaseContext = createContext()

export function useDatabase() {
  return useContext(DatabaseContext)
}

export function DatabaseProvider({ children }) {
  const [data, setData] = useState({
    vehicles: [],
    drivers: [],
    users: [],
    rides: [],
    complaints: [],
    payments: [],
  })

  const [loading, setLoading] = useState(true)

  // Real-time listeners
  useEffect(() => {
    const unsubscribes = []

    // Vehicles listener
    const vehiclesQuery = collection(db, "vehicles")
    const unsubVehicles = onSnapshot(vehiclesQuery, (snapshot) => {
      const vehicles = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setData((prev) => ({ ...prev, vehicles }))
    })
    unsubscribes.push(unsubVehicles)

    // Drivers listener
    const driversQuery = collection(db, "drivers")
    const unsubDrivers = onSnapshot(driversQuery, (snapshot) => {
      const drivers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setData((prev) => ({ ...prev, drivers }))
    })
    unsubscribes.push(unsubDrivers)

    // Users listener
    const usersQuery = collection(db, "users")
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setData((prev) => ({ ...prev, users }))
    })
    unsubscribes.push(unsubUsers)

    // Rides listener
    const ridesQuery = query(collection(db, "rides"), orderBy("createdAt", "desc"))
    const unsubRides = onSnapshot(ridesQuery, (snapshot) => {
      const rides = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setData((prev) => ({ ...prev, rides }))
    })
    unsubscribes.push(unsubRides)

    setLoading(false)

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe())
    }
  }, [])

  // CRUD Operations
  const addDocument = async (collectionName, data) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      return { success: true, id: docRef.id }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const updateDocument = async (collectionName, id, data) => {
    try {
      await updateDoc(doc(db, collectionName, id), {
        ...data,
        updatedAt: new Date(),
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const deleteDocument = async (collectionName, id) => {
    try {
      await deleteDoc(doc(db, collectionName, id))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const queryDocuments = async (collectionName, conditions = []) => {
    try {
      let q = collection(db, collectionName)

      conditions.forEach((condition) => {
        q = query(q, where(condition.field, condition.operator, condition.value))
      })

      const snapshot = await getDocs(q)
      const documents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      return { success: true, data: documents }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const value = {
    data,
    loading,
    addDocument,
    updateDocument,
    deleteDocument,
    queryDocuments,
  }

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>
}
