"use client"

import { auth } from "../lib/firebase"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"

export default function Home() {
  const loginWithGoogle = async (): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      alert("Login successful")
    } catch (error) {
      console.error(error)
      alert("Login failed")
    }
  }
    const testBackendAuth = async (): Promise<void> => {
        const user = auth.currentUser
        if (!user) {
            alert("Please login first")
            return
        }

        const token = await user.getIdToken()

        const res = await fetch("http://localhost:4000/test-auth", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })

        const data = await res.json()
        alert(JSON.stringify(data))
    }

  return (
      <main style={{ padding: 40 }}>
        <h1>AI Image Generator</h1>
        <button onClick={loginWithGoogle}>
          Login with Google
        </button>
          <br ></br>
          <button onClick={testBackendAuth}>
            Test Backend Auth
          </button>
      </main>
  )
}
